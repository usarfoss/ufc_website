import "server-only";
import { getRedis } from "@/server/cache/cache";

/**
 * What the live poll remembers between runs (when a member was last checked, the events ETag, a promised re-check, who has the dashboard open).
 * It is all in one Redis hash, so a run reads everything with one command and saves everything it learned with one more, instead of asking
 * Redis a handful of questions per member per minute. Each value carries its own expiry (`value|expires at`), because a hash field cannot expire
 * by itself. It is only ever a hint: if some of it is lost, the poll just does one extra check.
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

let localGateUntil = 0;

/**
 * Lets one poll start, and then none for `seconds`. Two things start polls (QStash on its schedule, and a server with a dashboard open), and this
 * keeps them from running over each other or doing the same checks twice. Returns whether this caller may go ahead.
 */
export async function claimPoll(seconds: number) {
  const redis = getRedis();
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

export class PollState {
  private fields: Map<string, string>;
  private writes = new Map<string, string>();
  private deletes = new Set<string>();
  private stale: string[] = [];

  private constructor(fields: Map<string, string>, stale: string[]) {
    this.fields = fields;
    this.stale = stale;
  }

  /** Everything the poll knows, in one read. If Redis cannot be reached this throws, and the run fails instead of treating everyone as new. */
  static async load() {
    const redis = getRedis();
    const raw = redis ? await redis.hgetall<Record<string, unknown>>(POLL_STATE_KEY) : Object.fromEntries(memory);
    const now = Date.now();
    const fields = new Map<string, string>();
    const stale: string[] = [];
    for (const [field, value] of Object.entries(raw ?? {})) {
      const live = decode(value, now);
      if (live === null) stale.push(field);
      else fields.set(field, live);
    }
    return new PollState(fields, stale);
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
      const redis = getRedis();
      if (redis) {
        const pipeline = redis.pipeline();
        if (this.writes.size) pipeline.hset(POLL_STATE_KEY, Object.fromEntries(this.writes));
        if (remove.length) pipeline.hdel(POLL_STATE_KEY, ...remove);
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
}
