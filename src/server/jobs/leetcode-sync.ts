import "server-only";
import { jobUrl, queue } from "./queue";

export type LeetCodeSyncReason = "scheduled";

/** Queues a LeetCode sync for one member. It runs in the background, the same way the GitHub sync does. */
export async function enqueueLeetCodeSync(userId: string, reason: LeetCodeSyncReason) {
  const url = jobUrl("/api/jobs/leetcode-sync");

  if (!queue || !url) {
    console.warn("LeetCode sync queue is not configured; skipping asynchronous sync.");
    return null;
  }

  const result = await queue.publishJSON({
    url,
    body: { userId, reason },
    retries: 3,
    // Same rules as the GitHub job: no colons in the ID, and a minute bucket so repeats do not queue duplicate work.
    deduplicationId: `leetcode-sync-${userId}-${Math.floor(Date.now() / 60_000)}`,
  });

  return result.messageId;
}
