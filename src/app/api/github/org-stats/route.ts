import { NextRequest, NextResponse } from 'next/server';
import { OrgGitHubService } from '@/lib/github-org';

export async function GET(request: NextRequest) {
  try {
    const token = process.env.GITHUB_ORG_TOKEN || process.env.GITHUB_TOKEN;
    const org = process.env.GITHUB_ORG;

    if (!token || !org) {
      return NextResponse.json({ error: 'GITHUB_ORG and GITHUB_ORG_TOKEN must be set' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const scope = searchParams.get('scope') || 'members'; // members | repos | all

    const service = new OrgGitHubService(token, org);

    if (scope === 'repos') {
      const repos = await service.getOrgRepos();
      return NextResponse.json({ org, repos, lastUpdated: new Date().toISOString() });
    }

    if (scope === 'members') {
      const members = await service.getAllMemberStats();
      return NextResponse.json({ org, members, lastUpdated: new Date().toISOString() });
    }

    // all
    const [repos, members] = await Promise.all([
      service.getOrgRepos(),
      service.getAllMemberStats(),
    ]);

    return NextResponse.json({ org, repos, members, lastUpdated: new Date().toISOString() });
  } catch (error: any) {
    console.error('Org stats error:', error?.message || error);
    return NextResponse.json({ error: 'Failed to fetch org stats' }, { status: 500 });
  }
} 