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
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });
  }

  private getCachedData(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  private setCachedData(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
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
      // Test basic GitHub API access first
      try {
        const { data: userData } = await this.octokit.rest.users.getByUsername({ username });
      } catch (error) {
        console.error(`GitHub user not found or API error:`, error);
        throw error;
      }

      const repos = await this.getUserRepositories(username);
      
      let languagePercentages: Record<string, number> = await this.getTopLanguagesFromReadmeStats(username);

      if (Object.keys(languagePercentages).length === 0) {
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

        if (totalSize > 0) {
          const tmp: Record<string, number> = {};
          for (const [lang, bytes] of Object.entries(languages)) {
            tmp[lang] = Math.round(((bytes as number) / totalSize) * 100);
          }
          languagePercentages = tmp;
        }
      }

        const recentActivity = await this.getRecentActivity(username);

      const totalCommits = await this.getTotalCommits(username, repos.slice(0, 10)); // Limit to avoid rate limits
      const totalPRs = await this.getTotalPullRequests(username);
      const totalIssues = await this.getTotalIssues(username);


      return {
        totalCommits,
        totalPRs,
        totalIssues,
        totalReviews: 0,
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

  private async getTopLanguagesFromReadmeStats(username: string): Promise<Record<string, number>> {
    try {
      const url = `https://github-readme-stats.vercel.app/api/top-langs/?username=${encodeURIComponent(username)}&theme=dark&hide_border=false&include_all_commits=false&count_private=false&layout=compact`;
      const res = await fetch(url, { next: { revalidate: 300 } });
      if (!res.ok) return {};
      const svg = await res.text();

      const matches = svg.matchAll(/([A-Za-z0-9+#._-]+)\s+(\d+(?:\.\d+)?)%/g);
      const parsed: Record<string, number> = {};
      for (const m of matches) {
        const lang = m[1];
        const pct = Number.parseFloat(m[2]);
        if (lang && Number.isFinite(pct) && pct > 0 && pct <= 100 && lang.length < 50) {
          parsed[lang] = Math.round(pct);
        }
      }
      return parsed;
    } catch {
      return {};
    }
  }

  private async getTotalCommits(username: string, repos: GitHubRepoStats[]): Promise<number> {
    try {
      const response = await fetch(`https://github.com/users/${username}/contributions`);
      
      if (response.ok) {
        const html = await response.text();
        
        const contributionMatch = html.match(/(\d+)\s+contributions?\s+in\s+the\s+last\s+year/i);
        if (contributionMatch) {
          const totalCommits = parseInt(contributionMatch[1]);
          return totalCommits;
        }
        
        const totalMatch = html.match(/total\s+contributions?\s*:?\s*(\d+)/i);
        if (totalMatch) {
          const totalCommits = parseInt(totalMatch[1]);
          return totalCommits;
        }
      }
    } catch (error: any) {
      console.warn(`Failed to fetch contributions from GitHub profile for ${username}:`, error.message);
    }

    try {
      const { data } = await this.octokit.rest.search.commits({
        q: `author:${username}`,
        per_page: 100,
      });
      
      const totalCommits = data.total_count;
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
      const root = data as unknown as { data?: { search?: { issueCount?: number } }; search?: { issueCount?: number } };
      const count = typeof root.data?.search?.issueCount === 'number'
        ? root.data.search.issueCount
        : (typeof root.search?.issueCount === 'number' ? root.search.issueCount : 0);
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
      const root = data as unknown as { data?: { search?: { issueCount?: number } }; search?: { issueCount?: number } };
      const count = typeof root.data?.search?.issueCount === 'number'
        ? root.data.search.issueCount
        : (typeof root.search?.issueCount === 'number' ? root.search.issueCount : 0);
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
      // Check cache first
      const cacheKey = `recent-activity-${username}`;
      const cachedData = this.getCachedData(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      // Calculate date 7 days ago
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const sevenDaysAgoISO = sevenDaysAgo.toISOString();

      const { data } = await this.octokit.rest.activity.listPublicEventsForUser({
        username,
        per_page: 50, // Reduced from 100 to 50 for faster loading
      });

      const items: Array<{ type: string; repo: string; date: string; message: string }> = [];

      for (const event of data) {
        const type = event.type || 'unknown';
        const repo = event.repo?.name || 'Unknown';
        const date = event.created_at || new Date().toISOString();

        // Only include events from the last 7 days
        const eventDate = new Date(date);
        const cutoffDate = new Date(sevenDaysAgoISO);
        
        if (eventDate < cutoffDate) {
          continue;
        }

        if (type === 'PushEvent') {
          const pushPayload = (event as unknown as { 
            payload?: { 
              size?: number, 
              commits?: Array<{ message?: string, sha?: string }>,
              head?: string,
              ref?: string
            } 
          }).payload;
          
          const commitCount = pushPayload?.size || 1;
          const headSha = pushPayload?.head;
          const ref = pushPayload?.ref;
          
          // Try to get actual commit messages by fetching commit details
          if (headSha && ref) {
            try {
              // Extract owner and repo from the repo name (e.g., "usarfoss/ufc_website")
              const [owner, repoName] = repo.split('/');
              
              // Fetch the commit details to get the actual commit message
              const { data: commitData } = await this.octokit.rest.repos.getCommit({
                owner: owner,
                repo: repoName,
                ref: headSha,
              });
              
              const commitMessage = commitData.commit.message.split('\n')[0]?.trim() || 'Pushed commit';
              const activity = {
                type: 'Commit',
                repo,
                date,
                message: `${commitMessage} in ${repo}`,
              };
              items.push(activity);
            } catch (commitError) {
              // Fallback if fetching individual commit fails (e.g., private repo, rate limit)
              const activity = {
                type: 'Commit',
                repo,
                date,
                message: `Pushed ${commitCount} commit${commitCount > 1 ? 's' : ''} to ${repo}`,
              };
              items.push(activity);
            }
          } else if (pushPayload?.commits && pushPayload.commits.length > 0) {
            // If we have commit data in the payload, use it
            for (const commit of pushPayload.commits) {
              const commitMessage = commit.message?.split('\n')[0]?.trim() || 'Pushed commit';
              const activity = {
                type: 'Commit',
                repo,
                date,
                message: `${commitMessage} in ${repo}`,
              };
              items.push(activity);
            }
          } else {
            // Final fallback to generic message
            const activity = {
              type: 'Commit',
              repo,
              date,
              message: `Pushed ${commitCount} commit${commitCount > 1 ? 's' : ''} to ${repo}`,
            };
            items.push(activity);
          }
        } else if (type === 'PullRequestEvent') {
          const prPayload = (event as unknown as { payload?: { pull_request?: { title?: string }, action?: string } }).payload;
          const action = prPayload?.action || 'updated';
          const title = prPayload?.pull_request?.title;
          
          const activity = {
            type: 'Pull Request',
            repo,
            date,
            message: title ? `${action} PR: ${title}` : `${action} pull request in ${repo}`,
          };
          items.push(activity);
        } else if (type === 'IssuesEvent') {
          const issuePayload = (event as unknown as { payload?: { issue?: { title?: string }, action?: string } }).payload;
          const action = issuePayload?.action || 'updated';
          const title = issuePayload?.issue?.title;
          
          const activity = {
            type: 'Issue',
            repo,
            date,
            message: title ? `${action} issue: ${title}` : `${action} issue in ${repo}`,
          };
          items.push(activity);
        } else if (type === 'CreateEvent') {
          const createPayload = (event as unknown as { payload?: { ref_type?: string } }).payload;
          const refType = createPayload?.ref_type || 'resource';
          
          const activity = {
            type: 'Create',
            repo,
            date,
            message: `Created ${refType} in ${repo}`,
          };
          items.push(activity);
        } else if (type === 'ForkEvent') {
          const activity = { 
            type: 'Fork', 
            repo, 
            date, 
            message: `Forked ${repo}` 
          };
          items.push(activity);
        } else if (type === 'WatchEvent') {
          const activity = { 
            type: 'Star', 
            repo, 
            date, 
            message: `Starred ${repo}` 
          };
          items.push(activity);
        }
      }

      // Sort by date (most recent first) and return up to 20 activities from last 7 days
      const result = items
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 20);
      
      // Cache the result
      this.setCachedData(cacheKey, result);
        
      return result;
    } catch (error) {
      console.error('Error fetching recent activity:', error);
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

      // Update user profile with GitHub data (preserve user's signup name)
      await prisma.user.update({
        where: { id: userId },
        data: {
          // Don't update name - keep the user's signup name
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