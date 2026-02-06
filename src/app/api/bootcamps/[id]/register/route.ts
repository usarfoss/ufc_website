import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { bootcampService } from '@/lib/bootcamp';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;

    // Get bootcamp details
    const bootcamp = await prisma.bootcamp.findUnique({
      where: { id: params.id }
    });

    if (!bootcamp) {
      return NextResponse.json({ error: 'Bootcamp not found' }, { status: 404 });
    }

    if (bootcamp.status !== 'ACTIVE' && bootcamp.status !== 'UPCOMING') {
      return NextResponse.json({ error: 'Bootcamp is not accepting registrations' }, { status: 400 });
    }

    // Check if already registered
    const existingParticipant = await prisma.bootcampParticipant.findUnique({
      where: {
        bootcampId_userId: {
          bootcampId: params.id,
          userId: decoded.userId
        }
      }
    });

    if (existingParticipant) {
      return NextResponse.json({ error: 'Already registered for this bootcamp' }, { status: 400 });
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { 
        id: true, 
        name: true, 
        githubUsername: true, 
        leetcodeUsername: true 
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get appropriate username
    const username = bootcamp.type === 'LEETCODE' 
      ? user.leetcodeUsername 
      : user.githubUsername;

    if (!username) {
      return NextResponse.json({ 
        error: `Please add your ${bootcamp.type === 'LEETCODE' ? 'LeetCode' : 'GitHub'} username to your profile first` 
      }, { status: 400 });
    }

    // Capture baseline stats
    const baselineStats = await bootcampService.captureBaseline(
      user.id,
      bootcamp.type,
      username
    );

    if (!baselineStats) {
      return NextResponse.json({ 
        error: `Failed to fetch your ${bootcamp.type === 'LEETCODE' ? 'LeetCode' : 'GitHub'} stats` 
      }, { status: 400 });
    }

    // Register participant
    const participant = await prisma.bootcampParticipant.create({
      data: {
        bootcampId: params.id,
        userId: decoded.userId,
        baselineStats: baselineStats
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Successfully registered for bootcamp!',
      participant 
    });
  } catch (error) {
    console.error('Error registering for bootcamp:', error);
    return NextResponse.json({ error: 'Failed to register for bootcamp' }, { status: 500 });
  }
}
