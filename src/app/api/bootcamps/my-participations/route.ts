import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;

    const participations = await prisma.bootcampParticipant.findMany({
      where: { userId: decoded.userId },
      include: {
        bootcamp: {
          include: {
            _count: {
              select: { participants: true }
            }
          }
        }
      },
      orderBy: { registeredAt: 'desc' }
    });

    return NextResponse.json({ 
      success: true, 
      participations 
    });
  } catch (error) {
    console.error('Error fetching participations:', error);
    return NextResponse.json({ error: 'Failed to fetch participations' }, { status: 500 });
  }
}
