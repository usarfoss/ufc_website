import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { githubService } from '@/lib/github';

export async function POST(request: NextRequest) {
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

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { githubStats: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.githubUsername) {
      return NextResponse.json({ error: 'No GitHub username configured' }, { status: 400 });
    }

    // Check rate limiting (allow sync once every 5 minutes)
    if (user.githubStats && user.githubStats.lastSynced) {
      const timeSinceLastSync = Date.now() - user.githubStats.lastSynced.getTime();
      const fiveMinutes = 5 * 60 * 1000;
      
      if (timeSinceLastSync < fiveMinutes) {
        const remainingTime = Math.ceil((fiveMinutes - timeSinceLastSync) / 1000 / 60);
        return NextResponse.json({ 
          error: `Please wait ${remainingTime} minutes before syncing again` 
        }, { status: 429 });
      }
    }

    // Sync GitHub data
    const result = await githubService.syncUserStats(userId, user.githubUsername);

    // Create activity record
    await prisma.activity.create({
      data: {
        type: 'MEMBER_JOIN', // Using existing enum value
        userId,
        description: 'Synced GitHub statistics',
        metadata: {
          action: 'github_sync',
          commits: result.contributions.totalCommits,
          pullRequests: result.contributions.totalPRs,
          issues: result.contributions.totalIssues
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'GitHub data synced successfully',
      stats: {
        commits: result.contributions.totalCommits,
        pullRequests: result.contributions.totalPRs,
        issues: result.contributions.totalIssues,
        repositories: result.profile.public_repos
      }
    });

  } catch (error) {
    console.error('GitHub sync error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to sync GitHub data' 
    }, { status: 500 });
  }
}