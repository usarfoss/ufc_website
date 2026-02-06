import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    });

    if (!user || !['ADMIN', 'MAINTAINER', 'MODERATOR'].includes(user.role.toUpperCase())) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get participants and assign final ranks
    const participants = await prisma.bootcampParticipant.findMany({
      where: { bootcampId: id },
      orderBy: { finalPoints: 'desc' }
    });

    // Update ranks
    for (let i = 0; i < participants.length; i++) {
      await prisma.bootcampParticipant.update({
        where: { id: participants[i].id },
        data: { finalRank: i + 1 }
      });
    }

    // Mark bootcamp as completed
    const bootcamp = await prisma.bootcamp.update({
      where: { id },
      data: { status: 'COMPLETED' }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Bootcamp completed successfully',
      bootcamp 
    });
  } catch (error) {
    console.error('Error completing bootcamp:', error);
    return NextResponse.json({ error: 'Failed to complete bootcamp' }, { status: 500 });
  }
}
