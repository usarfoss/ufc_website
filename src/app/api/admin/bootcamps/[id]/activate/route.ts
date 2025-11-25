import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
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

    const bootcamp = await prisma.bootcamp.update({
      where: { id: params.id },
      data: { status: 'ACTIVE' }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Bootcamp activated successfully',
      bootcamp 
    });
  } catch (error) {
    console.error('Error activating bootcamp:', error);
    return NextResponse.json({ error: 'Failed to activate bootcamp' }, { status: 500 });
  }
}
