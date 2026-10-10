import "server-only";
import { getStateRedis } from "@/server/cache/redis";

/**
 * What the live poll remembers between runs (when a member was last checked, the events ETag, a promised re-check, who has the dashboard open).
 * It is all in one Redis hash, and a run reads only the notes for the members it is about to look at (one command per thousand notes) and saves
 * everything it learned with one more, instead of asking Redis a handful of questions per member per minute. Each value carries its own expiry
 * (`value|expires at`), because a hash field cannot expire by itself. It is only ever a hint: if some of it is lost, the poll just does one
 * extra check.
 */
export const POLL_STATE_KEY = "live:poll";

/** Written by the dashboard stream, read by the poll: "this member is looking at their dashboard right now". */
export const watchingField = (userId: string) => `watching:${userId}`;
export const encodeState = (value: string, seconds: number) => `${value}|${Date.now() + seconds * 1000}`;

const decode = (raw: unknown, now: number) => {
  const text = String(raw ?? "");
  const at = text.lastIndexOf("|");
  if (at < 0 || Number(text.slice(at + 1)) <= now) return null;
  return text.slice(0, at);
};

// Used when there is no Redis (local development): the same hints, kept in this process.
const memory = new Map<string, string>();

/** A single command asks for at most this many fields, so no request is huge. */
const FIELDS_PER_COMMAND = 1_000;
const chunks = <T>(items: T[], size: number) => {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
};

/** Lets the poll try a member again straight away, for example after they sign in with a fresh GitHub token. */
export async function clearPollBackoff(userId: string) {
  const field = `backoff:${userId}`;
  memory.delete(field);
  try {
    await getStateRedis()?.hdel(POLL_STATE_KEY, field);
  } catch (error) {
    console.error("Could not clear a member's poll backoff:", error);
  }
}

let localGateUntil = 0;

/**
 * Lets one poll start, and then none for `seconds`. Two things start polls (QStash on its schedule, and a server with a dashboard open), and this
 * keeps them from running over each other or doing the same checks twice. Returns whether this caller may go ahead.
 */
export async function claimPoll(seconds: number) {
  const redis = getStateRedis();
  if (!redis) {
    if (Date.now() < localGateUntil) return false;
    localGateUntil = Date.now() + seconds * 1000;
    return true;
  }
  try {
    return (await redis.set("live:poll:gate", "1", { ex: seconds, nx: true })) === "OK";
  } catch (error) {
    console.error("Could not claim the live poll, skipping this one:", error);
    return false;
  }
}

/* ------------------------------------------------------------------------------------------------ is anybody here */

/**
 * "Somebody was on the site lately." It is a single key that lives for LIVE_POLL_IDLE_HOURS (3 by default) after the last sign of life, so
 * its absence means nobody has been around for that long. The scheduled poll checks it first and does nothing at all when it is gone:
 * no database query, so the database is free to go to sleep. Anybody opening a dashboard brings it back, and polls straight away themselves.
 * 0 turns this off (the schedule then polls whether or not anyone is there).
 */
const ACTIVE_KEY = "live:active";
const idleHours = Number(process.env.LIVE_POLL_IDLE_HOURS ?? 3);
const IDLE_AFTER_SECONDS = Number.isFinite(idleHours) && idleHours > 0 ? Math.round(idleHours * 3600) : 0;
const TOUCH_EVERY_MS = 2 * 60 * 1000;
let touchedAt = 0;

/** Said by anything that shows a member is around (a dashboard opening). At most once every couple of minutes per server instance. */
export async function touchSiteActive() {
  if (IDLE_AFTER_SECONDS === 0) return;
  const now = Date.now();
  if (now - touchedAt < TOUCH_EVERY_MS) return;
  touchedAt = now;
  try {
    await getStateRedis()?.set(ACTIVE_KEY, String(now), { ex: IDLE_AFTER_SECONDS });
  } catch (error) {
    touchedAt = 0;
    console.error("Could not record that the site is in use:", error);
  }
}

/** True when nobody has been around for the idle window. Without Redis (or when Redis cannot be reached) it says false, so polling carries on. */
export async function siteIsIdle() {
  if (IDLE_AFTER_SECONDS === 0) return false;
  const redis = getStateRedis();
  if (!redis) return false;
  try {
    return (await redis.exists(ACTIVE_KEY)) === 0;
  } catch (error) {
    console.error("Could not tell whether the site is in use, assuming it is:", error);
    return false;
  }
}

