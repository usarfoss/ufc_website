import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { runLivePoll } from "@/server/features/live/live-poll";
import { jobUrl, queue } from "@/server/jobs/queue";

export const runtime = "nodejs";
/** A poll stops starting new work after 45 seconds, so a minute is enough to finish what it began. */
export const maxDuration = 60;

/**
 * Called by QStash every minute. Checks every active member for new GitHub and LeetCode activity and updates only the ones that changed.
 *
 * QStash cannot schedule more often than once a minute. To poll every 30 seconds instead, set LIVE_POLL_SECONDS=30: each poll then queues
 * one more poll to run 30 seconds later. That doubles the messages QStash counts, so it is off unless you want it.
 */
const handler = async (request: Request) => {
  const body = (await request.json().catch(() => ({}))) as { pass?: string };
  const result = await runLivePoll();

  const url = jobUrl("/api/jobs/live-poll");
  if (Number(process.env.LIVE_POLL_SECONDS) === 30 && body.pass !== "second" && queue && url) {
    await queue
      .publishJSON({
        url,
        body: { pass: "second" },
        delay: 30,
        retries: 0,
        deduplicationId: `live-poll-${Math.floor(Date.now() / 60_000)}-b`,
      })
      .catch((error) => console.error("Could not queue the half-minute poll:", error));
  }

  return Response.json({ success: true, ...result });
};

const qstashSigningKeysConfigured = Boolean(process.env.QSTASH_CURRENT_SIGNING_KEY && process.env.QSTASH_NEXT_SIGNING_KEY);

export const POST = qstashSigningKeysConfigured
  ? verifySignatureAppRouter(handler)
  : async () => Response.json({ error: "QStash signing keys are not configured" }, { status: 503 });
