import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { githubService } from '@/lib/github';
import { RedisService } from '@/lib/redis';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let userId: string;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
      userId = decoded.userId;
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        githubStats: true,
        projects: {
          include: {
            project: true
          }
        },
        events: {
          include: {
            event: true
          }
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.githubUsername) {
      const shouldSync = !user.githubStats || 
        (new Date().getTime() - user.githubStats.lastSynced.getTime()) > 30 * 60 * 1000; // 30 minutes

      if (shouldSync) {
        try {
          console.log(`🔄 Auto-syncing GitHub data for user ${user.githubUsername} on dashboard visit...`);
          
          // Sync user stats
          await githubService.syncUserStats(userId, user.githubUsername);
          
          // Clear user's individual cache to ensure fresh data
          await RedisService.clearUserCache(userId);
          
          // Update global activities cache with user's fresh activities
          try {
            const userActivities = await githubService.getBatchUserActivities([{
              id: user.id,
              name: user.name,
              githubUsername: user.githubUsername,
              avatar: user.avatar
            }]);
            
            if (userActivities.length > 0) {
              // Get existing global cache
              const existingCache = await RedisService.getGlobalActivities();
              
              // Remove old activities for this user
              const filteredCache = (existingCache || []).filter(activity => 
                activity.user?.githubUsername !== user.githubUsername
              );
              
              // Add new activities
              const updatedCache = [...filteredCache, ...userActivities];
              
              // Sort by timestamp and cache
              const sortedCache = updatedCache.sort((a, b) => 
                new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
              );
              
              await RedisService.setGlobalActivities(sortedCache);
              console.log(`📊 Updated global cache with ${userActivities.length} fresh activities from ${user.githubUsername}`);
            }
          } catch (cacheError) {
            console.warn('Failed to update global cache:', cacheError);
          }
          
          // Fetch updated user data
          const updatedUser = await prisma.user.findUnique({
            where: { id: userId },
            include: {
              githubStats: true,
              projects: { include: { project: true } },
              events: { include: { event: true } },
              activities: { orderBy: { createdAt: 'desc' }, take: 10 }
            }
          });
          if (updatedUser) {
            Object.assign(user, updatedUser);
          }
          
          console.log(`✅ Auto-sync completed for user ${user.githubUsername}`);
        } catch (error) {
          console.error('Failed to sync GitHub stats:', error);
        }
      }
    }

    const allUsers = await prisma.user.findMany({
      include: { githubStats: true }
    });

    // Calculate points and filter users with contributions > 0 to match leaderboard logic
    const usersWithContributions = allUsers
      .filter(user => user.githubStats && user.githubStats.contributions > 0)
      .map(user => {
        const stats = user.githubStats || {
          commits: 0,
          pullRequests: 0,
          issues: 0,
          contributions: 0
        };
        const points = stats.commits * 1 + stats.pullRequests * 5 + stats.issues * 2;
        return { ...user, points };
      })
      .sort((a, b) => b.points - a.points); // Sort by points like leaderboard

    const userRank = usersWithContributions.findIndex(u => u.id === userId) + 1;
    const totalUsers = usersWithContributions.length;

    const getRandomChange = () => {
      const changes = ['+5%', '+12%', '+8%', '+15%', '+3%', '+20%', '-2%', '+7%'];
      return changes[Math.floor(Math.random() * changes.length)];
    };

    const githubStats = user.githubStats;
    const stats = {
      totalCommits: {
        value: githubStats?.commits?.toString() || '0',
        change: getRandomChange(),
        icon: 'GitCommit',
        color: '#0B874F'
      },
      pullRequests: {
        value: githubStats?.pullRequests?.toString() || '0',
        change: getRandomChange(),
        icon: 'GitPullRequest',
        color: '#F5A623'
      },
      leaderboardRank: {
        value: userRank > 0 ? `#${userRank}` : '#-',
        change: userRank > 0 ? `of ${totalUsers}` : 'N/A',
        icon: 'Trophy',
        color: '#E74C3C'
      },
      activeProjects: {
        value: user.projects.length.toString(),
        change: getRandomChange(),
        icon: 'Star',
        color: '#9B59B6'
      }
    };

    const recentActivity = [];

    // Only show GitHub activities, no internal activities
    if (user.githubUsername) {
      try {
        const contributions = await githubService.getUserContributions(user.githubUsername);
        for (const activity of contributions.recentActivity.slice(0, 5)) {
          recentActivity.push({
            type: activity.type.toLowerCase().replace('event', ''),
            message: activity.message,
            repo: activity.repo,
            time: timeAgo(new Date(activity.date))
          });
        }
      } catch (error) {
        console.error('Failed to fetch GitHub activity:', error);
      }
    }

    recentActivity.sort((a, b) => {
      const timeA = parseTimeAgo(a.time);
      const timeB = parseTimeAgo(b.time);
      return timeA - timeB;
    });

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weeklyActivities = await prisma.activity.findMany({
      where: {
        userId,
        createdAt: { gte: weekAgo }
      }
    });

    const githubWeeklyStats = {
      commits: weeklyActivities.filter(a => a.type === 'COMMIT').length,
      prsMerged: weeklyActivities.filter(a => a.type === 'PULL_REQUEST').length,
      issuesClosed: weeklyActivities.filter(a => a.type === 'ISSUE').length
    };

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        githubUsername: user.githubUsername
      },
      stats,
      recentActivity: recentActivity.slice(0, 10),
      githubWeeklyStats,
    });

    return response;

  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}

function timeAgo(date: Date): string {
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} days ago`;
  return `${Math.floor(diff / 2592000)} months ago`;
}

function parseTimeAgo(timeStr: string): number {
  if (timeStr === 'Just now') return 0;
  
  const match = timeStr.match(/(\d+)\s+(minute|hour|day|month)s?\s+ago/);
  if (!match) return 0;
  
  const value = parseInt(match[1]);
  const unit = match[2];
  
  switch (unit) {
    case 'minute': return value;
    case 'hour': return value * 60;
    case 'day': return value * 60 * 24;
    case 'month': return value * 60 * 24 * 30;
    default: return 0;
  }
} 