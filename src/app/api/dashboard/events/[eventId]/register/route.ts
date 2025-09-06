import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ eventId: string }> }
) {
  try {
    const params = await context.params;
    const { eventId } = params;

    // Get user from JWT token
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let userId: string;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
      userId = decoded.userId;
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check if event exists and is upcoming
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: {
            attendees: true
          }
        }
      }
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (event.status !== 'UPCOMING') {
      return NextResponse.json({ error: 'Cannot register for this event' }, { status: 400 });
    }

    if (event._count.attendees >= event.maxAttendees) {
      return NextResponse.json({ error: 'Event is full' }, { status: 400 });
    }

    // Check if user is already registered
    const existingRegistration = await prisma.eventAttendee.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId
        }
      }
    });

    if (existingRegistration) {
      return NextResponse.json({ error: 'Already registered for this event' }, { status: 400 });
    }

    // Register user for event
    await prisma.eventAttendee.create({
      data: {
        userId,
        eventId
      }
    });

    // Create activity record
    await prisma.activity.create({
      data: {
        type: 'EVENT_JOIN',
        userId,
        description: `Registered for event "${event.title}"`,
        eventId,
        metadata: {
          eventTitle: event.title,
          eventType: event.type,
          eventDate: event.date.toISOString()
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Successfully registered for event'
    });

  } catch (error) {
    console.error('Event registration error:', error);
    return NextResponse.json({ error: 'Failed to register for event' }, { status: 500 });
  }
}
