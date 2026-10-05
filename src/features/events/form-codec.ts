import type { Round, ScheduleDay } from "@/types/events";

/** The form keeps lists as plain text (one item per line) because that is quicker to type than a row of boxes. These turn that text into the shapes the server expects. */

export const linesOf = (text: string) =>
  text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

/** Paragraphs are separated by a blank line. */
export const paragraphsOf = (text: string) =>
  text
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean);

/**
 * "3:00 PM | Welcome and introduction", one per line. A line starting with # names a day, for events that run more than one.
 * Lines without a | are kept as an activity with no time, so the server can tell the person which one to fix.
 */
export function scheduleOf(text: string): ScheduleDay[] {
  const days: ScheduleDay[] = [];
  let current: ScheduleDay | null = null;
  for (const line of linesOf(text)) {
    if (line.startsWith("#")) {
      current = { day: line.replace(/^#+\s*/, ""), items: [] };
      days.push(current);
      continue;
    }
    if (!current) {
      current = { items: [] };
      days.push(current);
    }
    const [time, ...rest] = line.split("|");
    current.items.push(rest.length ? { time: time.trim(), activity: rest.join("|").trim() } : { time: "", activity: line });
  }
  return days.filter((d) => d.items.length);
}

/** "Website | https://example.com", one per line. */
export const linksOf = (text: string) =>
  linesOf(text).map((line) => {
    const [label, ...rest] = line.split("|");
    return rest.length ? { label: label.trim(), href: rest.join("|").trim() } : { label: "", href: line };
  });

export interface RoundForm {
  name: string;
  when: string;
  tagline: string;
  body: string;
  scoring: string;
}

export const EMPTY_ROUND: RoundForm = { name: "", when: "", tagline: "", body: "", scoring: "" };

export interface ProposalForm {
  title: string;
  subtitle: string;
  type: string;
  mode: string;
  summary: string;
  start: string;
  end: string;
  location: string;
  maxAttendees: string;
  overview: string;
  highlights: string;
  whoFor: string;
  bring: string;
  schedule: string;
  rounds: RoundForm[];
  speakerName: string;
  speakerTopic: string;
  speakerBio: string;
  speakerLinks: string;
  registrationLabel: string;
  registrationUrl: string;
  imageUrl: string;
  tags: string;
}

export const EMPTY_FORM: ProposalForm = {
  title: "",
  subtitle: "",
  type: "WORKSHOP",
  mode: "in-person",
  summary: "",
  start: "",
  end: "",
  location: "",
  maxAttendees: "50",
  overview: "",
  highlights: "",
  whoFor: "",
  bring: "",
  schedule: "",
  rounds: [],
  speakerName: "",
  speakerTopic: "",
  speakerBio: "",
  speakerLinks: "",
  registrationLabel: "",
  registrationUrl: "",
  imageUrl: "",
  tags: "",
};

/** The request body for POST /api/dashboard/events. Times go as exact moments, so the server and the browser agree on when. */
export function buildProposal(f: ProposalForm) {
  const iso = (local: string) => (local ? new Date(local).toISOString() : undefined);
  const rounds: Round[] = f.rounds.map((r) => ({
    name: r.name,
    when: r.when,
    tagline: r.tagline,
    body: r.body,
    scoring: linesOf(r.scoring),
  }));
  const details: Record<string, unknown> = {
    subtitle: f.subtitle,
    mode: f.mode,
    endsAt: iso(f.end),
    tags: f.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    imageUrl: f.imageUrl.trim() || undefined,
    overview: paragraphsOf(f.overview),
    highlights: linesOf(f.highlights),
    whoFor: f.whoFor,
    bring: linesOf(f.bring),
    schedule: scheduleOf(f.schedule),
    rounds,
    speaker: { name: f.speakerName, topic: f.speakerTopic, bio: f.speakerBio, links: linksOf(f.speakerLinks) },
    registration: { label: f.registrationLabel, href: f.registrationUrl },
  };
  return {
    title: f.title,
    description: f.summary,
    type: f.type,
    location: f.location,
    maxAttendees: Number(f.maxAttendees) || undefined,
    date: iso(f.start),
    details,
  };
}