/** "These members have a dashboard open." One write for all of them, so the cost does not grow with how many are watching. */
export async function markWatching(userIds: string[]) {
  if (userIds.length === 0) return;
  const entries = Object.fromEntries(userIds.map((id) => [watchingField(id), encodeState("1", 150)]));
  const redis = getStateRedis();
  if (!redis) {
    for (const [field, value] of Object.entries(entries)) memory.set(field, value);
    return;
  }
  try {
    await redis.hset(POLL_STATE_KEY, entries);
  } catch (error) {
    console.error("Could not record the open dashboards:", error);
  }
}

/* ------------------------------------------------------------------------------------------------ the notes */

export class PollState {
  private fields = new Map<string, string>();
  private asked = new Set<string>();
  private writes = new Map<string, string>();
  private deletes = new Set<string>();
  private stale: string[] = [];

  /**
   * Reads the notes of these kinds for these members, and nothing else. A note that is not there (or has run out) simply reads as nothing. If
   * Redis cannot be reached this throws, and the run fails instead of treating everyone as new.
   */
  async fetch(kinds: string[], ids: string[]) {
    const wanted: string[] = [];
    for (const id of ids) {
      for (const kind of kinds) {
        const field = `${kind}:${id}`;
        if (this.asked.has(field)) continue;
        this.asked.add(field);
        wanted.push(field);
      }
    }
    if (wanted.length === 0) return;

    const now = Date.now();
    const absorb = (field: string, raw: unknown) => {
      if (raw === null || raw === undefined) return;
      // What this run has already decided wins over what was on file.
      if (this.writes.has(field) || this.deletes.has(field)) return;
      const live = decode(raw, now);
      if (live === null) this.stale.push(field);
      else this.fields.set(field, live);
    };

    const redis = getStateRedis();
    if (!redis) {
      for (const field of wanted) absorb(field, memory.get(field));
      return;
    }

    const answers = await Promise.all(
      chunks(wanted, FIELDS_PER_COMMAND).map((part) => redis.hmget<Record<string, unknown>>(POLL_STATE_KEY, ...part)),
    );
    for (const answer of answers) {
      if (!answer) continue; // none of them were there
      for (const [field, raw] of Object.entries(answer)) absorb(field, raw);
    }
  }

  get(kind: string, id: string) {
    return this.fields.get(`${kind}:${id}`) ?? null;
  }

  has(kind: string, id: string) {
    return this.fields.has(`${kind}:${id}`);
  }

  set(kind: string, id: string, value: string, seconds: number) {
    const field = `${kind}:${id}`;
    this.fields.set(field, value);
    this.deletes.delete(field);
    this.writes.set(field, encodeState(value, seconds));
  }

  del(kind: string, id: string) {
    const field = `${kind}:${id}`;
    this.fields.delete(field);
    this.writes.delete(field);
    this.deletes.add(field);
  }

  /** Saves everything this run learned in one write (and clears out hints that have run out). A failure is only logged: the hints are not worth failing a run over. */
  async flush() {
    const remove = [...new Set([...this.deletes, ...this.stale])];
    if (this.writes.size === 0 && remove.length === 0) return;

    try {
      const redis = getStateRedis();
      if (redis) {
        const pipeline = redis.pipeline();
        if (this.writes.size) pipeline.hset(POLL_STATE_KEY, Object.fromEntries(this.writes));
        for (const part of chunks(remove, FIELDS_PER_COMMAND)) pipeline.hdel(POLL_STATE_KEY, ...part);
        await pipeline.exec();
      } else {
        for (const [field, value] of this.writes) memory.set(field, value);
        for (const field of remove) memory.delete(field);
      }
      this.writes.clear();
      this.deletes.clear();
      this.stale = [];
    } catch (error) {
      console.error("Could not save the live poll's notes, the next run will redo some checks:", error);
    }
  }

  /**
   * Clears out notes that have run out. A run only ever looks at the notes of the members it checks, so the notes of someone who left would
   * stay for good. This reads everything once and removes what has expired: it is meant to run a few times a day, not every poll.
   */
  static async sweep() {
    const redis = getStateRedis();
    const now = Date.now();
    const raw = redis ? await redis.hgetall<Record<string, unknown>>(POLL_STATE_KEY) : Object.fromEntries(memory);
    const entries = Object.entries(raw ?? {});
    const expired = entries.filter(([, value]) => decode(value, now) === null).map(([field]) => field);

    if (!redis) for (const field of expired) memory.delete(field);
    else for (const part of chunks(expired, FIELDS_PER_COMMAND)) await redis.hdel(POLL_STATE_KEY, ...part);

    return { notes: entries.length, removed: expired.length };
  }
}
