import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get('sortBy') || 'contributions';
    const limit = parseInt(searchParams.get('limit') || '50');

    // Smart approach: Get users with GitHub stats only (more efficient)
    const usersWithStats = await prisma.user.findMany({
      where: {
        githubStats: {
          isNot: null
        }
      },
      include: {
        githubStats: true
      },
      // Order by the relevant stat to get top performers first
      orderBy: sortBy === 'commits' 
        ? { githubStats: { commits: 'desc' } }
        : sortBy === 'pullRequests'
        ? { githubStats: { pullRequests: 'desc' } }
        : { githubStats: { contributions: 'desc' } }
    });

    // Calculate points and filter users with contributions > 0
    const usersWithRankings = usersWithStats
      .map(user => {
        const stats = user.githubStats!;
        const points = stats.commits * 1 + stats.pullRequests * 5 + stats.issues * 2;
        return { ...user, points };
      })
      .filter(user => user.githubStats!.contributions > 0)
      .sort((a, b) => {
        switch (sortBy) {
          case 'commits':
            return b.githubStats!.commits - a.githubStats!.commits;
          case 'pullRequests':
            return b.githubStats!.pullRequests - a.githubStats!.pullRequests;
          case 'contributions':
          default:
            return b.points - a.points;
        }
      })
      .map((user, index) => ({
        id: user.id,
        name: user.name || user.email,
        githubUsername: user.githubUsername,
        avatar: user.avatar,
        stats: {
          commits: user.githubStats!.commits,
          pullRequests: user.githubStats!.pullRequests,
          issues: user.githubStats!.issues,
          contributions: user.githubStats!.contributions
        },
        points: user.points,
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