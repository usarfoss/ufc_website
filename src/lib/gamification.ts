import { prisma } from './prisma';

export interface LevelInfo {
  level: number;
  experience: number;
  experienceToNext: number;
  totalExperienceForLevel: number;
}

export class GamificationService {
  // Experience points for different actions
  private static readonly XP_VALUES = {
    COMMIT: 10,
    PULL_REQUEST: 25,
    ISSUE: 15,
    PROJECT_CREATE: 50,
    EVENT_JOIN: 20,
    EVENT_CREATE: 40,
    DAILY_STREAK: 5,
    ACHIEVEMENT_UNLOCK: 100,
  };

  // Level calculation: exponential growth
  static calculateLevel(experience: number): LevelInfo {
    const baseXP = 100;
    const multiplier = 1.5;
    
    let level = 1;
    let totalXPForCurrentLevel = 0;
    let xpForNextLevel = baseXP;

    while (experience >= totalXPForCurrentLevel + xpForNextLevel) {
      totalXPForCurrentLevel += xpForNextLevel;
      level++;
      xpForNextLevel = Math.floor(baseXP * Math.pow(multiplier, level - 1));
    }

    const experienceToNext = (totalXPForCurrentLevel + xpForNextLevel) - experience;

    return {
      level,
      experience,
      experienceToNext,
      totalExperienceForLevel: totalXPForCurrentLevel,
    };
  }

