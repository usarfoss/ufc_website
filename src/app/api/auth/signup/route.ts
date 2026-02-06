import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, githubUsername } = await request.json();
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    console.log('🔵 Signup attempt:', { email: normalizedEmail, name, githubUsername });

    if (!email || !password || !name || !githubUsername) {
      return NextResponse.json(
        { error: 'Email, password, name, and GitHub username are required' },
        { status: 400 }
      );
    }

    const existingUserByEmail = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (existingUserByEmail) {
      console.log('❌ Signup failed: Email already exists:', normalizedEmail);
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    const existingUserByGitHub = await prisma.user.findFirst({
      where: { githubUsername: githubUsername }
    });

    if (existingUserByGitHub) {
      console.log('❌ Signup failed: GitHub username already exists:', githubUsername);
      return NextResponse.json(
        { error: 'User with this GitHub username already exists' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        name,
        githubUsername: githubUsername || null,
        role: 'MEMBER'
      }
    });

    const token = jwt.sign(
      { 
        userId: newUser.id, 
        email: newUser.email, 
        role: newUser.role,
        githubUsername: newUser.githubUsername 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    // Clear leaderboard caches when new user joins
    try {
      // Clear gamification leaderboard cache
      await prisma.leaderboard.deleteMany({
        where: {
          type: {
            in: ['CONTRIBUTIONS', 'COMMITS', 'PULL_REQUESTS', 'ISSUES', 'EXPERIENCE', 'STREAK']
          }
        }
      });
      console.log('🧹 Cleared leaderboard caches for new user');
    } catch (cacheError) {
      console.warn('Failed to clear leaderboard caches:', cacheError);
    }

    const response = NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role.toLowerCase(),
        githubUsername: newUser.githubUsername
      }
    });

    const cookieDomain = process.env.COOKIE_DOMAIN;
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
      ...(cookieDomain ? { domain: cookieDomain } : {})
    });

    return response;
  } catch (error) {
    console.error('Signup error:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
    return NextResponse.json(
          { error: 'User already exists' },
          { status: 409 }
    );
      }
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}