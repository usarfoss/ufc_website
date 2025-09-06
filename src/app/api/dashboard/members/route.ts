import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get all members with their GitHub stats
    const members = await prisma.user.findMany({
      take: limit,
      skip: offset,
      orderBy: { joinedAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        githubUsername: true,
        location: true,
        bio: true,
        avatar: true,
        joinedAt: true,
        githubStats: {
          select: {
            commits: true,
            pullRequests: true,
            issues: true,
            contributions: true
          }
        }
      }
    });

    // Format members for frontend
    const formattedMembers = members.map(member => ({
      id: member.id,
      name: member.name,
      email: member.email,
      githubUsername: member.githubUsername,
      location: member.location,
      bio: member.bio,
      avatar: member.avatar,
      joinedAt: member.joinedAt.toISOString(),
      githubStats: member.githubStats ? {
        commits: member.githubStats.commits,
        pullRequests: member.githubStats.pullRequests,
        issues: member.githubStats.issues,
        contributions: member.githubStats.contributions
      } : null
    }));

    return NextResponse.json({
      success: true,
      members: formattedMembers,
      total: formattedMembers.length,
      hasMore: formattedMembers.length === limit
    });

  } catch (error) {
    console.error('Members fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
  }
}