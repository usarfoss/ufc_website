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

    // Fetch submission calendar from LeetCode GraphQL API
    const query = `
      query userProfileCalendar($username: String!) {
        matchedUser(username: $username) {
          userCalendar {
            submissionCalendar
          }
        }
      }
    `;

    const response = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://leetcode.com'
      },
      body: JSON.stringify({
        query,
        variables: { username }
      })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch LeetCode submissions');
    }

    const data = await response.json();

    if (data.errors) {
      console.error('LeetCode GraphQL errors:', data.errors);
      return NextResponse.json(
        { error: 'Failed to fetch submissions from LeetCode' },
        { status: 500 }
      );
    }

    // Parse submission calendar (it's a JSON string with timestamps as keys)
    const submissionCalendar = data.data?.matchedUser?.userCalendar?.submissionCalendar;
    
    if (!submissionCalendar) {
      return NextResponse.json({
        success: true,
        submissions: [],
        totalSubmissions: 0
      });
    }

    const calendarData = JSON.parse(submissionCalendar);
    
    // Transform to array of date/count objects
    const submissions = Object.entries(calendarData).map(([timestamp, count]) => {
      const date = new Date(parseInt(timestamp) * 1000);
      return {
        date: date.toISOString().split('T')[0],
        count: count as number
      };
    });

    // Sort by date
    submissions.sort((a, b) => a.date.localeCompare(b.date));

    const totalSubmissions = submissions.reduce((sum, day) => sum + day.count, 0);

    return NextResponse.json({
      success: true,
      submissions,
      totalSubmissions
    });
  } catch (error) {
    console.error('LeetCode submissions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch LeetCode submissions' },
      { status: 500 }
    );
  }
}
