import "server-only";
import { jobUrl, queue } from "./queue";

export type GitHubSyncReason = "login" | "recheck" | "scheduled" | "webhook";

/** `delaySeconds` holds the job back that long, so a batch of them can be spread out instead of hitting GitHub all at the same moment. */
export async function enqueueGitHubSync(userId: string, reason: GitHubSyncReason, delaySeconds = 0) {
  const url = jobUrl("/api/jobs/github-sync");

  if (!queue || !url) {
    console.warn("GitHub sync queue is not configured; skipping asynchronous sync.");
    return null;
  }

  const result = await queue.publishJSON({
    url,
    body: { userId, reason },
    retries: 3,
    ...(delaySeconds > 0 ? { delay: Math.round(delaySeconds) } : {}),
    // QStash rejects colons in deduplication IDs. Keep the minute bucket so
    // repeated sign-ins do not enqueue duplicate work, using only safe chars.
    deduplicationId: `github-sync-${reason}-${userId}-${Math.floor(Date.now() / 60_000)}`,
  });

  return result.messageId;
}
