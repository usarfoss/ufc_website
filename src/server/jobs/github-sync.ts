import "server-only";
import { Client } from "@upstash/qstash";

export type GitHubSyncReason = "login" | "scheduled" | "webhook";

const queue = process.env.QSTASH_TOKEN ? new Client({ token: process.env.QSTASH_TOKEN }) : null;

const getJobUrl = () => {
  const baseUrl = process.env.NEXTAUTH_URL;
  const localQStash = process.env.QSTASH_URL?.includes("localhost") || process.env.QSTASH_URL?.includes("127.0.0.1");

  if (!baseUrl || (baseUrl.includes("localhost") && !localQStash)) {
    return null;
  }

  return new URL("/api/jobs/github-sync", baseUrl).toString();
};

export async function enqueueGitHubSync(userId: string, reason: GitHubSyncReason) {
  const url = getJobUrl();

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
