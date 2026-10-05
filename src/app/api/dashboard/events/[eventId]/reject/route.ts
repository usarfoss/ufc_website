import type { NextRequest } from "next/server";
import { requireSession } from "@/server/auth/session";
import { decideEvent } from "@/server/features/events/events.service";
import { json, withApiErrorHandling } from "@/server/http/api";
import { enforceRateLimit } from "@/server/security/rate-limit";

export const POST = withApiErrorHandling(async (request: NextRequest, context: { params: Promise<{ eventId: string }> }) => {
  const [session, { eventId }] = await Promise.all([requireSession(request), context.params]);
  await enforceRateLimit(`decide:${session.userId}`, 60, 60);
  const body = (await request.json().catch(() => null)) as { reason?: unknown } | null;
  const reason = typeof body?.reason === "string" ? body.reason : undefined;
  return json({ success: true, ...(await decideEvent({ eventId, adminId: session.userId, decision: "reject", reason })) });
});
