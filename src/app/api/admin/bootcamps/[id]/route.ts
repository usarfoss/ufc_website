import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export async function GET(
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

    const bootcamp = await prisma.bootcamp.findUnique({
      where: { id },
      include: {
        creator: {
          select: { name: true, email: true }
        },
        participants: {
          include: {
            user: {
              select: { name: true, email: true, githubUsername: true, leetcodeUsername: true }
            }
          },
          orderBy: { finalPoints: 'desc' }
        }
      }
    });

    if (!bootcamp) {
      return NextResponse.json({ error: 'Bootcamp not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, bootcamp });
  } catch (error) {
    console.error('Error fetching bootcamp:', error);
    return NextResponse.json({ error: 'Failed to fetch bootcamp' }, { status: 500 });
  }
}

export async function PUT(
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

    const { name, description, startDate, endDate } = await request.json();

    const bootcamp = await prisma.bootcamp.update({
      where: { id },
      data: {
        name,
        description,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Bootcamp updated successfully',
      bootcamp 
    });
  } catch (error) {
    console.error('Error updating bootcamp:', error);
    return NextResponse.json({ error: 'Failed to update bootcamp' }, { status: 500 });
  }
}

export async function DELETE(
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

    await prisma.bootcamp.delete({
      where: { id }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Bootcamp deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting bootcamp:', error);
    return NextResponse.json({ error: 'Failed to delete bootcamp' }, { status: 500 });
  }
}
