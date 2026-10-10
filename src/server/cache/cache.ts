import "server-only";
import type { Redis } from "@upstash/redis";
import { getCacheDatabases, getRedis } from "./redis";

export type CacheNamespace = "activity-feed" | "dashboard" | "events" | "leaderboard" | "members";

/** The shared Redis connection, or null when Redis is not configured. Other server code (such as the rate limiter) reuses it. */
export { getRedis };

/**
 * Cache entries live on one Redis database each. With a single database everything is on it. With more, the namespaces are dealt out in this
 * order (the busiest first), so each extra database takes the heaviest share that is left. A namespace's version number lives on the same
 * database as its entries, so reading something is still one request.
 *
 * Changing how many databases there are moves namespaces around. That is safe (it is only a cache, and a namespace that moves starts empty),
 * but entries left behind on a database a namespace moved away from can reappear if it moves back within their lifetime, which is minutes.
 */
const CACHE_ORDER: CacheNamespace[] = ["leaderboard", "members", "dashboard", "activity-feed", "events"];
const ALL_NAMESPACES = CACHE_ORDER;

const versionKey = (namespace: CacheNamespace) => `cache:version:${namespace}`;
/** The version is part of the key, so raising it is all it takes to retire everything cached under the old one (the old entries expire on their own). */
const valueKey = (namespace: CacheNamespace, version: number | string, key: string) => `cache:${namespace}:${version}:${key}`;

/**
 * Scripts keep each cache operation to one round trip. Redis runs a script as one step, so nothing can slip in between its commands.
 * (They are sent by their hash after the first time, so only the first call carries the full text.)
 */
const READ_SCRIPT = `
  local version = redis.call('GET', KEYS[1])
  if not version then version = '0' end
  return { version, redis.call('GET', ARGV[1] .. version .. ':' .. ARGV[2]) }
`;
const INVALIDATE_SCRIPT = `
  local out = {}
  for i, key in ipairs(KEYS) do out[i] = redis.call('INCR', key) end
  return out
`;

const makeRead = (redis: Redis) => redis.createScript<[string, string | null], true>(READ_SCRIPT, { readonly: true });
const makeInvalidate = (redis: Redis) => redis.createScript<number[]>(INVALIDATE_SCRIPT);

type Database = {
  redis: Redis;
  read: ReturnType<typeof makeRead>;
  invalidate: ReturnType<typeof makeInvalidate>;
};

const databases: Database[] = getCacheDatabases().map((redis) => ({
  redis,
  read: makeRead(redis),
  invalidate: makeInvalidate(redis),
}));

const databaseOf = (namespace: CacheNamespace) => (databases.length ? databases[CACHE_ORDER.indexOf(namespace) % databases.length] : null);

/* ------------------------------------------------------------------------------------------------ in this process */

/**
 * A few seconds of memory in front of Redis, in each server instance. When something changes, every open dashboard asks for the same few
 * answers at the same moment, and with this the first of them goes to Redis and the rest are answered from memory.
 *
 * A change made on this instance clears it straight away. A change made on another instance is noticed by the dashboard stream within a few
 * seconds (it compares versions), and otherwise the entry simply runs out. So an answer is at most CACHE_L1_SECONDS old. 0 turns it off.
 */
const L1_MS = Math.max(0, Number(process.env.CACHE_L1_SECONDS ?? 5) || 0) * 1000;
const L1_MAX_ENTRIES = 400;

type Held = { value: unknown; version: string; expires: number };
const held = new Map<string, Held>();
const epoch = Object.fromEntries(ALL_NAMESPACES.map((namespace) => [namespace, 0])) as Record<CacheNamespace, number>;

const heldKey = (namespace: CacheNamespace, key: string) => `${namespace}\u0000${key}`;

function hold(namespace: CacheNamespace, key: string, version: string, value: unknown) {
  if (L1_MS === 0) return;
  if (held.size >= L1_MAX_ENTRIES) {
    const now = Date.now();
    for (const [k, entry] of held) if (entry.expires <= now) held.delete(k);
    // Still full of live entries: drop the oldest ones (a Map keeps insertion order).
    for (const k of held.keys()) {
      if (held.size < L1_MAX_ENTRIES * 0.75) break;
      held.delete(k);
    }
  }
  held.set(heldKey(namespace, key), { value, version, expires: Date.now() + L1_MS });
}

function forgetNamespace(namespace: CacheNamespace) {
  epoch[namespace] += 1;
  const prefix = `${namespace}\u0000`;
  for (const k of held.keys()) if (k.startsWith(prefix)) held.delete(k);
}

