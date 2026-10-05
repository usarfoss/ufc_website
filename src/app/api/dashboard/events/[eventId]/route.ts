import type { NextRequest } from "next/server";
import { getSession } from "@/server/auth/session";
import { getEventDetail } from "@/server/features/events/events.service";
import { json, withApiErrorHandling } from "@/server/http/api";

/** One event with its full write-up. Approved events are public. A proposal is only for its proposer and the admins. */
export const GET = withApiErrorHandling(async (request: NextRequest, context: { params: Promise<{ eventId: string }> }) => {
  const [session, { eventId }] = await Promise.all([getSession(request), context.params]);
  return json({ success: true, event: await getEventDetail(eventId, session?.userId ?? null) });
});
