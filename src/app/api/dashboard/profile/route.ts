import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

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
      include: {
        githubStats: true,
        leetcodeStats: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }


    const profile = {
      id: user.id,
      name: user.name,
      email: user.email,
      githubUsername: user.githubUsername,
      leetcodeUsername: user.leetcodeUsername,
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
        languages: (() => {
          try {
            // Parse languages JSON safely
            if (typeof user.githubStats.languages === 'string') {
              const parsed = JSON.parse(user.githubStats.languages);
              // Validate and clean
              if (parsed && typeof parsed === 'object') {
                const cleaned: Record<string, number> = {};
                for (const [lang, value] of Object.entries(parsed)) {
                  if (typeof lang === 'string' && 
                      typeof value === 'number' && 
                      value >= 0 && 
                      lang.length > 0 && 
                      lang.length < 50 &&
                      !lang.includes('%')) {
                    cleaned[lang] = Math.round(value);
                  }
                }
                return cleaned;
              }
            }
            return {};
          } catch (error) {
            console.error('Error parsing languages:', error);
            return {};
          }
        })()
      } : null,
      leetcodeStats: user.leetcodeStats ? {
        totalSolved: user.leetcodeStats.totalSolved,
        easySolved: user.leetcodeStats.easySolved,
        mediumSolved: user.leetcodeStats.mediumSolved,
        hardSolved: user.leetcodeStats.hardSolved,
        ranking: user.leetcodeStats.ranking,
        reputation: user.leetcodeStats.reputation,
        acceptanceRate: user.leetcodeStats.acceptanceRate,
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

    const { name, githubUsername, leetcodeUsername, location, bio } = await request.json();

    // Check if LeetCode username changed and trigger sync
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { leetcodeUsername: true }
    });

    const leetcodeChanged = leetcodeUsername && leetcodeUsername !== currentUser?.leetcodeUsername;

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name || null,
        githubUsername: githubUsername || null,
        leetcodeUsername: leetcodeUsername || null,
        location: location || null,
        bio: bio || null
      }
    });

    // If LeetCode username was added/changed, trigger initial sync
    if (leetcodeChanged && leetcodeUsername) {
      try {
        const { leetcodeService } = await import('@/lib/leetcode');
        await leetcodeService.syncUserStats(userId, leetcodeUsername);
      } catch (error) {
        console.error('Failed to sync LeetCode stats on profile update:', error);
        // Don't fail the profile update if sync fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}