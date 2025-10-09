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

    // Get user's profile information
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        githubUsername: true,
        name: true,
        email: true
      }
    });

    if (!user?.githubUsername) {
      return NextResponse.json({
        success: true,
        activities: [],
        total: 0,
        hasMore: false,
        nextCursor: null
      });
    }

    try {
      // Fetch real GitHub activities
      const githubActivities = await githubService.getUserContributions(user.githubUsername);
      
      // Format GitHub activities with repo names and user's profile name
      const formattedActivities = githubActivities.recentActivity.map((activity, index) => ({
        id: `github-${index}`,
        type: activity.type.toLowerCase(),
        message: activity.message,
        repo: activity.repo,
        target: activity.repo,
        time: timeAgo(new Date(activity.date)),
        timestamp: activity.date,
        user: {
          name: user.name || 'Anonymous',
          githubUsername: user.githubUsername
        },
        metadata: {
          source: 'github',
          repo: activity.repo,
          type: activity.type
        }
      }));

      return NextResponse.json({
        success: true,
        activities: formattedActivities,
        total: formattedActivities.length,
        hasMore: false,
        nextCursor: null
      });

    } catch (githubError) {
      // No fallback - only show GitHub activities
      return NextResponse.json({
        success: true,
        activities: [],
        total: 0,
        hasMore: false,
        nextCursor: null
      });
    }

  } catch (error) {
    console.error('Activities fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
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