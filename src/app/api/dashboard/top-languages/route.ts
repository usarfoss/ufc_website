import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { githubService } from '@/lib/github';

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

    // Get user's GitHub username
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        githubUsername: true
      }
    });

    if (!user?.githubUsername) {
      return NextResponse.json({
        success: true,
        languages: {}
      });
    }

    try {
      // Use the existing getTopLanguagesFromReadmeStats method
      const languages = await githubService.getTopLanguagesFromReadmeStats(user.githubUsername);
      
      return NextResponse.json({
        success: true,
        languages
      });
    } catch (error) {
      console.error('Error fetching top languages:', error);
      return NextResponse.json({
        success: true,
        languages: {}
      });
    }

  } catch (error) {
    console.error('Top languages fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch top languages' }, { status: 500 });
  }
}

