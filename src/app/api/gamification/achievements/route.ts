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
    
    // Get user's achievements
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId: decoded.userId },
      include: {
        achievement: true,
      },
      orderBy: { unlockedAt: 'desc' },
    });

    // Get all available achievements
    const allAchievements = await prisma.achievement.findMany({
      orderBy: { category: 'asc' },
    });

    // Mark which achievements are unlocked
    const unlockedIds = new Set(userAchievements.map(ua => ua.achievementId));
    const achievementsWithStatus = allAchievements.map(achievement => ({
      ...achievement,
      unlocked: unlockedIds.has(achievement.id),
      unlockedAt: userAchievements.find(ua => ua.achievementId === achievement.id)?.unlockedAt || null,
    }));

    return NextResponse.json({
      achievements: achievementsWithStatus,
      unlockedCount: userAchievements.length,
      totalCount: allAchievements.length,
    });
  } catch (error) {
    console.error('Achievements error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    const { name, description, icon, category, points, requirement } = await request.json();

    // Only admins can create achievements
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true },
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const achievement = await prisma.achievement.create({
      data: {
        name,
        description,
        icon,
        category,
        points,
        requirement: JSON.stringify(requirement),
      },
    });

    return NextResponse.json({ achievement });
  } catch (error) {
    console.error('Create achievement error:', error);
    return NextResponse.json(
      { error: 'Failed to create achievement' },
      { status: 500 }
    );
  }
}