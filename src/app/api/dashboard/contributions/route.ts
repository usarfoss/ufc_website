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
      select: { 
        githubUsername: true
      }
    });

    if (!user?.githubUsername) {
      return NextResponse.json({
        success: true,
        contributions: []
      });
    }

    try {
      // Fetch contribution data from GitHub GraphQL API
      const response = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GITHUB_TOKEN || ''}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query($username: String!) {
              user(login: $username) {
                contributionsCollection {
                  contributionCalendar {
                    totalContributions
                    weeks {
                      contributionDays {
                        date
                        contributionCount
                        color
                      }
                    }
                  }
                }
              }
            }
          `,
          variables: {
            username: user.githubUsername
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch contributions');
      }

      const data = await response.json();
      
      if (data.errors) {
        console.error('GraphQL errors:', data.errors);
        return NextResponse.json({
          success: true,
          contributions: []
        });
      }

      const weeks = data.data?.user?.contributionsCollection?.contributionCalendar?.weeks || [];
      const contributions: Array<{ date: string; count: number; color: string }> = [];

      weeks.forEach((week: any) => {
        week.contributionDays.forEach((day: any) => {
          contributions.push({
            date: day.date,
            count: day.contributionCount,
            color: day.color
          });
        });
      });

      return NextResponse.json({
        success: true,
        contributions,
        totalContributions: data.data?.user?.contributionsCollection?.contributionCalendar?.totalContributions || 0
      });
    } catch (error) {
      console.error('Error fetching contributions:', error);
      return NextResponse.json({
        success: true,
        contributions: []
      });
    }

  } catch (error) {
    console.error('Contributions fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch contributions' }, { status: 500 });
  }
}

