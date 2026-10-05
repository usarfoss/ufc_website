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
/** The version is part of the key, so raising it is all it takes to retire everything cached under the old one (the old entries expire on their own). */
const valueKey = (namespace: CacheNamespace, version: number | string, key: string) => `cache:${namespace}:${version}:${key}`;

/**
 * Scripts keep each cache operation to one round trip. Redis runs a script as one step, so nothing can slip in between its commands.
 * (They are sent by their hash after the first time, so only the first call carries the full text.)
 */
const readScript = redis?.createScript<[string, string | null], true>(
  `
  local version = redis.call('GET', KEYS[1])
  if not version then version = '0' end
  return { version, redis.call('GET', ARGV[1] .. version .. ':' .. ARGV[2]) }
  `,
  { readonly: true },
);

const invalidateScript = redis?.createScript<number[]>(`
  local out = {}
  for i, key in ipairs(KEYS) do out[i] = redis.call('INCR', key) end
  return out
`);

/** What is cached under `key`, and the version it was looked up under. Hand the version back to `writeCache` so a late answer can never land on newer data. */
export async function readCache<T>(namespace: CacheNamespace, key: string): Promise<{ value: T | null; version: string }> {
  if (!redis || !readScript) return { value: null, version: "0" };
  try {
    const [version, value] = await readScript.exec([versionKey(namespace)], [`cache:${namespace}:`, key]);
    return { value: (value as T | null) ?? null, version: String(version) };
  } catch (error) {
    console.error(`Unable to read ${namespace} cache value:`, error);
    return { value: null, version: "0" };
  }
}

/**
 * Stores a value under the version it was read at. If the data changed while it was being loaded, the version has moved on and this entry is
 * simply never read, instead of putting an old answer in front of everyone for the whole lifetime of the entry.
 */
export async function writeCache<T>(namespace: CacheNamespace, key: string, version: string, value: T, ttlSeconds: number) {
  if (!redis) return;
  try {
    await redis.set(valueKey(namespace, version, key), value, { ex: ttlSeconds });
  } catch (error) {
    console.error(`Unable to write ${namespace} cache value:`, error);
  }
}

/** A cached answer if there is one. Otherwise `loader` runs and its answer is kept for `ttlSeconds` (an answer of null or undefined is never kept). */
export async function getOrSetCached<T>(namespace: CacheNamespace, key: string, ttlSeconds: number, loader: () => Promise<T>) {
  const { value: cached, version } = await readCache<T>(namespace, key);
  if (cached !== null) return cached;

  const value = await loader();
  if (value !== null && value !== undefined) await writeCache(namespace, key, version, value, ttlSeconds);
  return value;
}

export async function invalidateCache(...namespaces: CacheNamespace[]) {
  if (!redis || !invalidateScript || namespaces.length === 0) return;
  try {
    await invalidateScript.exec(namespaces.map(versionKey), []);
  } catch (error) {
    console.error("Unable to invalidate cache versions:", error);
  }
}

export async function getCacheVersions() {
  const namespaces: CacheNamespace[] = ["activity-feed", "dashboard", "events", "leaderboard", "members"];
  // One request for all of them: every open dashboard asks this every few seconds, so each saved request is multiplied by every tab.
  if (!redis) return Object.fromEntries(namespaces.map((namespace) => [namespace, 0])) as Record<CacheNamespace, number>;
  try {
    const values = await redis.mget<(number | null)[]>(...namespaces.map(versionKey));
    return Object.fromEntries(namespaces.map((namespace, i) => [namespace, values[i] ?? 0])) as Record<CacheNamespace, number>;
  } catch (error) {
    console.error("Unable to read cache versions:", error);
    return Object.fromEntries(namespaces.map((namespace) => [namespace, 0])) as Record<CacheNamespace, number>;
  }
}
