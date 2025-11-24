import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { leetcodeService } from '@/lib/leetcode';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const forceSync = searchParams.get('sync') === 'true';

    // Fetch users with LeetCode usernames
    const users = await prisma.user.findMany({
      include: {
        leetcodeStats: true
      },
      where: {
        leetcodeUsername: {
          not: null
        }
      }
    });

    // Auto-sync stale data or force sync if requested
    const syncPromises = users.map(async (user) => {
      if (!user.leetcodeUsername) return user;

      const shouldSync = forceSync || 
        !user.leetcodeStats || 
        (new Date().getTime() - new Date(user.leetcodeStats.lastSynced).getTime()) > 24 * 60 * 60 * 1000; // 24 hours

      if (shouldSync) {
        try {
          await leetcodeService.syncUserStats(user.id, user.leetcodeUsername);
          // Fetch updated stats
          const updatedUser = await prisma.user.findUnique({
            where: { id: user.id },
            include: { leetcodeStats: true }
          });
          return updatedUser || user;
        } catch (error) {
          console.error(`Failed to sync stats for ${user.leetcodeUsername}:`, error);
          return user;
        }
      }

      return user;
    });

    const usersWithStats = await Promise.all(syncPromises);

    // Transform stats for response
    let transformedStats = usersWithStats.map(user => ({
      id: user.id,
      username: user.leetcodeUsername || user.email.split('@')[0],
      name: user.name || 'Unknown User',
      avatar: user.avatar || 'https://github.com/github.png',
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
      })
    }));

    // Filter by username if provided
    if (username) {
      transformedStats = transformedStats.filter(
        stat => stat.username.toLowerCase() === username.toLowerCase()
      );
    }

    // Sort by total points
    transformedStats.sort((a, b) => b.points - a.points);

    return NextResponse.json({
      success: true,
      stats: transformedStats,
      count: transformedStats.length,
    });
  } catch (error) {
    console.error('LeetCode stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch LeetCode stats' },
      { status: 500 }
    );
  }
}
