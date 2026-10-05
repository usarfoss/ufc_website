import "server-only";
import { type ActivityType, type Prisma } from "@prisma/client";
import { invalidateCache, type CacheNamespace } from "@/server/cache/cache";
import { allowRecheck, seenTwice } from "@/server/cache/confirm";
import { prisma } from "@/server/db/prisma";
import { activityCutoff } from "@/server/features/activity/retention";
import { looksWrong } from "./sanity";
import { createGitHubService, type GitHubActivity } from "@/server/integrations/github.service";
import { markNeedsSignIn } from "@/server/auth/reauth";
import { TOKEN_FIELDS, usableGitHubToken } from "@/server/integrations/github-token";
import { enqueueGitHubSync } from "@/server/jobs/github-sync";

const activityTypeFor = (activity: GitHubActivity): ActivityType | null => {
  switch (activity.type.toLowerCase()) {
    case "push":
    case "commit":
      return "COMMIT";
    case "pullrequest":
    case "pull_request":
      return "PULL_REQUEST";
    case "issues":
    case "issue":
      return "ISSUE";
    default:
      return null;
  }
};

const same = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

/**
 * Reads GitHub once and brings the database in line with it, writing only what is actually different.
 *
 * If nothing is different, nothing is written, no row is touched, and no cache is cleared: `changed` comes back false. Caches are cleared only
 * when the database was really changed, and only the ones that show what changed. So running this too often costs a few GitHub requests and
 * a few reads, never a write, and never makes a dashboard reload data that has not moved.
 */
