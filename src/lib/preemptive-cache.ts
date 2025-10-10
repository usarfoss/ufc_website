/**
 * Preemptive Cache Service
 * Automatically refreshes stale cache data from GitHub API
 */

import { RedisService } from './redis';
import { githubService } from './github';
import { prisma } from './prisma';

export class PreemptiveCacheService {
  private static isRunning = false;
  private static intervalId: NodeJS.Timeout | null = null;
  private static readonly REFRESH_INTERVAL = 60 * 60 * 1000; // Check every 1 hour
  private static readonly CACHE_FRESHNESS = 60 * 60 * 1000; // 1 hour

  /**
   * Start preemptive cache service
   */
  static start(): void {
    if (this.isRunning) {
      console.log('🔄 Preemptive cache service already running');
      return;
    }

    console.log('⚡ Starting preemptive cache service (1-hour intervals) for dashboard user...');
    this.isRunning = true;

    // Check every 1 hour for stale cache
    this.intervalId = setInterval(async () => {
      await this.checkAndRefreshStaleCache();
    }, this.REFRESH_INTERVAL);

    // Initial check
    setTimeout(() => this.checkAndRefreshStaleCache(), 1000);
  }

  /**
   * Stop preemptive cache service
   */
  static stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('⏹️ Preemptive cache service stopped (user left dashboard)');
  }

  /**
   * Force stop all background services (emergency stop)
   */
  static forceStop(): void {
    console.log('🛑 Force stopping all background services...');
    this.stop();
  }

  /**
   * Check if cache is stale and refresh if needed
   */
  private static async checkAndRefreshStaleCache(): Promise<void> {
    try {
      console.log('🔍 Checking cache freshness...');
      
      // Check if we have cached data
      const cachedActivities = await RedisService.getGlobalActivities(false);
      if (!cachedActivities || cachedActivities.length === 0) {
        console.log('📊 No cached activities found, skipping preemptive refresh');
        return;
      }

      // Check if data is stale
      const cacheAge = Date.now() - (cachedActivities[0]?._cacheTimestamp || 0);
      if (cacheAge < this.CACHE_FRESHNESS) {
        console.log(`✅ Cache is fresh (${Math.round(cacheAge / 60000)} minutes old), no refresh needed`);
        return;
      }

      console.log(`🔄 Cache is stale (${Math.round(cacheAge / 60000)} minutes old), refreshing from GitHub API...`);
      await this.refreshCacheFromGitHub();
      
    } catch (error) {
      console.warn('⚠️ Preemptive cache check failed:', error);
    }
  }

  /**
   * Refresh cache with fresh data from GitHub API
   */
  private static async refreshCacheFromGitHub(): Promise<void> {
    try {
      console.log('🚀 Preemptive refresh: Fetching fresh data from GitHub API...');

      // Get all users with GitHub usernames
      const users = await prisma.user.findMany({
        where: { githubUsername: { not: null } },
        select: { id: true, name: true, githubUsername: true, avatar: true }
      });

      if (users.length === 0) {
        console.log('📊 No users found for preemptive refresh');
        return;
      }

      // Use batch processing with load balancer
      const freshActivities = await githubService.getBatchUserActivities(users);
      
      // Sort by timestamp (most recent first)
      const sortedActivities = freshActivities.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      // Cache with timestamp
      const activitiesWithTimestamp = sortedActivities.map(activity => ({
        ...activity,
        _cacheTimestamp: Date.now()
      }));

      await RedisService.setGlobalActivities(activitiesWithTimestamp);
      console.log(`✅ Preemptive refresh complete: ${sortedActivities.length} fresh activities cached`);
      
    } catch (error) {
      console.error('❌ Preemptive cache refresh failed:', error);
    }
  }

  /**
   * Force immediate cache refresh
   */
  static async forceRefresh(): Promise<void> {
    console.log('🔄 Force refresh requested...');
    await this.refreshCacheFromGitHub();
  }

  /**
   * Get service status
   */
  static getStatus(): {
    isRunning: boolean;
    refreshInterval: number;
    cacheFreshness: number;
  } {
    return {
      isRunning: this.isRunning,
      refreshInterval: this.REFRESH_INTERVAL,
      cacheFreshness: this.CACHE_FRESHNESS
    };
  }
}
