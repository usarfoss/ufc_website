import "server-only";
import { jobUrl, queue } from "./queue";

export type GitHubSyncReason = "login" | "scheduled" | "webhook";

export async function enqueueGitHubSync(userId: string, reason: GitHubSyncReason) {
  const url = jobUrl("/api/jobs/github-sync");

  if (!queue || !url) {
    console.warn("GitHub sync queue is not configured; skipping asynchronous sync.");
    return null;
  }

  const result = await queue.publishJSON({
    url,
    body: { userId, reason },
    retries: 3,
    // QStash rejects colons in deduplication IDs. Keep the minute bucket so
    // repeated sign-ins do not enqueue duplicate work, using only safe chars.
    deduplicationId: `github-sync-${userId}-${Math.floor(Date.now() / 60_000)}`,
  });

  return result.messageId;
}
