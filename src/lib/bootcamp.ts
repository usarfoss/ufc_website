import { githubService } from './github';
import { leetcodeService } from './leetcode';

export interface BootcampProgress {
  type: 'LEETCODE' | 'GITHUB';
  baseline: any;
  current: any;
  delta: any;
  points: number;
}

export class BootcampService {
  /**
   * Capture baseline stats when user registers
   */
  async captureBaseline(userId: string, type: 'LEETCODE' | 'GITHUB', username: string) {
    if (type === 'LEETCODE') {
      const stats = await leetcodeService.getUserStats(username);
      return stats ? {
        totalSolved: stats.totalSolved,
        easySolved: stats.easySolved,
        mediumSolved: stats.mediumSolved,
        hardSolved: stats.hardSolved,
        timestamp: new Date().toISOString()
      } : null;
    } else {
      const stats = await githubService.getUserContributions(username);
      return {
        commits: stats.totalCommits,
        pullRequests: stats.totalPRs,
        issues: stats.totalIssues,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Fetch current stats (reuses existing services)
   */
  async fetchCurrentStats(userId: string, type: 'LEETCODE' | 'GITHUB', username: string) {
    if (type === 'LEETCODE') {
      const stats = await leetcodeService.getUserStats(username);
      return stats ? {
        totalSolved: stats.totalSolved,
        easySolved: stats.easySolved,
        mediumSolved: stats.mediumSolved,
        hardSolved: stats.hardSolved,
        timestamp: new Date().toISOString()
      } : null;
    } else {
      const stats = await githubService.getUserContributions(username);
      return {
        commits: stats.totalCommits,
        pullRequests: stats.totalPRs,
        issues: stats.totalIssues,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Calculate progress (current - baseline)
   */
  calculateProgress(baseline: any, current: any, type: 'LEETCODE' | 'GITHUB'): BootcampProgress {
    if (type === 'LEETCODE') {
      const delta = {
        easyDelta: Math.max(0, (current?.easySolved || 0) - (baseline?.easySolved || 0)),
        mediumDelta: Math.max(0, (current?.mediumSolved || 0) - (baseline?.mediumSolved || 0)),
        hardDelta: Math.max(0, (current?.hardSolved || 0) - (baseline?.hardSolved || 0)),
        totalDelta: Math.max(0, (current?.totalSolved || 0) - (baseline?.totalSolved || 0))
      };

      const points = (delta.easyDelta * 2) + (delta.mediumDelta * 4) + (delta.hardDelta * 6);

      return {
        type: 'LEETCODE',
        baseline,
        current,
        delta,
        points
      };
    } else {
      const delta = {
        commitsDelta: Math.max(0, (current?.commits || 0) - (baseline?.commits || 0)),
        prsDelta: Math.max(0, (current?.pullRequests || 0) - (baseline?.pullRequests || 0)),
        issuesDelta: Math.max(0, (current?.issues || 0) - (baseline?.issues || 0))
      };

      const points = (delta.commitsDelta * 1) + (delta.prsDelta * 5) + (delta.issuesDelta * 2);

      return {
        type: 'GITHUB',
        baseline,
        current,
        delta,
        points
      };
    }
  }

  /**
   * Sync all participants in an active bootcamp
   */
  async syncBootcampParticipants(bootcampId: string) {
    const { prisma } = await import('./prisma');

    const bootcamp = await prisma.bootcamp.findUnique({
      where: { id: bootcampId },
      include: {
        participants: {
          include: {
            user: true
          }
        }
      }
    });

    if (!bootcamp || bootcamp.status !== 'ACTIVE') {
      return { success: false, message: 'Bootcamp not active' };
    }

    const results = [];

    for (const participant of bootcamp.participants) {
      try {
        const username = bootcamp.type === 'LEETCODE' 
          ? participant.user.leetcodeUsername 
          : participant.user.githubUsername;

        if (!username) continue;

        // Fetch current stats using existing services
        const currentStats = await this.fetchCurrentStats(
          participant.userId,
          bootcamp.type,
          username
        );

        if (!currentStats) continue;

        // Calculate progress
        const progress = this.calculateProgress(
          participant.baselineStats,
          currentStats,
          bootcamp.type
        );

        // Update participant
        await prisma.bootcampParticipant.update({
          where: { id: participant.id },
          data: {
            currentStats: currentStats,
            progressStats: progress.delta,
            finalPoints: progress.points
          }
        });

        // Create snapshot
        await prisma.bootcampSnapshot.create({
          data: {
            bootcampId: bootcamp.id,
            participantId: participant.id,
            stats: currentStats,
            points: progress.points
          }
        });

        results.push({ userId: participant.userId, success: true, points: progress.points });
      } catch (error) {
        console.error(`Failed to sync participant ${participant.userId}:`, error);
        results.push({ userId: participant.userId, success: false, error });
      }
    }

    return { success: true, results, synced: results.filter(r => r.success).length };
  }

  /**
   * Check and update bootcamp status based on dates
   */
  async updateBootcampStatuses() {
    const { prisma } = await import('./prisma');
    const now = new Date();

    // Activate upcoming bootcamps
    await prisma.bootcamp.updateMany({
      where: {
        status: 'UPCOMING',
        startDate: { lte: now }
      },
      data: { status: 'ACTIVE' }
    });

    // Complete active bootcamps
    const completedBootcamps = await prisma.bootcamp.findMany({
      where: {
        status: 'ACTIVE',
        endDate: { lte: now }
      },
      include: {
        participants: {
          orderBy: { finalPoints: 'desc' }
        }
      }
    });

    for (const bootcamp of completedBootcamps) {
      // Assign final ranks
      for (let i = 0; i < bootcamp.participants.length; i++) {
        await prisma.bootcampParticipant.update({
          where: { id: bootcamp.participants[i].id },
          data: { finalRank: i + 1 }
        });
      }

      // Mark as completed
      await prisma.bootcamp.update({
        where: { id: bootcamp.id },
        data: { status: 'COMPLETED' }
      });
    }
  }
}

export const bootcampService = new BootcampService();
