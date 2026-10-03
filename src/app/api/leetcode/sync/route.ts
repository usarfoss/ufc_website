import { NextRequest, NextResponse } from "next/server";
import { invalidateCache } from "@/server/cache/cache";
import { prisma } from "@/server/db/prisma";
import { leetcodeService } from "@/server/integrations/leetcode.service";
import { getSession } from "@/server/auth/session";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, leetcodeUsername: true },
    });

    if (!user || !user.leetcodeUsername) {
      return NextResponse.json({ error: "LeetCode username not found" }, { status: 400 });
    }

    // Sync LeetCode stats
    const result = await leetcodeService.syncUserStats(user.id, user.leetcodeUsername);
    await invalidateCache("members", "leaderboard");

    return NextResponse.json({
      success: true,
      message: "LeetCode stats synced successfully",
      data: result,
    });
  } catch (error: unknown) {
    console.error("LeetCode sync error:", error);
    return NextResponse.json(
      { error: error instanceof Error && error.message ? error.message : "Failed to sync LeetCode stats" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Get user's last sync time
    const leetcodeStats = await prisma.leetCodeStats.findUnique({
      where: { userId: session.userId },
      select: { lastSynced: true },
    });

    return NextResponse.json({
      lastSynced: leetcodeStats?.lastSynced || null,
      canSync: !leetcodeStats?.lastSynced || new Date().getTime() - new Date(leetcodeStats.lastSynced).getTime() > 5 * 60 * 1000, // 5 minutes
    });
  } catch (error) {
    console.error("Error checking sync status:", error);
    return NextResponse.json({ error: "Failed to check sync status" }, { status: 500 });
  }
}
