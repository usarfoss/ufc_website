import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { githubService } from '@/lib/github';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || !user.githubUsername) {
      return NextResponse.json(
        { error: 'GitHub username not found' },
        { status: 400 }
      );
    }

    // Sync GitHub stats
    const result = await githubService.syncUserStats(user.id, user.githubUsername);

    return NextResponse.json({
      success: true,
      message: 'GitHub stats synced successfully',
      data: result,
    });
  } catch (error: any) {
    console.error('GitHub sync error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sync GitHub stats' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    
    // Get user's last sync time
    const githubStats = await prisma.gitHubStats.findUnique({
      where: { userId: decoded.userId },
      select: { lastSynced: true },
    });

    return NextResponse.json({
      lastSynced: githubStats?.lastSynced || null,
      canSync: !githubStats?.lastSynced || 
        (new Date().getTime() - new Date(githubStats.lastSynced).getTime()) > 5 * 60 * 1000, // 5 minutes
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get sync status' },
      { status: 500 }
    );
  }
}