import { Redis } from '@upstash/redis';
import { gzip, gunzip } from 'zlib';
import { promisify } from 'util';

const gzipAsync = promisify(gzip);
const gunzipAsync = promisify(gunzip);

// Initialize Redis only if environment variables are present
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

export class RedisService {
  private static readonly CACHE_PREFIX = 'github_activities:';
  private static readonly CACHE_TTL = 10 * 60; // 10 minutes in seconds (longer for 36-hour data)
  private static readonly MEMORY_CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
  private static readonly GLOBAL_BUILD_LOCK_KEY = 'global_github_activities_build_lock';
  private static readonly GLOBAL_META_KEY = 'global_github_activities_meta';
  
  // In-memory cache for ultra-fast access
  private static memoryCache = new Map<string, { data: any; timestamp: number }>();

  // Memory cache helpers
  private static getFromMemoryCache(key: string): any | null {
    const cached = this.memoryCache.get(key);
    if (!cached) return null;
    
    const now = Date.now();
    if (now - cached.timestamp > this.MEMORY_CACHE_TTL) {
      this.memoryCache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  private static setMemoryCache(key: string, data: any): void {
    this.memoryCache.set(key, { data, timestamp: Date.now() });
  }

  private static clearMemoryCache(): void {
    this.memoryCache.clear();
  }

  static async getCachedActivities(userId: string): Promise<any[] | null> {
    const memoryKey = `user:${userId}`;
    
    // Check memory cache first (fastest)
    const memoryCached = this.getFromMemoryCache(memoryKey);
    if (memoryCached) {
      console.log(`Memory cache hit for user ${userId}`);
      return memoryCached;
    }
    
    if (!redis) {
      console.log('Redis not configured, skipping cache');
      return null;
    }
    
    try {
      const key = `${this.CACHE_PREFIX}user:${userId}`;
      const cached = await redis.get(key);
      if (!cached) return null;
      
      let data: any[];
      
      // Handle both string and object responses
      if (typeof cached === 'string') {
        // Try to decompress if it's compressed
        try {
          const compressed = Buffer.from(cached, 'base64');
          const decompressed = await gunzipAsync(compressed);
          data = JSON.parse(decompressed.toString());
        } catch {
          // Fallback to regular JSON parsing
          data = JSON.parse(cached);
        }
      } else if (typeof cached === 'object') {
        data = cached as any[];
      } else {
        return null;
      }
      
      // Store in memory cache for faster subsequent access
      this.setMemoryCache(memoryKey, data);
      console.log(`Redis cache hit for user ${userId}`);
      return data;
    } catch (error) {
      console.warn('Redis get error:', error);
      return null;
    }
  }

  static async setCachedActivities(userId: string, activities: any[]): Promise<void> {
    const memoryKey = `user:${userId}`;
    
    // Store in memory cache immediately
    this.setMemoryCache(memoryKey, activities);
    
    if (!redis) {
      console.log('Redis not configured, skipping cache');
      return;
    }
    
    try {
      const key = `${this.CACHE_PREFIX}user:${userId}`;
      const serialized = JSON.stringify(activities);
      
      // Compress data for smaller Redis storage
      let compressed: string;
      try {
        const compressedBuffer = await gzipAsync(Buffer.from(serialized));
        compressed = compressedBuffer.toString('base64');
      } catch {
        // Fallback to uncompressed if compression fails
        compressed = serialized;
      }
      
      await redis.setex(key, this.CACHE_TTL, compressed);
      console.log(`Cached ${activities.length} activities for user ${userId} (compressed: ${compressed.length < serialized.length})`);
    } catch (error) {
      console.warn('Redis set error:', error);
    }
  }

  static async getGlobalActivities(): Promise<any[] | null> {
    const memoryKey = 'global';
    
    // Check memory cache first (fastest)
    const memoryCached = this.getFromMemoryCache(memoryKey);
    if (memoryCached) {
      console.log('Memory cache hit for global activities');
      return memoryCached;
    }
    
    if (!redis) {
      console.log('Redis not configured, skipping cache');
      return null;
    }
    
    try {
      const key = `${this.CACHE_PREFIX}global`;
      const cached = await redis.get(key);
      if (!cached) return null;
      
      let data: any[];
      
      // Handle both string and object responses
      if (typeof cached === 'string') {
        // Try to decompress if it's compressed
        try {
          const compressed = Buffer.from(cached, 'base64');
          const decompressed = await gunzipAsync(compressed);
          data = JSON.parse(decompressed.toString());
        } catch {
          // Fallback to regular JSON parsing
          data = JSON.parse(cached);
        }
      } else if (typeof cached === 'object') {
        data = cached as any[];
      } else {
        return null;
      }
      
      // Store in memory cache for faster subsequent access
      this.setMemoryCache(memoryKey, data);
      console.log('Redis cache hit for global activities');
      return data;
    } catch (error) {
      console.warn('Redis get global error:', error);
      return null;
    }
  }

  static async setGlobalActivities(activities: any[]): Promise<void> {
    const memoryKey = 'global';
    
    // Store in memory cache immediately
    this.setMemoryCache(memoryKey, activities);
    
    if (!redis) {
      console.log('Redis not configured, skipping cache');
      return;
    }
    
    try {
      const key = `${this.CACHE_PREFIX}global`;
      const serialized = JSON.stringify(activities);
      
      // Compress data for smaller Redis storage
      let compressed: string;
      try {
        const compressedBuffer = await gzipAsync(Buffer.from(serialized));
        compressed = compressedBuffer.toString('base64');
      } catch {
        // Fallback to uncompressed if compression fails
        compressed = serialized;
      }
      
      await redis.setex(key, this.CACHE_TTL, compressed);
      console.log(`Cached ${activities.length} global activities (compressed: ${compressed.length < serialized.length})`);
    } catch (error) {
      console.warn('Redis set global error:', error);
    }
  }

  static async clearUserCache(userId: string): Promise<void> {
    // Clear memory cache
    const memoryKey = `user:${userId}`;
    this.memoryCache.delete(memoryKey);
    
    if (!redis) return;
    
    try {
      const key = `${this.CACHE_PREFIX}user:${userId}`;
      await redis.del(key);
      console.log(`Cleared cache for user ${userId}`);
    } catch (error) {
      console.warn('Redis clear user cache error:', error);
    }
  }

  static async clearGlobalCache(): Promise<void> {
    // Clear memory cache
    const memoryKey = 'global';
    this.memoryCache.delete(memoryKey);
    
    if (!redis) return;
    
    try {
      const key = `${this.CACHE_PREFIX}global`;
      await redis.del(key);
      console.log('Cleared global cache');
    } catch (error) {
      console.warn('Redis clear global cache error:', error);
    }
  }

  static async clearAllCache(): Promise<void> {
    // Clear all memory cache
    this.clearMemoryCache();
    
    if (!redis) return;
    
    try {
      const pattern = `${this.CACHE_PREFIX}*`;
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
      console.log('Cleared all cache');
    } catch (error) {
      console.warn('Redis clear all cache error:', error);
    }
  }

  // Background prefetching for ultra-fast loading
  static async prefetchUserActivities(userId: string, fetchFunction: () => Promise<any[]>): Promise<void> {
    try {
      console.log(`Prefetching activities for user ${userId}`);
      const activities = await fetchFunction();
      await this.setCachedActivities(userId, activities);
      console.log(`Prefetched ${activities.length} activities for user ${userId}`);
    } catch (error) {
      console.warn(`Prefetch error for user ${userId}:`, error);
    }
  }

  static async prefetchGlobalActivities(fetchFunction: () => Promise<any[]>): Promise<void> {
    try {
      console.log('Prefetching global activities');
      const activities = await fetchFunction();
      await this.setGlobalActivities(activities);
      console.log(`Prefetched ${activities.length} global activities`);
    } catch (error) {
      console.warn('Prefetch global error:', error);
    }
  }

  // Build lock helpers to prevent duplicate global rebuilds
  static async tryAcquireGlobalBuildLock(ttlSeconds: number = 180): Promise<boolean> {
    if (!redis) return false;
    try {
      // Use NX to acquire lock if not exists
      // @upstash/redis supports options for set
      // If the set returns 'OK', we acquired the lock
      const result = await (redis as any).set(this.GLOBAL_BUILD_LOCK_KEY, '1', { nx: true, ex: ttlSeconds });
      return result === 'OK';
    } catch (error) {
      console.warn('Redis acquire build lock error:', error);
      return false;
    }
  }

  static async releaseGlobalBuildLock(): Promise<void> {
    if (!redis) return;
    try {
      await redis.del(this.GLOBAL_BUILD_LOCK_KEY);
    } catch (error) {
      console.warn('Redis release build lock error:', error);
    }
  }

  // Optional metadata (builtAt timestamp and total items)
  static async setGlobalMeta(meta: { builtAt: number; total: number }): Promise<void> {
    if (!redis) return;
    try {
      const serialized = JSON.stringify(meta);
      await redis.setex(this.GLOBAL_META_KEY, this.CACHE_TTL, serialized);
    } catch (error) {
      console.warn('Redis set global meta error:', error);
    }
  }

  static async getGlobalMeta(): Promise<{ builtAt: number; total: number } | null> {
    if (!redis) return null;
    try {
      const raw = await redis.get(this.GLOBAL_META_KEY);
      if (!raw) return null;
      if (typeof raw === 'string') return JSON.parse(raw);
      return raw as any;
    } catch (error) {
      console.warn('Redis get global meta error:', error);
      return null;
    }
  }
}

export { redis };
