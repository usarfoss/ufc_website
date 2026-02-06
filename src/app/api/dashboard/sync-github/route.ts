import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { githubService } from '@/lib/github';
import { RedisService } from '@/lib/redis';

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

    // Server-side rate limiting for GitHub sync (10 minutes)
    const syncRateLimitKey = `github_sync_rate_limit:${userId}`;
    const now = Date.now();
    const SYNC_RATE_LIMIT_DURATION = 10 * 60 * 1000; // 10 minutes
    
    try {
      // Check if user has synced recently
      const lastSync = await RedisService.getFromRedis(syncRateLimitKey);
      if (lastSync) {
        const timeSinceLastSync = now - parseInt(lastSync);
        if (timeSinceLastSync < SYNC_RATE_LIMIT_DURATION) {
          const remainingTime = Math.ceil((SYNC_RATE_LIMIT_DURATION - timeSinceLastSync) / 1000);
          return NextResponse.json({ 
            error: 'Rate limited', 
            message: `Please wait ${Math.floor(remainingTime / 60)}m ${remainingTime % 60}s before syncing again`,
            remainingTime,
            rateLimited: true
          }, { status: 429 });
        }
      }
    } catch (error) {
      console.warn('Rate limiting check failed, proceeding with sync:', error);
      // Continue with sync if rate limiting fails
    }

    // Sync GitHub data using load balancer
    console.log('🔄 Syncing GitHub data with load balancer...');
    const result = await githubService.syncUserStats(userId, user.githubUsername);
    
    // Set sync rate limit timestamp
    await RedisService.setInRedis(syncRateLimitKey, now.toString(), 10 * 60); // 10 minutes TTL

    // Refresh caches without nuking the global feed
    // 1) Update the user's own cached activities
    await RedisService.clearUserCache(userId);

    // 2) Merge the user's refreshed activities into the global cache to avoid disappearance
    try {
      const contributions = await githubService.getUserContributions(user.githubUsername);

      const userActivities = contributions.recentActivity.map((activity, index) => ({
        id: `github-${user.id}-${activity.date}-${activity.type}-${activity.repo}-${index}`,
        type: activity.type.toLowerCase(),
        message: activity.message,
        repo: activity.repo,
        target: activity.repo,
        time: timeAgo(new Date(activity.date)),
        timestamp: activity.date,
        user: {
          name: user.name || 'Anonymous',
          githubUsername: user.githubUsername || undefined,
          avatar: user.avatar || undefined,
        },
        metadata: {
          source: 'github',
          repo: activity.repo,
          type: activity.type,
        },
      }));

      const existingGlobal = (await RedisService.getGlobalActivities()) || [];
      const filtered = existingGlobal.filter(
        (a: any) => a?.user?.githubUsername !== user.githubUsername
      );
      // Sort strictly by timestamp desc after merge
      const merged = [...userActivities, ...filtered]
        .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 100);
      await RedisService.setGlobalActivities(merged);
    } catch (mergeError) {
      console.warn('Failed to merge user activities into global cache after sync:', mergeError);
    }

    // Only clear leaderboard caches if stats changed significantly
    try {
      const statsChanged = result.contributions.totalCommits > 0 || 
                          result.contributions.totalPRs > 0 || 
                          result.contributions.totalIssues > 0;
      
      if (statsChanged) {
        await prisma.leaderboard.deleteMany({
          where: {
            type: {
              in: ['CONTRIBUTIONS', 'COMMITS', 'PULL_REQUESTS', 'ISSUES']
            }
          }
        });
        console.log('🧹 Cleared leaderboard caches after significant stats change');
      }
    } catch (cacheError) {
      console.warn('Failed to clear leaderboard caches:', cacheError);
    }

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