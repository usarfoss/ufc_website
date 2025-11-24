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
    
    // Check if user has admin access
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    });

    if (!user || !['ADMIN', 'MAINTAINER', 'MODERATOR'].includes(user.role.toUpperCase())) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch pending projects
    const projects = await prisma.project.findMany({
      where: {
        approvalStatus: 'PENDING'
      },
      include: {
        creator: {
          select: {
            name: true,
            githubUsername: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                name: true,
                githubUsername: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      projects
    });
  } catch (error) {
    console.error('Error fetching pending projects:', error);
    return NextResponse.json({ error: 'Failed to fetch pending projects' }, { status: 500 });
  }
}
