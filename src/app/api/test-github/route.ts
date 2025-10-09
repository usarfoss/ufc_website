import { NextRequest, NextResponse } from 'next/server';
import { githubService } from '@/lib/github';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    
    if (!username) {
      return NextResponse.json({ error: 'Username required' }, { status: 400 });
    }

    console.log(`Testing GitHub API for username: ${username}`);
    
    // Test basic GitHub API access
    try {
      const profile = await githubService.getUserProfile(username);
      console.log('Profile fetched:', profile);
      
      const contributions = await githubService.getUserContributions(username);
      console.log('Contributions fetched:', {
        totalCommits: contributions.totalCommits,
        totalPRs: contributions.totalPRs,
        totalIssues: contributions.totalIssues,
        recentActivityCount: contributions.recentActivity.length
      });
      
      return NextResponse.json({
        success: true,
        profile,
        contributions: {
          totalCommits: contributions.totalCommits,
          totalPRs: contributions.totalPRs,
          totalIssues: contributions.totalIssues,
          recentActivity: contributions.recentActivity
        }
      });
    } catch (error) {
      console.error('GitHub API test failed:', error);
      return NextResponse.json({ 
        error: 'GitHub API test failed', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json({ error: 'Test failed' }, { status: 500 });
  }
}
