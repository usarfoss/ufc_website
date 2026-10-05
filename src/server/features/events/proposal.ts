import "server-only";
import type { EventType } from "@prisma/client";
import { badRequest } from "@/server/http/api";
import { LIMITS, type EventDetails, type EventMode, type Round, type ScheduleDay, type Speaker } from "@/types/events";

export const EVENT_TYPES = ["WORKSHOP", "HACKATHON", "MEETUP", "CONFERENCE"] as const satisfies readonly EventType[];
const MODES: readonly EventMode[] = ["in-person", "online", "hybrid"];
const DAY_MS = 24 * 60 * 60 * 1000;

export interface ProposalInput {
  title: string;
  description: string;
  date: Date;
  location: string;
  maxAttendees: number;
  type: EventType;
  details: EventDetails;
}

type Range = readonly [number, number];

/** One required piece of text, trimmed, of a sensible length. */
const text = (value: unknown, label: string, [min, max]: Range) => {
  const trimmed = typeof value === "string" ? value.trim() : "";
  if (trimmed.length < min) throw badRequest(min <= 1 ? `${label} can't be empty.` : `${label} needs at least ${min} characters.`);
  if (trimmed.length > max) throw badRequest(`${label} can be at most ${max} characters.`);
  return trimmed;
};

/** A piece of text that may be left out. */
const optionalText = (value: unknown, label: string, max: number) => {
  if (value === undefined || value === null || value === "") return undefined;
  return text(value, label, [1, max]);
};

/** A list of short lines. Blank lines are dropped, and too many is an error rather than a silent cut. */
const lines = (value: unknown, label: string, maxItems: number, maxLength: number) => {
  if (value === undefined || value === null) return undefined;
  if (!Array.isArray(value)) throw badRequest(`${label} should be a list.`);
  const items = value.map((v) => (typeof v === "string" ? v.trim() : "")).filter(Boolean);
  if (items.length > maxItems) throw badRequest(`${label} can have at most ${maxItems} items.`);
  for (const item of items)
    if (item.length > maxLength) throw badRequest(`Each item in ${label.toLowerCase()} can be at most ${maxLength} characters.`);
  return items.length ? items : undefined;
};

/** Only web addresses, so a link can never be a script. */
const url = (value: unknown, label: string) => {
  const raw = typeof value === "string" ? value.trim() : "";
  let parsed: URL | null = null;
  try {
    parsed = new URL(raw);
  } catch {
    /* handled below */
  }
  if (!parsed || !["https:", "http:"].includes(parsed.protocol) || raw.length > 500) {
    throw badRequest(`${label} needs to be a full web address, starting with https://.`);
  }
  return parsed.toString();
};

const objects = (value: unknown, label: string, max: number): Record<string, unknown>[] | undefined => {
  if (value === undefined || value === null) return undefined;
  if (!Array.isArray(value)) throw badRequest(`${label} should be a list.`);
  if (value.length > max) throw badRequest(`${label} can have at most ${max} entries.`);
  return value.filter((v): v is Record<string, unknown> => !!v && typeof v === "object");
};

function parseSchedule(value: unknown): ScheduleDay[] | undefined {
  const days = objects(value, "The schedule", LIMITS.scheduleDays);
  const parsed = (days ?? []).flatMap((day): ScheduleDay[] => {
    const items = (objects(day.items, "A schedule day", LIMITS.scheduleItems) ?? [])
      .map((item) => ({
        time: typeof item.time === "string" ? item.time.trim() : "",
        activity: typeof item.activity === "string" ? item.activity.trim() : "",
      }))
      .filter((item) => item.time || item.activity);
    if (!items.length) return [];
    for (const item of items) {
      if (!item.time || !item.activity) throw badRequest("Every schedule line needs both a time and what happens then.");
      if (item.time.length > 30 || item.activity.length > LIMITS.listItem) throw badRequest("A schedule line is too long.");
    }
    return [{ day: optionalText(day.day, "A day's name", 40), items }];
  });
  return parsed.length ? parsed : undefined;
}

function parseRounds(value: unknown): Round[] | undefined {
  const rounds = (objects(value, "The rounds", LIMITS.rounds) ?? []).flatMap((r): Round[] => {
    const filled = ["name", "when", "tagline", "body"].some((k) => typeof r[k] === "string" && (r[k] as string).trim());
    if (!filled) return [];
    return [
      {
        name: text(r.name, "A round's name", [1, 60]),
        when: text(r.when, "When a round happens", [1, 80]),
        tagline: text(r.tagline, "A round's one-line summary", [1, 120]),
        body: text(r.body, "A round's description", [10, LIMITS.roundField]),
        scoring: lines(r.scoring, "A round's scoring", 8, LIMITS.listItem) ?? [],
      },
    ];
  });
  return rounds.length ? rounds : undefined;
}

