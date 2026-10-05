import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { invalidateCache } from "@/server/cache/cache";
import { prisma } from "@/server/db/prisma";
import { activityCutoff, expired } from "@/server/features/activity/retention";

export const runtime = "nodejs";

/**
 * Removes GitHub and LeetCode activity that is too old to show, from the club feed and from every member's dashboard (they are the same
 * table). Event activity is never touched. Invoked every 3 hours by QStash.
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

  return Response.json({
    success: true,
    deleted: count,
    cutoff: cutoff.toISOString(),
  });
};

const qstashSigningKeysConfigured = Boolean(process.env.QSTASH_CURRENT_SIGNING_KEY && process.env.QSTASH_NEXT_SIGNING_KEY);

export const POST = qstashSigningKeysConfigured
  ? verifySignatureAppRouter(handler)
  : async () => Response.json({ error: "QStash signing keys are not configured" }, { status: 503 });
