import type { NextRequest } from "next/server";
import { requireSession } from "@/server/auth/session";
import { prisma } from "@/server/db/prisma";
import { json, withApiErrorHandling } from "@/server/http/api";

export const GET = withApiErrorHandling(async (request: NextRequest) => {
  const session = await requireSession(request);
  const githubStats = await prisma.gitHubStats.findUnique({
    where: { userId: session.userId },
    select: { contributionCalendar: true, lastSynced: true },
  });
  const contributions = Array.isArray(githubStats?.contributionCalendar) ? githubStats.contributionCalendar : [];

  const totalContributions = contributions.reduce<number>((total, day) => {
    const count = typeof day === "object" && day !== null && !Array.isArray(day) && typeof day.count === "number" ? day.count : 0;
    return total + count;
  }, 0);

  return json({
    success: true,
    contributions,
    totalContributions,
    lastSynced: githubStats?.lastSynced || null,
  });
});
