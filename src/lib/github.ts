import { Octokit } from '@octokit/rest';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export interface GitHubUserStats {
  username: string;
  name: string;
  avatar_url: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
  bio: string | null;
  location: string | null;
  blog: string | null;
  company: string | null;
}

export interface GitHubRepoStats {
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  created_at: string;
  updated_at: string;
  pushed_at: string;
}

export interface GitHubContributionStats {
  totalCommits: number;
  totalPRs: number;
  totalIssues: number;
  totalReviews: number;
  languages: Record<string, number>;
  recentActivity: Array<{
    type: string;
    repo: string;
    date: string;
    message: string;
  }>;
}

export class GitHubService {
  private octokit: Octokit;

  constructor() {
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });
  }

  async getUserProfile(username: string): Promise<GitHubUserStats | null> {
    try {
      const { data } = await this.octokit.rest.users.getByUsername({
        username,
      });

      return {
        username: data.login,
        name: data.name || data.login,
        avatar_url: data.avatar_url,
        public_repos: data.public_repos,
        followers: data.followers,
        following: data.following,
        created_at: data.created_at,
        updated_at: data.updated_at,
        bio: data.bio,
        location: data.location,
        blog: data.blog,
        company: data.company,
      };
    } catch (error) {
      console.error(`Error fetching GitHub profile for ${username}:`, error);
      return null;
    }
  }

  async getUserRepositories(username: string): Promise<GitHubRepoStats[]> {
    try {
      // Fetch all pages of repos for the user
      const data = await this.octokit.paginate(this.octokit.rest.repos.listForUser, {
        username,
        type: 'all',
        sort: 'updated',
        per_page: 100,
      });

      return data.map((repo: any) => ({
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        language: repo.language || null,
        stargazers_count: repo.stargazers_count || 0,
        forks_count: repo.forks_count || 0,
        open_issues_count: repo.open_issues_count || 0,
        created_at: repo.created_at || new Date().toISOString(),
        updated_at: repo.updated_at || new Date().toISOString(),
        pushed_at: repo.pushed_at || new Date().toISOString(),
      }));
    } catch (error) {
      console.error(`Error fetching repositories for ${username}:`, error);
      return [];
    }
  }

  async getUserContributions(username: string): Promise<GitHubContributionStats> {
    try {
      // Get user's repositories
      const repos = await this.getUserRepositories(username);
      
      // Calculate language distribution across ALL repos
      const languages: Record<string, number> = {};
      let totalSize = 0;

      const results = await Promise.allSettled(
        repos.map(async (repo) => {
          try {
            const { data: langData } = await this.octokit.rest.repos.listLanguages({
              owner: username,
              repo: repo.name,
            });
            return langData as Record<string, number>;
          } catch (error: any) {
            console.warn(`Failed to fetch languages for ${username}/${repo.name}:`, error.status, error.message);
            return {} as Record<string, number>;
          }
        })
      );

      for (const r of results) {
        if (r.status === 'fulfilled') {
          for (const [lang, bytes] of Object.entries(r.value)) {
            languages[lang] = (languages[lang] || 0) + (bytes as number);
            totalSize += bytes as number;
          }
        }
      }

      // Convert to percentages
      const languagePercentages: Record<string, number> = {};
      if (totalSize > 0) {
        for (const [lang, bytes] of Object.entries(languages)) {
          languagePercentages[lang] = Math.round(((bytes as number) / totalSize) * 100);
        }
      }

      // Get recent activity (commits, PRs, issues)
      const recentActivity = await this.getRecentActivity(username);

      // Calculate totals from recent activity and repos
      const totalCommits = await this.getTotalCommits(username, repos.slice(0, 10)); // Limit to avoid rate limits
      const totalPRs = await this.getTotalPullRequests(username);
      const totalIssues = await this.getTotalIssues(username);

      return {
        totalCommits,
        totalPRs,
        totalIssues,
        totalReviews: 0, // GitHub API doesn't provide this easily
        languages: languagePercentages,
        recentActivity,
      };
    } catch (error) {
      console.error(`Error fetching contributions for ${username}:`, error);
      return {
        totalCommits: 0,
        totalPRs: 0,
        totalIssues: 0,
        totalReviews: 0,
        languages: {},
        recentActivity: [],
      };
    }
  }

  private async getTotalCommits(username: string, repos: GitHubRepoStats[]): Promise<number> {
    try {
      // Use GitHub's contribution graph API to get the most accurate count
      const response = await fetch(`https://github.com/users/${username}/contributions`);
      
      if (response.ok) {
        const html = await response.text();
        
        // Parse the contribution count from the HTML
        // Look for patterns like "165 contributions in the last year"
        const contributionMatch = html.match(/(\d+)\s+contributions?\s+in\s+the\s+last\s+year/i);
        if (contributionMatch) {
          const totalCommits = parseInt(contributionMatch[1]);
          console.log(`Found ${totalCommits} contributions from GitHub profile for ${username}`);
          return totalCommits;
        }
        
        // Alternative: Look for the total contribution count in the profile
        const totalMatch = html.match(/total\s+contributions?\s*:?\s*(\d+)/i);
        if (totalMatch) {
          const totalCommits = parseInt(totalMatch[1]);
          console.log(`Found ${totalCommits} total contributions from GitHub profile for ${username}`);
          return totalCommits;
        }
      }
    } catch (error: any) {
      console.warn(`Failed to fetch contributions from GitHub profile for ${username}:`, error.message);
    }

    // Fallback: Use the search API
    try {
      const { data } = await this.octokit.rest.search.commits({
        q: `author:${username}`,
        per_page: 100,
      });
      
      const totalCommits = data.total_count;
      console.log(`Found ${totalCommits} total commits via search for ${username}`);
      return totalCommits;
    } catch (error: any) {
      console.warn(`Failed to fetch commits via search for ${username}:`, error.status, error.message);
      return 0;
    }
  }

  private async getTotalPullRequests(username: string): Promise<number> {
    try {
      const query = `
        query($q: String!) {
          search(type: ISSUE, query: $q, first: 1) {
            issueCount
          }
        }
      `;
      const variables = { q: `author:${username} is:pr` };
      const { data } = await this.octokit.request('POST /graphql', { query, variables });
      // Be defensive in case GraphQL returns partial data or errors
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const count = (data as any)?.data?.search?.issueCount ?? (data as any)?.search?.issueCount ?? 0;
      return typeof count === 'number' ? count : 0;
    } catch (error) {
      console.warn(`Failed to fetch PRs for ${username}:`, error);
      return 0;
    }
  }

  private async getTotalIssues(username: string): Promise<number> {
    try {
      const query = `
        query($q: String!) {
          search(type: ISSUE, query: $q, first: 1) {
            issueCount
          }
        }
      `;
      const variables = { q: `author:${username} is:issue` };
      const { data } = await this.octokit.request('POST /graphql', { query, variables });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const count = (data as any)?.data?.search?.issueCount ?? (data as any)?.search?.issueCount ?? 0;
      return typeof count === 'number' ? count : 0;
    } catch (error) {
      console.warn(`Failed to fetch issues for ${username}:`, error);
      return 0;
    }
  }

  private async getRecentActivity(username: string): Promise<Array<{
    type: string;
    repo: string;
    date: string;
    message: string;
  }>> {
    try {
      const { data } = await this.octokit.rest.activity.listPublicEventsForUser({
        username,
        per_page: 50,
      });

      const items: Array<{ type: string; repo: string; date: string; message: string }> = [];

      for (const event of data) {
        const type = event.type || 'unknown';
        const repo = event.repo?.name || 'Unknown';
        const date = event.created_at || new Date().toISOString();

        if (type === 'PushEvent') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const commits = (event as any).payload?.commits || [];
          for (const c of commits) {
            items.push({
              type: 'Commit',
              repo,
              date,
              message: (c.message as string) || 'Pushed commit',
            });
            if (items.length >= 7) break;
          }
        } else if (type === 'PullRequestEvent') {
          items.push({
            type: 'Pull Request',
            repo,
            date,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            message: ((event as any).payload?.pull_request?.title as string) || `${(event as any).payload?.action || 'updated'} PR`,
          });
        } else if (type === 'IssuesEvent') {
          items.push({
            type: 'Issue',
            repo,
            date,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            message: ((event as any).payload?.issue?.title as string) || `${(event as any).payload?.action || 'updated'} issue`,
          });
        } else if (type === 'CreateEvent') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          items.push({ type: 'Create', repo, date, message: `Created ${(event as any).payload?.ref_type || 'resource'}` });
        } else if (type === 'ForkEvent') {
          items.push({ type: 'Fork', repo, date, message: 'Forked repository' });
        } else if (type === 'WatchEvent') {
          items.push({ type: 'Star', repo, date, message: 'Starred repository' });
        }

        if (items.length >= 7) break;
      }

      return items.slice(0, 7);
    } catch (error) {
      return [];
    }
  }

  private getEventMessage(event: any): string {
    switch (event.type) {
      case 'PushEvent':
        const commitCount = event.payload?.commits?.length || 1;
        return `Pushed ${commitCount} commit${commitCount > 1 ? 's' : ''}`;
      case 'PullRequestEvent':
        return `${event.payload?.action || 'opened'} pull request`;
      case 'IssuesEvent':
        return `${event.payload?.action || 'opened'} issue`;
      case 'CreateEvent':
        return `Created ${event.payload?.ref_type || 'repository'}`;
      case 'ForkEvent':
        return 'Forked repository';
      case 'WatchEvent':
        return 'Starred repository';
      default:
        return event.type.replace('Event', '');
    }
  }

  async syncUserStats(userId: string, githubUsername: string) {
    try {
      const profile = await this.getUserProfile(githubUsername);
      const contributions = await this.getUserContributions(githubUsername);

      if (!profile) {
        throw new Error(`GitHub profile not found for ${githubUsername}`);
      }

      // Update user's GitHub stats in database
      const { prisma } = await import('@/lib/prisma');
      
      await prisma.gitHubStats.upsert({
        where: { userId },
        update: {
          commits: contributions.totalCommits,
          pullRequests: contributions.totalPRs,
          issues: contributions.totalIssues,
          repositories: profile.public_repos,
          followers: profile.followers,
          contributions: contributions.totalCommits + contributions.totalPRs + contributions.totalIssues,
          languages: JSON.stringify(contributions.languages),
          lastSynced: new Date(),
        },
        create: {
          userId,
          commits: contributions.totalCommits,
          pullRequests: contributions.totalPRs,
          issues: contributions.totalIssues,
          repositories: profile.public_repos,
          followers: profile.followers,
          contributions: contributions.totalCommits + contributions.totalPRs + contributions.totalIssues,
          languages: JSON.stringify(contributions.languages),
          lastSynced: new Date(),
        },
      });

      // Update user profile with GitHub data
      await prisma.user.update({
        where: { id: userId },
        data: {
          name: profile.name,
          avatar: profile.avatar_url,
          location: profile.location,
          bio: profile.bio,
        },
      });

      return { success: true, profile, contributions };
    } catch (error) {
      console.error('Error syncing GitHub stats:', error);
      throw error;
    }
  }
}

export const githubService = new GitHubService();