import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { invalidateCache } from "@/server/cache/cache";
import { prisma } from "@/server/db/prisma";
import { activityCutoff, expired } from "@/server/features/activity/retention";
import { PollState } from "@/server/features/live/poll-state";

export const runtime = "nodejs";

/**
 * Removes GitHub and LeetCode activity that is too old to show, from the club feed and from every member's dashboard (they are the same
 * table). Event activity is never touched. Also clears out the live poll's expired notes. Invoked every 3 hours by QStash.
 */
const handler = async () => {
  const cutoff = activityCutoff();
  const { count } = await prisma.activity.deleteMany({
    where: expired(),
  });

  if (count > 0) {
    // Both the club feed and the per-member dashboard lists are cached, so both are cleared along with the rows.
    await invalidateCache("activity-feed", "dashboard");
  }

  // The live poll's notes have their own expiry, but nothing removes the notes of a member it no longer looks at. Done here, a few times a day.
  const notes = await PollState.sweep().catch((error) => {
    console.error("Could not clear out the live poll's old notes:", error);
    return null;
  });

  return Response.json({
    success: true,
    deleted: count,
    cutoff: cutoff.toISOString(),
    notes,
  });
};

const qstashSigningKeysConfigured = Boolean(process.env.QSTASH_CURRENT_SIGNING_KEY && process.env.QSTASH_NEXT_SIGNING_KEY);

export const POST = qstashSigningKeysConfigured
  ? verifySignatureAppRouter(handler)
  : async () => Response.json({ error: "QStash signing keys are not configured" }, { status: 503 });
