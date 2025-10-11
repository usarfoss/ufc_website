import { Octokit } from '@octokit/rest';
import { tokenManager } from './token-load-balancer';

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
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  constructor() {
    // Use primary token for initialization with fallback
    try {
      const primaryToken = tokenManager.getTokenForPurpose('user');
      this.octokit = new Octokit({
        auth: primaryToken,
      });
    } catch (error) {
      console.warn('Load balancer failed, using primary token:', error);
      // Fallback to primary token
      this.octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN,
      });
    }
  }

  /**
   * Get Octokit instance with specific token
   */
  private getOctokitWithToken(purpose: 'user' | 'community' | 'heavy' | 'background' = 'user'): Octokit {
    try {
      const token = tokenManager.getTokenForPurpose(purpose);
      return new Octokit({ auth: token });
    } catch (error) {
      console.warn(`Load balancer failed for ${purpose}, using primary token:`, error);
      // Fallback to primary token
      return new Octokit({ auth: process.env.GITHUB_TOKEN });
    }
  }

  /**
   * Batch fetch activities for multiple users using load balancer
   */
  async getBatchUserActivities(users: Array<{ id: string; name: string | null; githubUsername: string | null; avatar?: string | null }>): Promise<Array<{
    id: string;
    type: string;
    message: string;
    repo: string;
    target: string;
    time: string;
    timestamp: string;
    user: {
      name: string;
      githubUsername?: string;
      avatar?: string;
    };
    metadata: {
      source: string;
      repo: string;
      type: string;
    };
  }>> {
    console.log(`🔄 Processing ${users.length} users with batch processing...`);
    const tokenCount = tokenManager.getTokenCount();
    const batchSize = Math.ceil(users.length / tokenCount);
    
    console.log(`📊 Token count: ${tokenCount}, Batch size: ${batchSize}`);
    
    // Distribute users across tokens
    const userBatches = [];
    for (let i = 0; i < users.length; i += batchSize) {
      userBatches.push(users.slice(i, i + batchSize));
    }
    
    console.log(`📦 Created ${userBatches.length} batches for processing`);

    // Process each batch with different tokens (use all 5 tokens)
    const batchPromises = userBatches.map(async (batch, batchIndex) => {
      const purposes: Array<'user' | 'community' | 'heavy' | 'background'> = ['user', 'community', 'heavy', 'background'];
      const purpose = purposes[batchIndex % purposes.length];
      console.log(`🔄 Processing batch ${batchIndex + 1}/${userBatches.length} with ${batch.length} users using ${purpose} token`);
      const octokit = this.getOctokitWithToken(purpose);
      
      const batchActivities = await Promise.allSettled(
        batch.map(async (user) => {
          if (!user.githubUsername) return [];
          
          try {
            // Use different purposes for different users to distribute load
            const purposes: Array<'user' | 'community' | 'heavy' | 'background'> = ['user', 'community', 'heavy', 'background'];
            const purpose = purposes[batchIndex % purposes.length];
            const githubActivities = await this.getUserContributions(user.githubUsername, purpose);
            const activities = githubActivities.recentActivity.map((activity, index) => ({
              id: `github-${user.id}-${activity.date}-${activity.type}-${activity.repo}-${index}`,
              type: activity.type.toLowerCase(),
              message: activity.message,
              repo: activity.repo,
              target: activity.repo,
              time: this.timeAgo(new Date(activity.date)),
              timestamp: activity.date,
              user: {
                name: user.name || 'Anonymous',
                githubUsername: user.githubUsername || undefined,
                avatar: user.avatar || undefined
              },
              metadata: {
                source: 'github',
                repo: activity.repo,
                type: activity.type
              }
            }));
            
            console.log(`✅ Fetched ${activities.length} activities for user ${user.githubUsername}`);
            return activities;
          } catch (error: any) {
            // Only log non-404 errors to reduce noise
            if (error.status !== 404) {
              console.warn(`Failed to fetch activities for user ${user.githubUsername}:`, error);
            }
            return [];
          }
        })
      );

      return batchActivities.flatMap(result => 
        result.status === 'fulfilled' ? result.value : []
      );
    });

    const batchResults = await Promise.all(batchPromises);
    const allActivities = batchResults.flat();
    console.log(`🎉 Batch processing complete: ${allActivities.length} total activities from ${users.length} users`);
    return allActivities;
  }

  private timeAgo(date: Date | string): string {
    const now = new Date();
    const targetDate = typeof date === 'string' ? new Date(date) : date;
    const diff = Math.floor((now.getTime() - targetDate.getTime()) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)} days ago`;
    return `${Math.floor(diff / 2592000)} months ago`;
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

  async getUserRepositories(username: string, purpose: 'user' | 'community' | 'heavy' | 'background' = 'user'): Promise<GitHubRepoStats[]> {
    try {
      const octokit = this.getOctokitWithToken(purpose);
      const data = await octokit.paginate(octokit.rest.repos.listForUser, {
        username,
        type: 'all', // Fetch all repositories (public and private)
        sort: 'updated',
        per_page: 50, // Reduced from 100 to avoid rate limits
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

  async getUserContributions(username: string, purpose: 'user' | 'community' | 'heavy' | 'background' = 'user'): Promise<GitHubContributionStats> {
    try {
      // Use load balancer to get appropriate token
      const octokit = this.getOctokitWithToken(purpose);
      
      // Test basic GitHub API access first
      try {
        const { data: userData } = await octokit.rest.users.getByUsername({ username });
      } catch (error: any) {
        // Handle 404 (user not found) gracefully
        if (error.status === 404) {
          console.warn(`GitHub user '${username}' not found, skipping...`);
          return {
            totalCommits: 0,
            totalPRs: 0,
            totalIssues: 0,
            totalReviews: 0,
            languages: {},
            recentActivity: []
          };
        }
        // For other errors, still throw
        console.error(`GitHub API error for user '${username}':`, error);
        throw error;
      }

      const repos = await this.getUserRepositories(username, purpose);
      
      let languagePercentages: Record<string, number> = await this.getTopLanguagesFromReadmeStats(username);

      if (Object.keys(languagePercentages).length === 0) {
        const languages: Record<string, number> = {};
        let totalSize = 0;

        // Filter repositories to avoid 404 errors
        const validRepos = repos.filter(repo => 
          repo.name && 
          repo.name.length > 0 && 
          !repo.name.includes(' ') && 
          !repo.name.includes('%20') && // Avoid URL encoded spaces
          repo.name.length < 100 // Avoid extremely long names
        );
        
        const results = await Promise.allSettled(
          validRepos.slice(0, 10).map(async (repo) => { // Limit to first 10 repos to avoid rate limits
            try {
              // Add timeout to prevent hanging requests
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
              
              const { data: langData } = await this.octokit.rest.repos.listLanguages({
                owner: username,
                repo: repo.name,
              });
              
              clearTimeout(timeoutId);
              return langData as Record<string, number>;
            } catch (error: any) {
              // Only log non-404 errors to reduce console spam
              if (error.status !== 404 && error.name !== 'AbortError') {
                console.warn(`Failed to fetch languages for ${username}/${repo.name}:`, error.status, error.message);
              }
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

        const recentActivity = await this.getRecentActivity(username, purpose);

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

         private async getRecentActivity(username: string, purpose: 'user' | 'community' | 'heavy' | 'background' = 'user'): Promise<Array<{
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

             // Calculate date 36 hours ago (1.5 days)
             const thirtySixHoursAgo = new Date();
             thirtySixHoursAgo.setHours(thirtySixHoursAgo.getHours() - 36);
             const thirtySixHoursAgoISO = thirtySixHoursAgo.toISOString();

             const octokit = this.getOctokitWithToken(purpose);
             const { data } = await octokit.rest.activity.listPublicEventsForUser({
               username,
               per_page: 50, // Reduced from 100 to 50 for faster loading
             });

      const items: Array<{ type: string; repo: string; date: string; message: string }> = [];
      let totalEvents = 0;
      let filteredEvents = 0;

      for (const event of data) {
        totalEvents++;
        const type = event.type || 'unknown';
        const repo = event.repo?.name || 'Unknown';
        const date = event.created_at || new Date().toISOString();

        // Only include events from the last 36 hours
             const eventDate = new Date(date);
             const cutoffDate = new Date(thirtySixHoursAgoISO);

             if (eventDate < cutoffDate) {
               filteredEvents++;
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
              
              console.log(`🔍 Fetching commit details for ${repo} (${headSha})`);
              
              // Fetch the commit details to get the actual commit message
              const { data: commitData } = await this.octokit.rest.repos.getCommit({
                owner: owner,
                repo: repoName,
                ref: headSha,
              });
              
              const commitMessage = commitData.commit.message.split('\n')[0]?.trim() || 'Pushed commit';
              console.log(`✅ Got commit message: "${commitMessage}"`);
              
              const activity = {
                type: 'Commit',
                repo,
                date,
                message: `${commitMessage} in ${repo}`,
              };
              items.push(activity);
            } catch (commitError) {
              console.warn(`⚠️ Failed to fetch commit details for ${repo}:`, commitError);
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
            console.log(`📝 Using payload commits for ${repo}:`, pushPayload.commits.length);
            for (const commit of pushPayload.commits) {
              const commitMessage = commit.message?.split('\n')[0]?.trim() || 'Pushed commit';
              console.log(`✅ Payload commit message: "${commitMessage}"`);
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
            console.log(`⚠️ Using fallback message for ${repo} - no commit details available`);
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

             // Sort by date (most recent first) and return up to 30 activities from last 36 hours
             const result = items
               .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
               .slice(0, 30);
      
      console.log(`📊 User ${username}: ${totalEvents} total events, ${filteredEvents} filtered out (older than 36h), ${result.length} activities returned`);
      
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

// Lazy-loaded singleton to avoid client-side instantiation
let _githubService: GitHubService | null = null;

export const githubService = {
  getUserProfile: async (username: string) => {
    if (!_githubService) _githubService = new GitHubService();
    return _githubService.getUserProfile(username);
  },
  getUserRepositories: async (username: string) => {
    if (!_githubService) _githubService = new GitHubService();
    return _githubService.getUserRepositories(username);
  },
  getUserContributions: async (username: string) => {
    if (!_githubService) _githubService = new GitHubService();
    return _githubService.getUserContributions(username);
  },
  getRecentActivity: async (username: string) => {
    if (!_githubService) _githubService = new GitHubService();
    return _githubService.getUserContributions(username);
  },
  getBatchUserActivities: async (users: any[]) => {
    if (!_githubService) _githubService = new GitHubService();
    return _githubService.getBatchUserActivities(users);
  },
  syncUserStats: async (userId: string, username: string) => {
    if (!_githubService) _githubService = new GitHubService();
    return _githubService.syncUserStats(userId, username);
  },
};