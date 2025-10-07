import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const demoEmails = [
    'admin@fosser.com',
    'jane@example.com',
    'john@example.com',
    'sarah@example.com',
  ];
  const demoGithub = ['admin', 'developer1', 'coder2', 'sarahw'];

  // Find demo users
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { email: { in: demoEmails } },
        { githubUsername: { in: demoGithub } },
      ],
    },
    select: { id: true },
  });

  if (users.length === 0) {
    console.log('No demo users found. Nothing to delete.');
    return;
  }

  const userIds = users.map((u) => u.id);
  console.log(`Deleting demo data for ${userIds.length} user(s)...`);

  // Delete dependents first
  await prisma.activity.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.projectMember.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.eventAttendee.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.gitHubStats.deleteMany({ where: { userId: { in: userIds } } });

  // Delete projects/events created by demo users
  await prisma.project.deleteMany({ where: { creatorId: { in: userIds } } });
  await prisma.event.deleteMany({ where: { creatorId: { in: userIds } } });

  // Finally delete users
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });

  console.log('✅ Demo users and related data removed.');
}

main()
  .catch((e) => {
    console.error('Cleanup failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


