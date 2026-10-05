import "server-only";
import { getRedis } from "@/server/cache/cache";

/**
 * Members who have to sign in again, because their GitHub connection has run out and could not be renewed.
 *
 * It is a set in Redis, checked on dashboard page loads and on every API request, so the very next thing they do sends them to the sign in page.
 * Signing in takes them off it. It is only a hint, like the live poll's notes: if it were lost, the next time we try to use their token and
 * cannot, they are put back on it.
 */
const SET = "auth:reauth";

const local = new Set<string>();

// A page load makes several API calls at once, so each server remembers the answer for a few seconds rather than asking Redis every time.
const memo = new Map<string, { value: boolean; at: number }>();
const MEMO_MS = 5_000;

const remember = (userId: string, value: boolean) => {
  if (memo.size > 1_000) memo.clear();
  memo.set(userId, { value, at: Date.now() });
};

export async function needsSignIn(userId: string) {
  const hit = memo.get(userId);
  if (hit && Date.now() - hit.at < MEMO_MS) return hit.value;

  let value = local.has(userId);
  const redis = getRedis();
  if (redis) {
    try {
      value = (await redis.sismember(SET, userId)) === 1;
    } catch (error) {
      console.error("Could not check whether a member has to sign in again, assuming not:", error);
      value = false;
    }
  }
  remember(userId, value);
  return value;
}

export async function markNeedsSignIn(userId: string) {
  local.add(userId);
  remember(userId, true);
  try {
    await getRedis()?.sadd(SET, userId);
  } catch (error) {
    console.error("Could not record that a member has to sign in again:", error);
  }
}

export async function clearNeedsSignIn(userId: string) {
  local.delete(userId);
  remember(userId, false);
  try {
    await getRedis()?.srem(SET, userId);
  } catch (error) {
    console.error("Could not clear a member's sign in note:", error);
  }
}

/** Everyone who currently has to sign in again, in one read. The live poll skips them. */
export async function membersNeedingSignIn(): Promise<Set<string>> {
  const redis = getRedis();
  if (!redis) return new Set(local);
  try {
    return new Set(await redis.smembers<string[]>(SET));
  } catch (error) {
    console.error("Could not read who has to sign in again:", error);
    return new Set(local);
  }
}
