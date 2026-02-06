import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bootcamp = await prisma.bootcamp.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            user: {
              select: {
                name: true,
                githubUsername: true,
                leetcodeUsername: true,
                avatar: true
              }
            }
          },
          orderBy: { finalPoints: 'desc' }
        }
      }
    });

    if (!bootcamp) {
      return NextResponse.json({ error: 'Bootcamp not found' }, { status: 404 });
    }

    // Format leaderboard data
    const leaderboard = bootcamp.participants.map((participant, index) => ({
      rank: index + 1,
      user: {
        name: participant.user.name,
        username: bootcamp.type === 'LEETCODE' 
          ? participant.user.leetcodeUsername 
          : participant.user.githubUsername,
        avatar: participant.user.avatar
      },
      registeredAt: participant.registeredAt,
      baselineStats: participant.baselineStats,
      currentStats: participant.currentStats,
      progressStats: participant.progressStats,
      points: participant.finalPoints,
      finalRank: participant.finalRank
    }));

    return NextResponse.json({ 
      success: true, 
      bootcamp: {
        id: bootcamp.id,
        name: bootcamp.name,
        description: bootcamp.description,
        type: bootcamp.type,
        status: bootcamp.status,
        startDate: bootcamp.startDate,
        endDate: bootcamp.endDate
      },
      leaderboard 
    });
  } catch (error) {
    console.error('Error fetching bootcamp leaderboard:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
