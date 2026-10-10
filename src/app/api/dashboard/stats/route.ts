import type { NextRequest } from "next/server";
import { getOrSetCached } from "@/server/cache/cache";
import { requireSession } from "@/server/auth/session";
import { prisma } from "@/server/db/prisma";
import { notExpired } from "@/server/features/activity/retention";
import { json, notFound, withApiErrorHandling } from "@/server/http/api";

export const GET = withApiErrorHandling(async (request: NextRequest) => {
  const session = await requireSession(request);
  const payload = await getOrSetCached("dashboard", `stats:${session.userId}`, 30, async () => {
    const [user, recentActivity, memberCount] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.userId },
        select: {
          id: true,
          name: true,
          githubUsername: true,
          githubStats: { select: { commits: true, pullRequests: true, issues: true, lastSynced: true } },
        },
      }),
      prisma.activity.findMany({
        where: { userId: session.userId, ...notExpired() },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { id: true, type: true, description: true, metadata: true, createdAt: true },
      }),
      prisma.gitHubStats.count(),
    ]);

    if (!user) {
      throw notFound("User not found");
    }

    // Where this member stands: one plus the number of people with more points. (This used to load every member's numbers and sort them, for
    // every member, every thirty seconds. Counting is one cheap query however many members there are.) Ties share a place, as on the leaderboard.
    const stats = user.githubStats;
    let rank = 0;
    if (stats) {
      const mine = stats.commits + stats.pullRequests * 5 + stats.issues * 2;
      const [{ ahead }] = await prisma.$queryRaw<{ ahead: bigint }[]>`
        SELECT COUNT(*)::bigint AS ahead FROM github_stats WHERE ("commits" + "pullRequests" * 5 + "issues" * 2) > ${mine}`;
      rank = Number(ahead) + 1;
    }

    return {
      success: true,
      user: { id: user.id, name: user.name, githubUsername: user.githubUsername },
      stats: {
        totalCommits: { value: String(user.githubStats?.commits || 0), change: "Stored", icon: "GitCommit", color: "#0B874F" },
        pullRequests: { value: String(user.githubStats?.pullRequests || 0), change: "Stored", icon: "GitPullRequest", color: "#F5A623" },
        leaderboardRank: {
          value: rank > 0 ? `#${rank}` : "#-",
          change: rank > 0 ? `of ${memberCount}` : "N/A",
          icon: "Trophy",
          color: "#E74C3C",
        },
      },
      recentActivity: recentActivity.map((activity) => ({
        id: activity.id,
        type: activity.type.toLowerCase(),
        message: activity.description,
        repo: (activity.metadata as { repo?: string } | null)?.repo || null,
        time: timeAgo(activity.createdAt),
        timestamp: activity.createdAt.toISOString(),
      })),
      lastSynced: user.githubStats?.lastSynced || null,
    };
  });

  return json(payload);
});

function timeAgo(date: Date) {
  const minutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60_000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minutes ago`;
  if (minutes < 1_440) return `${Math.floor(minutes / 60)} hours ago`;
  return `${Math.floor(minutes / 1_440)} days ago`;
}
