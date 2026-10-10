import "server-only";
import type { Prisma } from "@prisma/client";
import { invalidateCache } from "@/server/cache/cache";
import { PollState, claimPoll } from "@/server/features/live/poll-state";
import { prisma, prismaRead } from "@/server/db/prisma";
import { syncGitHubUser } from "@/server/features/github/github-sync.service";
import { createGitHubService } from "@/server/integrations/github.service";
import { TOKEN_FIELDS, usableGitHubToken, type TokenRow } from "@/server/integrations/github-token";
import { leetcodeService } from "@/server/integrations/leetcode.service";
import { markNeedsSignIn, membersNeedingSignIn } from "@/server/auth/reauth";
import { SERVICE_ACTIVITY_TYPES } from "@/server/features/activity/retention";

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
 * Everything the poll remembers between runs (when a member was last checked, the events ETag) lives in one Redis hash (see poll-state.ts),
 * read (only the notes for the members being looked at) at the start of a run and saved once at the end. It is only a hint: losing it just
 * means one extra check.
 *
 * A run is cheap however many members there are: it loads their ids, works out who is due, and only then loads the full rows (tokens, stats)
 * of those few. And the scheduled run does not start at all when nobody has been on the site for a while (see siteIsIdle).
 */

const GITHUB_ACTIVE_WITHIN_MS = 30 * 24 * 60 * 60 * 1000;
const LEETCODE_MIN_GAP_MS = 2 * 60 * 1000;

/**
 * How often each member is polled depends on whether they have been active lately.
 *  - HOT: any GitHub or LeetCode activity in the last 36 hours. Polled every run.
 *  - COLD: none. Polled once every 6 hours, with a little random spread so they do not all fall on the same minute.
 * A cold member whose 6 hourly check finds something becomes hot again straight away, and stays hot until they have gone 36 hours quiet.
 * A member with the dashboard open right now is treated as hot too, so a live dashboard really is live for the person looking at it.
 */
export const HOT_WINDOW_MS = 36 * 60 * 60 * 1000;
export const COLD_INTERVAL_MS = 6 * 60 * 60 * 1000;
const COLD_SPREAD_MS = 20 * 60 * 1000;
const RETRY_AFTER_FAILURE_MS = 30 * 60 * 1000;
/**
 * The roster (everyone who could be polled, as bare ids) is read a page at a time, in a fixed order, until nobody is left, so no member is
 * ever left out by a cap. The ceiling is only a safety stop against something going badly wrong; it is far above the size of the club, and
 * below the number of values one database query can carry, so one list of ids is always safe to send back.
 */
const ROSTER_PAGE = 2_000;
const ROSTER_CEILING = 20_000;
const GITHUB_CONCURRENCY = 6;
const LEETCODE_CONCURRENCY = 3;

const DAY = 24 * 60 * 60;

/**
 * Bump this whenever the way GitHub is read or stored changes. Each member is then synced once with the new logic (a sync only writes real
 * differences, so for most people nothing changes), which also repairs anything the older logic had missed.
 */
const GITHUB_LOGIC_VERSION = "3";

/**
 * GitHub's own feeds run behind: a commit is counted at once, but the activity list built from GitHub's events can take minutes more. So after
 * a real change is found, the member is checked again a few minutes later, whatever the cheap check says, to pick up what had not arrived yet.
 * Those re-checks cost a few GitHub requests and write nothing unless something new turned up.
 */
const SETTLE_AFTER_MS = [3 * 60 * 1000, 10 * 60 * 1000];

/* ------------------------------------------------------------------------------------------------ one member */

type Outcome = "unchanged" | "synced" | "skipped" | "failed";

interface Member extends TokenRow {
  liveActiveAt: Date | null;
  githubUsername: string | null;
  leetcodeUsername: string | null;
  githubStats: { commits: number; pullRequests: number; issues: number } | null;
  leetcodeStats: { easySolved: number; mediumSolved: number; hardSolved: number } | null;
}

