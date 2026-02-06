export interface LeetCodeUserStats {
  username: string;
  ranking: number | null;
  reputation: number;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  acceptanceRate: number | null;
}

export interface LeetCodeSubmission {
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timestamp: string;
}

export class LeetCodeService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

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

  async getUserStats(username: string): Promise<LeetCodeUserStats | null> {
    try {
      // Check cache first
      const cacheKey = `leetcode-stats-${username}`;
      const cachedData = this.getCachedData(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      // Try primary API (alfa-leetcode-api)
      try {
        const response = await fetch(`https://alfa-leetcode-api.onrender.com/${username}/solved`, {
          headers: {
            'Accept': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          
          const stats: LeetCodeUserStats = {
            username: username,
            ranking: data.ranking || null,
            reputation: data.reputation || 0,
            totalSolved: data.solvedProblem || 0,
            easySolved: data.easySolved || 0,
            mediumSolved: data.mediumSolved || 0,
            hardSolved: data.hardSolved || 0,
            acceptanceRate: data.acceptanceRate || null,
          };

          // Cache the result
          this.setCachedData(cacheKey, stats);
          return stats;
        }
      } catch (error) {
        console.warn('Primary LeetCode API failed, trying fallback:', error);
      }

      // Fallback: Try LeetCode GraphQL API
      try {
        const graphqlQuery = {
          query: `
            query getUserProfile($username: String!) {
              matchedUser(username: $username) {
                username
                profile {
                  ranking
                  reputation
                }
                submitStats {
                  acSubmissionNum {
                    difficulty
                    count
                  }
                }
              }
            }
          `,
          variables: { username },
        };

        const response = await fetch('https://leetcode.com/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(graphqlQuery),
        });

        if (response.ok) {
          const result = await response.json();
          const userData = result.data?.matchedUser;

          if (!userData) {
            console.error(`LeetCode user '${username}' not found`);
            return null;
          }

          // Parse submission stats
          const submissions = userData.submitStats?.acSubmissionNum || [];
          let easySolved = 0;
          let mediumSolved = 0;
          let hardSolved = 0;

          for (const sub of submissions) {
            if (sub.difficulty === 'Easy') easySolved = sub.count;
            else if (sub.difficulty === 'Medium') mediumSolved = sub.count;
            else if (sub.difficulty === 'Hard') hardSolved = sub.count;
          }

          const stats: LeetCodeUserStats = {
            username: userData.username,
            ranking: userData.profile?.ranking || null,
            reputation: userData.profile?.reputation || 0,
            totalSolved: easySolved + mediumSolved + hardSolved,
            easySolved,
            mediumSolved,
            hardSolved,
            acceptanceRate: null,
          };

          // Cache the result
          this.setCachedData(cacheKey, stats);
          return stats;
        }
      } catch (error) {
        console.error('LeetCode GraphQL API failed:', error);
      }

      return null;
    } catch (error) {
      console.error(`Error fetching LeetCode stats for ${username}:`, error);
      return null;
    }
  }

  async syncUserStats(userId: string, leetcodeUsername: string) {
    try {
      const stats = await this.getUserStats(leetcodeUsername);

      if (!stats) {
        throw new Error(`LeetCode profile not found for ${leetcodeUsername}`);
      }

      // Update user's LeetCode stats in database
      const { prisma } = await import('@/lib/prisma');

      await prisma.leetCodeStats.upsert({
        where: { userId },
        update: {
          leetcodeUsername,
          totalSolved: stats.totalSolved,
          easySolved: stats.easySolved,
          mediumSolved: stats.mediumSolved,
          hardSolved: stats.hardSolved,
          ranking: stats.ranking,
          reputation: stats.reputation,
          acceptanceRate: stats.acceptanceRate,
          lastSynced: new Date(),
        },
        create: {
          userId,
          leetcodeUsername,
          totalSolved: stats.totalSolved,
          easySolved: stats.easySolved,
          mediumSolved: stats.mediumSolved,
          hardSolved: stats.hardSolved,
          ranking: stats.ranking,
          reputation: stats.reputation,
          acceptanceRate: stats.acceptanceRate,
          lastSynced: new Date(),
        },
      });

      return { success: true, stats };
    } catch (error) {
      console.error('Error syncing LeetCode stats:', error);
      throw error;
    }
  }

  calculatePoints(stats: { easySolved: number; mediumSolved: number; hardSolved: number }): number {
    return (stats.easySolved * 2) + (stats.mediumSolved * 4) + (stats.hardSolved * 6);
  }
}

// Lazy-loaded singleton
let _leetcodeService: LeetCodeService | null = null;

export const leetcodeService = {
  getUserStats: async (username: string) => {
    if (!_leetcodeService) _leetcodeService = new LeetCodeService();
    return _leetcodeService.getUserStats(username);
  },
  syncUserStats: async (userId: string, username: string) => {
    if (!_leetcodeService) _leetcodeService = new LeetCodeService();
    return _leetcodeService.syncUserStats(userId, username);
  },
  calculatePoints: (stats: { easySolved: number; mediumSolved: number; hardSolved: number }) => {
    if (!_leetcodeService) _leetcodeService = new LeetCodeService();
    return _leetcodeService.calculatePoints(stats);
  },
};
