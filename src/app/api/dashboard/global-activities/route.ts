import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { githubService } from '@/lib/github';
import { RedisService } from '@/lib/redis';

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

           // Check Redis cache first
           const cachedActivities = await RedisService.getGlobalActivities();
           if (cachedActivities && cachedActivities.length > 0) {
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

           // If no cache, start a full background rebuild covering ALL users
           // Respond quickly with a partial build for UX, but kick off full build with a lock
           const acquired = await RedisService.tryAcquireGlobalBuildLock(180);
           if (acquired) {
             (async () => {
               try {
                 const allUsers = await prisma.user.findMany({
                   where: { githubUsername: { not: null } },
                   select: { id: true, name: true, githubUsername: true, avatar: true }
                 });

                 const allActivities: any[] = [];
                 const batchSize = 8; // larger batch for faster total build
                 const maxConcurrent = 8;
                 
                 for (let i = 0; i < allUsers.length; i += batchSize) {
                   const batch = allUsers.slice(i, i + batchSize);
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
                       console.warn(`Rebuild failed for user ${user.githubUsername}:`, error);
                       return [];
                     }
                   });
                   const batchResults = await Promise.all(batchPromises);
                   allActivities.push(...batchResults.flat());
                 }

                 const sortedActivities = allActivities.sort((a, b) =>
                   new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                 );

                 await RedisService.setGlobalActivities(sortedActivities);
                 await RedisService.setGlobalMeta({ builtAt: Date.now(), total: sortedActivities.length });
               } catch (e) {
                 console.warn('Global rebuild failed:', e);
               } finally {
                 await RedisService.releaseGlobalBuildLock();
               }
             })();
           }

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

           // Process users in batches of 5 for faster loading (increased from 3)
           const batchSize = 5;
           const maxUsers = Math.min(limitedUsers.length, 8); // Limit to 8 users max for speed
           
           for (let i = 0; i < maxUsers; i += batchSize) {
             const batch = limitedUsers.slice(i, i + batchSize);
             
             const batchPromises = batch.map(async (user) => {
               if (!user.githubUsername) return [];

               try {
                 // Use timeout to prevent hanging
                 const controller = new AbortController();
                 const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout per user
                 
                 const githubActivities = await githubService.getUserContributions(user.githubUsername);
                 clearTimeout(timeoutId);
                 
                 return githubActivities.recentActivity.map((activity, index) => ({
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
                     avatar: user.avatar || undefined
                   },
                   metadata: {
                     source: 'github',
                     repo: activity.repo,
                     type: activity.type
                   }
                 }));
               } catch (error) {
                 if (error instanceof Error && error.name === 'AbortError') {
                   console.warn(`Timeout fetching activities for user ${user.githubUsername}`);
                 } else {
                   console.error(`Failed to fetch activities for user ${user.githubUsername}:`, error);
                 }
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

           // Cache the results in Redis with compression
           await RedisService.setGlobalActivities(sortedActivities);
           
           // Start background prefetching for next request
           setTimeout(async () => {
             try {
               await RedisService.prefetchGlobalActivities(async () => {
                 // Re-fetch fresh data in background
                 const freshUsers = await prisma.user.findMany({
                   where: { githubUsername: { not: null } },
                   select: { id: true, name: true, githubUsername: true, avatar: true }
                 });
                 
                 const freshActivities: any[] = [];
                 const batchSize = 3;
                 
                 for (let i = 0; i < Math.min(freshUsers.length, 10); i += batchSize) {
                   const batch = freshUsers.slice(i, i + batchSize);
                   const batchPromises = batch.map(async (user) => {
                     if (!user.githubUsername) return [];
                     try {
                       const githubActivities = await githubService.getUserContributions(user.githubUsername);
                       return githubActivities.recentActivity.map((activity, index) => ({
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
                           avatar: user.avatar || undefined
                         },
                         metadata: {
                           source: 'github',
                           repo: activity.repo,
                           type: activity.type
                         }
                       }));
                     } catch (error) {
                       console.error(`Background prefetch failed for user ${user.githubUsername}:`, error);
                       return [];
                     }
                   });
                   
                   const batchResults = await Promise.all(batchPromises);
                   freshActivities.push(...batchResults.flat());
                 }
                 
                 return freshActivities.sort((a, b) => 
                   new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                 );
               });
             } catch (error) {
               console.warn('Background prefetch failed:', error);
             }
           }, 1000); // Start after 1 second

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
