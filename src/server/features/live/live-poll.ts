import "server-only";
import { invalidateCache, getRedis } from "@/server/cache/cache";
import { prisma } from "@/server/db/prisma";
import { syncGitHubUser } from "@/server/features/github/github-sync.service";
import { createGitHubService } from "@/server/integrations/github.service";
import { leetcodeService } from "@/server/integrations/leetcode.service";
import { SERVICE_ACTIVITY_TYPES } from "@/server/features/activity/retention";
import { decryptToken } from "@/server/security/token-encryption";

/**
 * The live poll. It runs about once a minute, looks at every active member, and does the cheapest possible check for each one: has anything
 * changed on GitHub or LeetCode since we last stored it? If not, it does nothing at all (no sync, no database write, no cache clearing).
 * If something has, it updates that member and clears the caches, and the dashboards that are open pick the change up live.
 *
 * What counts as "changed", and why it is cheap:
 *  - GitHub: one small GraphQL request returns the three totals we store (contributions, pull requests, issues) and they are compared with the
 *    database. A conditional request for the newest public event (a 304 costs nothing against GitHub's limits) catches activity that has
 *    not moved the totals yet. Each member's own token pays for their own checks, so there is no shared limit to run out of.
 *  - LeetCode: one request for the solved counts, compared with the database. LeetCode has no conditional request and is not ours, so each
 *    member is checked at most every couple of minutes.
 *
 * Everything the poll remembers between runs (when a member was last checked, the events ETag) lives in Redis and is only a hint: losing
 * it just means one extra check.
 */

const GITHUB_ACTIVE_WITHIN_MS = 30 * 24 * 60 * 60 * 1000;
const LEETCODE_MIN_GAP_MS = 2 * 60 * 1000;

/**
 * How often each member is polled depends on whether they have been active lately.
 *  - HOT: any GitHub or LeetCode activity in the last 36 hours. Polled every run (every minute).
 *  - COLD: none. Polled once every 6 hours, with a little random spread so they do not all fall on the same minute.
 * A cold member whose 6 hourly check finds something becomes hot again straight away, and stays hot until they have gone 36 hours quiet.
 * A member with the dashboard open right now is treated as hot too, so a live dashboard really is live for the person looking at it.
 */
export const HOT_WINDOW_MS = 36 * 60 * 60 * 1000;
export const COLD_INTERVAL_MS = 6 * 60 * 60 * 1000;
const COLD_SPREAD_MS = 20 * 60 * 1000;
const RETRY_AFTER_FAILURE_MS = 30 * 60 * 1000;
const GITHUB_CONCURRENCY = 6;
const LEETCODE_CONCURRENCY = 3;

/* ------------------------------------------------------------------------------------------------ what we remember between runs */

const memory = new Map<string, { value: string; expires: number }>();

const kv = {
  async get(key: string) {
    const redis = getRedis();
    if (redis) return (await redis.get<string | number>(key))?.toString() ?? null;
    const hit = memory.get(key);
    return hit && hit.expires > Date.now() ? hit.value : null;
  },
  async getMany(keys: string[]) {
    const redis = getRedis();
    if (redis && keys.length) return (await redis.mget<(string | number | null)[]>(...keys)).map((v) => (v === null ? null : String(v)));
    return Promise.all(keys.map((key) => kv.get(key)));
  },
  async set(key: string, value: string, seconds: number) {
    const redis = getRedis();
    if (redis) await redis.set(key, value, { ex: seconds });
    else memory.set(key, { value, expires: Date.now() + seconds * 1000 });
  },
};

const DAY = 24 * 60 * 60;

/* ------------------------------------------------------------------------------------------------ one member */

type Outcome = "unchanged" | "synced" | "skipped" | "failed";

interface Member {
  id: string;
  liveActiveAt: Date | null;
  githubUsername: string | null;
  githubTokenCiphertext: string | null;
  leetcodeUsername: string | null;
  githubStats: { commits: number; pullRequests: number; issues: number } | null;
  leetcodeStats: { easySolved: number; mediumSolved: number; hardSolved: number } | null;
}

