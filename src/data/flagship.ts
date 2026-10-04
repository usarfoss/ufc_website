import { PROJECTS, type Project } from "./projects";

/**
 * The projects the club is proudest of, in the order the home page's drawing set turns over. These are not limited to the
 * bootcamp: Kwaque and Sedim are community projects that grew on their own. Add or reorder entries here and the section follows.
 * A sixth sheet, left blank on purpose, always closes the set as an invitation.
 */
export type Flagship = Project & {
  /** A drawn diagram stands in for a screenshot. */
  diagram?: "log";
  /** What it is made of, top layer first: the part you see, then the layers under it. The section pulls these apart as you scroll. */
  parts: [Part, Part, Part, Part];
  /** A few words in marker pen, stuck next to the project. */
  note: string;
};

/** One layer of a project. `kind` picks the little drawing on that layer. */
export type Part = {
  name: string;
  /** The little drawing shown on the layer when there is no picture. */
  kind: "ui" | "code" | "data" | "net" | "core";
  /** A picture of this layer, in /public/projects. It replaces the drawing. */
  image?: string;
  /** The address of the page in the picture, shown in the layer's address bar. */
  url?: string;
};

/** A project from the bootcamp tracker, optionally renamed or reworded. */
const fromBootcamp = (slug: string, overrides: Pick<Flagship, "parts" | "note"> & Partial<Project>): Flagship => {
  const found = PROJECTS.find((p) => p.slug === slug);
  if (!found) throw new Error(`No bootcamp project called ${slug}`);
  return { ...found, ...overrides };
};

export const FLAGSHIP: Flagship[] = [
  {
    slug: "kwaque",
    title: "Kwaque",
    by: "Vikram Aditya Verma",
    github: "vikramaditya33",
    repo: "https://github.com/Kwaque-org/Kwaque",
    domain: "systems",
    tier: 1,
    stage: "bench",
    stack: ["C++"],
    blurb: "A self-governed, high-performance distributed log, built in C++.",
    diagram: "log",
    parts: [
      { name: "The log", kind: "ui" },
      { name: "Replication", kind: "net", image: "/projects/kwaque-cluster.webp" },
      { name: "Shard per core", kind: "core", image: "/projects/kwaque-shards.webp" },
      { name: "Run it", kind: "code", image: "/projects/kwaque-run.webp" },
    ],
    note: "append only. no take-backs.",
  },
  {
    slug: "sedim",
    title: "Sedim",
    by: "Siddharth Bansal",
    github: "sidd190",
    repo: "https://github.com/sedimie/sedim",
    live: "https://sedim-web.vercel.app/",
    domain: "tools",
    tier: 1,
    stage: "live",
    stack: ["TypeScript", "Next.js", "React", "Express", "Prisma"],
    blurb: "Modular full-stack features you install, own, and customize.",
    image: { src: "/projects/sedim-home.webp", w: 1200, h: 750 },
    parts: [
      { name: "Landing page", kind: "ui" },
      { name: "In the terminal", kind: "code", image: "/projects/sedim-terminal.webp", url: "sedim-web.vercel.app" },
      { name: "The stamp model", kind: "data", image: "/projects/sedim-stamp.webp", url: "sedim-web.vercel.app" },
      { name: "Docs", kind: "core", image: "/projects/sedim-docs.webp", url: "sedim-web.vercel.app/docs" },
    ],
    note: "install it. own it. change it.",
  },
  fromBootcamp("uwestjs", {
    parts: [
      { name: "Landing page", kind: "ui" },
      { name: "Introduction", kind: "code", image: "/projects/uwestjs-intro.webp", url: "uwest.js.org/docs/introduction" },
      { name: "Benchmarks", kind: "data", image: "/projects/uwestjs-bench.webp", url: "uwest.js.org/docs/benchmarks" },
      { name: "Getting started", kind: "core", image: "/projects/uwestjs-start.webp", url: "uwest.js.org/docs/getting-started" },
    ],
    note: "same decorators. way faster.",
  }),
  fromBootcamp("stride", {
    parts: [
      { name: "React Native", kind: "ui" },
      { name: "Expo", kind: "code" },
      { name: "Workouts as NFTs", kind: "data" },
      { name: "On-chain", kind: "net" },
    ],
    note: "every run, on-chain.",
  }),
  fromBootcamp("park-conscious", {
    slug: "backstage",
    title: "Backstage",
    blurb: "An event platform for organisers and attendees: live capacity, QR check-in, ticket tiers, payments and a real-time dashboard.",
    parts: [
      { name: "Home", kind: "ui" },
      { name: "Browse events", kind: "code", image: "/projects/backstage-browse.webp", url: "events.parkconscious.in" },
      {
        name: "Event page",
        kind: "data",
        image: "/projects/backstage-event.webp",
        url: "events.parkconscious.in/event/techconfluence-2026",
      },
      { name: "List your event", kind: "core", image: "/projects/backstage-create.webp", url: "events.parkconscious.in/create" },
    ],
    note: "scan in. walk in.",
  }),
];
