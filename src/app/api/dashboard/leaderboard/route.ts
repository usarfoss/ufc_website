import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get('sortBy') || 'contributions';
    const limit = parseInt(searchParams.get('limit') || '50');

    // Get all users with their GitHub stats
    const users = await prisma.user.findMany({
      include: {
        githubStats: true
      },
      take: limit
    });

    // Calculate points and sort
    const leaderboardUsers = users
      .map(user => {
        const stats = user.githubStats || {
          commits: 0,
          pullRequests: 0,
          issues: 0,
          contributions: 0
        };

        // Calculate points (commits: 1pt, PRs: 5pts, issues: 2pts)
        const points = stats.commits * 1 + stats.pullRequests * 5 + stats.issues * 2;

        return {
          id: user.id,
          name: user.name || user.email,
          githubUsername: user.githubUsername,
          avatar: user.avatar,
          stats: {
            commits: stats.commits,
            pullRequests: stats.pullRequests,
            issues: stats.issues,
            contributions: stats.contributions
          },
          points,
          rank: 0 // Will be set after sorting
        };
      })
      .filter(user => user.stats.contributions > 0) // Only show users with contributions
      .sort((a, b) => {
        switch (sortBy) {
          case 'commits':
            return b.stats.commits - a.stats.commits;
          case 'pullRequests':
            return b.stats.pullRequests - a.stats.pullRequests;
          case 'contributions':
          default:
            return b.points - a.points;
        }
      })
      .map((user, index) => ({
        ...user,
        rank: index + 1
      }));

    return NextResponse.json({
      success: true,
      users: leaderboardUsers,
      total: leaderboardUsers.length,
      sortBy
    });

  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}