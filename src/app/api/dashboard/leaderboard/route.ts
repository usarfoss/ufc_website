import type { NextRequest } from "next/server";
import { getOrSetCached } from "@/server/cache/cache";
import { prisma } from "@/server/db/prisma";
import { json, withApiErrorHandling } from "@/server/http/api";

export const GET = withApiErrorHandling(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const sortBy = searchParams.get("sortBy") || "totalPoints";
  const limit = Math.min(Math.max(Number(searchParams.get("limit")) || 50, 1), 100);
  const payload = await getOrSetCached("leaderboard", `${sortBy}:${limit}`, 60, async () => {
    const users = await prisma.user.findMany({
      where: {
        OR: [{ githubStats: { isNot: null } }, { leetcodeStats: { isNot: null } }],
      },
      include: { githubStats: true, leetcodeStats: true },
    });

    const rankedUsers = users
      .map((user) => {
        const githubPoints =
          (user.githubStats?.commits || 0) + (user.githubStats?.pullRequests || 0) * 5 + (user.githubStats?.issues || 0) * 2;
        const leetcodePoints =
          (user.leetcodeStats?.easySolved || 0) * 2 +
          (user.leetcodeStats?.mediumSolved || 0) * 4 +
          (user.leetcodeStats?.hardSolved || 0) * 6;

        return { user, githubPoints, leetcodePoints, totalPoints: githubPoints + leetcodePoints };
      })
      .filter((entry) => entry.totalPoints > 0)
      .sort((left, right) => {
        if (sortBy === "commits") return (right.user.githubStats?.commits || 0) - (left.user.githubStats?.commits || 0);
        if (sortBy === "pullRequests") return (right.user.githubStats?.pullRequests || 0) - (left.user.githubStats?.pullRequests || 0);
        if (sortBy === "leetcode") return right.leetcodePoints - left.leetcodePoints;
        if (sortBy === "github") return right.githubPoints - left.githubPoints;
        return right.totalPoints - left.totalPoints;
      });

    return {
      success: true,
      users: rankedUsers.slice(0, limit).map((entry, index) => ({
        id: entry.user.id,
        name: entry.user.name || entry.user.githubUsername || "Member",
        githubUsername: entry.user.githubUsername,
        leetcodeUsername: entry.user.leetcodeUsername,
        avatar: entry.user.avatar,
        stats: {
          commits: entry.user.githubStats?.commits || 0,
          pullRequests: entry.user.githubStats?.pullRequests || 0,
          issues: entry.user.githubStats?.issues || 0,
          contributions: entry.user.githubStats?.contributions || 0,
        },
        leetcodeStats: entry.user.leetcodeStats
          ? {
              totalSolved: entry.user.leetcodeStats.totalSolved,
              easySolved: entry.user.leetcodeStats.easySolved,
              mediumSolved: entry.user.leetcodeStats.mediumSolved,
              hardSolved: entry.user.leetcodeStats.hardSolved,
            }
          : null,
        githubPoints: entry.githubPoints,
        leetcodePoints: entry.leetcodePoints,
        points: entry.totalPoints,
        rank: index + 1,
      })),
      total: rankedUsers.length,
      sortBy,
    };
  });

  return json(payload);
});
