import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const completedBootcamps = await prisma.bootcamp.findMany({
      where: { status: 'COMPLETED' },
      include: {
        _count: {
          select: { participants: true }
        },
        participants: {
          where: { finalRank: { lte: 3 } },
          orderBy: { finalRank: 'asc' },
          take: 3,
          include: {
            user: {
              select: {
                name: true,
                githubUsername: true,
                leetcodeUsername: true,
                avatar: true
              }
            }
          }
        }
      },
      orderBy: { endDate: 'desc' }
    });

    return NextResponse.json({ 
      success: true, 
      bootcamps: completedBootcamps 
    });
  } catch (error) {
    console.error('Error fetching bootcamp history:', error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}
