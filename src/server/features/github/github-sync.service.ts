import "server-only";
import { type ActivityType, type Prisma } from "@prisma/client";
import { invalidateCache } from "@/server/cache/cache";
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

/** Fetches GitHub once, then atomically persists data that all dashboard reads consume. */
export async function syncGitHubUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      githubUsername: true,
      githubTokenCiphertext: true,
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

  await prisma.$transaction(async (transaction) => {
    await transaction.gitHubStats.upsert({
      where: { userId: user.id },
      update: {
        commits: contributions.totalCommits,
        pullRequests: contributions.totalPRs,
        issues: contributions.totalIssues,
        repositories: profile.public_repos,
        followers: profile.followers,
        contributions: contributions.totalCommits + contributions.totalPRs + contributions.totalIssues,
        languages: JSON.stringify(contributions.languages),
        contributionCalendar: contributions.contributionCalendar as unknown as Prisma.InputJsonValue,
        lastSynced: now,
      },
      create: {
        userId: user.id,
        commits: contributions.totalCommits,
        pullRequests: contributions.totalPRs,
        issues: contributions.totalIssues,
        repositories: profile.public_repos,
        followers: profile.followers,
        contributions: contributions.totalCommits + contributions.totalPRs + contributions.totalIssues,
        languages: JSON.stringify(contributions.languages),
        contributionCalendar: contributions.contributionCalendar as unknown as Prisma.InputJsonValue,
        lastSynced: now,
      },
    });

    await transaction.user.update({
      where: { id: user.id },
      data: {
        avatar: profile.avatar_url,
        location: profile.location,
        bio: profile.bio,
      },
    });

    // The same GitHub event can be observed again on a later job run. Upserting
    // keeps its title/message accurate instead of leaving the initial fallback
    // (for example, "Pull request in owner/repo") permanently in the feed.
    await Promise.all(
      activities.map((activity) =>
        transaction.activity.upsert({
          where: { sourceKey: activity.sourceKey },
          create: activity,
          update: {
            type: activity.type,
            description: activity.description,
            metadata: activity.metadata,
            createdAt: activity.createdAt,
          },
        }),
      ),
    );
  });

  await invalidateCache("activity-feed", "dashboard", "leaderboard", "members");

  return {
    userId: user.id,
    syncedAt: now.toISOString(),
    activityCount: activities.length,
  };
}