/** The same caller must never be able to change what another caller is about to be given. */
const copy = <T>(value: T): T => structuredClone(value);

/* ------------------------------------------------------------------------------------------------ the cache */

/** What is cached under `key`, and the version it was looked up under. Hand the version back to `writeCache` so a late answer can never land on newer data. */
export async function readCache<T>(namespace: CacheNamespace, key: string): Promise<{ value: T | null; version: string }> {
  const database = databaseOf(namespace);
  if (!database) return { value: null, version: "0" };

  const nearby = held.get(heldKey(namespace, key));
  if (nearby && nearby.expires > Date.now()) return { value: copy(nearby.value as T), version: nearby.version };

  const epochBefore = epoch[namespace];
  try {
    const [version, value] = await database.read.exec([versionKey(namespace)], [`cache:${namespace}:`, key]);
    const found = (value as T | null) ?? null;
    // Only remember it if nothing was invalidated while the answer was on its way: otherwise it may already be out of date.
    if (found !== null && epoch[namespace] === epochBefore) hold(namespace, key, String(version), found);
    return { value: found === null ? null : copy(found), version: String(version) };
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
  const database = databaseOf(namespace);
  if (!database) return;
  try {
    await database.redis.set(valueKey(namespace, version, key), value, { ex: ttlSeconds });
  } catch (error) {
    console.error(`Unable to write ${namespace} cache value:`, error);
  }
}

/** Loads that are already running, so a crowd asking for the same thing at the same moment costs one trip to the database. */
const flights = new Map<string, Promise<unknown>>();

/** A cached answer if there is one. Otherwise `loader` runs and its answer is kept for `ttlSeconds` (an answer of null or undefined is never kept). */
export async function getOrSetCached<T>(namespace: CacheNamespace, key: string, ttlSeconds: number, loader: () => Promise<T>) {
  const id = heldKey(namespace, key);
  const running = flights.get(id);
  if (running) return copy((await running) as T);

  const flight = (async () => {
    const { value: cached, version } = await readCache<T>(namespace, key);
    if (cached !== null) return cached;

    const value = await loader();
    if (value !== null && value !== undefined) await writeCache(namespace, key, version, value, ttlSeconds);
    return value;
  })();

  flights.set(id, flight);
  try {
    return await flight;
  } finally {
    // Only the one that started it clears it, and only if it is still the one on file.
    if (flights.get(id) === flight) flights.delete(id);
  }
}

export async function invalidateCache(...namespaces: CacheNamespace[]) {
  if (namespaces.length === 0) return;
  for (const namespace of namespaces) forgetNamespace(namespace);
  if (databases.length === 0) return;

  // One script call per database, with all of that database's version keys in it.
  const byDatabase = new Map<Database, CacheNamespace[]>();
  for (const namespace of namespaces) {
    const database = databaseOf(namespace)!;
    byDatabase.set(database, [...(byDatabase.get(database) ?? []), namespace]);
  }

  await Promise.all(
    [...byDatabase].map(async ([database, group]) => {
      try {
        await database.invalidate.exec(group.map(versionKey), []);
      } catch (error) {
        console.error("Unable to invalidate cache versions:", error);
      }
    }),
  );
}

export async function getCacheVersions() {
  const zeroes = () => Object.fromEntries(ALL_NAMESPACES.map((namespace) => [namespace, 0])) as Record<CacheNamespace, number>;
  // One request per database for all of its namespaces: every open dashboard asks this every few seconds, so each saved request is multiplied
  // by every tab.
  if (databases.length === 0) return zeroes();

  const result = zeroes();
  const byDatabase = new Map<Database, CacheNamespace[]>();
  for (const namespace of ALL_NAMESPACES) {
    const database = databaseOf(namespace)!;
    byDatabase.set(database, [...(byDatabase.get(database) ?? []), namespace]);
  }

  await Promise.all(
    [...byDatabase].map(async ([database, group]) => {
      try {
        const values = await database.redis.mget<(number | null)[]>(...group.map(versionKey));
        group.forEach((namespace, i) => {
          result[namespace] = Number(values[i] ?? 0);
        });
      } catch (error) {
        console.error("Unable to read cache versions:", error);
      }
    }),
  );

  // Something changed on another instance: whatever this one is holding for that namespace is from before.
  for (const [k, entry] of held) {
    const namespace = k.slice(0, k.indexOf("\u0000")) as CacheNamespace;
    if (Number(entry.version) < result[namespace]) held.delete(k);
  }

  return result;
}
