import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Fetch only approved projects for public view
    const projects = await prisma.project.findMany({
      where: {
        approvalStatus: 'APPROVED'
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

    // Format projects for frontend
    const formattedProjects = projects.map(project => ({
      id: project.id,
      name: project.name,
      description: project.description,
      repoUrl: project.repoUrl,
      language: project.language,
      status: project.status.toLowerCase(),
      createdAt: project.createdAt.toISOString(),
      creator: {
        name: project.creator.name || 'Unknown',
        githubUsername: project.creator.githubUsername
      },
      collaborators: project.members.map(member => ({
        name: member.user.name || 'Unknown',
        githubUsername: member.user.githubUsername,
        role: member.role
      }))
    }));

    return NextResponse.json({
      success: true,
      projects: formattedProjects
    });
  } catch (error) {
    console.error('Error fetching public projects:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}