async function pollGitHub(member: Member, state: PollState): Promise<Outcome> {
  if (!member.githubUsername || !member.githubTokenCiphertext) return "skipped";
  if (state.get("backoff", member.id)) return "skipped";

  try {
    // GitHub tokens last 8 hours: this renews the member's if it has run out, and puts them on the "sign in again" list if it cannot.
    const auth = await usableGitHubToken(member);
    if (auth.token === null) return auth.reason === "retry" ? "failed" : "skipped";

    const service = createGitHubService(auth.token);
    const etag = state.get("gh:etag", member.id) ?? undefined;
    const probe = await service.probe(member.githubUsername, etag);

    const known = state.get("gh:event", member.id);
    const stored = member.githubStats;
    const numbersMoved =
      !stored || probe.commits !== stored.commits || probe.pullRequests !== stored.pullRequests || probe.issues !== stored.issues;
    // A new public event only counts once we have seen one before: the first look just records where we are, so a deploy does not sync everyone.
    const newEvent = probe.events.modified && !!probe.events.latestEventId && !!known && probe.events.latestEventId !== known;

    if (probe.events.modified) {
      if (probe.events.etag) state.set("gh:etag", member.id, probe.events.etag, DAY);
      if (probe.events.latestEventId && !newEvent) state.set("gh:event", member.id, probe.events.latestEventId, DAY);
    }

    // Two reasons to look again even though the cheap check saw nothing new: this member has not been read with the current logic yet, or a
    // re-check that was promised after their last change has come due.
    const version = state.get("gh:v", member.id);
    const settle = state.get("settle", member.id);
    const settleTimes = (settle ?? "").split(",").filter(Boolean).map(Number);
    const settleDue = settleTimes.length > 0 && settleTimes[0] <= Date.now();
    const needsReread = version !== GITHUB_LOGIC_VERSION;

    if (!numbersMoved && !newEvent && !settleDue && !needsReread) return "unchanged";

    const result = await syncGitHubUser(member.id);
    if (probe.events.modified && probe.events.latestEventId) state.set("gh:event", member.id, probe.events.latestEventId, DAY);
    state.set("gh:v", member.id, GITHUB_LOGIC_VERSION, 30 * DAY);

    if (settleDue) {
      // That re-check is done. If more are promised, keep them. If there are none left, forget the list.
      const rest = settleTimes.slice(1);
      if (rest.length) state.set("settle", member.id, rest.join(","), 60 * 60);
      else state.del("settle", member.id);
    } else if ((numbersMoved || newEvent) && result.changed) {
      // A real change just landed. Come back soon, since GitHub's feeds may not have caught up yet.
      state.set("settle", member.id, SETTLE_AFTER_MS.map((ms) => Date.now() + ms).join(","), 60 * 60);
    }

    // Something looked different, but the sync compares with what is stored and only writes real differences. If it found none (for example
    // a new public event that is not a commit, pull request or issue), nothing was written, so this is not a change.
    return result.changed ? "synced" : "unchanged";
  } catch (error) {
    const status = (error as { status?: number }).status;
    // A token GitHub no longer accepts (the member revoked it, for one) needs a fresh sign in: they are put on that list and not tried again
    // until they have. A rate limit just needs time.
    if (status === 401) {
      await markNeedsSignIn(member.id);
      state.set("backoff", member.id, "token", 60 * 60);
    } else if (status === 403 || status === 429) state.set("backoff", member.id, "limit", 10 * 60);
    console.error(`Live poll failed for GitHub member ${member.githubUsername}:`, error);
    return "failed";
  }
}

async function pollLeetCode(
  member: Member,
  force: boolean,
  state: PollState,
): Promise<{ outcome: Outcome; changed: boolean; activityAdded?: boolean }> {
  if (!member.leetcodeUsername) return { outcome: "skipped", changed: false };
  const last = Number(state.get("lc:checked", member.id) ?? 0);
  // A hot member is checked at most every couple of minutes. A cold member is only here because their 6 hour check is due, so it always goes.
  if (!force && Date.now() - last < LEETCODE_MIN_GAP_MS) return { outcome: "skipped", changed: false };

  try {
    state.set("lc:checked", member.id, String(Date.now()), DAY);
    const stats = await leetcodeService.getUserStats(member.leetcodeUsername, { fast: true });
    if (!stats) return { outcome: "failed", changed: false };

    const stored = member.leetcodeStats;
    const same =
      !!stored &&
      stored.easySolved === stats.easySolved &&
      stored.mediumSolved === stats.mediumSolved &&
      stored.hardSolved === stats.hardSolved;
    if (same) return { outcome: "unchanged", changed: false };

    const { changed, activityAdded } = await leetcodeService.saveStats(member.id, member.leetcodeUsername, stats);
    return changed ? { outcome: "synced", changed: true, activityAdded } : { outcome: "unchanged", changed: false };
  } catch (error) {
    console.error(`Live poll failed for LeetCode member ${member.leetcodeUsername}:`, error);
    return { outcome: "failed", changed: false };
  }
}

