import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const activeBootcamp = await prisma.bootcamp.findFirst({
      where: { status: 'ACTIVE' },
      include: {
        _count: {
          select: { participants: true }
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      bootcamp: activeBootcamp 
    });
  } catch (error) {
    console.error('Error fetching active bootcamp:', error);
    return NextResponse.json({ error: 'Failed to fetch active bootcamp' }, { status: 500 });
  }
}
