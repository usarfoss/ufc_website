/**
 * Seeds five made-up members (with GitHub and LeetCode stats) so the leaderboard, members list and dashboard
 * have something to show during development.
 *
 *   npm run db:seed     add them (safe to run again: it updates the same five rows)
 *   npm run db:unseed   remove exactly those rows and nothing else
 *
 * Every seeded row is tagged by an email ending in @seed.ufc.local and a GitHub id starting "seed-", which is what
 * db:unseed matches on. Real members are never touched. It writes to whatever DATABASE_URL points at.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const SEED_DOMAIN = "@seed.ufc.local";
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

type Person = {
  name: string;
  handle: string;
  location: string;
  bio: string;
  leetcode?: string;
  gh: { commits: number; pullRequests: number; issues: number; repositories: number; followers: number };
  lc?: { easy: number; medium: number; hard: number; ranking: number };
  /** How busy their last year looks on the calendar, 0 to 1. */
  busy: number;
  joinedDaysAgo: number;
};

// Handles start with "seed-" so github.com/<handle>.png is a 404 and the UI falls back to an initial instead of a stranger's photo.
const PEOPLE: Person[] = [
  { name: "Aarav Mehta", handle: "seed-aarav", location: "Delhi", bio: "Rust curious, chai dependent. Fixes docs for fun.", leetcode: "seed-aarav", gh: { commits: 412, pullRequests: 38, issues: 21, repositories: 19, followers: 44 }, lc: { easy: 62, medium: 41, hard: 9, ranking: 48210 }, busy: 0.85, joinedDaysAgo: 120 },
  { name: "Ishita Rao", handle: "seed-ishita", location: "Noida", bio: "Frontend, design systems and an unreasonable number of stickers.", gh: { commits: 268, pullRequests: 55, issues: 14, repositories: 12, followers: 61 }, busy: 0.7, joinedDaysAgo: 98 },
  { name: "Kabir Sethi", handle: "seed-kabir", location: "Gurugram", bio: "Competitive programmer who got dragged into open source.", leetcode: "seed-kabir", gh: { commits: 96, pullRequests: 11, issues: 6, repositories: 7, followers: 15 }, lc: { easy: 140, medium: 118, hard: 37, ranking: 9120 }, busy: 0.45, joinedDaysAgo: 76 },
  { name: "Tanvi Joshi", handle: "seed-tanvi", location: "Delhi", bio: "Hardware by day, firmware by night. KiCad evangelist.", gh: { commits: 171, pullRequests: 22, issues: 31, repositories: 15, followers: 28 }, busy: 0.55, joinedDaysAgo: 54 },
  { name: "Rohan Bhatia", handle: "seed-rohan", location: "Faridabad", bio: "First-year. Opened a first pull request last month and hasn't stopped.", leetcode: "seed-rohan", gh: { commits: 38, pullRequests: 6, issues: 3, repositories: 4, followers: 5 }, lc: { easy: 33, medium: 9, hard: 1, ranking: 211400 }, busy: 0.25, joinedDaysAgo: 21 },
];

const key = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** A believable year of contributions. Deterministic per person, so re-seeding doesn't churn the data. */
function calendar(seed: number, busy: number) {
  const today = new Date();
  const days: { date: string; count: number }[] = [];
  for (let i = 0; i < 364; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const wave = (Math.sin((i + seed * 17) * 0.9) + Math.cos((i + seed * 5) * 0.23) + 2) / 4; // 0..1
    const weekend = d.getDay() === 0 || d.getDay() === 6 ? 0.6 : 1;
    const active = wave * weekend > 1 - busy * 0.75;
    days.push({ date: key(d), count: active ? Math.max(1, Math.round(wave * 9 * busy * 1.4)) : 0 });
  }
  return days;
}

async function seed() {
  for (const [i, p] of PEOPLE.entries()) {
    const email = `${p.handle}${SEED_DOMAIN}`;
    const joinedAt = new Date(Date.now() - p.joinedDaysAgo * 86_400_000);
    const user = await prisma.user.upsert({
      where: { githubId: p.handle },
      update: { name: p.name, bio: p.bio, location: p.location, leetcodeUsername: p.leetcode ?? null },
      create: { email, name: p.name, githubId: p.handle, githubUsername: p.handle, leetcodeUsername: p.leetcode ?? null, location: p.location, bio: p.bio, joinedAt },
    });

    const cal = calendar(i + 1, p.busy);
    const github = {
      commits: p.gh.commits,
      pullRequests: p.gh.pullRequests,
      issues: p.gh.issues,
      repositories: p.gh.repositories,
      followers: p.gh.followers,
      contributions: cal.reduce((n, d) => n + d.count, 0),
      contributionCalendar: cal,
      lastSynced: new Date(),
    };
    await prisma.gitHubStats.upsert({ where: { userId: user.id }, update: github, create: { userId: user.id, ...github } });

    if (p.lc && p.leetcode) {
      const leet = {
        leetcodeUsername: p.leetcode,
        easySolved: p.lc.easy,
        mediumSolved: p.lc.medium,
        hardSolved: p.lc.hard,
        totalSolved: p.lc.easy + p.lc.medium + p.lc.hard,
        ranking: p.lc.ranking,
        lastSynced: new Date(),
      };
      await prisma.leetCodeStats.upsert({ where: { userId: user.id }, update: leet, create: { userId: user.id, ...leet } });
    }

    const gh = p.gh.commits + p.gh.pullRequests * 5 + p.gh.issues * 2;
    const lc = p.lc ? p.lc.easy * 2 + p.lc.medium * 4 + p.lc.hard * 6 : 0;
    console.log(`  ${p.name.padEnd(14)} @${p.handle.padEnd(13)} ${String(gh + lc).padStart(4)} pts  (github ${gh}, leetcode ${lc})`);
  }
}

async function unseed() {
  const users = await prisma.user.findMany({ where: { email: { endsWith: SEED_DOMAIN } }, select: { id: true, name: true } });
  const ids = users.map((u) => u.id);
  if (!ids.length) return console.log("  nothing to remove");
  // children first: stats, then any activity or event rows, then the users
  await prisma.$transaction([
    prisma.gitHubStats.deleteMany({ where: { userId: { in: ids } } }),
    prisma.leetCodeStats.deleteMany({ where: { userId: { in: ids } } }),
    prisma.activity.deleteMany({ where: { userId: { in: ids } } }),
    prisma.eventAttendee.deleteMany({ where: { userId: { in: ids } } }),
    prisma.user.deleteMany({ where: { id: { in: ids } } }),
  ]);
  console.log(`  removed ${users.map((u) => u.name).join(", ")}`);
}

const mode = process.argv[2] === "unseed" ? "unseed" : "seed";
console.log(mode === "seed" ? "Seeding 5 members…" : "Removing seeded members…");
try {
  await (mode === "seed" ? seed() : unseed());
  const total = await prisma.user.count();
  console.log(`Done. ${total} user${total === 1 ? "" : "s"} in the database now.`);
} finally {
  await prisma.$disconnect();
}
