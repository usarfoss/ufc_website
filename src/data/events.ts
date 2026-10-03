/**
 * Single source of truth for the public events pages (/events and /events/[slug]).
 * Plain data on purpose: no JSX, so it can be read from server and client components alike.
 *
 * DATES: the old site disagreed with itself about years and months (the listing said 2024, the detail page said Oct 2025).
 * These are the best reading of it. Fix them here and every page follows.
 */

export type Tone = "butter" | "mint" | "pink" | "lilac" | "sky";

export type ScheduleDay = { day?: string; items: { time: string; activity: string }[] };

export type Round = { name: string; when: string; tagline: string; body: string; scoring: string[] };

export type Speaker = { name: string; bio: string; topic: string; links: { label: string; href: string }[] };

export type EventItem = {
  slug: string;
  n: string;
  title: string;
  subtitle: string;
  dateLabel: string;
  /** ISO date of the first day, used for sorting. */
  sort: string;
  time?: string;
  location: string;
  type: "Orientation" | "Workshop" | "Flagship" | "Hackathon" | "Open talk";
  tone: Tone;
  summary: string;
  tags: string[];
  /** Poster or photo. */
  image?: { src: string; alt: string; aspect: string; position?: string };
  overview: string[];
  highlights?: string[];
  whoFor?: string;
  bring?: string[];
  schedule?: ScheduleDay[];
  rounds?: Round[];
  speaker?: Speaker;
  registration?: { label: string; href: string };
};

