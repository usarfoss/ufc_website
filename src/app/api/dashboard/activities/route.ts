import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get user from JWT token
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const cursor = searchParams.get('cursor');

    // Fetch user activities
    const activities = await prisma.activity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: { project: true, event: true }
    });

    const hasMore = activities.length > limit;
    const pageItems = activities.slice(0, limit);
    const nextCursor = hasMore ? activities[limit].id : null;

    // Format activities for frontend
    const formattedActivities = activities.map(activity => ({
      id: activity.id,
      type: activity.type.toLowerCase(),
      message: activity.description,
      repo: activity.metadata ? (activity.metadata as any).repo || 'Internal' : 'Internal',
      target: activity.project?.name || activity.event?.title || 'System',
      time: timeAgo(activity.createdAt),
      timestamp: activity.createdAt.toISOString(),
      metadata: activity.metadata
    }));

    // Count for UI indicators (lightweight index-backed)
    const totalCount = await prisma.activity.count({ where: { userId } });

    return NextResponse.json({
      success: true,
      activities: formattedActivities,
      total: totalCount,
      hasMore,
      nextCursor
    });

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