import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const filter = searchParams.get('filter') || 'all';

    // Build where clause based on filter
    let whereClause: any = {};
    
    if (filter !== 'all') {
      switch (filter) {
        case 'commits':
          whereClause.type = 'COMMIT';
          break;
        case 'pull_requests':
          whereClause.type = 'PULL_REQUEST';
          break;
        case 'issues':
          whereClause.type = 'ISSUE';
          break;
      }
    }

    // Fetch activities with user information
    const activities = await prisma.activity.findMany({
      where: whereClause,
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            githubUsername: true
          }
        },
        project: {
          select: {
            name: true
          }
        },
        event: {
          select: {
            title: true
          }
        }
      }
    });

    // Format activities for frontend
    const formattedActivities = activities.map(activity => ({
      id: activity.id,
      type: activity.type.toLowerCase(),
      message: activity.description,
      repo: activity.metadata ? (activity.metadata as any).repo : null,
      target: activity.project?.name || activity.event?.title || 'System',
      time: timeAgo(activity.createdAt),
      timestamp: activity.createdAt.toISOString(),
      user: {
        name: activity.user.name || 'Anonymous',
        githubUsername: activity.user.githubUsername
      }
    }));

    return NextResponse.json({
      success: true,
      activities: formattedActivities,
      total: formattedActivities.length,
      hasMore: formattedActivities.length === limit,
      filter
    });

  } catch (error) {
    console.error('Activity fetch error:', error);
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