/* ------------------------------------------------------------------------------------------------ everyone */

/**
 * Reads every page from `fetchPage` (which returns the rows after `cursor`, in a stable order) until a short page says there are no more.
 * Paging by a cursor on a stable key, rather than taking the first N, is what makes sure the same members are not the ones left out.
 */
export async function collectPages<T extends { id: string }>(
  fetchPage: (cursor: string | undefined, take: number) => Promise<T[]>,
  pageSize = ROSTER_PAGE,
  ceiling = ROSTER_CEILING,
): Promise<{ rows: T[]; truncated: boolean }> {
  const rows: T[] = [];
  let cursor: string | undefined;
  while (rows.length < ceiling) {
    const take = Math.min(pageSize, ceiling - rows.length);
    const page = await fetchPage(cursor, take);
    rows.push(...page);
    // A page that is not full is the last one.
    if (page.length < take) return { rows, truncated: false };
    cursor = page[page.length - 1].id;
  }
  // The ceiling was reached with a full page. That may have been exactly the end, so look for one more before calling it a truncation.
  const extra = await fetchPage(cursor, 1);
  return { rows, truncated: extra.length > 0 };
}

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

interface PollOptions {
  budgetMs?: number;
  onlyUserIds?: string[];
  /** Members known to have the dashboard open on this very server, treated as hot even if Redis has not heard about them yet. */
  watching?: string[];
}

/**
 * A poll that first checks nobody else has just run one. Both QStash (on its schedule) and a server with a dashboard open start polls, so
 * this keeps them from doubling up. Returns null when it stood aside.
 */
export async function runGatedLivePoll(options: PollOptions = {}) {
  if (!(await claimPoll(40))) return null;
  return runLivePoll(options);
}

export async function runLivePoll(options: PollOptions = {}) {
  const state = new PollState();
  try {
    return await poll(state, options);
  } finally {
    await state.flush();
  }
}

