import { PrismaClient, AchievementCategory, BadgeRarity } from '@prisma/client';

const prisma = new PrismaClient();

async function seedGamification() {
  console.log('🎮 Seeding gamification data...');

  // Create achievements
  const achievements = [
    // Commit achievements
    {
      name: 'First Steps',
      description: 'Make your first commit',
      icon: '🚀',
      category: AchievementCategory.COMMITS,
      points: 50,
      requirement: { count: 1 },
    },
    {
      name: 'Getting Started',
      description: 'Make 10 commits',
      icon: '💪',
      category: AchievementCategory.COMMITS,
      points: 100,
      requirement: { count: 10 },
    },
    {
      name: 'Commit Champion',
      description: 'Make 100 commits',
      icon: '🏆',
      category: AchievementCategory.COMMITS,
      points: 500,
      requirement: { count: 100 },
    },
    {
      name: 'Code Machine',
      description: 'Make 500 commits',
      icon: '🤖',
      category: AchievementCategory.COMMITS,
      points: 1000,
      requirement: { count: 500 },
    },
    {
      name: 'Commit Legend',
      description: 'Make 1000 commits',
      icon: '⚡',
      category: AchievementCategory.COMMITS,
      points: 2000,
      requirement: { count: 1000 },
    },

    // Pull Request achievements
    {
      name: 'Collaborator',
      description: 'Create your first pull request',
      icon: '🤝',
      category: AchievementCategory.PULL_REQUESTS,
      points: 75,
      requirement: { count: 1 },
    },
    {
      name: 'Team Player',
      description: 'Create 10 pull requests',
      icon: '👥',
      category: AchievementCategory.PULL_REQUESTS,
      points: 200,
      requirement: { count: 10 },
    },
    {
      name: 'PR Master',
      description: 'Create 50 pull requests',
      icon: '🎯',
      category: AchievementCategory.PULL_REQUESTS,
      points: 750,
      requirement: { count: 50 },
    },
    {
      name: 'Merge Wizard',
      description: 'Create 100 pull requests',
      icon: '🧙‍♂️',
      category: AchievementCategory.PULL_REQUESTS,
      points: 1500,
      requirement: { count: 100 },
    },

    // Issue achievements
    {
      name: 'Problem Solver',
      description: 'Close your first issue',
      icon: '🔧',
      category: AchievementCategory.ISSUES,
      points: 60,
      requirement: { count: 1 },
    },
    {
      name: 'Bug Hunter',
      description: 'Close 10 issues',
      icon: '🐛',
      category: AchievementCategory.ISSUES,
      points: 150,
      requirement: { count: 10 },
    },
    {
      name: 'Issue Terminator',
      description: 'Close 50 issues',
      icon: '🎯',
      category: AchievementCategory.ISSUES,
      points: 600,
      requirement: { count: 50 },
    },

    // Project achievements
    {
      name: 'Project Starter',
      description: 'Join your first project',
      icon: '🌟',
      category: AchievementCategory.PROJECTS,
      points: 100,
      requirement: { count: 1 },
    },
    {
      name: 'Multi-Tasker',
      description: 'Join 3 projects',
      icon: '🎪',
      category: AchievementCategory.PROJECTS,
      points: 250,
      requirement: { count: 3 },
    },
    {
      name: 'Project Juggler',
      description: 'Join 5 projects',
      icon: '🤹',
      category: AchievementCategory.PROJECTS,
      points: 500,
      requirement: { count: 5 },
    },

    // Event achievements
    {
      name: 'Event Attendee',
      description: 'Attend your first event',
      icon: '🎉',
      category: AchievementCategory.EVENTS,
      points: 80,
      requirement: { count: 1 },
    },
    {
      name: 'Regular Attendee',
      description: 'Attend 5 events',
      icon: '📅',
      category: AchievementCategory.EVENTS,
      points: 200,
      requirement: { count: 5 },
    },
    {
      name: 'Event Enthusiast',
      description: 'Attend 10 events',
      icon: '🎊',
      category: AchievementCategory.EVENTS,
      points: 400,
      requirement: { count: 10 },
    },

    // Streak achievements
    {
      name: 'Week Warrior',
      description: 'Maintain a 7-day streak',
      icon: '🔥',
      category: AchievementCategory.STREAK,
      points: 200,
      requirement: { days: 7 },
    },
    {
      name: 'Month Master',
      description: 'Maintain a 30-day streak',
      icon: '🌙',
      category: AchievementCategory.STREAK,
      points: 500,
      requirement: { days: 30 },
    },
    {
      name: 'Century Streaker',
      description: 'Maintain a 100-day streak',
      icon: '💯',
      category: AchievementCategory.STREAK,
      points: 1000,
      requirement: { days: 100 },
    },
    {
      name: 'Year Long Dedication',
      description: 'Maintain a 365-day streak',
      icon: '🏅',
      category: AchievementCategory.STREAK,
      points: 2500,
      requirement: { days: 365 },
    },

    // Social achievements
    {
      name: 'Socializer',
      description: 'Connect with 5 other members',
      icon: '👋',
      category: AchievementCategory.SOCIAL,
      points: 150,
      requirement: { connections: 5 },
    },
    {
      name: 'Community Builder',
      description: 'Help 10 other members',
      icon: '🏗️',
      category: AchievementCategory.SOCIAL,
      points: 300,
      requirement: { helps: 10 },
    },

    // Special achievements
    {
      name: 'Early Adopter',
      description: 'One of the first 100 members',
      icon: '🌅',
      category: AchievementCategory.SPECIAL,
      points: 500,
      requirement: { memberNumber: 100 },
    },
    {
      name: 'Beta Tester',
      description: 'Participated in beta testing',
      icon: '🧪',
      category: AchievementCategory.SPECIAL,
      points: 750,
      requirement: { betaTester: true },
    },
    {
      name: 'Founding Member',
      description: 'Charter member of FOSSER',
      icon: '👑',
      category: AchievementCategory.SPECIAL,
      points: 1000,
      requirement: { founder: true },
    },
  ];

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { name: achievement.name },
      update: {},
      create: {
        ...achievement,
        requirement: JSON.stringify(achievement.requirement),
      },
    });
  }

  // Create badges
  const badges = [
    {
      name: 'Contributor',
      description: 'Active contributor to the community',
      icon: '🌟',
      color: '#0B874F',
      rarity: BadgeRarity.COMMON,
    },
    {
      name: 'Mentor',
      description: 'Helps other community members',
      icon: '🎓',
      color: '#F5A623',
      rarity: BadgeRarity.UNCOMMON,
    },
    {
      name: 'Innovator',
      description: 'Creates innovative solutions',
      icon: '💡',
      color: '#9B59B6',
      rarity: BadgeRarity.RARE,
    },
    {
      name: 'Leader',
      description: 'Shows exceptional leadership',
      icon: '👑',
      color: '#E74C3C',
      rarity: BadgeRarity.EPIC,
    },
    {
      name: 'Legend',
      description: 'Legendary contributor to FOSSER',
      icon: '⚡',
      color: '#FFD700',
      rarity: BadgeRarity.LEGENDARY,
    },
  ];

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { name: badge.name },
      update: {},
      create: badge,
    });
  }

  console.log('✅ Gamification data seeded successfully!');
  console.log(`🏆 Created ${achievements.length} achievements`);
  console.log(`🎖️ Created ${badges.length} badges`);
}

seedGamification()
  .catch((e) => {
    console.error('❌ Error seeding gamification data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });