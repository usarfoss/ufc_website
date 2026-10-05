import "server-only";

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
  difficulty: "Easy" | "Medium" | "Hard";
  timestamp: string;
}

export class LeetCodeService {
  /** `fast` skips the community API (which sleeps when idle and can take seconds to answer) and asks LeetCode directly. The live poll uses it. */
  async getUserStats(username: string, options: { fast?: boolean } = {}): Promise<LeetCodeUserStats | null> {
    try {
      // Try primary API (alfa-leetcode-api)
      try {
        if (options.fast) throw new Error("skipped: fast path");
        const response = await fetch(`https://alfa-leetcode-api.onrender.com/${username}/solved`, {
          headers: {
            Accept: "application/json",
          },
          // That service sleeps when idle and can take a minute to wake. Give up quickly and use LeetCode's own API instead.
          signal: AbortSignal.timeout(6_000),
        });

        if (response.ok) {
          const data = await response.json();

          // For a name that does not exist this service still answers 200, with an error instead of numbers. Only trust real numbers.
          if (typeof data.solvedProblem !== "number" || data.errors) {
            throw new Error("The primary LeetCode API returned no stats for that user");
          }

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

          return stats;
        }
      } catch (error) {
        if (!options.fast) console.warn("Primary LeetCode API failed, trying fallback:", error);
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

        const response = await fetch("https://leetcode.com/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(graphqlQuery),
          signal: AbortSignal.timeout(8_000),
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
            if (sub.difficulty === "Easy") easySolved = sub.count;
            else if (sub.difficulty === "Medium") mediumSolved = sub.count;
            else if (sub.difficulty === "Hard") hardSolved = sub.count;
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

          return stats;
        }
      } catch (error) {
        console.error("LeetCode GraphQL API failed:", error);
      }

      return null;
    } catch (error) {
      console.error(`Error fetching LeetCode stats for ${username}:`, error);
      return null;
    }
  }

  /** Writes numbers we already have to the database. */
  async saveStats(userId: string, leetcodeUsername: string, stats: LeetCodeUserStats) {
    const { prisma } = await import("@/server/db/prisma");
    const data = {
      leetcodeUsername,
      totalSolved: stats.totalSolved,
      easySolved: stats.easySolved,
      mediumSolved: stats.mediumSolved,
      hardSolved: stats.hardSolved,
      ranking: stats.ranking,
      reputation: stats.reputation,
      acceptanceRate: stats.acceptanceRate,
      lastSynced: new Date(),
    };
    await prisma.leetCodeStats.upsert({ where: { userId }, update: data, create: { userId, ...data } });
  }

  /** Fetches the numbers from LeetCode and stores them. */
  async syncUserStats(userId: string, leetcodeUsername: string) {
    const stats = await this.getUserStats(leetcodeUsername);

    if (!stats) {
      throw new Error(`LeetCode profile not found for ${leetcodeUsername}`);
    }

    await this.saveStats(userId, leetcodeUsername, stats);
    return { success: true, stats };
  }

  calculatePoints(stats: { easySolved: number; mediumSolved: number; hardSolved: number }): number {
    return stats.easySolved * 2 + stats.mediumSolved * 4 + stats.hardSolved * 6;
  }
}

// Lazy-loaded singleton
let _leetcodeService: LeetCodeService | null = null;

export const leetcodeService = {
  getUserStats: async (username: string, options?: { fast?: boolean }) => {
    if (!_leetcodeService) _leetcodeService = new LeetCodeService();
    return _leetcodeService.getUserStats(username, options);
  },
  syncUserStats: async (userId: string, username: string) => {
    if (!_leetcodeService) _leetcodeService = new LeetCodeService();
    return _leetcodeService.syncUserStats(userId, username);
  },
  saveStats: async (userId: string, username: string, stats: LeetCodeUserStats) => {
    if (!_leetcodeService) _leetcodeService = new LeetCodeService();
    return _leetcodeService.saveStats(userId, username, stats);
  },
  calculatePoints: (stats: { easySolved: number; mediumSolved: number; hardSolved: number }) => {
    if (!_leetcodeService) _leetcodeService = new LeetCodeService();
    return _leetcodeService.calculatePoints(stats);
  },
};
