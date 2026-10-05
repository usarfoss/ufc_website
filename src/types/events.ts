/**
 * What a proposal says about an event, beyond the basics. It is the same set of fields the public event pages show
 * (src/data/events.ts), so an approved proposal has everything an event page needs. Shared by the form and the server.
 */
export interface ScheduleDay {
  /** "Day 1", "Saturday". Left out for a one day event. */
  day?: string;
  items: { time: string; activity: string }[];
}

export interface Round {
  name: string;
  when: string;
  tagline: string;
  body: string;
  scoring: string[];
}

export interface Speaker {
  name: string;
  bio: string;
  topic: string;
  links: { label: string; href: string }[];
}

export type EventMode = "in-person" | "online" | "hybrid";

export interface EventDetails {
  /** A few words under the title, such as "Orientation and founding". */
  subtitle?: string;
  mode?: EventMode;
  /** When it ends, for events that run longer than a start time suggests. */
  endsAt?: string;
  tags?: string[];
  /** A poster or photo, at an https address. */
  imageUrl?: string;
  /** The story, one paragraph per entry. */
  overview: string[];
  highlights?: string[];
  whoFor?: string;
  bring?: string[];
  schedule?: ScheduleDay[];
  rounds?: Round[];
  speaker?: Speaker;
  registration?: { label: string; href: string };
}

/** The most the server accepts, so nobody can store a novel in a proposal. The form shows the same numbers. */
export const LIMITS = {
  summary: [20, 300],
  title: [3, 120],
  subtitle: [0, 80],
  location: [2, 200],
  tags: 6,
  tag: 24,
  overviewParagraphs: 6,
  overview: [30, 1200],
  list: 10,
  listItem: 200,
  whoFor: 300,
  scheduleDays: 4,
  scheduleItems: 20,
  rounds: 6,
  roundField: 400,
  speakerBio: 600,
  links: 5,
} as const;
