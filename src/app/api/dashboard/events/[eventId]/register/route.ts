import { NextRequest, NextResponse } from "next/server";
import { invalidateCache } from "@/server/cache/cache";
import { prisma } from "@/server/db/prisma";
import { getSession } from "@/server/auth/session";

export async function POST(request: NextRequest, context: { params: Promise<{ eventId: string }> }) {
  try {
    const params = await context.params;
    const { eventId } = params;

    const session = await getSession(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = session.userId;

    // Check if event exists and is upcoming
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: {
            attendees: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.status !== "UPCOMING") {
      return NextResponse.json({ error: "Cannot register for this event" }, { status: 400 });
    }

    if (event._count.attendees >= event.maxAttendees) {
      return NextResponse.json({ error: "Event is full" }, { status: 400 });
    }

    // Check if user is already registered
    const existingRegistration = await prisma.eventAttendee.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId,
        },
      },
    });

    if (existingRegistration) {
      return NextResponse.json({ error: "Already registered for this event" }, { status: 400 });
    }

    // Register user for event
    await prisma.eventAttendee.create({
      data: {
        userId,
        eventId,
      },
    });

    // Create activity record
    await prisma.activity.create({
      data: {
        type: "EVENT_JOIN",
        userId,
        description: `Registered for event "${event.title}"`,
        eventId,
        metadata: {
          eventTitle: event.title,
          eventType: event.type,
          eventDate: event.date.toISOString(),
        },
      },
    });

    await invalidateCache("activity-feed");

    return NextResponse.json({
      success: true,
      message: "Successfully registered for event",
    });
  } catch (error) {
    console.error("Event registration error:", error);
    return NextResponse.json({ error: "Failed to register for event" }, { status: 500 });
  }
}
