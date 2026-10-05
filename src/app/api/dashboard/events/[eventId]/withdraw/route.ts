import type { NextRequest } from "next/server";
import { requireSession } from "@/server/auth/session";
import { withdrawEvent } from "@/server/features/events/events.service";
import { json, withApiErrorHandling } from "@/server/http/api";
import { enforceRateLimit } from "@/server/security/rate-limit";

export const POST = withApiErrorHandling(async (request: NextRequest, context: { params: Promise<{ eventId: string }> }) => {
  const [session, { eventId }] = await Promise.all([requireSession(request), context.params]);
  await enforceRateLimit(`withdraw:${session.userId}`, 20, 60);
  return json({ success: true, ...(await withdrawEvent(eventId, session.userId)) });
});
