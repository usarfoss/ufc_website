import "server-only";
import { tooManyRequests } from "@/server/http/api";
import { getRedis } from "@/server/cache/cache";

/**
 * A fixed window counter: at most `limit` calls per `windowSeconds` for one key (usually "what:who").
 * It is a burst guard that sits in front of the database, so a script hammering an endpoint is turned away before it costs anything.
 * It uses Redis, so the count is shared by every server instance. Without Redis it counts per instance, which still stops a single
 * runaway client. If Redis itself is down it lets the request through rather than lock everyone out.
 */
const local = new Map<string, { count: number; resetsAt: number }>();

/**
 * One step in Redis: count this call, and make sure the counter has a lifetime. (Giving the key its lifetime in the same step means a crash
 * can never leave a counter that never expires, and a counter that somehow lost its lifetime is given one again.)
 */
const countScript = getRedis()?.createScript<[number, number]>(`
  local count = redis.call('INCR', KEYS[1])
  local ttl = redis.call('TTL', KEYS[1])
  if ttl < 0 then
    redis.call('EXPIRE', KEYS[1], ARGV[1])
    ttl = tonumber(ARGV[1])
  end
  return { count, ttl }
`);

async function hit(key: string, windowSeconds: number): Promise<{ count: number; retryAfter: number }> {
  if (countScript) {
    try {
      const [count, ttl] = await countScript.exec([`ratelimit:${key}`], [String(windowSeconds)]);
      return { count, retryAfter: ttl > 0 ? ttl : windowSeconds };
    } catch (error) {
      console.error("Rate limiter could not reach Redis, letting the request through:", error);
      return { count: 0, retryAfter: 0 };
    }
  }

  const now = Date.now();
  const entry = local.get(key);
  if (!entry || entry.resetsAt <= now) {
    if (local.size > 5_000) for (const [k, v] of local) if (v.resetsAt <= now) local.delete(k);
    local.set(key, { count: 1, resetsAt: now + windowSeconds * 1000 });
    return { count: 1, retryAfter: windowSeconds };
  }
  entry.count += 1;
  return { count: entry.count, retryAfter: Math.ceil((entry.resetsAt - now) / 1000) };
}

/** Throws a 429 (with Retry-After) once `key` has been used more than `limit` times in the window. */
export async function enforceRateLimit(key: string, limit: number, windowSeconds: number) {
  const { count, retryAfter } = await hit(key, windowSeconds);
  if (count > limit) throw tooManyRequests("You're doing that too quickly. Please wait a moment and try again.", retryAfter);
}
