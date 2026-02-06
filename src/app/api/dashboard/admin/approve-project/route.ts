import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
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

    const { projectId, action, reason } = await request.json();

    if (!projectId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Update project approval status
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        approvalStatus: action === 'approve' ? 'APPROVED' : 'REJECTED',
        approvedById: action === 'approve' ? decoded.userId : null,
        approvedAt: action === 'approve' ? new Date() : null,
        rejectionReason: action === 'reject' ? reason : null
      }
    });

    // Create activity for approval/rejection
    await prisma.activity.create({
      data: {
        type: action === 'approve' ? 'PROJECT_APPROVED' : 'PROJECT_REJECTED',
        userId: updatedProject.creatorId,
        description: action === 'approve' 
          ? `Your project "${updatedProject.name}" has been approved!`
          : `Your project "${updatedProject.name}" was rejected${reason ? `: ${reason}` : ''}`,
        projectId: projectId
      }
    });

    return NextResponse.json({
      success: true,
      message: `Project ${action === 'approve' ? 'approved' : 'rejected'} successfully`
    });
  } catch (error) {
    console.error('Error updating project approval:', error);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}