export const EVENTS: EventItem[] = [
  {
    slug: "genesis",
    n: "00",
    title: "Genesis",
    subtitle: "Orientation and founding",
    dateLabel: "9 Aug 2025",
    sort: "2025-08-09",
    location: "USAR Campus, GGSIPU EDC",
    type: "Orientation",
    tone: "butter",
    summary: "Where it all started. The founding orientation, where we introduced the club and told everyone what we wanted it to be.",
    tags: ["founding", "orientation", "community"],
    image: { src: "/about-images/team.jpg", alt: "UFC members introducing themselves on stage at the orientation", aspect: "aspect-[4/3]", position: "50% 30%" },
    overview: [
      "Genesis was the first time everyone was in one room. We introduced the club, explained what we were trying to build and who it was for, and put the team on a slide so people knew who to bug with questions.",
      "It was a room full of curious people and a whiteboard full of ideas. We told them the one thing that mattered: this club is for people who want to build things, not only hear about building things.",
    ],
    highlights: ["We introduced the club and its vision", "First time the whole community met", "Set the tone: build, don't just learn about building"],
    whoFor: "Anyone at USAR who was even a little curious about open source. No experience needed.",
  },
  {
    slug: "git-gud",
    n: "01",
    title: "Git Gud",
    subtitle: "Introduction to open source",
    dateLabel: "10 Oct 2025",
    sort: "2025-10-10",
    time: "3:00 PM to 5:15 PM",
    location: "USAR Campus, GGSIPU EDC",
    type: "Workshop",
    tone: "sky",
    summary: "A hands-on workshop on Git, GitHub and how to contribute to open source. Live demos, a first pull request and a lot of questions.",
    tags: ["git", "github", "open source", "version control"],
    image: { src: "/event-images/git-gud.webp", alt: "Git Gud poster: Git and GitHub intro, October 10. Learn, try, grow.", aspect: "aspect-[2458/1704]" },
    overview: [
      "Git Gud was a hands-on meetup for people who had never touched open source. We went through Git and GitHub from scratch, with live demos and plenty of time to ask the questions everybody is secretly wondering.",
      "The goal was simple: leave with enough confidence to open a real pull request on a real project. Beginners and people with some experience were both welcome, and we helped anyone who didn't have a GitHub account yet get one.",
    ],
    highlights: [
      "Version control from scratch, with Git and GitHub",
      "Working with a team on shared code",
      "How to find a project and contribute to it",
      "Code review, documentation and community manners",
      "How open source experience helps your career",
    ],
    whoFor: "Students who were new to open source, or wanted a better handle on working together on code.",
    bring: ["A laptop", "Some basic programming knowledge", "A GitHub account (we helped you make one)"],
    schedule: [
      {
        items: [
          { time: "3:00 PM", activity: "Welcome and introduction" },
          { time: "3:15 PM", activity: "Git fundamentals demo" },
          { time: "3:45 PM", activity: "Hands-on Git practice" },
          { time: "4:15 PM", activity: "Speaker session" },
          { time: "4:30 PM", activity: "How to contribute to open source" },
          { time: "4:45 PM", activity: "Live project contribution" },
          { time: "5:00 PM", activity: "Q&A and discussion" },
          { time: "5:15 PM", activity: "Wrap-up and next steps" },
        ],
      },
    ],
    registration: { label: "Registration page (from when it ran)", href: "https://fossunited.org/c/university-school-of-automation-and-robotics/git-gudd/rsvp" },
  },
  {
    slug: "foss-forge-2025",
    n: "02",
    title: "FOSS Forge 2025",
    subtitle: "Open source competition and festival",
    dateLabel: "15 to 16 Oct 2025",
    sort: "2025-10-15",
    time: "11:00 AM to 5:00 PM, both days",
    location: "USAR Campus, GGSIPU EDC",
    type: "Flagship",
    tone: "pink",
    summary: "Our flagship festival during ELYSIAN 2025. Two days of Git Clash, a Pokémon YAML Showdown and a Repo Sprint, with a live leaderboard.",
    tags: ["open source", "competition", "git", "teams"],
    image: { src: "/foss-forge-2025.jpg", alt: "FOSS Forge 2025 poster", aspect: "aspect-[2942/4160]" },
    overview: [
      "FOSS Forge is the biggest thing we run. It happened as part of ELYSIAN 2025 and mixed proper coding challenges with silly game-style rounds, so it felt like a festival of open source culture and not an exam.",
      "Teams of three competed across three rounds over two days. Points from every round went into one live leaderboard, projected for everyone to watch, and the final ranking added up Day 1 and Day 2.",
    ],
    highlights: [
      "Two days, three rounds, one live leaderboard",
      "Day 1: Git Clash and the Pokémon YAML Showdown",
      "Day 2: the Repo Sprint finals",
      "Points for individuals and for teams",
    ],
    whoFor: "Teams of three. Some programming knowledge helped, but the rounds were designed so people at different levels could all score.",
    bring: ["A laptop", "A GitHub account", "A team of three", "Some basic programming knowledge"],
    rounds: [
      {
        name: "Git Clash",
        when: "Day 1",
        tagline: "Commit Storm",
        body: "Teams took on curated issues, from simple to properly hard, against the clock. Pull requests were judged live and the leaderboard moved as they landed.",
        scoring: ["Valid PR: 10 points", "Medium issue: 5 bonus", "Hard issue: 10 bonus", "Earliest accepted PRs: 5 bonus each", "Clean Git workflow: up to 30 points per team"],
      },
      {
        name: "Pokémon YAML Showdown",
        when: "Day 1",
        tagline: "Battle of Configs",
        body: "A live, Pokémon-style game where YAML files decide the battles. Teams pushed their configs to GitHub, and the matches were simulated and projected live.",
        scoring: ["Match victory: 30 points", "Close match: 15 points", "Creative strategy: 10 points", "Valid participation: 5 points"],
      },
      {
        name: "Repo Sprint",
        when: "Day 2",
        tagline: "Build from base repos",
        body: "Teams were handed base repositories and had the day to show what they could do: features, UX, documentation and polish.",
        scoring: ["High-impact feature or creative solution: 30 points", "Code quality and documentation: 25 points", "UI and UX improvement: 20 points", "Valid PRs merged and verified: 25 points"],
      },
    ],
    schedule: [
      {
        day: "Day 1 · 15 Oct",
        items: [
          { time: "11:00 AM", activity: "Registration and team formation" },
          { time: "11:30 AM", activity: "Opening ceremony" },
          { time: "12:00 PM", activity: "Git Clash, round 1" },
          { time: "2:00 PM", activity: "Lunch break" },
          { time: "2:30 PM", activity: "Pokémon YAML Showdown" },
          { time: "5:00 PM", activity: "Day 1 wrap-up and leaderboard" },
        ],
      },
      {
        day: "Day 2 · 16 Oct",
        items: [
          { time: "11:00 AM", activity: "Repo Sprint, the creativity round" },
          { time: "1:30 PM", activity: "Lunch break" },
          { time: "2:00 PM", activity: "Showcase and judging" },
          { time: "5:00 PM", activity: "Awards ceremony" },
        ],
      },
    ],
    registration: { label: "Registration page (from when it ran)", href: "https://tinyurl.com/FOSS-FORGE-REGISTRATION" },
  },
  {
    slug: "build-with-trae",
    n: "03",
    title: "Build with TRAE",
    subtitle: "@ New Delhi, with MiniMax",
    dateLabel: "28 Mar 2026",
    sort: "2026-03-28",
    location: "USAR Campus, GGSIPU EDC",
    type: "Hackathon",
    tone: "lilac",
    summary: "Build with TRAE came to New Delhi with MiniMax: a session on AI-native coding and agents, then a mini hackathon where teams built and demoed projects in a few hours.",
    tags: ["AI", "AI-native coding", "hackathon", "TRAE", "MiniMax"],
    image: { src: "/event-images/build-with-trae.webp", alt: "Poster for Build with TRAE at New Delhi with MiniMax, 28th March. Experience the future of AI-native coding.", aspect: "aspect-square" },
    overview: [
      "Build with TRAE is a series of developer events, and this stop was in New Delhi, with MiniMax. The theme was the future of AI-native coding: using AI as more than a fancy autocomplete, and letting it act as an agent that works through your tasks while you steer.",
      "It finished with a mini hackathon. Teams had a few hours to build something with AI-assisted workflows and then demoed what they made, all in a single sitting.",
    ],
    highlights: ["A session on AI-native coding, not just a talk", "A mini hackathon to try it for real", "Run with TRAE and MiniMax"],
    whoFor: "Anyone curious about building with AI tools, whatever your level.",
  },
  {
    slug: "chintan-1",
    n: "04",
    title: "Threat Modeling and Precogly",
    subtitle: "Open Community Chintan #01",
    dateLabel: "29 Apr 2026",
    sort: "2026-04-29",
    time: "6:00 PM",
    location: "Online",
    type: "Open talk",
    tone: "mint",
    summary: "The creator of Precogly on open threat modeling, how the project works and how you can contribute to it.",
    tags: ["security", "threat modeling", "online", "talk"],
    image: { src: "/event-images/OCC1.png", alt: "Poster for Open Community Chintan #01: threat modeling and Precogly", aspect: "aspect-[1587/2245]" },
    overview: [
      "The first Open Community Chintan was an introduction to open threat modeling, followed by a deep dive into Precogly: what it is, why it was built, how it works and how to contribute. It was beginner friendly, with room to go deep if you wanted to.",
      "Open Community Chintans are our online talk series. Different topics, different speakers, real conversations. No polished corporate panels, just people with ideas worth sharing.",
    ],
    highlights: ["An intro to open threat modeling", "A deep dive into Precogly", "How to contribute to it"],
    whoFor: "Anyone interested in security or in how open source projects are run. Beginners welcome.",
    speaker: {
      name: "Vikramaditya Narayan",
      bio: "Creator of Precogly, an open-source, enterprise-grade threat modeling platform built for compliance-aware security teams. Earlier he designed the prototype for a YC-funded AI governance platform. He leads the Bangalore chapter of Threat Modeling Connect and has spoken at ThreatModCon DC on emergent risks in multi-agentic systems. He holds an MS from Carnegie Mellon and is a Certified Threat Modeling Professional.",
      topic: "An intro to open threat modeling, then a deep dive into Precogly.",
      links: [{ label: "Precogly on GitHub", href: "https://github.com/precogly/precogly" }],
    },
  },
  {
    slug: "chintan-2",
    n: "05",
    title: "Open Source, GSoC and Remote Work from a Tier 3 College",
    subtitle: "Open Community Chintan #02",
    dateLabel: "6 May 2026",
    sort: "2026-05-06",
    time: "6:00 PM",
    location: "Online",
    type: "Open talk",
    tone: "butter",
    summary: "Jigyasu Rajput on how open source, GSoC and remote work opened doors, all from a Tier 3 college in Ghaziabad.",
    tags: ["GSoC", "careers", "remote work", "online", "talk"],
    image: { src: "/event-images/OCC2.png", alt: "Poster for Open Community Chintan #02: all roads lead to open source", aspect: "aspect-[1587/2245]" },
    overview: [
      "The second Chintan was for every college student in India who wants a remote tech job, wants to get into open source or GSoC, or just wants out of the placement rat race.",
      "Jigyasu is a third-year student at a Tier 3 college in Ghaziabad who works remotely at a Japanese AI company, did GSoC with the Python Software Foundation and mentors open source at Newton School. He is documenting the whole journey so others don't have to figure it out alone.",
    ],
    highlights: ["Getting into GSoC", "Remote work as a student", "Doing it all from a Tier 3 college"],
    whoFor: "Any student who wants a path into open source or remote work and isn't sure where to start.",
    speaker: {
      name: "Jigyasu Rajput",
      bio: "A 3rd year engineering student from a Tier 3 college in Ghaziabad. He works remotely at a Japanese AI company, did GSoC at the Python Software Foundation and is an open source mentor at Newton School. He is also part of Super 30 by Harkirat Singh.",
      topic: "Open source, GSoC and remote work, and how to get started.",
      links: [
        { label: "X (Twitter)", href: "https://x.com/rajputwt" },
        { label: "LinkedIn", href: "https://www.linkedin.com/in/jigyasu-rajput-218657284/" },
        { label: "GitHub", href: "https://github.com/JigyasuRajput" },
      ],
    },
  },
];

/** Newest first, the order the events page shows them in. */
export const EVENTS_NEWEST_FIRST = [...EVENTS].sort((a, b) => b.sort.localeCompare(a.sort));

export const getEvent = (slug: string) => EVENTS.find((e) => e.slug === slug);

/** Old numeric URLs (/events/1, /events/2) still resolve. */
export const LEGACY_IDS: Record<string, string> = { "1": "git-gud", "2": "foss-forge-2025", "trae-ai": "build-with-trae" };
