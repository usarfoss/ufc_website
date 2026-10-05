import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { prisma } from "@/server/db/prisma";
import { enqueueLeetCodeSync } from "@/server/jobs/leetcode-sync";

export const runtime = "nodejs";

/** Queues a LeetCode sync for every active member who has linked an account. Run on a schedule by QStash, like the GitHub one. */

/** The safety-net jobs queue one sync per member. Fired all at once, that is dozens of syncs hitting GitHub in the same second, which is how requests get refused. Spread over up to ten minutes instead. */
const spread = (index: number, total: number) => (total <= 1 ? 0 : Math.min(600, total * 3) * (index / total));

const handler = async () => {
  const activeSince = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const users = await prisma.user.findMany({
    where: { lastActive: { gte: activeSince }, leetcodeUsername: { not: null } },
    select: { id: true },
    take: 250,
  });

  const queued = await Promise.all(users.map((user, i) => enqueueLeetCodeSync(user.id, "scheduled", spread(i, users.length))));

  return Response.json({ success: true, candidates: users.length, queued: queued.filter(Boolean).length });
};

const qstashSigningKeysConfigured = Boolean(process.env.QSTASH_CURRENT_SIGNING_KEY && process.env.QSTASH_NEXT_SIGNING_KEY);

export const POST = qstashSigningKeysConfigured
  ? verifySignatureAppRouter(handler)
  : async () => Response.json({ error: "QStash signing keys are not configured" }, { status: 503 });
