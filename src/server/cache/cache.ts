import "server-only";
import { Redis } from "@upstash/redis";

export type CacheNamespace = "activity-feed" | "dashboard" | "events" | "leaderboard" | "members";

const redis = (() => {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token || !url.startsWith("https://")) {
    return null;
  }

  try {
    return new Redis({ url, token });
  } catch (error) {
    console.error("Upstash Redis is disabled because its configuration is invalid:", error);
    return null;
  }
})();

/** The shared Redis connection, or null when Redis is not configured. Other server code (such as the rate limiter) reuses it. */
export const getRedis = () => redis;

const versionKey = (namespace: CacheNamespace) => `cache:version:${namespace}`;
const valueKey = (namespace: CacheNamespace, key: string) => `cache:${namespace}:${key}`;
const keysKey = (namespace: CacheNamespace) => `cache:keys:${namespace}`;

const getVersion = async (namespace: CacheNamespace) => {
  if (!redis) return 0;
  try {
    return (await redis.get<number>(versionKey(namespace))) ?? 0;
  } catch (error) {
    console.error(`Unable to read ${namespace} cache version:`, error);
    return 0;
  }
};

export async function getCached<T>(namespace: CacheNamespace, key: string) {
  if (!redis) return null;
  try {
    return await redis.get<T>(valueKey(namespace, key));
  } catch (error) {
    console.error(`Unable to read ${namespace} cache value:`, error);
    return null;
  }
}

export async function setCached<T>(namespace: CacheNamespace, key: string, value: T, ttlSeconds: number) {
  if (!redis) return;
  try {
    await Promise.all([
      redis.set(valueKey(namespace, key), value, { ex: ttlSeconds }),
      redis.sadd(keysKey(namespace), valueKey(namespace, key)),
    ]);
  } catch (error) {
    console.error(`Unable to write ${namespace} cache value:`, error);
  }
}

export async function getOrSetCached<T>(namespace: CacheNamespace, key: string, ttlSeconds: number, loader: () => Promise<T>) {
  const cached = await getCached<T>(namespace, key);

  if (cached !== null) {
    return cached;
  }

  const value = await loader();
  await setCached(namespace, key, value, ttlSeconds);
  return value;
}

export async function invalidateCache(...namespaces: CacheNamespace[]) {
  if (!redis || namespaces.length === 0) return;
  try {
    const versions = await Promise.all(
      namespaces.map(async (namespace) => {
        const keys = await redis.smembers<string[]>(keysKey(namespace));
        if (keys.length > 0) {
          await redis.del(...keys);
        }
        await redis.del(keysKey(namespace));
        return [namespace, await redis.incr(versionKey(namespace))] as const;
      }),
    );

    await redis.publish(
      "dashboard:updates",
      JSON.stringify({
        namespaces,
        versions: Object.fromEntries(versions),
        updatedAt: new Date().toISOString(),
      }),
    );
  } catch (error) {
    console.error("Unable to invalidate cache versions:", error);
  }
}

export async function getCacheVersions() {
  const namespaces: CacheNamespace[] = ["activity-feed", "dashboard", "events", "leaderboard", "members"];
  const entries = await Promise.all(namespaces.map(async (namespace) => [namespace, await getVersion(namespace)] as const));
  return Object.fromEntries(entries) as Record<CacheNamespace, number>;
}
