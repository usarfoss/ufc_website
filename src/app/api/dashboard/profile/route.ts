import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get user from JWT token
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

    // Get user profile with GitHub stats
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        githubStats: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Format profile for frontend
    const profile = {
      id: user.id,
      name: user.name,
      email: user.email,
      githubUsername: user.githubUsername,
      location: user.location,
      bio: user.bio,
      avatar: user.avatar,
      joinedAt: user.joinedAt.toISOString(),
      lastActive: user.lastActive.toISOString(),
      githubStats: user.githubStats ? {
        commits: user.githubStats.commits,
        pullRequests: user.githubStats.pullRequests,
        issues: user.githubStats.issues,
        repositories: user.githubStats.repositories,
        followers: user.githubStats.followers,
        contributions: user.githubStats.contributions,
        languages: user.githubStats.languages as Record<string, number> || {}
      } : null
    };

    return NextResponse.json({
      success: true,
      profile
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get user from JWT token
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

    const { name, githubUsername, location, bio } = await request.json();

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name || null,
        githubUsername: githubUsername || null,
        location: location || null,
        bio: bio || null
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}