async function poll(state: PollState, options: PollOptions) {
  const started = Date.now();
  const deadline = started + (options.budgetMs ?? 45_000);
  const hotSince = new Date(started - HOT_WINDOW_MS);

  // Members whose GitHub connection has run out are left alone until they sign in again: there is nothing to check with. (LeetCode needs no
  // sign in, but a member in this state is not looking at the site, so it can wait too.)
  const signInNeeded = await membersNeedingSignIn();

  // Who could be polled at all, as bare ids. A thousand of these is a few kilobytes, and nothing yet needs a token or a stats row. (A replica
  // is used when there is one: a moment old is fine here, and it keeps this off the database that takes the writes.)
  const rosterWhere: Prisma.UserWhereInput = {
    ...(options.onlyUserIds ? { id: { in: options.onlyUserIds } } : {}),
    ...(signInNeeded.size ? { id: { notIn: [...signInNeeded], ...(options.onlyUserIds ? { in: options.onlyUserIds } : {}) } } : {}),
    lastActive: { gte: new Date(started - GITHUB_ACTIVE_WITHIN_MS) },
    OR: [{ githubTokenCiphertext: { not: null } }, { leetcodeUsername: { not: null } }],
  };
  const { rows: roster, truncated } = await collectPages((cursor, take) =>
    prismaRead.user.findMany({
      where: rosterWhere,
      select: { id: true, liveActiveAt: true },
      orderBy: { id: "asc" },
      take,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    }),
  );
  if (truncated) console.warn(`The live poll's roster hit its ceiling of ${ROSTER_CEILING} members, so the rest are not being polled.`);
  const ids = roster.map((m) => m.id);

  // Who is hot: seen new activity lately, or has GitHub/LeetCode activity on record from the last 36 hours, or has the dashboard open now.
  const [recent] = await Promise.all([
    ids.length
      ? prismaRead.activity.groupBy({
          by: ["userId"],
          where: { userId: { in: ids }, type: { in: SERVICE_ACTIVITY_TYPES }, createdAt: { gte: hotSince } },
        })
      : [],
    // The three notes that decide who is due, for everyone on the roster. Everything else is read below, for the members who are due.
    state.fetch(["watching", "cold:due", "gh:checked"], ids),
  ]);
  const recentIds = new Set(recent.map((row) => row.userId));
  const open = new Set(options.watching);
  const isHot = (m: { id: string; liveActiveAt: Date | null }) =>
    open.has(m.id) || !!state.get("watching", m.id) || (!!m.liveActiveAt && m.liveActiveAt >= hotSince) || recentIds.has(m.id);
  const isDue = (m: { id: string; liveActiveAt: Date | null }) => isHot(m) || Number(state.get("cold:due", m.id) ?? 0) <= started;

  const hot = roster.filter(isHot);
  const dueRoster = roster.filter(isDue);
  // The member who has gone longest without a check goes first, so a slow minute never starves the same people.
  dueRoster.sort((a, b) => Number(state.get("gh:checked", a.id) ?? 0) - Number(state.get("gh:checked", b.id) ?? 0));
  const dueIds = dueRoster.map((m) => m.id);
  const hotIds = new Set(hot.map((m) => m.id));

  // Only now the full rows (with tokens and stats), and only for those who are due: on a quiet minute that is a handful out of everyone.
  const [rows] = await Promise.all([
    dueIds.length
      ? prisma.user.findMany({
          where: { id: { in: dueIds } },
          select: {
            ...TOKEN_FIELDS,
            liveActiveAt: true,
            githubUsername: true,
            leetcodeUsername: true,
            githubStats: { select: { commits: true, pullRequests: true, issues: true } },
            leetcodeStats: { select: { easySolved: true, mediumSolved: true, hardSolved: true } },
          },
        })
      : [],
    state.fetch(["backoff", "gh:etag", "gh:event", "gh:v", "settle", "lc:checked"], dueIds),
  ]);
  const byId = new Map(rows.map((row) => [row.id, row]));
  const due: Member[] = dueIds.flatMap((id) => {
    const row = byId.get(id);
    return row ? [row] : [];
  });

  const [github, leetcode] = await Promise.all([
    lane(due, GITHUB_CONCURRENCY, deadline, async (member) => {
      const outcome = await pollGitHub(member, state);
      if (outcome !== "skipped") state.set("gh:checked", member.id, String(Date.now()), DAY);
      return { id: member.id, outcome };
    }),
    lane(due, LEETCODE_CONCURRENCY, deadline, async (member) => ({
      id: member.id,
      ...(await pollLeetCode(member, !hotIds.has(member.id), state)),
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
  for (const id of checkedCold) {
    const wait = failed.has(id) ? RETRY_AFTER_FAILURE_MS : COLD_INTERVAL_MS + Math.floor(Math.random() * COLD_SPREAD_MS);
    state.set("cold:due", id, String(Date.now() + wait), Math.ceil((wait + 60_000) / 1000));
  }

  // GitHub syncs clear the caches themselves. LeetCode changes are written directly, so clear what shows them once, here.
  if (leetcode.some((r) => r.changed)) await invalidateCache("dashboard", "leaderboard", "members");
  if (leetcode.some((r) => r.activityAdded)) await invalidateCache("activity-feed");

  return {
    members: roster.length,
    hot: hot.length,
    cold: roster.length - hot.length,
    checked: due.length,
    becameHot: [...changed].filter((id) => !hotIds.has(id)).length,
    github: tally(github.map((r) => r.outcome)),
    leetcode: tally(leetcode.map((r) => r.outcome)),
    tookMs: Date.now() - started,
  };
}
