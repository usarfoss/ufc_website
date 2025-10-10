import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { githubService } from '@/lib/github';
import { RedisService } from '@/lib/redis';
import { PreemptiveCacheService } from '../../../../lib/preemptive-cache';

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

    // Check for force refresh parameter
    const forceRefresh = searchParams.get('refresh') === 'true';
    
    // Server-side rate limiting for refresh requests
    if (forceRefresh) {
      const rateLimitKey = `refresh_rate_limit:${userId}`;
      const now = Date.now();
      const RATE_LIMIT_DURATION = 10 * 60 * 1000; // 10 minutes
      
      try {
        // Check if user has refreshed recently
        const lastRefresh = await RedisService.getFromRedis(rateLimitKey);
        if (lastRefresh) {
          const timeSinceLastRefresh = now - parseInt(lastRefresh);
          if (timeSinceLastRefresh < RATE_LIMIT_DURATION) {
            const remainingTime = Math.ceil((RATE_LIMIT_DURATION - timeSinceLastRefresh) / 1000);
            return NextResponse.json({ 
              error: 'Rate limited', 
              message: `Please wait ${Math.floor(remainingTime / 60)}m ${remainingTime % 60}s before refreshing again`,
              remainingTime,
              rateLimited: true
            }, { status: 429 });
          }
        }
        
        // Set new refresh timestamp
        await RedisService.setInRedis(rateLimitKey, now.toString(), 10 * 60); // 10 minutes TTL
        
        console.log('🔄 Force refresh requested, clearing all caches and fetching fresh data...');
        await RedisService.clearGlobalCache();
        PreemptiveCacheService.forceRefresh();
      } catch (error) {
        console.warn('Rate limiting check failed, proceeding with refresh:', error);
        // Continue with refresh if rate limiting fails
      }
    }
    
    // Check Redis cache first (with freshness check)
    const cachedActivities = await RedisService.getGlobalActivities(forceRefresh);
    if (cachedActivities && cachedActivities.length > 0 && !forceRefresh) {
      // Ensure strict most-recent-first ordering before paginating
      const sortedCached = [...cachedActivities].sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      const paginatedActivities = sortedCached.slice(offset, offset + limit);
      const hasMore = offset + limit < sortedCached.length;
 
      return NextResponse.json({
        success: true,
        activities: paginatedActivities,
               total: sortedCached.length,
        hasMore,
        nextCursor: hasMore ? (offset + limit).toString() : null,
        cached: true
      });
    }

    // Note: Preemptive cache service is now started from dashboard layout

    // If no cache, fetch data immediately and cache it
    console.log('No cached activities found, fetching fresh data with load balancer...');

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

    // Use batch processing with load balancer for all users
    console.log(`🚀 Fetching activities for ${users.length} users using 5-token load balancer...`);
    const allActivities = await githubService.getBatchUserActivities(users);

    // Sort all activities by timestamp (most recent first)
    const sortedActivities = allActivities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Cache the results in Redis immediately with timestamp
    const activitiesWithTimestamp = sortedActivities.map(activity => ({
      ...activity,
      _cacheTimestamp: Date.now()
    }));
    await RedisService.setGlobalActivities(activitiesWithTimestamp);
    console.log(`Cached ${sortedActivities.length} activities in Redis with timestamp`);

    // Start background refresh for additional users (non-blocking)
    setTimeout(async () => {
      try {
        const allUsers = await prisma.user.findMany({
          where: { githubUsername: { not: null } },
          select: { id: true, name: true, githubUsername: true, avatar: true }
        });

        // Only refresh if we have more users than what we initially fetched
        if (allUsers.length > users.length) {
          console.log('🔄 Starting background refresh for additional users...');
          const additionalUsers = allUsers.slice(users.length);
          
          // Use batch processing for additional users
          const additionalActivities = await githubService.getBatchUserActivities(additionalUsers);
          
          // Merge with existing cache
          const existingCache = await RedisService.getGlobalActivities();
          const mergedActivities = [...(existingCache || []), ...additionalActivities];
          const sortedMerged = mergedActivities.sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
          
          await RedisService.setGlobalActivities(sortedMerged);
          console.log(`✅ Background refresh completed. Total activities: ${sortedMerged.length}`);
        }
      } catch (error) {
        console.warn('⚠️ Background refresh failed:', error);
      }
    }, 2000); // Start after 2 seconds

    // Apply pagination
    const paginatedActivities = sortedActivities.slice(offset, offset + limit);
    const hasMore = offset + limit < sortedActivities.length;

    return NextResponse.json({
      success: true,
      activities: paginatedActivities,
      total: sortedActivities.length,
      hasMore,
      nextCursor: hasMore ? (offset + limit).toString() : null,
      cached: false
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