function parseSpeaker(value: unknown): Speaker | undefined {
  if (!value || typeof value !== "object") return undefined;
  const s = value as Record<string, unknown>;
  const touched =
    ["name", "bio", "topic"].some((k) => typeof s[k] === "string" && (s[k] as string).trim()) ||
    (Array.isArray(s.links) && s.links.length > 0);
  if (!touched) return undefined;
  const links = (objects(s.links, "The speaker's links", LIMITS.links) ?? [])
    .filter((l) => (typeof l.label === "string" && l.label.trim()) || (typeof l.href === "string" && l.href.trim()))
    .map((l) => ({ label: text(l.label, "A link's label", [1, 40]), href: url(l.href, "A speaker link") }));
  return {
    name: text(s.name, "The speaker's name", [2, 80]),
    bio: text(s.bio, "The speaker's bio", [10, LIMITS.speakerBio]),
    topic: text(s.topic, "The talk's topic", [3, 160]),
    links,
  };
}

/** Turns whatever the client sent into a proposal we are happy to store, or says exactly what is wrong. */
export function parseProposal(body: unknown): ProposalInput {
  if (!body || typeof body !== "object") throw badRequest("Send the event details as JSON.");
  const input = body as Record<string, unknown>;
  const raw = (input.details && typeof input.details === "object" ? input.details : {}) as Record<string, unknown>;

  const now = Date.now();
  const date = new Date(typeof input.date === "string" ? input.date : NaN);
  if (Number.isNaN(date.getTime())) throw badRequest("Pick a valid start date and time.");
  if (date.getTime() < now + 60 * 60 * 1000) throw badRequest("The event has to start at least an hour from now.");
  if (date.getTime() > now + 366 * DAY_MS) throw badRequest("The event has to be within the next year.");

  let endsAt: string | undefined;
  if (raw.endsAt) {
    const end = new Date(typeof raw.endsAt === "string" ? raw.endsAt : NaN);
    if (Number.isNaN(end.getTime())) throw badRequest("Pick a valid end date and time.");
    if (end <= date) throw badRequest("The event has to end after it starts.");
    if (end.getTime() - date.getTime() > 7 * DAY_MS) throw badRequest("An event can run for at most a week.");
    endsAt = end.toISOString();
  }

  const type = typeof input.type === "string" ? input.type.toUpperCase() : "WORKSHOP";
  if (!(EVENT_TYPES as readonly string[]).includes(type)) throw badRequest("That kind of event isn't one we run.");

  const maxAttendees = input.maxAttendees === undefined || input.maxAttendees === "" ? 50 : Number(input.maxAttendees);
  if (!Number.isInteger(maxAttendees) || maxAttendees < 1 || maxAttendees > 1000) {
    throw badRequest("Max attendees must be a whole number from 1 to 1000.");
  }

  const mode = raw.mode === undefined || raw.mode === "" ? undefined : (raw.mode as EventMode);
  if (mode && !MODES.includes(mode)) throw badRequest("Pick in person, online or hybrid.");

  const overview = lines(raw.overview, "The overview", LIMITS.overviewParagraphs, LIMITS.overview[1]) ?? [];
  if (!overview.length) throw badRequest("Tell the story: write at least one paragraph in the overview.");
  if (overview.some((p) => p.length < LIMITS.overview[0]))
    throw badRequest(`Each overview paragraph needs at least ${LIMITS.overview[0]} characters.`);

  const tags = lines(raw.tags, "Tags", LIMITS.tags, LIMITS.tag);
  const registration = raw.registration && typeof raw.registration === "object" ? (raw.registration as Record<string, unknown>) : null;

  const details: EventDetails = {
    subtitle: optionalText(raw.subtitle, "The subtitle", LIMITS.subtitle[1]),
    mode,
    endsAt,
    tags: tags?.map((t) => t.toLowerCase()),
    imageUrl: raw.imageUrl ? url(raw.imageUrl, "The poster address") : undefined,
    overview,
    highlights: lines(raw.highlights, "Highlights", LIMITS.list, LIMITS.listItem),
    whoFor: optionalText(raw.whoFor, "Who it's for", LIMITS.whoFor),
    bring: lines(raw.bring, "What to bring", LIMITS.list, LIMITS.listItem),
    schedule: parseSchedule(raw.schedule),
    rounds: parseRounds(raw.rounds),
    speaker: parseSpeaker(raw.speaker),
    registration:
      registration && (registration.href || registration.label)
        ? {
            label: text(registration.label, "The registration link's label", [1, 60]),
            href: url(registration.href, "The registration link"),
          }
        : undefined,
  };

  // Leave out anything unset, so what we store is exactly what the person wrote.
  const clean = Object.fromEntries(Object.entries(details).filter(([, v]) => v !== undefined)) as unknown as EventDetails;

  return {
    title: text(input.title, "The title", LIMITS.title),
    description: text(input.description, "The summary", LIMITS.summary),
    location: text(input.location, "The location", LIMITS.location),
    date,
    maxAttendees,
    type: type as EventType,
    details: clean,
  };
}
