import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;

    const participant = await prisma.bootcampParticipant.findUnique({
      where: {
        bootcampId_userId: {
          bootcampId: params.id,
          userId: decoded.userId
        }
      },
      include: {
        bootcamp: {
          select: {
            name: true,
            type: true,
            status: true,
            startDate: true,
            endDate: true
          }
        }
      }
    });

    if (!participant) {
      return NextResponse.json({ error: 'Not registered for this bootcamp' }, { status: 404 });
    }

    // Get snapshots for progress chart
    const snapshots = await prisma.bootcampSnapshot.findMany({
      where: {
        participantId: participant.id
      },
      orderBy: { capturedAt: 'asc' },
      take: 50 // Last 50 snapshots
    });

    return NextResponse.json({ 
      success: true, 
      participant,
      snapshots
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 });
  }
}
