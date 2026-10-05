import type { NextRequest } from "next/server";
import { requireSession } from "@/server/auth/session";
import { listReviewQueue } from "@/server/features/events/events.service";
import { json, withApiErrorHandling } from "@/server/http/api";

/** The review queue, oldest first. Admins only. */
export const GET = withApiErrorHandling(async (request: NextRequest) => {
  const session = await requireSession(request);
  return json({ success: true, events: await listReviewQueue(session.userId) });
});
