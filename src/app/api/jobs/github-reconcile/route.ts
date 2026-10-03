import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { prisma } from "@/server/db/prisma";
import { enqueueGitHubSync } from "@/server/jobs/github-sync";

export const runtime = "nodejs";

const handler = async () => {
  const activeSince = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const users = await prisma.user.findMany({
    where: {
      lastActive: { gte: activeSince },
      githubTokenCiphertext: { not: null },
    },
    select: { id: true },
    take: 250,
  });

  const queued = await Promise.all(users.map((user) => enqueueGitHubSync(user.id, "scheduled")));

  return Response.json({
    success: true,
    candidates: users.length,
    queued: queued.filter(Boolean).length,
  });
};

const qstashSigningKeysConfigured = Boolean(process.env.QSTASH_CURRENT_SIGNING_KEY && process.env.QSTASH_NEXT_SIGNING_KEY);

export const POST = qstashSigningKeysConfigured
  ? verifySignatureAppRouter(handler)
  : async () => Response.json({ error: "QStash signing keys are not configured" }, { status: 503 });
