import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get('sortBy') || 'totalPoints';
    const limit = parseInt(searchParams.get('limit') || '50');

    // Get all users with either GitHub or LeetCode stats
    const usersWithStats = await prisma.user.findMany({
      where: {
        OR: [
          { githubStats: { isNot: null } },
          { leetcodeStats: { isNot: null } }
        ]
      },
      include: {
        githubStats: true,
        leetcodeStats: true
      }
    });

    // Calculate points for each user
    const usersWithRankings = usersWithStats
      .map(user => {
        const githubPoints = user.githubStats 
          ? (user.githubStats.commits * 1 + user.githubStats.pullRequests * 5 + user.githubStats.issues * 2)
          : 0;
        
        const leetcodePoints = user.leetcodeStats
          ? (user.leetcodeStats.easySolved * 2 + user.leetcodeStats.mediumSolved * 4 + user.leetcodeStats.hardSolved * 6)
          : 0;

        const totalPoints = githubPoints + leetcodePoints;

        return { 
          ...user, 
          githubPoints,
          leetcodePoints,
          totalPoints 
        };
      })
      .filter(user => user.totalPoints > 0)
      .sort((a, b) => {
        switch (sortBy) {
          case 'commits':
            return (b.githubStats?.commits || 0) - (a.githubStats?.commits || 0);
          case 'pullRequests':
            return (b.githubStats?.pullRequests || 0) - (a.githubStats?.pullRequests || 0);
          case 'leetcode':
            return b.leetcodePoints - a.leetcodePoints;
          case 'github':
            return b.githubPoints - a.githubPoints;
          case 'totalPoints':
          default:
            return b.totalPoints - a.totalPoints;
        }
      })
      .map((user, index) => ({
        id: user.id,
        name: user.name || user.email,
        githubUsername: user.githubUsername,
        leetcodeUsername: user.leetcodeUsername,
        avatar: user.avatar,
        stats: {
          commits: user.githubStats?.commits || 0,
          pullRequests: user.githubStats?.pullRequests || 0,
          issues: user.githubStats?.issues || 0,
          contributions: user.githubStats?.contributions || 0
        },
        leetcodeStats: user.leetcodeStats ? {
          totalSolved: user.leetcodeStats.totalSolved,
          easySolved: user.leetcodeStats.easySolved,
          mediumSolved: user.leetcodeStats.mediumSolved,
          hardSolved: user.leetcodeStats.hardSolved
        } : null,
        githubPoints: user.githubPoints,
        leetcodePoints: user.leetcodePoints,
        points: user.totalPoints,
        rank: index + 1
      }));

    // Apply limit after ranking
    const leaderboardUsers = usersWithRankings.slice(0, limit);

    return NextResponse.json({
      success: true,
      users: leaderboardUsers,
      total: usersWithRankings.length,
      sortBy
    });

  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}