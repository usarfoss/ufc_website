import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { syncGitHubUser } from "@/server/features/github/github-sync.service";

export const runtime = "nodejs";

const handler = async (request: Request) => {
  const body = (await request.json()) as { userId?: string; reason?: string };

  if (!body.userId) {
    return Response.json({ error: "userId is required" }, { status: 400 });
  }

  const result = await syncGitHubUser(body.userId);
  return Response.json({ success: true, reason: body.reason, result });
};

const qstashSigningKeysConfigured = Boolean(process.env.QSTASH_CURRENT_SIGNING_KEY && process.env.QSTASH_NEXT_SIGNING_KEY);

export const POST = qstashSigningKeysConfigured
  ? verifySignatureAppRouter(handler)
  : async () => Response.json({ error: "QStash signing keys are not configured" }, { status: 503 });
