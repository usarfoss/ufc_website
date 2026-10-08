/**
 * Everything the FOSS Forge 2.0 event page says, in one place. The facts about the event itself (dates, venue, the fest, the sponsors and
 * who to talk to) are shared with the Support us page, so they are re-exported from support-data and only ever edited there. The format,
 * timeline and key dates below are the event's own, mirroring the Unstop registration.
 */

export { FORGE, ELYSIAN, CURRENT_SPONSORS, CONTACTS, BROCHURE } from "@/components/support/support-data";

/** Where teams sign up. The Unstop page is the source of truth for team size, deadlines and the fine print. */
export const REGISTER =
  "https://unstop.com/hackathons/foss-forge-20-university-school-of-automation-robotics-usar-guru-gobind-singh-indraprastha-university-ggsipu--1767553";

/** The event's own community group, for teaming up, questions and the links as they drop. */
export const JOIN = "https://chat.whatsapp.com/Dl6kisUVWmeHjSNH4bhVIW?s=cl&p=a&mlu=4&ilr=4";

/** When registration closes, said plainly for the places that need to shout it. */
export const REG_CLOSES = "18 Oct, 1:30 AM IST";

/**
 * How the event works, in three stages: a quiz that seeds the leaderboard, an issue hunt where you choose your challenge, and the finale
 * where you build and ship the fix. The quiz rank carries an advantage into what follows, which is the thread tying the three together.
 */
export const FORMAT: { kicker: string; name: string; tagline: string; body: string; points: string[]; tone: string }[] = [
  {
    kicker: "stage 1 · 18 Oct",
    name: "Online Quiz Round",
    tagline: "Every point counts",
    body: "A fast-paced quiz on open source, Git, GitHub, programming, developer tools and technology. Every correct answer earns points, and your score sets your place on the first FOSS Forge leaderboard — which is not just bragging rights. Your rank gives you an advantage in the rounds that follow.",
    points: ["Open source, Git, GitHub and dev tools", "Sets your initial leaderboard rank", "A higher rank is an edge later"],
    tone: "var(--butter)",
  },
  {
    kicker: "stage 2 · 19–20 Oct",
    name: "The Issue Hunt",
    tagline: "Choose your challenge",
    body: "The issue board opens: a curated collection of real issues from open-source projects, non-profits and community-driven repositories — bugs, features, documentation, automation, frontend, backend, AI/ML and everything in between. There are no fixed tracks. Each issue is its own challenge. Read it, weigh its complexity, and decide which one is worth taking on.",
    points: ["Real issues from real projects", "No fixed tracks — each issue stands alone", "Pick what is worth your time"],
    tone: "var(--pink)",
  },
  {
    kicker: "stage 3 · 21–22 Oct",
    name: "Forge the Fix",
    tagline: "Ship a real contribution",
    body: "Now the real work begins, in coding contests hosted on Unstop. Dive into the repository, understand the codebase, reproduce the issue, design your solution, write the code, test it and prepare your contribution — a full open-source workflow of Git, GitHub, pull requests, testing, documentation and collaboration. You are not building a demo for the judges; you are building a contribution that can actually be used.",
    points: ["Hosted on Unstop", "A real open-source workflow, end to end", "A contribution that can actually ship"],
    tone: "var(--lilac)",
  },
];

/** The stages with their exact windows, for the timeline. */
export const TIMELINE: { n: string; name: string; window: string }[] = [
  { n: "01", name: "Online Quiz Round", window: "18 Oct, 9:00 – 9:15 PM IST" },
  { n: "02", name: "The Issue Hunt", window: "19 Oct, 8:00 PM → 20 Oct, 9:30 PM IST" },
  { n: "03", name: "Forge the Fix", window: "21 Oct, 8:30 AM → 22 Oct, 4:30 PM IST" },
];

/** The dates nobody should miss. Registration first, because it closes before anything else starts. */
export const KEY_DATES: { date: string; when: string; label: string; urgent?: boolean }[] = [
  { date: "18 Oct", when: "1:30 AM IST", label: "Registration closes", urgent: true },
  { date: "18 Oct", when: "9:00 PM IST", label: "Online Quiz Round" },
  { date: "19 Oct", when: "8:00 PM IST", label: "Issue Hunt opens" },
  { date: "21 Oct", when: "9:00 AM IST", label: "Grand Finale" },
];

/** Who it is for, and what to bring. Team size and the fine print live on the Unstop registration. */
export const WHO = {
  lead: "Open to all students.",
  level:
    "The issues run from approachable to properly hard, so people at different levels can all find something to sink into. You do not need to be an expert — only up for it.",
  bring: ["A laptop", "A GitHub account", "An Unstop account", "Some basic programming knowledge"],
} as const;

/** The common questions, answered plainly. */
export const FAQ: { q: string; a: string }[] = [
  {
    q: "What is FOSS Forge 2.0?",
    a: "A competitive open-source event run by UFC at USAR, GGSIPU East Delhi Campus. It is not a traditional hackathon: instead of one problem statement for everyone, you get a pool of real-world challenges from open-source projects, non-profits, communities and technical partners. You choose what to solve, compete with others on similar challenges, and earn points, rewards and prizes for what you accomplish.",
  },
  {
    q: "How does it work?",
    a: "Three stages. An Online Quiz Round on 18 Oct seeds the leaderboard and earns you an early advantage. The Issue Hunt opens the board of real issues to choose from. Then Forge the Fix, the finale on 21–22 Oct, is where you build and ship your contribution through a real Git and GitHub workflow.",
  },
  {
    q: "What kind of challenges are there?",
    a: "All sorts. Bugs, features, documentation, automation, frontend, backend and AI/ML — with no fixed tracks. Some ask you to build a tool a non-profit actually needs; others might be a CTF or a bug bounty. You pick what fits you.",
  },
  {
    q: "Who can take part, and what does it cost?",
    a: "Any student. It is free — FOSS Forge runs inside Elysian, the USAR techfest. Team size and the fine print are on the Unstop registration linked below, and registration closes on 18 Oct.",
  },
  {
    q: "Do I need to be good at Git already?",
    a: "No. If you have opened a pull request before you will feel at home, but the range of issues means there is something for beginners too. Bring a GitHub account and we will help with the rest.",
  },
  {
    q: "What if I do not have a team?",
    a: "Come anyway and join the community group below. We help people team up before the day, so nobody is left out for want of one more.",
  },
];