async function pollGitHub(member: Member): Promise<Outcome> {
  if (!member.githubUsername || !member.githubTokenCiphertext) return "skipped";
  if (await kv.get(`live:backoff:${member.id}`)) return "skipped";

  try {
    const service = createGitHubService(decryptToken(member.githubTokenCiphertext));
    const etag = (await kv.get(`live:gh:etag:${member.id}`)) ?? undefined;
    const probe = await service.probe(member.githubUsername, etag);

    const known = await kv.get(`live:gh:event:${member.id}`);
    const stored = member.githubStats;
    const numbersMoved =
      !stored || probe.commits !== stored.commits || probe.pullRequests !== stored.pullRequests || probe.issues !== stored.issues;
    // A new public event only counts once we have seen one before: the first look just records where we are, so a deploy does not sync everyone.
    const newEvent = probe.events.modified && !!probe.events.latestEventId && !!known && probe.events.latestEventId !== known;

    if (probe.events.modified) {
      if (probe.events.etag) await kv.set(`live:gh:etag:${member.id}`, probe.events.etag, DAY);
      if (probe.events.latestEventId && !newEvent) await kv.set(`live:gh:event:${member.id}`, probe.events.latestEventId, DAY);
    }

    if (!numbersMoved && !newEvent) return "unchanged";

    const result = await syncGitHubUser(member.id);
    if (probe.events.modified && probe.events.latestEventId) await kv.set(`live:gh:event:${member.id}`, probe.events.latestEventId, DAY);
    // Something looked different, but the sync compares with what is stored and only writes real differences. If it found none (for example
    // a new public event that is not a commit, pull request or issue), nothing was written, so this is not a change.
    return result.changed ? "synced" : "unchanged";
  } catch (error) {
    const status = (error as { status?: number }).status;
    // A revoked token needs a fresh sign in, and a rate limit needs time. Either way, leave this member alone for a while.
    if (status === 401) await kv.set(`live:backoff:${member.id}`, "token", 60 * 60);
    else if (status === 403 || status === 429) await kv.set(`live:backoff:${member.id}`, "limit", 10 * 60);
    console.error(`Live poll failed for GitHub member ${member.githubUsername}:`, error);
    return "failed";
  }
}

async function pollLeetCode(member: Member, force: boolean): Promise<{ outcome: Outcome; changed: boolean }> {
  if (!member.leetcodeUsername) return { outcome: "skipped", changed: false };
  const last = Number((await kv.get(`live:lc:checked:${member.id}`)) ?? 0);
  // A hot member is checked at most every couple of minutes. A cold member is only here because their 6 hour check is due, so it always goes.
  if (!force && Date.now() - last < LEETCODE_MIN_GAP_MS) return { outcome: "skipped", changed: false };

  try {
    await kv.set(`live:lc:checked:${member.id}`, String(Date.now()), DAY);
    const stats = await leetcodeService.getUserStats(member.leetcodeUsername, { fast: true });
    if (!stats) return { outcome: "failed", changed: false };

    const stored = member.leetcodeStats;
    const same =
      !!stored &&
      stored.easySolved === stats.easySolved &&
      stored.mediumSolved === stats.mediumSolved &&
      stored.hardSolved === stats.hardSolved;
    if (same) return { outcome: "unchanged", changed: false };

    const written = await leetcodeService.saveStats(member.id, member.leetcodeUsername, stats);
    return written ? { outcome: "synced", changed: true } : { outcome: "unchanged", changed: false };
  } catch (error) {
    console.error(`Live poll failed for LeetCode member ${member.leetcodeUsername}:`, error);
    return { outcome: "failed", changed: false };
  }
}

/* ------------------------------------------------------------------------------------------------ everyone */

