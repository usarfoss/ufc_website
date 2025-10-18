import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'rank';

    // Build search conditions
    const searchConditions = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { githubUsername: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
        { location: { contains: search, mode: 'insensitive' as const } },
        { bio: { contains: search, mode: 'insensitive' as const } }
      ]
    } : {};

    // Get total count for pagination
    const totalCount = await prisma.user.count({
      where: searchConditions
    });

    // Optimized: Get members with smart ordering to reduce API calls
    const allMembers = await prisma.user.findMany({
      where: {
        ...searchConditions,
        // Only get users with GitHub stats for ranking
        githubStats: {
          isNot: null
        }
      },
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
      },
      // Pre-order by contributions to get top performers first
      orderBy: {
        githubStats: {
          contributions: 'desc'
        }
      }
    });

    // Calculate points and rankings for all members
    const membersWithRankings = allMembers
      .map(member => {
        const stats = member.githubStats || {
          commits: 0,
          pullRequests: 0,
          issues: 0,
          contributions: 0
        };
        const points = stats.commits * 1 + stats.pullRequests * 5 + stats.issues * 2;
        return { ...member, points };
      })
      .filter(member => member.githubStats && member.githubStats.contributions > 0)
      .sort((a, b) => b.points - a.points)
      .map((member, index) => ({
        ...member,
        rank: index + 1
      }));

    // Add members without contributions at the end
    const membersWithoutContributions = allMembers
      .filter(member => !member.githubStats || member.githubStats.contributions === 0)
      .map(member => ({
        ...member,
        points: 0,
        rank: membersWithRankings.length + 1
      }));

    // Combine and sort based on sortBy parameter
    let allMembersWithRankings = [...membersWithRankings, ...membersWithoutContributions];
    
    if (sortBy === 'name') {
      allMembersWithRankings = allMembersWithRankings.sort((a, b) => 
        (a.name || '').localeCompare(b.name || '')
      );
    } else if (sortBy === 'joined') {
      allMembersWithRankings = allMembersWithRankings.sort((a, b) => 
        new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime()
      );
    } else {
      // Default: sort by rank
      allMembersWithRankings = allMembersWithRankings.sort((a, b) => a.rank - b.rank);
    }

    // Apply pagination
    const members = allMembersWithRankings.slice(offset, offset + limit);

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
      rank: member.rank,
      points: member.points,
      githubStats: member.githubStats ? {
        commits: member.githubStats.commits,
        pullRequests: member.githubStats.pullRequests,
        issues: member.githubStats.issues,
        contributions: member.githubStats.contributions
      } : null
    }));

    const totalPages = Math.ceil(totalCount / limit);
    const hasMore = offset + limit < totalCount;

    return NextResponse.json({
      success: true,
      members: formattedMembers,
      total: totalCount,
      totalPages,
      currentPage: Math.floor(offset / limit) + 1,
      hasMore,
      search: search || null
    });

  } catch (error) {
    console.error('Members fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
  }
}