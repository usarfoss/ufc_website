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
  private static readonly REFRESH_INTERVAL = 10 * 60 * 1000; // Check every 10 minutes
  private static readonly CACHE_FRESHNESS = 10 * 60 * 1000; // 10 minutes

  /**
   * Start preemptive cache service
   */
  static start(): void {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;

    // Check every 10 minutes for stale cache
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
  }

  /**
   * Force stop all background services (emergency stop)
   */
  static forceStop(): void {
    this.stop();
  }

  /**
   * Check if cache is stale and refresh if needed
   */
  private static async checkAndRefreshStaleCache(): Promise<void> {
    try {
      
      // Check if we have cached data
      const cachedActivities = await RedisService.getGlobalActivities(false);
      if (!cachedActivities || cachedActivities.length === 0) {
        return;
      }

      // Check if data is stale
      const cacheAge = Date.now() - (cachedActivities[0]?._cacheTimestamp || 0);
      if (cacheAge < this.CACHE_FRESHNESS) {
        return;
      }

      await this.refreshCacheFromGitHub();
      
    } catch (error) {
    }
  }

  /**
   * Refresh cache with fresh data from GitHub API
   */
  private static async refreshCacheFromGitHub(): Promise<void> {
    try {

      // Get all users with GitHub usernames
      const users = await prisma.user.findMany({
        where: { githubUsername: { not: null } },
        select: { id: true, name: true, githubUsername: true, avatar: true }
      });

      if (users.length === 0) {
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
      
    } catch (error) {
    }
  }

  /**
   * Force immediate cache refresh
   */
  static async forceRefresh(): Promise<void> {
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
