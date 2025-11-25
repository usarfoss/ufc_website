import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // Find user by portfolio slug
    const user = await prisma.user.findUnique({
      where: { portfolioSlug: slug },
      include: {
        githubStats: true,
        leetcodeStats: true,
        projects: {
          include: {
            project: true
          },
          take: 10
        },
        bootcampParticipations: {
          include: {
            bootcamp: true
          },
          orderBy: {
            registeredAt: 'desc'
          },
          take: 10
        },
        achievements: {
          include: {
            achievement: true
          },
          orderBy: {
            unlockedAt: 'desc'
          },
          take: 12
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404 }
      );
    }

    // Check if portfolio is public or if user is viewing their own portfolio
    const token = request.cookies.get('auth-token')?.value;
    let isOwner = false;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
        isOwner = decoded.userId === user.id;
      } catch (err) {
        // Token invalid, continue as guest
      }
    }

    if (!user.portfolioPublic && !isOwner) {
      return NextResponse.json(
        { error: 'This portfolio is private' },
        { status: 403 }
      );
    }

    // Parse tech stack
    let techStack: string[] = [];
    if (user.techStack) {
      try {
        techStack = JSON.parse(user.techStack as string);
      } catch (err) {
        console.error('Error parsing tech stack:', err);
      }
    }

    // Parse GitHub languages
    let languages: Record<string, number> = {};
    if (user.githubStats?.languages) {
      try {
        languages = JSON.parse(user.githubStats.languages as string);
      } catch (err) {
        console.error('Error parsing languages:', err);
      }
    }

    // Build response
    const portfolioData = {
      user: {
        id: user.id,
        name: user.name,
        email: isOwner ? user.email : undefined, // Only show email to owner
        avatar: user.avatar,
        location: user.location,
        bio: user.bio,
        tagline: user.tagline,
        githubUsername: user.githubUsername,
        leetcodeUsername: user.leetcodeUsername,
        websiteUrl: user.websiteUrl,
        linkedinUrl: user.linkedinUrl,
        twitterUrl: user.twitterUrl,
        resumeUrl: user.resumeUrl,
        techStack,
        joinedAt: user.joinedAt.toISOString()
      },
      githubStats: user.githubStats ? {
        commits: user.githubStats.commits,
        pullRequests: user.githubStats.pullRequests,
        issues: user.githubStats.issues,
        repositories: user.githubStats.repositories,
        followers: user.githubStats.followers,
        contributions: user.githubStats.contributions,
        languages
      } : undefined,
      leetcodeStats: user.leetcodeStats ? {
        totalSolved: user.leetcodeStats.totalSolved,
        easySolved: user.leetcodeStats.easySolved,
        mediumSolved: user.leetcodeStats.mediumSolved,
        hardSolved: user.leetcodeStats.hardSolved,
        ranking: user.leetcodeStats.ranking,
        reputation: user.leetcodeStats.reputation
      } : undefined,
      projects: user.projects.map(pm => ({
        id: pm.project.id,
        name: pm.project.name,
        description: pm.project.description,
        repoUrl: pm.project.repoUrl,
        language: pm.project.language,
        status: pm.project.status
      })),
      bootcamps: user.bootcampParticipations.map(bp => ({
        id: bp.bootcamp.id,
        name: bp.bootcamp.name,
        type: bp.bootcamp.type,
        finalRank: bp.finalRank,
        finalPoints: bp.finalPoints
      })),
      achievements: user.achievements.map(ua => ({
        id: ua.achievement.id,
        name: ua.achievement.name,
        description: ua.achievement.description,
        icon: ua.achievement.icon,
        unlockedAt: ua.unlockedAt.toISOString()
      }))
    };

    return NextResponse.json(portfolioData);
  } catch (error) {
    console.error('Portfolio fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio' },
      { status: 500 }
    );
  }
}
