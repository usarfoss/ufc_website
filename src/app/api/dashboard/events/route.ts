import type { NextRequest } from "next/server";
import { getSession } from "@/server/auth/session";
import { badRequest, json, withApiErrorHandling } from "@/server/http/api";
import { enforceRateLimit } from "@/server/security/rate-limit";
import { VIEWS, listEvents, parseProposal, proposeEvent, type EventView } from "@/server/features/events/events.service";

/** Events the viewer is allowed to see. Anyone can read the approved ones. Proposals are only visible to their proposer and to admins. */
export const GET = withApiErrorHandling(async (request: NextRequest) => {
  const session = await getSession(request);
  const params = new URL(request.url).searchParams;

  const view = (params.get("view") ?? "upcoming") as EventView;
  if (!VIEWS.includes(view)) throw badRequest(`view must be one of: ${VIEWS.join(", ")}.`);

  const limit = Math.min(Math.max(Number.parseInt(params.get("limit") ?? "", 10) || 20, 1), 50);
  const offset = Math.max(Number.parseInt(params.get("offset") ?? "", 10) || 0, 0);

  return json({ success: true, ...(await listEvents(session?.userId ?? null, { view, limit, offset })) });
});

/** Propose an event. Validated, limited to five a day, and queued for an admin (admins' own events are published at once). */
export const POST = withApiErrorHandling(async (request: NextRequest) => {
  const session = await getSession(request);
  if (!session) return json({ error: "Unauthorized" }, { status: 401 });

  // A burst guard in front of the database, on top of the five a day: it also stops a script that keeps sending invalid proposals.
  await enforceRateLimit(`propose:${session.userId}`, 10, 60);

  const body = await request.json().catch(() => null);
  const result = await proposeEvent(session.userId, parseProposal(body));

  return json(
    {
      success: true,
      ...result,
      message: result.approvalStatus === "approved" ? "Event published." : "Proposal sent. An admin will review it.",
    },
    { status: 201 },
  );
});
