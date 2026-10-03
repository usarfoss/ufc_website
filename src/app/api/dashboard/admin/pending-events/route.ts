import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db/prisma";
import { getSession } from "@/server/auth/session";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Check if user has admin access
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { role: true },
    });

    if (!user || !["ADMIN", "MAINTAINER"].includes(user.role.toUpperCase())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch pending events
    const events = await prisma.event.findMany({
      where: {
        approvalStatus: "PENDING",
      },
      include: {
        creator: {
          select: {
            name: true,
            githubUsername: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      events,
    });
  } catch (error) {
    console.error("Error fetching pending events:", error);
    return NextResponse.json({ error: "Failed to fetch pending events" }, { status: 500 });
  }
}
