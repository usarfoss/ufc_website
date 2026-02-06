import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { leetcodeService } from '@/lib/leetcode';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, leetcodeUsername: true },
    });

    if (!user || !user.leetcodeUsername) {
      return NextResponse.json(
        { error: 'LeetCode username not found' },
        { status: 400 }
      );
    }

    // Sync LeetCode stats
    const result = await leetcodeService.syncUserStats(user.id, user.leetcodeUsername);

    return NextResponse.json({
      success: true,
      message: 'LeetCode stats synced successfully',
      data: result,
    });
  } catch (error: any) {
    console.error('LeetCode sync error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sync LeetCode stats' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    
    // Get user's last sync time
    const leetcodeStats = await prisma.leetCodeStats.findUnique({
      where: { userId: decoded.userId },
      select: { lastSynced: true },
    });

    return NextResponse.json({
      lastSynced: leetcodeStats?.lastSynced || null,
      canSync: !leetcodeStats?.lastSynced || 
        (new Date().getTime() - new Date(leetcodeStats.lastSynced).getTime()) > 5 * 60 * 1000, // 5 minutes
    });
  } catch (error) {
    console.error('Error checking sync status:', error);
    return NextResponse.json(
      { error: 'Failed to check sync status' },
      { status: 500 }
    );
  }
}
