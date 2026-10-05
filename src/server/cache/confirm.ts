import "server-only";
import { getRedis } from "@/server/cache/cache";

/**
 * "Seen twice." Some numbers should never fall sharply by themselves, so when one does, the first sighting is not believed: it could be a
 * failed request, or GitHub or LeetCode having a bad moment. If the very same thing is seen again shortly after, it is real.
 *
 * `key` says what is being watched and `signature` says what was seen. Returns true when the same signature was already seen within the
 * last few minutes (and forgets it), false the first time. Members are looked at every minute or two, so a few minutes covers the next look
 * without letting an old hiccup vouch for a new one. Without Redis there is nowhere to remember, so it believes everything, as before.
 */
export async function seenTwice(key: string, signature: string, ttlSeconds = 5 * 60) {
  const redis = getRedis();
  if (!redis) return true;
  const slot = `suspect:${key}`;
  try {
    const before = await redis.get<string>(slot);
    if (before === signature) {
      await redis.del(slot);
      return true;
    }
    await redis.set(slot, signature, { ex: ttlSeconds });
    return false;
  } catch (error) {
    console.error("Could not record a suspect reading, believing it:", error);
    return true;
  }
}

/**
 * Permission to queue a re-check for something that was just held back. At most one per `key` every ten minutes, so a number that keeps
 * misbehaving cannot start an endless chain of re-checks: after that, the regular checks carry on as normal. Without Redis it always allows.
 */
export async function allowRecheck(key: string, ttlSeconds = 10 * 60) {
  const redis = getRedis();
  if (!redis) return true;
  try {
    return (await redis.set(`recheck:${key}`, "1", { ex: ttlSeconds, nx: true })) === "OK";
  } catch (error) {
    console.error("Could not record a re-check, allowing it:", error);
    return true;
  }
}
