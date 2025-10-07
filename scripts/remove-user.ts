import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const target = 'manandeep';

  // Find users where name, email, or githubUsername matches 'manandeep'
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: target, mode: 'insensitive' } },
        { email: { contains: target, mode: 'insensitive' } },
        { githubUsername: { equals: target, mode: 'insensitive' } },
      ],
    },
    select: { id: true, email: true, name: true, githubUsername: true },
  });

  if (users.length === 0) {
    console.log('No matching users found.');
    return;
  }

  console.log(`Found ${users.length} user(s):`);
  for (const u of users) {
    console.log(`- ${u.id} ${u.email} ${u.name ?? ''} ${u.githubUsername ?? ''}`);
  }

  const ids = users.map(u => u.id);

  // Remove dependent data first
  await prisma.activity.deleteMany({ where: { userId: { in: ids } } });
  await prisma.projectMember.deleteMany({ where: { userId: { in: ids } } });
  await prisma.eventAttendee.deleteMany({ where: { userId: { in: ids } } });
  await prisma.gitHubStats.deleteMany({ where: { userId: { in: ids } } });

  // Optionally remove projects/events created by these users
  await prisma.project.deleteMany({ where: { creatorId: { in: ids } } });
  await prisma.event.deleteMany({ where: { creatorId: { in: ids } } });

  // Finally delete the users
  await prisma.user.deleteMany({ where: { id: { in: ids } } });

  console.log('✅ Deleted matching users and related data.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


