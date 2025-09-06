import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Fetch projects with member count and creator info
    const projects = await prisma.project.findMany({
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      include: {
        creator: {
          select: {
            name: true,
            githubUsername: true
          }
        },
        members: true,
        _count: {
          select: {
            members: true
          }
        }
      }
    });

    // Format projects for frontend
    const formattedProjects = projects.map(project => ({
      id: project.id,
      name: project.name,
      description: project.description,
      repoUrl: project.repoUrl,
      language: project.language,
      status: project.status.toLowerCase(),
      createdAt: project.createdAt.toISOString(),
      memberCount: project._count.members,
      creator: {
        name: project.creator.name || 'Unknown',
        githubUsername: project.creator.githubUsername
      }
    }));

    return NextResponse.json({
      success: true,
      projects: formattedProjects,
      total: formattedProjects.length,
      hasMore: formattedProjects.length === limit
    });

  } catch (error) {
    console.error('Projects fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
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

    // Check if user has permission to create projects
    const allowedRoles = ['ADMIN', 'MAINTAINER', 'MODERATOR'];
    if (!allowedRoles.includes(userRole?.toUpperCase())) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { name, description, repoUrl, language } = await request.json();

    // Validate required fields
    if (!name?.trim() || !description?.trim()) {
      return NextResponse.json({ error: 'Name and description are required' }, { status: 400 });
    }

    // Create project
    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        description: description.trim(),
        repoUrl: repoUrl?.trim() || null,
        language: language?.trim() || 'Other',
        status: 'PLANNING',
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

    // Add creator as project member with admin role
    await prisma.projectMember.create({
      data: {
        userId,
        projectId: project.id,
        role: 'admin'
      }
    });

    // Create activity record
    await prisma.activity.create({
      data: {
        type: 'PROJECT_CREATE',
        userId,
        description: `Created project "${project.name}"`,
        projectId: project.id,
        metadata: {
          projectName: project.name,
          language: project.language
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Project created successfully',
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        repoUrl: project.repoUrl,
        language: project.language,
        status: project.status.toLowerCase(),
        createdAt: project.createdAt.toISOString(),
        memberCount: 1,
        creator: {
          name: project.creator.name || 'Unknown',
          githubUsername: project.creator.githubUsername
        }
      }
    });

  } catch (error) {
    console.error('Project creation error:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}