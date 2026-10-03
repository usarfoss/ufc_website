import type { NextRequest } from "next/server";
import { requireSession } from "@/server/auth/session";
import { prisma } from "@/server/db/prisma";
import { json, withApiErrorHandling } from "@/server/http/api";

export const GET = withApiErrorHandling(async (request: NextRequest) => {
  const session = await requireSession(request);
  const stats = await prisma.gitHubStats.findUnique({
    where: { userId: session.userId },
    select: { languages: true, lastSynced: true },
  });
  let languages: Record<string, number> = {};

  if (typeof stats?.languages === "string") {
    try {
      const parsed = JSON.parse(stats.languages);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        languages = Object.fromEntries(Object.entries(parsed).filter((entry): entry is [string, number] => typeof entry[1] === "number"));
      }
    } catch {
      languages = {};
    }
  }

  return json({ success: true, languages, lastSynced: stats?.lastSynced || null });
});
