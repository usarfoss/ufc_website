import type { NextRequest } from "next/server";
import { getSession } from "@/server/auth/session";
import { getEventDetail, parseProposal, updateEvent } from "@/server/features/events/events.service";
import { requireSession } from "@/server/auth/session";
import { badRequest, json, withApiErrorHandling } from "@/server/http/api";
import { enforceRateLimit } from "@/server/security/rate-limit";

/** One event with its full write-up. Approved events are public. A proposal is only for its proposer and the admins. */
export const GET = withApiErrorHandling(async (request: NextRequest, context: { params: Promise<{ eventId: string }> }) => {
  const [session, { eventId }] = await Promise.all([getSession(request), context.params]);
  return json({ success: true, event: await getEventDetail(eventId, session?.userId ?? null) });
});

/** Edit an event. See `updateEvent` for who may change what. The body is the same as for proposing one, plus the `updatedAt` it was opened at. */
export const PATCH = withApiErrorHandling(async (request: NextRequest, context: { params: Promise<{ eventId: string }> }) => {
  const [session, { eventId }] = await Promise.all([requireSession(request), context.params]);
  await enforceRateLimit(`edit:${session.userId}`, 20, 60);

  const body = (await request.json().catch(() => null)) as (Record<string, unknown> & { expectedUpdatedAt?: unknown }) | null;
  if (!body) throw badRequest("Send the event details as JSON.");
  const expectedUpdatedAt = typeof body.expectedUpdatedAt === "string" ? body.expectedUpdatedAt : undefined;

  // The start is only held to "an hour from now" if it moved, so a small fix to an event that begins soon is not refused.
  const result = await updateEvent({
    eventId,
    userId: session.userId,
    input: parseProposal(body, { checkStart: false }),
    expectedUpdatedAt,
  });
  return json({
    success: true,
    ...result,
    message: result.resubmitted ? "Saved, and sent back for review." : "Saved.",
  });
});
