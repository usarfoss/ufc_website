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
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const filter = searchParams.get('filter') || 'all';

    // Get all users with GitHub usernames
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
      }
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

    // Limit to first 10 users to avoid too many API calls
    const limitedUsers = users.slice(0, 10);
    
    // Fetch GitHub activities for users in parallel (but with concurrency limit)
    const allActivities: Array<{
      id: string;
      type: string;
      message: string;
      repo: string;
      target: string;
      time: string;
      timestamp: string;
      user: {
        name: string;
        githubUsername?: string;
        avatar?: string;
      };
      metadata: {
        source: string;
        repo: string;
        type: string;
      };
    }> = [];

    // Process users in batches of 3 to avoid rate limiting
    const batchSize = 3;
    for (let i = 0; i < limitedUsers.length; i += batchSize) {
      const batch = limitedUsers.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (user) => {
        if (!user.githubUsername) return [];

        try {
          const githubActivities = await githubService.getUserContributions(user.githubUsername);
          
          return githubActivities.recentActivity.map((activity, index) => ({
            id: `github-${user.id}-${index}`,
            type: activity.type.toLowerCase(),
            message: activity.message,
            repo: activity.repo,
            target: activity.repo,
            time: timeAgo(new Date(activity.date)),
            timestamp: activity.date,
            user: {
              name: user.name || 'Anonymous',
              githubUsername: user.githubUsername || undefined,
              avatar: user.avatar || undefined
            },
            metadata: {
              source: 'github',
              repo: activity.repo,
              type: activity.type
            }
          }));
        } catch (error) {
          console.error(`Failed to fetch activities for user ${user.githubUsername}:`, error);
          return [];
        }
      });

      const batchResults = await Promise.all(batchPromises);
      allActivities.push(...batchResults.flat());
    }

    // Sort all activities by timestamp (most recent first)
    const sortedActivities = allActivities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Apply filters
    let filteredActivities = sortedActivities;
    if (filter !== 'all') {
      switch (filter) {
        case 'commits':
          filteredActivities = sortedActivities.filter(activity => 
            activity.type.toLowerCase() === 'commit'
          );
          break;
        case 'pull_requests':
          filteredActivities = sortedActivities.filter(activity => 
            activity.type.toLowerCase() === 'pull request'
          );
          break;
        case 'issues':
          filteredActivities = sortedActivities.filter(activity => 
            activity.type.toLowerCase() === 'issue'
          );
          break;
      }
    }

    // Apply pagination
    const paginatedActivities = filteredActivities.slice(offset, offset + limit);
    const hasMore = offset + limit < filteredActivities.length;

    return NextResponse.json({
      success: true,
      activities: paginatedActivities,
      total: filteredActivities.length,
      hasMore,
      nextCursor: hasMore ? (offset + limit).toString() : null
    });

  } catch (error) {
    console.error('Global activities fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch global activities' }, { status: 500 });
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
