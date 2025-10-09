import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { githubService } from '@/lib/github';

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

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '30');

    // Check if we have cached activities in the last 10 minutes
    let cachedActivities: any[] = [];
    try {
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      
      cachedActivities = await prisma.activity.findMany({
        where: {
          type: {
            in: ['COMMIT', 'PULL_REQUEST', 'ISSUE']
          },
          createdAt: {
            gte: tenMinutesAgo
          }
        },
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              name: true,
              githubUsername: true,
              avatar: true
            }
          }
        }
      });
    } catch (dbError) {
      console.warn('Database connection failed, skipping cache:', dbError);
      // Continue without cache
    }

    // If we have recent cached activities, return them
    if (cachedActivities.length > 0) {
      const formattedActivities = cachedActivities.map(activity => ({
        id: activity.id,
        type: (activity.metadata as any)?.type || 'commit',
        message: activity.description,
        repo: (activity.metadata as any)?.repo || 'Unknown',
        target: (activity.metadata as any)?.repo || 'Unknown',
        time: timeAgo(activity.createdAt),
        timestamp: activity.createdAt.toISOString(),
        user: {
          name: activity.user.name || 'Anonymous',
          githubUsername: activity.user.githubUsername,
          avatar: activity.user.avatar
        },
        metadata: {
          source: 'github',
          repo: (activity.metadata as any)?.repo || 'Unknown',
          type: (activity.metadata as any)?.type || 'commit'
        }
      }));

      return NextResponse.json({
        success: true,
        activities: formattedActivities,
        total: formattedActivities.length,
        hasMore: false,
        nextCursor: null,
        cached: true
      });
    }

    // If no cached data, fetch fresh data (but limit to 5 users max)
    const users = await prisma.user.findMany({
      where: {
        githubUsername: {
          not: null
        }
      },
      select: {
        id: true,
        name: true,
        githubUsername: true,
        avatar: true
      },
      take: 5 // Limit to 5 users for faster loading
    });

    if (users.length === 0) {
      return NextResponse.json({
        success: true,
        activities: [],
        total: 0,
        hasMore: false,
        nextCursor: null
      });
    }

    // Fetch activities for limited users
    const allActivities: any[] = [];

    for (const user of users) {
      if (!user.githubUsername) continue;

      try {
        const githubActivities = await githubService.getUserContributions(user.githubUsername);
        
        const userActivities = githubActivities.recentActivity.slice(0, 5).map((activity, index) => ({
          id: `github-${user.id}-${index}`,
          type: activity.type.toLowerCase(),
          message: activity.message,
          repo: activity.repo,
          target: activity.repo,
          time: timeAgo(new Date(activity.date)),
          timestamp: activity.date,
          user: {
            name: user.name || 'Anonymous',
            githubUsername: user.githubUsername,
            avatar: user.avatar
          },
          metadata: {
            source: 'github',
            repo: activity.repo,
            type: activity.type
          }
        }));

        allActivities.push(...userActivities);

        // Cache these activities in database (with error handling)
        try {
          for (const activity of userActivities) {
            let activityType: 'COMMIT' | 'PULL_REQUEST' | 'ISSUE';
            
            switch (activity.type.toLowerCase()) {
              case 'commit':
                activityType = 'COMMIT';
                break;
              case 'pull request':
                activityType = 'PULL_REQUEST';
                break;
              case 'issue':
                activityType = 'ISSUE';
                break;
              default:
                activityType = 'COMMIT'; // Default to commit
            }
            
            await prisma.activity.create({
              data: {
                type: activityType,
                description: activity.message,
                userId: user.id,
                metadata: {
                  repo: activity.repo,
                  type: activity.type,
                  source: 'github'
                }
              }
            });
          }
        } catch (cacheError) {
          console.warn('Failed to cache activities in database:', cacheError);
          // Continue without caching
        }
      } catch (error) {
        console.error(`Failed to fetch activities for user ${user.githubUsername}:`, error);
      }
    }

    // Sort activities
    const sortedActivities = allActivities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const paginatedActivities = sortedActivities.slice(0, limit);

    return NextResponse.json({
      success: true,
      activities: paginatedActivities,
      total: sortedActivities.length,
      hasMore: false,
      nextCursor: null,
      cached: false
    });

  } catch (error) {
    console.error('Cached activities fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
  }
}

function timeAgo(date: Date | string): string {
  const now = new Date();
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  const diff = Math.floor((now.getTime() - targetDate.getTime()) / 1000);
  
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} days ago`;
  return `${Math.floor(diff / 2592000)} months ago`;
}
