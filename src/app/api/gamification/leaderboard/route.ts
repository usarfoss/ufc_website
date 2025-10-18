import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { gamificationService } from '@/lib/gamification';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'CONTRIBUTIONS';
    const period = searchParams.get('period') || 'all-time';

    // Try to get cached leaderboard first
    const cachedLeaderboard = await prisma.leaderboard.findUnique({
      where: {
        type_period: {
          type: type as any,
          period,
        },
      },
    });

    // If cache is recent (less than 2 hours old), return it
    if (cachedLeaderboard && 
        (new Date().getTime() - new Date(cachedLeaderboard.updatedAt).getTime()) < 2 * 60 * 60 * 1000) {
      return NextResponse.json({
        leaderboard: JSON.parse(cachedLeaderboard.data as string),
        type,
        period,
        lastUpdated: cachedLeaderboard.updatedAt,
        cached: true,
      });
    }

    // Otherwise, generate fresh leaderboard
    let users;
    
    switch (type) {
      case 'COMMITS':
        users = await prisma.user.findMany({
          include: { 
            githubStats: true,
            achievements: { include: { achievement: true } },
          },
          where: {
            githubStats: { isNot: null },
          },
          orderBy: { githubStats: { commits: 'desc' } },
          take: 100,
        });
        break;
      case 'PULL_REQUESTS':
        users = await prisma.user.findMany({
          include: { 
            githubStats: true,
            achievements: { include: { achievement: true } },
          },
          where: {
            githubStats: { isNot: null },
          },
          orderBy: { githubStats: { pullRequests: 'desc' } },
          take: 100,
        });
        break;
      case 'ISSUES':
        users = await prisma.user.findMany({
          include: { 
            githubStats: true,
            achievements: { include: { achievement: true } },
          },
          where: {
            githubStats: { isNot: null },
          },
          orderBy: { githubStats: { issues: 'desc' } },
          take: 100,
        });
        break;
      case 'EXPERIENCE':
        users = await prisma.user.findMany({
          include: { 
            githubStats: true,
            achievements: { include: { achievement: true } },
          },
          orderBy: { experience: 'desc' },
          take: 100,
        });
        break;
      case 'STREAK':
        users = await prisma.user.findMany({
          include: { 
            githubStats: true,
            achievements: { include: { achievement: true } },
          },
          orderBy: { streak: 'desc' },
          take: 100,
        });
        break;
      default: // CONTRIBUTIONS
        users = await prisma.user.findMany({
          include: { 
            githubStats: true,
            achievements: { include: { achievement: true } },
          },
          where: {
            githubStats: { isNot: null },
          },
          orderBy: { githubStats: { contributions: 'desc' } },
          take: 100,
        });
    }

    const leaderboardData = users.map((user, index) => ({
      rank: index + 1,
      userId: user.id,
      name: user.name || 'Unknown User',
      githubUsername: user.githubUsername,
      avatar: user.avatar || `https://github.com/${user.githubUsername}.png`,
      level: user.level,
      experience: user.experience,
      streak: user.streak,
      achievementCount: user.achievements.length,
      stats: {
        commits: user.githubStats?.commits || 0,
        pullRequests: user.githubStats?.pullRequests || 0,
        issues: user.githubStats?.issues || 0,
        repositories: user.githubStats?.repositories || 0,
        followers: user.githubStats?.followers || 0,
        contributions: user.githubStats?.contributions || 0,
      },
      languages: user.githubStats?.languages ? JSON.parse(user.githubStats.languages as string) : {},
      value: getLeaderboardValue(user, type),
      points: calculatePoints(user, type),
    }));

    // Cache the result
    await prisma.leaderboard.upsert({
      where: {
        type_period: {
          type: type as any,
          period,
        },
      },
      update: {
        data: JSON.stringify(leaderboardData),
      },
      create: {
        type: type as any,
        period,
        data: JSON.stringify(leaderboardData),
      },
    });

    return NextResponse.json({
      leaderboard: leaderboardData,
      type,
      period,
      lastUpdated: new Date().toISOString(),
      cached: false,
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}

function getLeaderboardValue(user: any, type: string): number {
  switch (type) {
    case 'COMMITS':
      return user.githubStats?.commits || 0;
    case 'PULL_REQUESTS':
      return user.githubStats?.pullRequests || 0;
    case 'ISSUES':
      return user.githubStats?.issues || 0;
    case 'EXPERIENCE':
      return user.experience || 0;
    case 'STREAK':
      return user.streak || 0;
    default: // CONTRIBUTIONS
      return user.githubStats?.contributions || 0;
  }
}

function calculatePoints(user: any, type: string): number {
  const stats = user.githubStats;
  if (!stats) return user.experience || 0;

  return (
    (stats.commits || 0) * 1 +
    (stats.pullRequests || 0) * 5 +
    (stats.issues || 0) * 2 +
    (stats.repositories || 0) * 3 +
    (user.experience || 0)
  );
}