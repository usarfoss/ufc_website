import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { runGatedLivePoll } from "@/server/features/live/live-poll";
import { siteIsIdle } from "@/server/features/live/poll-state";

export const runtime = "nodejs";
/** A poll stops starting new work after 45 seconds, so a minute is enough to finish what it began. */
export const maxDuration = 60;

/**
 * Called by QStash on its schedule. Checks every member who is due for new GitHub and LeetCode activity and updates only the ones that changed.
 * While somebody has their dashboard open, that server polls every minute by itself (see the dashboard stream), so QStash is the steady
 * background beat for the times nobody is looking. If a poll has just run, this one stands aside.
 *
 * When nobody has been on the site for a few hours it does nothing at all, and it does it before touching the database, so the database can
 * sleep through the night. The first person back starts polling again by themselves, and the daily jobs still run regardless.
 */
const handler = async () => {
  if (await siteIsIdle()) return Response.json({ success: true, skipped: "nobody has been on the site lately" });

  try {
    const result = await runGatedLivePoll();
    return Response.json(result ? { success: true, ...result } : { success: true, skipped: "a poll just ran" });
  } catch (error) {
    // A failed poll is not worth a retry: the next one is only minutes away, and a retry here would just be one more message. This is what a
    // Redis outage looks like, so it is answered quietly rather than with an error.
    console.error("Scheduled live poll failed:", error);
    return Response.json({ success: false, error: "The poll could not run. The next one will try again." });
  }
};

const qstashSigningKeysConfigured = Boolean(process.env.QSTASH_CURRENT_SIGNING_KEY && process.env.QSTASH_NEXT_SIGNING_KEY);

export const POST = qstashSigningKeysConfigured
  ? verifySignatureAppRouter(handler)
  : async () => Response.json({ error: "QStash signing keys are not configured" }, { status: 503 });