  static async awardExperience(userId: string, action: keyof typeof GamificationService.XP_VALUES, amount?: number): Promise<LevelInfo> {
    const xpGained = amount || this.XP_VALUES[action];
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { experience: true, level: true }
    });

    if (!user) throw new Error('User not found');

    const newExperience = user.experience + xpGained;
    const levelInfo = this.calculateLevel(newExperience);

    // Check if user leveled up
    const leveledUp = levelInfo.level > user.level;

    // Update user
    await prisma.user.update({
      where: { id: userId },
      data: {
        experience: newExperience,
        level: levelInfo.level,
      },
    });

    // Create activity record
    await prisma.activity.create({
      data: {
        type: 'ACHIEVEMENT',
        userId,
        description: `Gained ${xpGained} XP from ${action.toLowerCase().replace('_', ' ')}`,
        metadata: JSON.stringify({
          xpGained,
          action,
          newLevel: levelInfo.level,
          leveledUp,
        }),
      },
    });

    // If leveled up, create notification
    if (leveledUp) {
      await prisma.notification.create({
        data: {
          userId,
          type: 'LEVEL_UP',
          title: 'Level Up!',
          message: `Congratulations! You've reached level ${levelInfo.level}!`,
          data: JSON.stringify({ newLevel: levelInfo.level, xpGained }),
        },
      });

      // Check for level-based achievements
      await this.checkLevelAchievements(userId, levelInfo.level);
    }

    return levelInfo;
  }

  static async updateStreak(userId: string): Promise<number> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { streak: true, lastStreakDate: true }
    });

    if (!user) throw new Error('User not found');

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastStreakDate = user.lastStreakDate ? new Date(user.lastStreakDate) : null;
    lastStreakDate?.setHours(0, 0, 0, 0);

    let newStreak = user.streak;

    if (!lastStreakDate) {
      // First streak day
      newStreak = 1;
    } else {
      const daysDiff = Math.floor((today.getTime() - lastStreakDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        // Consecutive day
        newStreak = user.streak + 1;
      } else if (daysDiff > 1) {
        // Streak broken
        newStreak = 1;
      }
      // If daysDiff === 0, same day, no change
    }

    if (newStreak !== user.streak) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          streak: newStreak,
          lastStreakDate: today,
        },
      });

      // Award streak XP
      if (newStreak > user.streak) {
        await this.awardExperience(userId, 'DAILY_STREAK');
      }

      // Check streak achievements
      await this.checkStreakAchievements(userId, newStreak);
    }

    return newStreak;
  }

  static async checkAchievements(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        githubStats: true,
        achievements: {
          include: { achievement: true }
        },
        projects: true,
        events: true,
      },
    });

    if (!user) return;

    const unlockedAchievements = user.achievements.map(ua => ua.achievement.name);
    const achievements = await prisma.achievement.findMany();

    for (const achievement of achievements) {
      if (unlockedAchievements.includes(achievement.name)) continue;

      const requirement = achievement.requirement as any;
      let unlocked = false;

      switch (achievement.category) {
        case 'COMMITS':
          unlocked = (user.githubStats?.commits || 0) >= requirement.count;
          break;
        case 'PULL_REQUESTS':
          unlocked = (user.githubStats?.pullRequests || 0) >= requirement.count;
          break;
        case 'ISSUES':
          unlocked = (user.githubStats?.issues || 0) >= requirement.count;
          break;
        case 'PROJECTS':
          unlocked = user.projects.length >= requirement.count;
          break;
        case 'EVENTS':
          unlocked = user.events.length >= requirement.count;
          break;
        case 'STREAK':
          unlocked = user.streak >= requirement.days;
          break;
      }

      if (unlocked) {
        await this.unlockAchievement(userId, achievement.id);
      }
    }
  }

  private static async unlockAchievement(userId: string, achievementId: string): Promise<void> {
    const achievement = await prisma.achievement.findUnique({
      where: { id: achievementId }
    });

    if (!achievement) return;

    // Create user achievement
    await prisma.userAchievement.create({
      data: {
        userId,
        achievementId,
      },
    });

    // Award XP
    await this.awardExperience(userId, 'ACHIEVEMENT_UNLOCK', achievement.points);

    // Create notification
    await prisma.notification.create({
      data: {
        userId,
        type: 'ACHIEVEMENT',
        title: 'Achievement Unlocked!',
        message: `You've unlocked "${achievement.name}"!`,
        data: JSON.stringify({
          achievementId,
          achievementName: achievement.name,
          points: achievement.points,
        }),
      },
    });
  }

  private static async checkLevelAchievements(userId: string, level: number): Promise<void> {
    const levelMilestones = [5, 10, 25, 50, 100];
    
    for (const milestone of levelMilestones) {
      if (level >= milestone) {
        const achievementName = `Level ${milestone} Master`;
        
        const existingAchievement = await prisma.userAchievement.findFirst({
          where: {
            userId,
            achievement: { name: achievementName }
          }
        });

        if (!existingAchievement) {
          // Create achievement if it doesn't exist
          const achievement = await prisma.achievement.upsert({
            where: { name: achievementName },
            update: {},
            create: {
              name: achievementName,
              description: `Reached level ${milestone}`,
              icon: '🏆',
              category: 'SPECIAL',
              points: milestone * 10,
              requirement: JSON.stringify({ level: milestone }),
            },
          });

          await this.unlockAchievement(userId, achievement.id);
        }
      }
    }
  }

  private static async checkStreakAchievements(userId: string, streak: number): Promise<void> {
    const streakMilestones = [7, 30, 100, 365];
    
    for (const milestone of streakMilestones) {
      if (streak >= milestone) {
        const achievementName = `${milestone} Day Streak`;
        
        const existingAchievement = await prisma.userAchievement.findFirst({
          where: {
            userId,
            achievement: { name: achievementName }
          }
        });

        if (!existingAchievement) {
          const achievement = await prisma.achievement.upsert({
            where: { name: achievementName },
            update: {},
            create: {
              name: achievementName,
              description: `Maintained a ${milestone} day contribution streak`,
              icon: '🔥',
              category: 'STREAK',
              points: milestone * 2,
              requirement: JSON.stringify({ days: milestone }),
            },
          });

          await this.unlockAchievement(userId, achievement.id);
        }
      }
    }
  }

  static async updateLeaderboards(): Promise<void> {
    const periods = ['daily', 'weekly', 'monthly', 'all-time'];
    const types = ['COMMITS', 'PULL_REQUESTS', 'ISSUES', 'CONTRIBUTIONS', 'EXPERIENCE', 'STREAK'];

    for (const period of periods) {
      for (const type of types) {
        let users;
        
        switch (type) {
          case 'COMMITS':
            users = await prisma.user.findMany({
              include: { githubStats: true },
              orderBy: { githubStats: { commits: 'desc' } },
              take: 100,
            });
            break;
          case 'PULL_REQUESTS':
            users = await prisma.user.findMany({
              include: { githubStats: true },
              orderBy: { githubStats: { pullRequests: 'desc' } },
              take: 100,
            });
            break;
          case 'ISSUES':
            users = await prisma.user.findMany({
              include: { githubStats: true },
              orderBy: { githubStats: { issues: 'desc' } },
              take: 100,
            });
            break;
          case 'CONTRIBUTIONS':
            users = await prisma.user.findMany({
              include: { githubStats: true },
              orderBy: { githubStats: { contributions: 'desc' } },
              take: 100,
            });
            break;
          case 'EXPERIENCE':
            users = await prisma.user.findMany({
              orderBy: { experience: 'desc' },
              take: 100,
            });
            break;
          case 'STREAK':
            users = await prisma.user.findMany({
              orderBy: { streak: 'desc' },
              take: 100,
            });
            break;
          default:
            continue;
        }

        const leaderboardData = users.map((user, index) => ({
          rank: index + 1,
          userId: user.id,
          name: user.name,
          githubUsername: user.githubUsername,
          avatar: user.avatar,
          value: this.getLeaderboardValue(user, type),
        }));

        await prisma.leaderboard.upsert({
          where: {
            type_period: {
              type: type as any,
              period,
            },
          },
          update: {
            data: JSON.stringify(leaderboardData),
          },
          create: {
            type: type as any,
            period,
            data: JSON.stringify(leaderboardData),
          },
        });
      }
    }
  }

  private static getLeaderboardValue(user: any, type: string): number {
    switch (type) {
      case 'COMMITS':
        return user.githubStats?.commits || 0;
      case 'PULL_REQUESTS':
        return user.githubStats?.pullRequests || 0;
      case 'ISSUES':
        return user.githubStats?.issues || 0;
      case 'CONTRIBUTIONS':
        return user.githubStats?.contributions || 0;
      case 'EXPERIENCE':
        return user.experience || 0;
      case 'STREAK':
        return user.streak || 0;
      default:
        return 0;
    }
  }
}

export const gamificationService = GamificationService;