export async function syncGitHubUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      ...TOKEN_FIELDS,
      githubUsername: true,
      avatar: true,
      location: true,
      bio: true,
      githubStats: true,
    },
  });

  if (!user?.githubUsername || !user.githubTokenCiphertext) {
    throw new Error("GitHub authorization is missing for this user.");
  }

  const skipped = (reason: string) => ({
    userId: user.id,
    syncedAt: new Date().toISOString(),
    activityCount: 0,
    changed: false,
    skipped: reason,
  });

  // GitHub tokens last 8 hours, so this renews the member's if it has run out. If it cannot be renewed they are asked to sign in again, and
  // there is nothing to retry until they do (a failed job here would only be retried by QStash to the same end).
  const auth = await usableGitHubToken(user);
  if (auth.token === null) {
    if (auth.reason === "retry") throw new Error("GitHub could not be reached to renew this member's token.");
    return skipped(auth.reason);
  }

  let snapshot: Awaited<ReturnType<ReturnType<typeof createGitHubService>["fetchUserSnapshot"]>>;
  try {
    snapshot = await createGitHubService(auth.token).fetchUserSnapshot(user.githubUsername);
  } catch (error) {
    // The token had time left on paper but GitHub no longer accepts it (the member revoked it, for one). Only signing in again fixes that.
    if ((error as { status?: number }).status === 401) {
      await markNeedsSignIn(user.id);
      return skipped("needs-sign-in");
    }
    throw error;
  }
  const { profile, contributions } = snapshot;
  const now = new Date();
  // GitHub reports events from the last few weeks. Anything older than we keep would be added now and deleted by the next cleanup, then
  // added again by the next sync, so it would keep coming back onto dashboards. Only recent events are imported.
  const cutoff = activityCutoff();
  const activities = contributions.recentActivity.flatMap((activity) => {
    const type = activityTypeFor(activity);

    if (!type || new Date(activity.date) < cutoff) return [];

    return [
      {
        sourceKey: `github:${activity.sourceId}`,
        type,
        userId: user.id,
        description: activity.message,
        metadata: {
          source: "github",
          repo: activity.repo,
          occurredAt: activity.date,
        },
        createdAt: new Date(activity.date),
      },
    ];
  });

  // Pushes used to be stored under the id of the GitHub event. They are now stored under the commit's sha, so the old copies go.
  const legacyKeys = contributions.recentActivity.flatMap((activity) =>
    activity.legacySourceId ? [`github:${activity.legacySourceId}`] : [],
  );

  // What is already stored, so only the difference is written.
  const [stored, legacyRows] = await Promise.all([
    prisma.activity.findMany({
      where: { sourceKey: { in: activities.map((a) => a.sourceKey) } },
      select: { sourceKey: true, type: true, description: true, createdAt: true },
    }),
    legacyKeys.length ? prisma.activity.findMany({ where: { sourceKey: { in: legacyKeys } }, select: { id: true } }) : [],
  ]);
  const storedByKey = new Map(stored.map((row) => [row.sourceKey, row]));
  const toCreate = activities.filter((a) => !storedByKey.has(a.sourceKey));
  // The same GitHub item can be seen again on a later run. If its title or time has since improved (a fallback such as "Pull request in
  // owner/repo" replaced by the real title), the stored copy is corrected.
  const toUpdate = activities.filter((a) => {
    const row = storedByKey.get(a.sourceKey);
    return !!row && (row.description !== a.description || row.type !== a.type || row.createdAt.getTime() !== a.createdAt.getTime());
  });

  const old = user.githubStats;
  const nextStats = {
    commits: contributions.totalCommits,
    pullRequests: contributions.totalPRs,
    issues: contributions.totalIssues,
    repositories: profile.public_repos,
    followers: profile.followers,
    contributions: contributions.totalCommits + contributions.totalPRs + contributions.totalIssues,
    languages: JSON.stringify(contributions.languages),
    contributionCalendar: contributions.contributionCalendar as unknown as Prisma.InputJsonValue,
  };
  // A sharp fall in the totals is not believed the first time (see sanity.ts). Nothing is written, and the next look decides: if GitHub says the
  // same again it was real, and if the numbers come back it was a hiccup that never touched the leaderboard.
  if (old && looksWrong(old, nextStats)) {
    const signature = `${nextStats.commits}/${nextStats.pullRequests}/${nextStats.issues}`;
    if (!(await seenTwice(`github:${user.id}`, signature))) {
      console.warn(
        `GitHub totals for ${user.githubUsername} fell sharply (${old.commits}/${old.pullRequests}/${old.issues} to ${signature}); waiting for a second look.`,
      );
      // Take that second look in a minute, for this member only, whichever group they are in. (Members who have been active would be looked
      // at again by the next poll anyway, but quiet ones are only polled every six hours.)
      if (await allowRecheck(`github:${user.id}`)) {
        await enqueueGitHubSync(user.id, "recheck", 60).catch((error) => console.error("Could not queue the re-check:", error));
      }
      return { userId: user.id, syncedAt: now.toISOString(), activityCount: activities.length, changed: false };
    }
  }

  const statsChanged =
    !old ||
    old.commits !== nextStats.commits ||
    old.pullRequests !== nextStats.pullRequests ||
    old.issues !== nextStats.issues ||
    old.repositories !== nextStats.repositories ||
    old.followers !== nextStats.followers ||
    old.contributions !== nextStats.contributions ||
    !same(old.languages, nextStats.languages) ||
    !same(old.contributionCalendar, nextStats.contributionCalendar);
  const profileChanged =
    user.avatar !== (profile.avatar_url ?? null) || user.location !== (profile.location ?? null) || user.bio !== (profile.bio ?? null);
  const activityChanged = toCreate.length > 0 || toUpdate.length > 0 || legacyRows.length > 0;

  if (!statsChanged && !profileChanged && !activityChanged) {
    return { userId: user.id, syncedAt: now.toISOString(), activityCount: activities.length, changed: false };
  }

  await prisma.$transaction(async (transaction) => {
    if (legacyRows.length) await transaction.activity.deleteMany({ where: { id: { in: legacyRows.map((r) => r.id) } } });

    if (statsChanged) {
      await transaction.gitHubStats.upsert({
        where: { userId: user.id },
        update: { ...nextStats, lastSynced: now },
        create: { userId: user.id, ...nextStats, lastSynced: now },
      });
    }

    if (profileChanged) {
      await transaction.user.update({
        where: { id: user.id },
        data: { avatar: profile.avatar_url, location: profile.location, bio: profile.bio },
      });
    }

    if (toCreate.length) await transaction.activity.createMany({ data: toCreate, skipDuplicates: true });
    for (const activity of toUpdate) {
      await transaction.activity.update({
        where: { sourceKey: activity.sourceKey },
        data: { type: activity.type, description: activity.description, metadata: activity.metadata, createdAt: activity.createdAt },
      });
    }
  });

  // Clear exactly the caches that show what changed, and only now that the database really did.
  const namespaces: CacheNamespace[] = [];
  if (statsChanged || profileChanged) namespaces.push("dashboard", "leaderboard", "members");
  if (activityChanged) namespaces.push("activity-feed", "dashboard");
  await invalidateCache(...new Set(namespaces));

  return { userId: user.id, syncedAt: now.toISOString(), activityCount: activities.length, changed: true };
}
