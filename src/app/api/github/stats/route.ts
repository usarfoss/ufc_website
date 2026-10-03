import { prisma } from "@/server/db/prisma";
import { json, withApiErrorHandling } from "@/server/http/api";

export const GET = withApiErrorHandling(async () => {
  const users = await prisma.user.findMany({
    include: { githubStats: true },
    where: { githubUsername: { not: null } },
  });

  const data = users
    .map((user) => ({
      id: user.id,
      username: user.githubUsername || user.email?.split("@")[0] || "github-user",
      name: user.name || "Unknown User",
      avatar: user.avatar || "https://github.com/github.png",
      stats: {
        commits: user.githubStats?.commits || 0,
        pullRequests: user.githubStats?.pullRequests || 0,
        issues: user.githubStats?.issues || 0,
        repositories: user.githubStats?.repositories || 0,
        followers: user.githubStats?.followers || 0,
        contributions: user.githubStats?.contributions || 0,
      },
      languages: user.githubStats?.languages || {},
    }))
    .sort((left, right) => right.stats.contributions - left.stats.contributions)
    .map((user, index) => ({
      ...user,
      rank: index + 1,
      points: user.stats.commits + user.stats.pullRequests * 5 + user.stats.issues * 2 + user.stats.repositories * 3,
    }));

  return json({ success: true, data, lastUpdated: new Date().toISOString() });
});
