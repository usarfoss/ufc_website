import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db/prisma";
import { leetcodeService } from "@/server/integrations/leetcode.service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    // Fetch users with LeetCode usernames
    const users = await prisma.user.findMany({
      include: {
        leetcodeStats: true,
      },
      where: {
        leetcodeUsername: {
          not: null,
        },
      },
    });

    // These numbers are kept fresh by the background job (api/jobs/leetcode-sync), so reading them never calls LeetCode.
    const usersWithStats = users;

    // Transform stats for response
    let transformedStats = usersWithStats.map((user) => ({
      id: user.id,
      username: user.leetcodeUsername || user.email?.split("@")[0] || "leetcode-user",
      name: user.name || "Unknown User",
      avatar: user.avatar || "https://github.com/github.png",
      stats: {
        totalSolved: user.leetcodeStats?.totalSolved || 0,
        easySolved: user.leetcodeStats?.easySolved || 0,
        mediumSolved: user.leetcodeStats?.mediumSolved || 0,
        hardSolved: user.leetcodeStats?.hardSolved || 0,
        ranking: user.leetcodeStats?.ranking || null,
        reputation: user.leetcodeStats?.reputation || 0,
      },
      points: leetcodeService.calculatePoints({
        easySolved: user.leetcodeStats?.easySolved || 0,
        mediumSolved: user.leetcodeStats?.mediumSolved || 0,
        hardSolved: user.leetcodeStats?.hardSolved || 0,
      }),
    }));

    // Filter by username if provided
    if (username) {
      transformedStats = transformedStats.filter((stat) => stat.username.toLowerCase() === username.toLowerCase());
    }

    // Sort by total points
    transformedStats.sort((a, b) => b.points - a.points);

    return NextResponse.json({
      success: true,
      stats: transformedStats,
      count: transformedStats.length,
    });
  } catch (error) {
    console.error("LeetCode stats error:", error);
    return NextResponse.json({ error: "Failed to fetch LeetCode stats" }, { status: 500 });
  }
}
