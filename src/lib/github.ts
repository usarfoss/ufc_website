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
      const { data } = await this.octokit.rest.repos.listForUser({
        username,
        type: 'all',
        sort: 'updated',
        per_page: 100,
      });

      return data.map(repo => ({
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
      
      // Calculate language distribution
      const languages: Record<string, number> = {};
      let totalSize = 0;

      for (const repo of repos) {
        if (repo.language) {
          try {
            const { data: langData } = await this.octokit.rest.repos.listLanguages({
              owner: username,
              repo: repo.name,
            });

            for (const [lang, bytes] of Object.entries(langData)) {
              languages[lang] = (languages[lang] || 0) + bytes;
              totalSize += bytes;
            }
          } catch (error) {
            // Skip if we can't access language data
            continue;
          }
        }
      }

      // Convert to percentages
      const languagePercentages: Record<string, number> = {};
      for (const [lang, bytes] of Object.entries(languages)) {
        languagePercentages[lang] = Math.round((bytes / totalSize) * 100);
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
    let totalCommits = 0;
    
    for (const repo of repos.slice(0, 5)) { // Limit to avoid rate limits
      try {
        const { data } = await this.octokit.rest.repos.listCommits({
          owner: username,
          repo: repo.name,
          author: username,
          per_page: 100,
        });
        totalCommits += data.length;
      } catch (error) {
        // Skip if we can't access commits
        continue;
      }
    }

    return totalCommits;
  }

  private async getTotalPullRequests(username: string): Promise<number> {
    try {
      const { data } = await this.octokit.rest.search.issuesAndPullRequests({
        q: `author:${username} type:pr`,
        per_page: 100,
      });
      return data.total_count;
    } catch (error) {
      return 0;
    }
  }

  private async getTotalIssues(username: string): Promise<number> {
    try {
      const { data } = await this.octokit.rest.search.issuesAndPullRequests({
        q: `author:${username} type:issue`,
        per_page: 100,
      });
      return data.total_count;
    } catch (error) {
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
        per_page: 30,
      });

      return data.slice(0, 10).map(event => ({
        type: event.type || 'unknown',
        repo: event.repo?.name || 'Unknown',
        date: event.created_at || new Date().toISOString(),
        message: this.getEventMessage(event),
      }));
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