const lane = async <T, R>(items: T[], limit: number, deadline: number, task: (item: T) => Promise<R>) => {
  const out: R[] = [];
  let next = 0;
  // Each worker takes the next member until the time is up. Whoever is left over is first in line next time.
  const worker = async () => {
    while (next < items.length && Date.now() < deadline) out.push(await task(items[next++]));
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
};

const tally = (outcomes: Outcome[]) => ({
  checked: outcomes.length,
  synced: outcomes.filter((o) => o === "synced").length,
  unchanged: outcomes.filter((o) => o === "unchanged").length,
  failed: outcomes.filter((o) => o === "failed").length,
  skipped: outcomes.filter((o) => o === "skipped").length,
});

export async function runLivePoll(options: { budgetMs?: number; onlyUserIds?: string[] } = {}) {
  const started = Date.now();
  const deadline = started + (options.budgetMs ?? 45_000);
  const hotSince = new Date(started - HOT_WINDOW_MS);

  const members = await prisma.user.findMany({
    where: {
      ...(options.onlyUserIds ? { id: { in: options.onlyUserIds } } : {}),
      lastActive: { gte: new Date(started - GITHUB_ACTIVE_WITHIN_MS) },
      OR: [{ githubTokenCiphertext: { not: null } }, { leetcodeUsername: { not: null } }],
    },
    select: {
      id: true,
      liveActiveAt: true,
      githubUsername: true,
      githubTokenCiphertext: true,
      leetcodeUsername: true,
      githubStats: { select: { commits: true, pullRequests: true, issues: true } },
      leetcodeStats: { select: { easySolved: true, mediumSolved: true, hardSolved: true } },
    },
    take: 500,
  });
  const ids = members.map((m) => m.id);

  // Who is hot: seen new activity lately, or has GitHub/LeetCode activity on record from the last 36 hours, or has the dashboard open now.
  const recent = new Set(
    ids.length
      ? (
          await prisma.activity.groupBy({
            by: ["userId"],
            where: { userId: { in: ids }, type: { in: SERVICE_ACTIVITY_TYPES }, createdAt: { gte: hotSince } },
          })
        ).map((row) => row.userId)
      : [],
  );
  const [watching, coldDue, lastChecked] = await Promise.all([
    kv.getMany(ids.map((id) => `live:watching:${id}`)),
    kv.getMany(ids.map((id) => `live:cold:due:${id}`)),
    kv.getMany(ids.map((id) => `live:gh:checked:${id}`)),
  ]);
  const index = new Map(ids.map((id, i) => [id, i]));
  const isHot = (m: Member) => !!watching[index.get(m.id)!] || (!!m.liveActiveAt && m.liveActiveAt >= hotSince) || recent.has(m.id);
  const isDue = (m: Member) => isHot(m) || Number(coldDue[index.get(m.id)!] ?? 0) <= started;

  const hot = members.filter(isHot);
  const due = members.filter(isDue);
  // The member who has gone longest without a check goes first, so a slow minute never starves the same people.
  due.sort((a, b) => Number(lastChecked[index.get(a.id)!] ?? 0) - Number(lastChecked[index.get(b.id)!] ?? 0));
  const hotIds = new Set(hot.map((m) => m.id));

  const [github, leetcode] = await Promise.all([
    lane(due, GITHUB_CONCURRENCY, deadline, async (member) => {
      const outcome = await pollGitHub(member);
      if (outcome !== "skipped") await kv.set(`live:gh:checked:${member.id}`, String(Date.now()), DAY);
      return { id: member.id, outcome };
    }),
    lane(due, LEETCODE_CONCURRENCY, deadline, async (member) => ({
      id: member.id,
      ...(await pollLeetCode(member, !hotIds.has(member.id))),
    })),
  ]);

  // Anyone who just showed new activity is hot from now on, and stays hot until they have been quiet for 36 hours.
  const changed = new Set([
    ...github.filter((r) => r.outcome === "synced").map((r) => r.id),
    ...leetcode.filter((r) => r.changed).map((r) => r.id),
  ]);
  if (changed.size) await prisma.user.updateMany({ where: { id: { in: [...changed] } }, data: { liveActiveAt: new Date() } });

  // A cold member that has just been checked is left alone for 6 hours (a little longer or shorter each time so they spread out through
  // the day). If their check failed, try again sooner.
  const failed = new Set([
    ...github.filter((r) => r.outcome === "failed").map((r) => r.id),
    ...leetcode.filter((r) => r.outcome === "failed").map((r) => r.id),
  ]);
  const checkedCold = new Set([...github, ...leetcode].map((r) => r.id).filter((id) => !hotIds.has(id) && !changed.has(id)));
  await Promise.all(
    [...checkedCold].map((id) => {
      const wait = failed.has(id) ? RETRY_AFTER_FAILURE_MS : COLD_INTERVAL_MS + Math.floor(Math.random() * COLD_SPREAD_MS);
      return kv.set(`live:cold:due:${id}`, String(Date.now() + wait), Math.ceil((wait + 60_000) / 1000));
    }),
  );

  // GitHub syncs clear the caches themselves. LeetCode changes are written directly, so clear what shows them once, here.
  if (leetcode.some((r) => r.changed)) await invalidateCache("dashboard", "leaderboard", "members");

  return {
    members: members.length,
    hot: hot.length,
    cold: members.length - hot.length,
    checked: due.length,
    becameHot: [...changed].filter((id) => !hotIds.has(id)).length,
    github: tally(github.map((r) => r.outcome)),
    leetcode: tally(leetcode.map((r) => r.outcome)),
    tookMs: Date.now() - started,
  };
}
