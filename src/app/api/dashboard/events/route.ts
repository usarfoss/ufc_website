import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get user from JWT token for registration status
    const token = request.cookies.get('auth-token')?.value;
    let userId: string | null = null;
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
        userId = decoded.userId;
      } catch (error) {
        // Continue without user ID if token is invalid
      }
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Fetch events with attendee count and creator info
    const events = await prisma.event.findMany({
      take: limit,
      skip: offset,
      orderBy: { date: 'asc' },
      include: {
        creator: {
          select: {
            name: true,
            githubUsername: true
          }
        },
        attendees: userId ? {
          where: { userId }
        } : false,
        _count: {
          select: {
            attendees: true
          }
        }
      }
    });

    // Format events for frontend
    const formattedEvents = events.map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.date.toISOString(),
      location: event.location,
      maxAttendees: event.maxAttendees,
      currentAttendees: event._count.attendees,
      type: event.type.toLowerCase(),
      status: event.status.toLowerCase(),
      creator: {
        name: event.creator.name || 'Unknown',
        githubUsername: event.creator.githubUsername
      },
      isRegistered: userId ? (event.attendees as any[]).length > 0 : false
    }));

    return NextResponse.json({
      success: true,
      events: formattedEvents,
      total: formattedEvents.length,
      hasMore: formattedEvents.length === limit
    });

  } catch (error) {
    console.error('Events fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user from JWT token
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let userId: string;
    let userRole: string;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
      userId = decoded.userId;
      userRole = decoded.role;
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check if user has permission to create events
    const allowedRoles = ['ADMIN', 'MAINTAINER', 'MODERATOR'];
    if (!allowedRoles.includes(userRole?.toUpperCase())) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { title, description, date, location, maxAttendees, type } = await request.json();

    // Validate required fields
    if (!title?.trim() || !description?.trim() || !date || !location?.trim()) {
      return NextResponse.json({ error: 'Title, description, date, and location are required' }, { status: 400 });
    }

    // Validate date is in the future
    const eventDate = new Date(date);
    if (eventDate <= new Date()) {
      return NextResponse.json({ error: 'Event date must be in the future' }, { status: 400 });
    }

    // Create event
    const event = await prisma.event.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        date: eventDate,
        location: location.trim(),
        maxAttendees: maxAttendees || 50,
        type: type || 'WORKSHOP',
        status: 'UPCOMING',
        creatorId: userId
      },
      include: {
        creator: {
          select: {
            name: true,
            githubUsername: true
          }
        }
      }
    });

    // Create activity record
    await prisma.activity.create({
      data: {
        type: 'EVENT_CREATE',
        userId,
        description: `Created event "${event.title}"`,
        eventId: event.id,
        metadata: {
          eventTitle: event.title,
          eventType: event.type,
          eventDate: event.date.toISOString()
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Event created successfully',
      event: {
        id: event.id,
        title: event.title,
        description: event.description,
        date: event.date.toISOString(),
        location: event.location,
        maxAttendees: event.maxAttendees,
        currentAttendees: 0,
        type: event.type.toLowerCase(),
        status: event.status.toLowerCase(),
        creator: {
          name: event.creator.name || 'Unknown',
          githubUsername: event.creator.githubUsername
        },
        isRegistered: false
      }
    });

  } catch (error) {
    console.error('Event creation error:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}