import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('password', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@fosser.com' },
    update: {},
    create: {
      email: 'admin@fosser.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
      githubUsername: 'admin',
      location: 'San Francisco, CA',
      bio: 'Full-stack developer and FOSSER club administrator',
      avatar: 'https://github.com/github.png'
    }
  });

  // Create sample users
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'jane@example.com' },
      update: {},
      create: {
        email: 'jane@example.com',
        password: await bcrypt.hash('password', 10),
        name: 'Jane Developer',
        role: 'MEMBER',
        githubUsername: 'developer1',
        location: 'New York, NY',
        bio: 'Frontend developer passionate about React and TypeScript',
        avatar: 'https://github.com/github.png'
      }
    }),
    prisma.user.upsert({
      where: { email: 'john@example.com' },
      update: {},
      create: {
        email: 'john@example.com',
        password: await bcrypt.hash('password', 10),
        name: 'John Coder',
        role: 'MEMBER',
        githubUsername: 'coder2',
        location: 'Austin, TX',
        bio: 'Backend developer specializing in Node.js and Python',
        avatar: 'https://github.com/github.png'
      }
    }),
    prisma.user.upsert({
      where: { email: 'sarah@example.com' },
      update: {},
      create: {
        email: 'sarah@example.com',
        password: await bcrypt.hash('password', 10),
        name: 'Sarah Wilson',
        role: 'MODERATOR',
        githubUsername: 'sarahw',
        location: 'Seattle, WA',
        bio: 'DevOps engineer and open source contributor',
        avatar: 'https://github.com/github.png'
      }
    })
  ]);

  // Create GitHub stats for users
  await Promise.all([
    prisma.gitHubStats.upsert({
      where: { userId: admin.id },
      update: {},
      create: {
        userId: admin.id,
        commits: 247,
        pullRequests: 18,
        issues: 12,
        repositories: 8,
        followers: 45,
        contributions: 156,
        languages: JSON.stringify({
          'JavaScript': 45,
          'TypeScript': 30,
          'Python': 15,
          'Go': 10
        })
      }
    }),
    prisma.gitHubStats.upsert({
      where: { userId: users[0].id },
      update: {},
      create: {
        userId: users[0].id,
        commits: 189,
        pullRequests: 15,
        issues: 8,
        repositories: 6,
        followers: 32,
        contributions: 134,
        languages: JSON.stringify({
          'React': 50,
          'JavaScript': 25,
          'CSS': 15,
          'HTML': 10
        })
      }
    }),
    prisma.gitHubStats.upsert({
      where: { userId: users[1].id },
      update: {},
      create: {
        userId: users[1].id,
        commits: 156,
        pullRequests: 12,
        issues: 6,
        repositories: 4,
        followers: 28,
        contributions: 98,
        languages: JSON.stringify({
          'Python': 40,
          'JavaScript': 30,
          'Java': 20,
          'C++': 10
        })
      }
    }),
    prisma.gitHubStats.upsert({
      where: { userId: users[2].id },
      update: {},
      create: {
        userId: users[2].id,
        commits: 203,
        pullRequests: 16,
        issues: 9,
        repositories: 7,
        followers: 38,
        contributions: 142,
        languages: JSON.stringify({
          'Docker': 35,
          'Kubernetes': 25,
          'Python': 25,
          'Bash': 15
        })
      }
    })
  ]);

  // Create sample projects
  const projects = await Promise.all([
    prisma.project.create({
      data: {
        name: 'fosser-website',
        description: 'Main club website built with Next.js and TypeScript',
        repoUrl: 'https://github.com/fosser/website',
        language: 'TypeScript',
        status: 'ACTIVE',
        creatorId: admin.id
      }
    }),
    prisma.project.create({
      data: {
        name: 'discord-bot',
        description: 'Discord bot for club management and notifications',
        repoUrl: 'https://github.com/fosser/discord-bot',
        language: 'Python',
        status: 'ACTIVE',
        creatorId: users[1].id
      }
    }),
    prisma.project.create({
      data: {
        name: 'event-tracker',
        description: 'Event management system for workshops and meetups',
        repoUrl: 'https://github.com/fosser/event-tracker',
        language: 'JavaScript',
        status: 'PLANNING',
        creatorId: users[0].id
      }
    })
  ]);

  // Create sample events
  const events = await Promise.all([
    prisma.event.create({
      data: {
        title: 'React Workshop: Advanced Patterns',
        description: 'Deep dive into advanced React patterns including hooks, context, and performance optimization',
        date: new Date('2025-08-25T18:00:00Z'),
        location: 'Tech Hub Room 101',
        maxAttendees: 30,
        type: 'WORKSHOP',
        status: 'UPCOMING',
        creatorId: admin.id
      }
    }),
    prisma.event.create({
      data: {
        title: 'Open Source Contribution Day',
        description: 'Collaborative session to contribute to open source projects and learn Git workflows',
        date: new Date('2025-08-28T14:00:00Z'),
        location: 'Online',
        maxAttendees: 25,
        type: 'HACKATHON',
        status: 'UPCOMING',
        creatorId: users[2].id
      }
    }),
    prisma.event.create({
      data: {
        title: 'JavaScript Fundamentals',
        description: 'Introduction to JavaScript for beginners covering ES6+ features and modern development',
        date: new Date('2025-08-18T19:00:00Z'),
        location: 'Main Auditorium',
        maxAttendees: 35,
        type: 'WORKSHOP',
        status: 'COMPLETED',
        creatorId: users[0].id
      }
    })
  ]);

  // Create sample activities
  await Promise.all([
    prisma.activity.create({
      data: {
        type: 'COMMIT',
        userId: admin.id,
        description: 'Fixed authentication bug in login system',
        projectId: projects[0].id,
        metadata: JSON.stringify({
          commits: 3,
          additions: 45,
          deletions: 12,
          repository: 'fosser-website'
        })
      }
    }),
    prisma.activity.create({
      data: {
        type: 'PULL_REQUEST',
        userId: users[0].id,
        description: 'Added new dashboard components',
        projectId: projects[0].id,
        metadata: JSON.stringify({
          files: 5,
          additions: 89,
          deletions: 23,
          repository: 'fosser-website'
        })
      }
    }),
    prisma.activity.create({
      data: {
        type: 'EVENT_JOIN',
        userId: users[1].id,
        description: 'Joined React Workshop event',
        eventId: events[0].id,
        metadata: JSON.stringify({
          eventTitle: 'React Workshop: Advanced Patterns'
        })
      }
    })
  ]);

  console.log('✅ Database seeded successfully!');
  console.log(`👤 Admin user: admin@fosser.com / password`);
  console.log(`👥 Sample users created with password: password`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });