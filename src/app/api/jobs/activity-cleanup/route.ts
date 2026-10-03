import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { invalidateCache } from "@/server/cache/cache";
import { prisma } from "@/server/db/prisma";

export const runtime = "nodejs";

const ACTIVITY_RETENTION_MS = 36 * 60 * 60 * 1000;

/** Removes feed data that the product no longer displays. Invoked hourly by QStash. */
const handler = async () => {
  const cutoff = new Date(Date.now() - ACTIVITY_RETENTION_MS);
  const { count } = await prisma.activity.deleteMany({
    where: { createdAt: { lt: cutoff } },
  });

  if (count > 0) {
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
