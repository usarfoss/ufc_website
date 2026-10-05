import type { NextRequest } from "next/server";
import { getOrSetCached } from "@/server/cache/cache";
import { requireSession } from "@/server/auth/session";
import { prisma } from "@/server/db/prisma";
import { badRequest, json, withApiErrorHandling } from "@/server/http/api";
import { enforceRateLimit } from "@/server/security/rate-limit";

const QUERY = `
  query userProfileCalendar($username: String!) {
    matchedUser(username: $username) {
      userCalendar {
        totalActiveDays
        streak
        submissionCalendar
      }
    }
  }
`;

interface Calendar {
  submissions: { date: string; count: number }[];
  totalSubmissions: number;
  fetchedAt: string;
}

/** Asks LeetCode for the last twelve months of one member's submissions. A day is one entry: the day, and how many they sent. */
async function fetchCalendar(username: string): Promise<Calendar> {
  const response = await fetch("https://leetcode.com/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json", Referer: "https://leetcode.com" },
    body: JSON.stringify({ query: QUERY, variables: { username } }),
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) throw new Error(`LeetCode answered ${response.status}`);

  const body = (await response.json()) as {
    data?: { matchedUser?: { userCalendar?: { submissionCalendar?: string } } | null };
    errors?: unknown;
  };
  // A profile that does not exist comes back as an error. One that exists but has done nothing has an empty calendar, which is fine.
  if (!body.data?.matchedUser) throw badRequest("LeetCode doesn't know that username. Check the link in Settings.");

  const raw = body.data.matchedUser.userCalendar?.submissionCalendar;
  const calendar = raw ? (JSON.parse(raw) as Record<string, number>) : {};

  const submissions = Object.entries(calendar)
    .map(([seconds, count]) => ({ date: new Date(Number(seconds) * 1000).toISOString().slice(0, 10), count: Number(count) }))
    .filter((d) => Number.isFinite(d.count) && d.count > 0)
    .sort((a, b) => a.date.localeCompare(b.date));

  return { submissions, totalSubmissions: submissions.reduce((n, d) => n + d.count, 0), fetchedAt: new Date().toISOString() };
}

/**
 * The signed in member's own calendar. It makes our server call LeetCode, so it is limited per member, and the answer is kept in
 * Redis for ten minutes so that opening the dashboard over and over does not hit LeetCode each time.
 */
export const GET = withApiErrorHandling(async (request: NextRequest) => {
  const session = await requireSession(request);
  await enforceRateLimit(`leetcode-calendar:${session.userId}`, 20, 60);

  const linked = await prisma.user.findUnique({ where: { id: session.userId }, select: { leetcodeUsername: true } });
  if (!linked?.leetcodeUsername) throw badRequest("Link your LeetCode account in Settings first.");

  const calendar = await getOrSetCached<Calendar>("dashboard", `leetcode-calendar:${linked.leetcodeUsername.toLowerCase()}`, 600, () =>
    fetchCalendar(linked.leetcodeUsername!),
  );

  return json({ success: true, ...calendar });
});
