import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    // Fetch contribution data from GitHub GraphQL API
    const query = `
      query($username: String!) {
        user(login: $username) {
          contributionsCollection {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  contributionCount
                  date
                }
              }
            }
          }
        }
      }
    `;

    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { username }
      })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch GitHub contributions');
    }

    const data = await response.json();

    if (data.errors) {
      console.error('GitHub GraphQL errors:', data.errors);
      return NextResponse.json(
        { error: 'Failed to fetch contributions from GitHub' },
        { status: 500 }
      );
    }

    // Transform the data into a flat array
    const contributions = data.data?.user?.contributionsCollection?.contributionCalendar?.weeks
      ?.flatMap((week: any) => 
        week.contributionDays.map((day: any) => ({
          date: day.date,
          count: day.contributionCount,
          level: getContributionLevel(day.contributionCount)
        }))
      ) || [];

    return NextResponse.json({
      success: true,
      contributions,
      totalContributions: data.data?.user?.contributionsCollection?.contributionCalendar?.totalContributions || 0
    });
  } catch (error) {
    console.error('GitHub contributions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch GitHub contributions' },
      { status: 500 }
    );
  }
}

function getContributionLevel(count: number): number {
  if (count === 0) return 0;
  if (count < 3) return 1;
  if (count < 6) return 2;
  if (count < 10) return 3;
  return 4;
}
