import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { githubService } from '@/lib/github';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'all';
    const sortBy = searchParams.get('sortBy') || 'contributions';
    const forceSync = searchParams.get('sync') === 'true';

    // Fetch users with GitHub usernames
    const users = await prisma.user.findMany({
      include: {
        githubStats: true
      },
      where: {
        githubUsername: {
          not: null
        }
      }
    });

    // Auto-sync stale data or force sync if requested
    const syncPromises = users.map(async (user) => {
      if (!user.githubUsername) return user;

      const shouldSync = forceSync || 
        !user.githubStats || 
        (new Date().getTime() - new Date(user.githubStats.lastSynced).getTime()) > 24 * 60 * 60 * 1000; // 24 hours

      if (shouldSync) {
        try {
          await githubService.syncUserStats(user.id, user.githubUsername);
          // Fetch updated stats
          const updatedUser = await prisma.user.findUnique({
            where: { id: user.id },
            include: { githubStats: true }
          });
          return updatedUser || user;
        } catch (error) {
          console.error(`Failed to sync stats for ${user.githubUsername}:`, error);
          return user;
        }
      }
      return user;
    });

    const usersWithStats = await Promise.all(syncPromises);

    // Transform data to match expected format
    let transformedStats = usersWithStats.map(user => ({
      id: user.id,
      username: user.githubUsername || user.email.split('@')[0],
      name: user.name || 'Unknown User',
      avatar: user.avatar || 'https://github.com/github.png',
      stats: {
        commits: user.githubStats?.commits || 0,
        pullRequests: user.githubStats?.pullRequests || 0,
        issues: user.githubStats?.issues || 0,
        repositories: user.githubStats?.repositories || 0,
        followers: user.githubStats?.followers || 0,
        contributions: user.githubStats?.contributions || 0
      },
      weeklyStats: {
        commits: Math.floor((user.githubStats?.commits || 0) * 0.1), // Mock weekly as 10% of total
        pullRequests: Math.floor((user.githubStats?.pullRequests || 0) * 0.2),
        issues: Math.floor((user.githubStats?.issues || 0) * 0.15)
      },
      languages: user.githubStats?.languages ? JSON.parse(user.githubStats.languages as string) : {}
    }));

    // Sort the data based on the sortBy parameter
    switch (sortBy) {
      case 'commits':
        transformedStats.sort((a, b) => b.stats.commits - a.stats.commits);
        break;
      case 'pullRequests':
        transformedStats.sort((a, b) => b.stats.pullRequests - a.stats.pullRequests);
        break;
      case 'issues':
        transformedStats.sort((a, b) => b.stats.issues - a.stats.issues);
        break;
      default:
        transformedStats.sort((a, b) => b.stats.contributions - a.stats.contributions);
    }

    // Add ranking and points
    const rankedStats = transformedStats.map((user, index) => ({
      ...user,
      rank: index + 1,
      points: calculatePoints(user.stats)
    }));

    return NextResponse.json({
      success: true,
      data: rankedStats,
      period,
      sortBy,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('GitHub stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch GitHub stats' },
      { status: 500 }
    );
  }
}

function calculatePoints(stats: any) {
  return (
    stats.commits * 1 +
    stats.pullRequests * 5 +
    stats.issues * 2 +
    stats.repositories * 3
  );
}