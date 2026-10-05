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

  /**
   * Writes numbers we already have to the database, but only if they differ from what is stored. The solved counts are what people see and what
   * the leaderboard uses, so those decide. Ranking and reputation drift on their own and differ a little between the two sources we read, so
   * they are saved along with a real change and never cause a write by themselves.
   *
   * When the counts went up for a member we already knew, a line is added to the activity feed for each difficulty that rose ("Solved 2 Medium
   * problems on LeetCode"). LeetCode only gives totals, so that is all it can say: how many, and when we noticed. A first link adds nothing, so
   * nobody's whole history lands in the feed, and a count that went down adds nothing either.
   */
  async saveStats(userId: string, leetcodeUsername: string, stats: LeetCodeUserStats) {
    const { prisma } = await import("@/server/db/prisma");
    const stored = await prisma.leetCodeStats.findUnique({ where: { userId } });
    if (
      stored &&
      stored.leetcodeUsername === leetcodeUsername &&
      stored.totalSolved === stats.totalSolved &&
      stored.easySolved === stats.easySolved &&
      stored.mediumSolved === stats.mediumSolved &&
      stored.hardSolved === stats.hardSolved
    ) {
      return { changed: false, activityAdded: false };
    }

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

    // Only for the same account as before: a different username is a different history, not new solves.
    const rises =
      stored && stored.leetcodeUsername === leetcodeUsername
        ? (
            [
              { type: "LEETCODE_EASY", label: "Easy", before: stored.easySolved, after: stats.easySolved },
              { type: "LEETCODE_MEDIUM", label: "Medium", before: stored.mediumSolved, after: stats.mediumSolved },
              { type: "LEETCODE_HARD", label: "Hard", before: stored.hardSolved, after: stats.hardSolved },
            ] as const
          ).filter((r) => r.after > r.before)
        : [];
    const now = new Date();

    await prisma.$transaction(async (tx) => {
      await tx.leetCodeStats.upsert({ where: { userId }, update: data, create: { userId, ...data } });
      if (rises.length) {
        await tx.activity.createMany({
          data: rises.map((r) => ({
            type: r.type,
            userId,
            description: `Solved ${r.after - r.before} ${r.label} problem${r.after - r.before === 1 ? "" : "s"} on LeetCode`,
            // One line per new total, so noticing the same rise twice can never add it twice.
            sourceKey: `leetcode:${userId}:${r.label.toLowerCase()}:${r.after}`,
            metadata: { source: "leetcode", difficulty: r.label, solved: r.after - r.before, total: r.after },
            createdAt: now,
          })),
          skipDuplicates: true,
        });
      }
    });
    return { changed: true, activityAdded: rises.length > 0 };
  }

  /** Fetches the numbers from LeetCode and stores them. */
  async syncUserStats(userId: string, leetcodeUsername: string) {
    const stats = await this.getUserStats(leetcodeUsername);

    if (!stats) {
      throw new Error(`LeetCode profile not found for ${leetcodeUsername}`);
    }

    const { changed, activityAdded } = await this.saveStats(userId, leetcodeUsername, stats);
    return { success: true, stats, changed, activityAdded };
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
