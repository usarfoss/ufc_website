import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { runGatedLivePoll } from "@/server/features/live/live-poll";

export const runtime = "nodejs";
/** A poll stops starting new work after 45 seconds, so a minute is enough to finish what it began. */
export const maxDuration = 60;

/**
 * Called by QStash every 2 minutes. Checks every active member for new GitHub and LeetCode activity and updates only the ones that changed.
 * While somebody has their dashboard open, that server polls every minute by itself (see the dashboard stream), so QStash is the steady
 * background beat for the times nobody is looking. If a poll has just run, this one stands aside.
 */
const handler = async () => {
  const result = await runGatedLivePoll();
  return Response.json(result ? { success: true, ...result } : { success: true, skipped: "a poll just ran" });
};

const qstashSigningKeysConfigured = Boolean(process.env.QSTASH_CURRENT_SIGNING_KEY && process.env.QSTASH_NEXT_SIGNING_KEY);

export const POST = qstashSigningKeysConfigured
  ? verifySignatureAppRouter(handler)
  : async () => Response.json({ error: "QStash signing keys are not configured" }, { status: 503 });
