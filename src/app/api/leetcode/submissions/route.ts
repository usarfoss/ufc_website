import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/server/auth/session";
import { prisma } from "@/server/db/prisma";
import { ApiError } from "@/server/http/api";
import { enforceRateLimit } from "@/server/security/rate-limit";

export async function GET(request: NextRequest) {
  try {
    // This route makes our server call LeetCode, so it is for signed in members, a few times a minute, and only for their own linked account.
    // Without that, anyone could use it as a free relay to LeetCode with our address.
    const session = await requireSession(request);
    await enforceRateLimit(`leetcode-calendar:${session.userId}`, 20, 60);
    const linked = await prisma.user.findUnique({ where: { id: session.userId }, select: { leetcodeUsername: true } });
    const username = linked?.leetcodeUsername;

    if (!username) {
      return NextResponse.json({ error: "Link your LeetCode account first." }, { status: 400 });
    }

    // Fetch submission calendar from LeetCode GraphQL API
    const query = `
      query userProfileCalendar($username: String!) {
        matchedUser(username: $username) {
          userCalendar {
            submissionCalendar
          }
        }
      }
    `;

    const response = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Referer: "https://leetcode.com",
      },
      body: JSON.stringify({
        query,
        variables: { username },
      }),
      signal: AbortSignal.timeout(8_000),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch LeetCode submissions");
    }

    const data = await response.json();

    if (data.errors) {
      console.error("LeetCode GraphQL errors:", data.errors);
      return NextResponse.json({ error: "Failed to fetch submissions from LeetCode" }, { status: 500 });
    }

    // Parse submission calendar (it's a JSON string with timestamps as keys)
    const submissionCalendar = data.data?.matchedUser?.userCalendar?.submissionCalendar;

    if (!submissionCalendar) {
      return NextResponse.json({
        success: true,
        submissions: [],
        totalSubmissions: 0,
      });
    }

    const calendarData = JSON.parse(submissionCalendar);

    // Transform to array of date/count objects
    const submissions = Object.entries(calendarData).map(([timestamp, count]) => {
      const date = new Date(parseInt(timestamp) * 1000);
      return {
        date: date.toISOString().split("T")[0],
        count: count as number,
      };
    });

    // Sort by date
    submissions.sort((a, b) => a.date.localeCompare(b.date));

    const totalSubmissions = submissions.reduce((sum, day) => sum + day.count, 0);

    return NextResponse.json({
      success: true,
      submissions,
      totalSubmissions,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message, ...error.details }, { status: error.status, headers: error.headers });
    }
    console.error("LeetCode submissions error:", error);
    return NextResponse.json({ error: "Failed to fetch LeetCode submissions" }, { status: 500 });
  }
}
