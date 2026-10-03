/** The club's origin story, one entry per knot on the thread. Edit copy here. */
export type Chapter = {
  n: string;
  title: string;
  /** Short tag shown on the card's corner. */
  tag: string;
  body: string[];
  points?: string[];
  link?: { label: string; href: string; external?: boolean };
  tone: "butter" | "mint" | "pink" | "lilac" | "sky";
};

export const CHAPTERS: Chapter[] = [
  {
    n: "01",
    title: "It started with a chat",
    tag: "2025",
    tone: "butter",
    body: [
      "In 2025, Siddharth and a few friends got talking about how there wasn't really a place on campus where open source was the main thing. Plenty of people at USAR could code, but most of it stayed on their own laptops.",
      "So they decided to just start a club for it. Nothing fancy. Give people a place to try this stuff together and see who sticks around.",
    ],
    points: ["a few friends", "one simple idea", "no one's permission"],
  },
  {
    n: "02",
    title: "FOSS United came on board",
    tag: "the backers",
    tone: "mint",
    body: [
      "Pretty early on we got FOSS United involved. They're a non-profit that supports open source communities across India, and they back the club today.",
      "That changed things for us. We were no longer just a few friends with a group chat, we were part of something bigger. Our chapter page there is also where we put up Git Gud.",
    ],
    link: { label: "Our FOSS United chapter", href: "https://fossunited.org/c/university-school-of-automation-and-robotics", external: true },
  },
  {
    n: "03",
    title: "Then we found everyone else",
    tag: "the crew",
    tone: "pink",
    body: [
      "Next we started pulling in people from different sections and with different interests. Not everyone was a hardcore programmer, and honestly that was the best part.",
      "We also had one first-year in the group right from the start. Having someone that new around early on kept us from turning into a clique, and it meant we had to explain things properly.",
    ],
    points: ["different sections", "different interests", "a first-year from day one"],
  },
  {
    n: "04",
    title: "Spreading the word",
    tag: "the mission",
    tone: "lilac",
    body: [
      "We want more people to know what open source is, both inside our college and outside it. On campus that means workshops, talks and sprints where you make your first pull request with people sitting next to you.",
      "Beyond campus, we try to be part of the wider community, invite speakers anyone can listen to, and be useful to whoever asks where to begin.",
    ],
    points: ["workshops and sprints", "open talks for everyone", "showing up beyond campus"],
  },
  {
    n: "05",
    title: "Everyone is welcome",
    tag: "inclusivity",
    tone: "sky",
    body: [
      "Open source can look pretty intimidating from the outside. We'd like to change that. Designers, writers, hardware people, organisers and complete beginners all do real work in open source, and we want them all in the room.",
      "If something helps the project or the people around it, it counts as a contribution. That's the rule.",
    ],
    link: { label: "See where you'd fit", href: "/#big-tent" },
  },
  {
    n: "06",
    title: "Nobody is the boss of us",
    tag: "the freedom",
    tone: "butter",
    body: [
      "No company owns this club. No sponsor, no one deciding what we're allowed to work on. We do what we want.",
      "Mostly that means building projects (this website is one), arguing about licences and tabs versus spaces, going on trips and throwing parties. It turns out people stay for the friends as much as for the code.",
    ],
    points: ["building projects", "long arguments", "trips", "parties"],
  },
];

/** What year one was made of. */
export const YEAR_ONE_NOTES = [
  "Git Gud: from first commit to first PR, live.",
  "Two open talks, online, free for everyone.",
  "FOSS Forge: two days of open source competition.",
  "Trips, parties and a group chat that never sleeps.",
];

export type Belief = { n: string; title: string; body: string; tone: "butter" | "mint" | "pink" | "lilac" | "sky" };

export const BELIEFS: Belief[] = [
  {
    n: "1",
    title: "Everyone's invited",
    tone: "mint",
    body: "Developers, designers, hardware tinkerers, writers, organisers, total beginners. Open source gets better with every kind of person in it, so we go out of our way to make room. If you want to be here, you're in.",
  },
  {
    n: "2",
    title: "No proprietary master",
    tone: "butter",
    body: "No company, sponsor or single person owns what we do. We choose our own projects, make our own rules and share what we make, because that's the whole idea of open source.",
  },
  {
    n: "3",
    title: "No hierarchy",
    tone: "pink",
    body: "Somebody has to run the group chat and book the rooms, but titles don't decide whose idea wins. A first-year's pull request gets the same review as anyone else's.",
  },
  {
    n: "4",
    title: "Spread the word",
    tone: "lilac",
    body: "Most students have never heard of open source, or assume it isn't for them. We want to change that on campus and beyond, through workshops, talks, events and a lot of conversations. The more people who know, the better it gets for all of us.",
  },
];
