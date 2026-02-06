import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let userId: string;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
      userId = decoded.userId;
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        portfolioSlug: true,
        portfolioPublic: true,
        portfolioTitle: true,
        portfolioSubtitle: true,
        tagline: true,
        techStack: true,
        resumeUrl: true,
        websiteUrl: true,
        linkedinUrl: true,
        twitterUrl: true,
        showEmail: true,
        showLocation: true,
        showJoinDate: true,
        showGithubStats: true,
        showLeetcodeStats: true,
        showProjects: true,
        showBootcamps: true,
        showAchievements: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
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

    return NextResponse.json({
      portfolioSlug: user.portfolioSlug,
      portfolioPublic: user.portfolioPublic,
      portfolioTitle: user.portfolioTitle,
      portfolioSubtitle: user.portfolioSubtitle,
      tagline: user.tagline,
      techStack,
      resumeUrl: user.resumeUrl,
      websiteUrl: user.websiteUrl,
      linkedinUrl: user.linkedinUrl,
      twitterUrl: user.twitterUrl,
      showEmail: user.showEmail,
      showLocation: user.showLocation,
      showJoinDate: user.showJoinDate,
      showGithubStats: user.showGithubStats,
      showLeetcodeStats: user.showLeetcodeStats,
      showProjects: user.showProjects,
      showBootcamps: user.showBootcamps,
      showAchievements: user.showAchievements
    });
  } catch (error) {
    console.error('Portfolio settings fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let userId: string;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
      userId = decoded.userId;
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();

    const {
      portfolioSlug,
      portfolioPublic,
      portfolioTitle,
      portfolioSubtitle,
      tagline,
      techStack,
      resumeUrl,
      websiteUrl,
      linkedinUrl,
      twitterUrl,
      showEmail,
      showLocation,
      showJoinDate,
      showGithubStats,
      showLeetcodeStats,
      showProjects,
      showBootcamps,
      showAchievements
    } = body;

    // Validate slug format
    if (portfolioSlug && !/^[a-z0-9-]+$/.test(portfolioSlug)) {
      return NextResponse.json(
        { error: 'Invalid slug format. Only lowercase letters, numbers, and hyphens allowed.' },
        { status: 400 }
      );
    }

    // Check if slug is already taken by another user
    if (portfolioSlug) {
      const existingUser = await prisma.user.findUnique({
        where: { portfolioSlug }
      });

      if (existingUser && existingUser.id !== userId) {
        return NextResponse.json(
          { error: 'Slug already taken' },
          { status: 400 }
        );
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        portfolioSlug: portfolioSlug || null,
        portfolioPublic: portfolioPublic || false,
        portfolioTitle: portfolioTitle || null,
        portfolioSubtitle: portfolioSubtitle || null,
        tagline: tagline || null,
        techStack: techStack ? JSON.stringify(techStack) : undefined,
        resumeUrl: resumeUrl || null,
        websiteUrl: websiteUrl || null,
        linkedinUrl: linkedinUrl || null,
        twitterUrl: twitterUrl || null,
        showEmail: showEmail ?? false,
        showLocation: showLocation ?? true,
        showJoinDate: showJoinDate ?? true,
        showGithubStats: showGithubStats ?? true,
        showLeetcodeStats: showLeetcodeStats ?? true,
        showProjects: showProjects ?? true,
        showBootcamps: showBootcamps ?? true,
        showAchievements: showAchievements ?? true
      }
    });

    return NextResponse.json({
      success: true,
      portfolioSlug: updatedUser.portfolioSlug
    });
  } catch (error: any) {
    console.error('Portfolio settings update error:', error);
    
    // Check if it's a database column error
    if (error?.message?.includes('column') || error?.code === 'P2010') {
      return NextResponse.json(
        { error: 'Database migration required. Please run: npx prisma migrate dev' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: error?.message || 'Failed to update portfolio settings' },
      { status: 500 }
    );
  }
}
