import "server-only";
import { type ActivityType, type Prisma } from "@prisma/client";
import { invalidateCache, type CacheNamespace } from "@/server/cache/cache";
import { prisma } from "@/server/db/prisma";
import { activityCutoff } from "@/server/features/activity/retention";
import { createGitHubService, type GitHubActivity } from "@/server/integrations/github.service";
import { decryptToken } from "@/server/security/token-encryption";

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
      id: true,
      githubUsername: true,
      githubTokenCiphertext: true,
      avatar: true,
      location: true,
      bio: true,
      githubStats: true,
    },
  });

  if (!user?.githubUsername || !user.githubTokenCiphertext) {
    throw new Error("GitHub authorization is missing for this user.");
  }

  const github = createGitHubService(decryptToken(user.githubTokenCiphertext));
  const { profile, contributions } = await github.fetchUserSnapshot(user.githubUsername);
  const now = new Date();
  // GitHub reports events from the last few weeks. Anything older than we keep would be added now and deleted by the hourly cleanup, then
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
