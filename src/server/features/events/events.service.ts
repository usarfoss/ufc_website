import "server-only";
import { Prisma, type ApprovalStatus, type Event, type EventStatus } from "@prisma/client";
import { getCached, getOrSetCached, invalidateCache, setCached } from "@/server/cache/cache";
import { prisma } from "@/server/db/prisma";
import { isAdminAccount } from "@/server/auth/roles";
import { badRequest, conflict, forbidden, notFound, tooManyRequests, unauthorized } from "@/server/http/api";
import type { EventDetails } from "@/types/events";
import type { ProposalInput } from "./proposal";

/**
 * The life of an event, as a pipeline. Each step is one function here, and the routes only call them.
 *
 *   propose  ->  review queue  ->  decide (approve or reject)  ->  published  ->  registration  ->  past
 *                    ^                                   |
 *                    +--- withdraw (the proposer, while it is still waiting)
 *
 * Rules that hold at every step:
 *  - Anyone signed in can propose, but no more than PROPOSALS_PER_DAY in any rolling 24 hours. Withdrawn and rejected
 *    proposals still count, so the limit cannot be dodged by cancelling.
 *  - Only an admin can decide. Admins' own proposals skip the queue (they would only be approving themselves).
 *  - A decision happens exactly once. Two admins clicking at the same moment cannot both win.
 *  - A decision and the notice to the proposer are written together or not at all.
 *  - Only approved events are public. A proposal is visible to its proposer and to admins, nobody else.
 */

export const PROPOSALS_PER_DAY = 5;
const DAY_MS = 24 * 60 * 60 * 1000;

export const VIEWS = ["upcoming", "past", "pending", "rejected", "all"] as const;
export type EventView = (typeof VIEWS)[number];

export { EVENT_TYPES, parseProposal, type ProposalInput } from "./proposal";
import { assertStartsInTime } from "./proposal";

export interface Viewer {
  id: string;
}

/* ------------------------------------------------------------------------------------------------ roles and limits */

/** "ADMIN" or "MAINTAINER" (every other signed in member), decided by the live admin list, never by the sign in token or a stored copy. */
async function roleOf(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { githubId: true, githubUsername: true } });
  if (!user) throw unauthorized();
  return isAdminAccount(user) ? "ADMIN" : "MAINTAINER";
}

/** Checked on every call, so taking someone off the admin list stops them at once. */
async function requireAdmin(userId: string) {
  if ((await roleOf(userId)) !== "ADMIN") throw forbidden("Only an admin can review events.");
}

export interface Quota {
  limit: number;
  used: number;
  remaining: number;
  /** When one more proposal becomes possible, or null if there is room now. */
  resetsAt: string | null;
}

const quotaFrom = (createdAts: Date[]): Quota => {
  const used = createdAts.length;
  const remaining = Math.max(0, PROPOSALS_PER_DAY - used);
  // The oldest proposal that still counts is the one that has to age out before there is room again.
  const frees = remaining === 0 ? createdAts[used - PROPOSALS_PER_DAY] : undefined;
  return { limit: PROPOSALS_PER_DAY, used, remaining, resetsAt: frees ? new Date(frees.getTime() + DAY_MS).toISOString() : null };
};

const recentProposals = (db: Prisma.TransactionClient | typeof prisma, creatorId: string) =>
  db.event.findMany({
    where: { creatorId, createdAt: { gte: new Date(Date.now() - DAY_MS) } },
    orderBy: { createdAt: "asc" },
    select: { createdAt: true },
  });

export async function getQuota(userId: string): Promise<Quota> {
  return quotaFrom((await recentProposals(prisma, userId)).map((e) => e.createdAt));
}

/* ------------------------------------------------------------------------------------------------ the shape we send out */

const withPeople = {
  creator: { select: { name: true, githubUsername: true } },
  reviewedBy: { select: { name: true, githubUsername: true } },
} as const;
type EventWithPeople = Prisma.EventGetPayload<{ include: typeof withPeople & { _count: { select: { attendees: true } } } }>;

/** An approved event whose date has gone by is complete. We work that out when we read it, so nothing has to flip a flag at midnight. */
const displayStatus = (event: Pick<Event, "status" | "date">): EventStatus =>
  event.status === "UPCOMING" && event.date.getTime() < Date.now() ? "COMPLETED" : event.status;

function present(event: EventWithPeople, viewer: { id: string; admin: boolean } | null, registered: Set<string>, withDetails = false) {
  const mine = !!viewer && event.creatorId === viewer.id;
  const details = (event.details ?? null) as EventDetails | null;
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    date: event.date.toISOString(),
    location: event.location,
    maxAttendees: event.maxAttendees,
    currentAttendees: event._count.attendees,
    type: event.type.toLowerCase(),
    subtitle: details?.subtitle,
    tags: details?.tags ?? [],
    // The full write-up is only sent when one event is opened, so the list stays light.
    details: withDetails ? (details ?? undefined) : undefined,
    status: displayStatus(event).toLowerCase(),
    approvalStatus: event.approvalStatus.toLowerCase(),
    // Why something was turned down is for the person who proposed it and the admins, not the whole club.
    rejectionReason: mine || viewer?.admin ? (event.rejectionReason ?? undefined) : undefined,
    reviewedAt: event.reviewedAt?.toISOString(),
    createdAt: event.createdAt.toISOString(),
    /** Changes whenever the event does. An edit sends it back, so two people editing at once cannot silently overwrite each other. */
    updatedAt: event.updatedAt.toISOString(),
    creator: { name: event.creator.name || "Unknown", githubUsername: event.creator.githubUsername },
    reviewedBy: event.reviewedBy
      ? { name: event.reviewedBy.name || "An admin", githubUsername: event.reviewedBy.githubUsername }
      : undefined,
    isRegistered: registered.has(event.id),
    isMine: mine,
  };
}

/* ------------------------------------------------------------------------------------------------ reading */

/** Who may see which events. Public: approved ones. A proposer also sees their own. Admins see everything. */
function visibility(view: EventView, viewer: { id: string; admin: boolean } | null): Prisma.EventWhereInput {
  const now = new Date();
  const approved: Prisma.EventWhereInput = { approvalStatus: "APPROVED", status: { not: "CANCELLED" } };
  const scope = (status: ApprovalStatus): Prisma.EventWhereInput =>
    !viewer ? { id: "none" } : viewer.admin ? { approvalStatus: status } : { approvalStatus: status, creatorId: viewer.id };

  switch (view) {
    case "upcoming":
      return { ...approved, date: { gte: now } };
    case "past":
      return { ...approved, date: { lt: now } };
    case "pending":
      return { ...scope("PENDING"), status: { not: "CANCELLED" } };
    case "rejected":
      return scope("REJECTED");
    case "all":
      if (viewer?.admin) return {};
      return viewer ? { OR: [approved, { creatorId: viewer.id }] } : approved;
  }
}

/** What a cached public page holds: the events as everyone sees them, plus who proposed each so we can mark the viewer's own. */
type PublicPage = { events: (ReturnType<typeof present> & { creatorId: string })[]; total: number; hasMore: boolean };

/**
 * The public lists (upcoming and past) are the same for everybody, so they are built once and kept in Redis for a minute. Any change
 * (a proposal, a decision, a registration) clears them. What differs per person (are you registered, is it yours, how many proposals
 * you have left) is added on top afterwards, and that part is cheap.
 */
const publicPage = (view: EventView, limit: number, offset: number) =>
  getOrSetCached<PublicPage>("events", `list:${view}:${limit}:${offset}`, 60, async () => {
    const where = visibility(view, null);
    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        orderBy: view === "upcoming" ? { date: "asc" } : { date: "desc" },
        take: limit,
        skip: offset,
        include: { ...withPeople, _count: { select: { attendees: true } } },
      }),
      prisma.event.count({ where }),
    ]);
    return {
      events: events.map((e) => ({ ...present(e, null, new Set()), creatorId: e.creatorId })),
      total,
      hasMore: offset + events.length < total,
    };
  });

/** Adds the parts that belong to one viewer to events that came from the shared cache. */
async function forViewer<T extends { id: string; creatorId: string }>(events: T[], viewerId: string | null) {
  const registered = new Set(
    viewerId && events.length
      ? (
          await prisma.eventAttendee.findMany({
            where: { userId: viewerId, eventId: { in: events.map((e) => e.id) } },
            select: { eventId: true },
          })
        ).map((a) => a.eventId)
      : [],
  );
  return events.map(({ creatorId, ...event }) => ({ ...event, isMine: creatorId === viewerId, isRegistered: registered.has(event.id) }));
}

export async function listEvents(viewerId: string | null, options: { view: EventView; limit: number; offset: number }) {
  const viewer = viewerId ? { id: viewerId, admin: (await roleOf(viewerId).catch(() => null)) === "ADMIN" } : null;
  const quota = viewer ? getQuota(viewer.id) : Promise.resolve(null);

  // Upcoming and past are public, so they are shared and cached. Proposals (pending, rejected, all) depend on who is asking, so they are not.
  if (options.view === "upcoming" || options.view === "past") {
    const page = await publicPage(options.view, options.limit, options.offset);
    return {
      events: await forViewer(page.events, viewerId),
      total: page.total,
      hasMore: page.hasMore,
      isAdmin: viewer?.admin ?? false,
      quota: await quota,
    };
  }

  const where = visibility(options.view, viewer);
  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      // Waiting proposals oldest first, everything else newest first.
      orderBy: options.view === "pending" ? { createdAt: "asc" } : { date: "desc" },
      take: options.limit,
      skip: options.offset,
      include: { ...withPeople, _count: { select: { attendees: true } } },
    }),
    prisma.event.count({ where }),
  ]);

  const registered = new Set(
    viewer && events.length
      ? (
          await prisma.eventAttendee.findMany({
            where: { userId: viewer.id, eventId: { in: events.map((e) => e.id) } },
            select: { eventId: true },
          })
        ).map((a) => a.eventId)
      : [],
  );

  return {
    events: events.map((e) => present(e, viewer, registered)),
    total,
    hasMore: options.offset + events.length < total,
    isAdmin: viewer?.admin ?? false,
    quota: await quota,
  };
}

/** One event with its whole write-up, if this viewer is allowed to see it (approved: anyone. Otherwise its proposer, or an admin). */
export async function getEventDetail(eventId: string, viewerId: string | null) {
  const load = async () => {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { ...withPeople, _count: { select: { attendees: true } } },
    });
    return event;
  };

  // An approved event reads the same for everybody, so its write-up is cached like the lists. Only approved events are stored: unknown ids and
  // proposals are never cached, so nobody can fill the cache by asking for made-up addresses.
  type PublicDetail = ReturnType<typeof present> & { creatorId: string };
  const key = `detail:${eventId}`;
  let cached = await getCached<PublicDetail>("events", key);
  if (!cached) {
    const event = await load();
    if (event && event.approvalStatus === "APPROVED" && event.status !== "CANCELLED") {
      cached = { ...present(event, null, new Set(), true), creatorId: event.creatorId };
      await setCached("events", key, cached, 60);
    }
  }

  if (cached) return (await forViewer([cached], viewerId))[0];

  // Not public (or not there at all): only its proposer or an admin may see it, and that is not cached.
  const viewer = viewerId ? { id: viewerId, admin: (await roleOf(viewerId).catch(() => null)) === "ADMIN" } : null;
  const event = await load();
  if (!event || !(viewer?.admin || (!!viewer && event.creatorId === viewer.id))) throw notFound("That event doesn't exist.");
  return present(event, viewer, new Set(), true);
}

/** The review queue: oldest first, so nobody's proposal waits behind a newer one. */
export async function listReviewQueue(adminId: string) {
  await requireAdmin(adminId);
  const events = await prisma.event.findMany({
    where: { approvalStatus: "PENDING", status: { not: "CANCELLED" } },
    orderBy: { createdAt: "asc" },
    include: { ...withPeople, _count: { select: { attendees: true } } },
  });
  return events.map((e) => present(e, { id: adminId, admin: true }, new Set(), true));
}

/* ------------------------------------------------------------------------------------------------ writing */

/**
 * Takes the lock that makes "count, then insert" safe. Without it two requests sent at the same moment would both
 * see four proposals and both be allowed a fifth. The lock is per key, so it never slows down anyone else, and it is
 * released by itself when the transaction ends.
 */
const lock = (tx: Prisma.TransactionClient, key: string) => tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${key}))`;

export async function proposeEvent(creatorId: string, input: ProposalInput) {
  const admin = (await roleOf(creatorId)) === "ADMIN";

  const result = await prisma.$transaction(async (tx) => {
    await lock(tx, `event-proposal:${creatorId}`);

    const recent = (await recentProposals(tx, creatorId)).map((e) => e.createdAt);
    const quota = quotaFrom(recent);
    if (quota.remaining === 0) {
      const wait = (new Date(quota.resetsAt!).getTime() - Date.now()) / 1000;
      throw tooManyRequests(`You can propose ${PROPOSALS_PER_DAY} events a day, and you've used them all.`, wait, { quota });
    }

    const duplicate = await tx.event.findFirst({
      where: {
        creatorId,
        title: { equals: input.title, mode: "insensitive" },
        date: input.date,
        approvalStatus: { in: ["PENDING", "APPROVED"] },
        status: { not: "CANCELLED" },
      },
      select: { id: true },
    });
    if (duplicate) throw conflict("You've already proposed this event.");

    const now = new Date();
    const event = await tx.event.create({
      data: {
        ...input,
        details: input.details as unknown as Prisma.InputJsonValue,
        status: "UPCOMING",
        creatorId,
        // An admin's own event does not wait for an admin.
        approvalStatus: admin ? "APPROVED" : "PENDING",
        reviewedById: admin ? creatorId : null,
        reviewedAt: admin ? now : null,
      },
      select: { id: true, title: true, approvalStatus: true },
    });

    await tx.activity.createMany({
      data: [
        { type: "EVENT_PROPOSAL", userId: creatorId, eventId: event.id, description: `You proposed "${event.title}"` },
        ...(admin
          ? [{ type: "EVENT_CREATE" as const, userId: creatorId, eventId: event.id, description: `New event: "${event.title}"` }]
          : []),
      ],
    });

    return { event, quota: quotaFrom([...recent, now]) };
  });

  await invalidateCache("activity-feed", "dashboard", "events");
  return { id: result.event.id, approvalStatus: result.event.approvalStatus.toLowerCase(), quota: result.quota };
}

/**
 * Approve or reject a waiting proposal. The `where` clause is the whole concurrency story: it only matches an event that is
 * still waiting, so if two admins decide at once, one update changes a row and the other changes none and gets a 409.
 */
export async function decideEvent(options: { eventId: string; adminId: string; decision: "approve" | "reject"; reason?: string }) {
  const { eventId, adminId, decision } = options;
  await requireAdmin(adminId);

  const reason = options.reason?.trim();
  if (decision === "reject" && (!reason || reason.length < 5)) {
    throw badRequest("Say why, in a few words, so the proposer knows what to change.");
  }
  if (reason && reason.length > 500) throw badRequest("Keep the reason under 500 characters.");

  const event = await prisma.$transaction(async (tx) => {
    const now = new Date();
    const changed = await tx.event.updateMany({
      where: {
        id: eventId,
        approvalStatus: "PENDING",
        status: { not: "CANCELLED" },
        ...(decision === "approve" ? { date: { gt: now } } : {}),
      },
      data: {
        approvalStatus: decision === "approve" ? "APPROVED" : "REJECTED",
        reviewedById: adminId,
        reviewedAt: now,
        rejectionReason: decision === "reject" ? reason : null,
      },
    });

    const event = await tx.event.findUnique({
      where: { id: eventId },
      select: { id: true, title: true, creatorId: true, approvalStatus: true, status: true, date: true },
    });
    if (!event) throw notFound("That event doesn't exist.");

    if (changed.count === 0) {
      if (event.status === "CANCELLED") throw conflict("The proposer withdrew this event.");
      if (event.approvalStatus !== "PENDING") throw conflict(`Someone already ${event.approvalStatus.toLowerCase()} this event.`);
      throw badRequest("That event's date has already passed, so it can't be approved. Reject it, or ask for a new date.");
    }

    // The notice is written in the same transaction as the decision, so there is never a decision nobody was told about.
    await tx.activity.createMany({
      data:
        decision === "approve"
          ? [
              {
                type: "EVENT_APPROVED",
                userId: event.creatorId,
                eventId,
                description: `"${event.title}" was approved and is now open for registration.`,
              },
              { type: "EVENT_CREATE", userId: event.creatorId, eventId, description: `New event: "${event.title}"` },
            ]
          : [{ type: "EVENT_REJECTED", userId: event.creatorId, eventId, description: `"${event.title}" wasn't approved: ${reason}` }],
    });

    return event;
  });

  await invalidateCache("activity-feed", "dashboard", "events");
  return { id: event.id, approvalStatus: decision === "approve" ? "approved" : "rejected" };
}

const minute = (value: Date | string | null | undefined) => (value ? Math.floor(new Date(value).getTime() / 60_000) : null);

/**
 * Edit an event. The rules:
 *  - The person who proposed it can edit it, and so can an admin. Nobody else can tell it exists unless it is public.
 *  - A withdrawn proposal, or an event that has already started, cannot be edited.
 *  - While it is waiting for review, the proposer can change anything. If it was turned down, editing it sends it back to the review queue
 *    (that is how you answer a "no").
 *  - Once it is approved, people may have registered, so only an admin can change the title, when and where it happens, or what kind of event
 *    it is. The proposer can still improve everything else (the description, schedule, speaker, links and so on) and can raise the number of seats.
 *  - Seats can never go below the number of people already registered.
 *  - An edit has to carry the `updatedAt` it started from. If the event changed in the meantime, it is refused rather than overwriting that.
 */
export async function updateEvent(options: { eventId: string; userId: string; input: ProposalInput; expectedUpdatedAt?: string }) {
  const { eventId, userId, input } = options;
  const admin = (await roleOf(userId)) === "ADMIN";

  const result = await prisma.$transaction(async (tx) => {
    await lock(tx, `event-edit:${eventId}`);

    const event = await tx.event.findUnique({ where: { id: eventId }, include: { _count: { select: { attendees: true } } } });
    const mine = !!event && event.creatorId === userId;
    if (!event || !(mine || admin)) throw notFound("That event doesn't exist.");
    if (event.status === "CANCELLED") throw conflict("A withdrawn proposal can't be edited. Propose it again instead.");
    if (event.date.getTime() < Date.now()) throw conflict("That event has already started, so it can't be edited.");
    if (options.expectedUpdatedAt && new Date(options.expectedUpdatedAt).getTime() !== event.updatedAt.getTime()) {
      throw conflict("Someone changed this event after you opened it. Close it and open it again to see their changes.");
    }

    const before = (event.details ?? {}) as unknown as Partial<EventDetails>;
    const startMoved = minute(input.date) !== minute(event.date);
    if (startMoved) assertStartsInTime(input.date);

    if (!admin && event.approvalStatus === "APPROVED") {
      const material =
        input.title !== event.title ||
        input.location !== event.location ||
        input.type !== event.type ||
        startMoved ||
        minute(input.details.endsAt) !== minute(before.endsAt) ||
        (input.details.mode ?? null) !== (before.mode ?? null);
      if (material) {
        throw forbidden(
          "Once an event is approved, only an admin can change its title, date, place or kind, because people may have registered.",
        );
      }
    }

    if (input.maxAttendees < event._count.attendees) {
      throw badRequest(
        `${event._count.attendees} ${event._count.attendees === 1 ? "person has" : "people have"} already registered, so there have to be at least that many seats.`,
      );
    }

    // Answering a "no": the proposer edits it and it goes back to the queue. An admin editing someone else's event leaves its status alone.
    const resubmit = mine && !admin && event.approvalStatus === "REJECTED";

    await tx.event.update({
      where: { id: eventId },
      data: {
        title: input.title,
        description: input.description,
        date: input.date,
        location: input.location,
        maxAttendees: input.maxAttendees,
        type: input.type,
        details: input.details as unknown as Prisma.InputJsonValue,
        ...(resubmit ? { approvalStatus: "PENDING", rejectionReason: null, reviewedAt: null, reviewedById: null } : {}),
      },
    });
    if (resubmit) {
      await tx.activity.create({
        data: { type: "EVENT_PROPOSAL", userId, eventId, description: `You edited "${input.title}" and sent it back for review` },
      });
    }

    const next = await tx.event.findUniqueOrThrow({ where: { id: eventId }, select: { approvalStatus: true, updatedAt: true } });
    return { resubmitted: resubmit, approvalStatus: next.approvalStatus, updatedAt: next.updatedAt };
  });

  await invalidateCache("activity-feed", "dashboard", "events");
  return {
    id: eventId,
    approvalStatus: result.approvalStatus.toLowerCase(),
    resubmitted: result.resubmitted,
    updatedAt: result.updatedAt.toISOString(),
  };
}

/** The proposer takes back a proposal that is still waiting. It stays on their record and still counts toward their daily limit. */
export async function withdrawEvent(eventId: string, userId: string) {
  const changed = await prisma.event.updateMany({
    where: { id: eventId, creatorId: userId, approvalStatus: "PENDING", status: { not: "CANCELLED" } },
    data: { status: "CANCELLED" },
  });

  if (changed.count === 0) {
    const event = await prisma.event.findFirst({ where: { id: eventId, creatorId: userId }, select: { approvalStatus: true } });
    if (!event) throw notFound("You don't have a proposal like that.");
    throw conflict("It has already been decided, so it can't be withdrawn.");
  }

  await invalidateCache("activity-feed", "dashboard", "events");
  return { id: eventId };
}

/** Sign someone up. The capacity check and the sign up happen together under a lock, so the last seat can't be sold twice. */
export async function registerForEvent(eventId: string, userId: string) {
  const event = await prisma.$transaction(async (tx) => {
    await lock(tx, `event-register:${eventId}`);

    const event = await tx.event.findUnique({ where: { id: eventId }, include: { _count: { select: { attendees: true } } } });
    if (!event || event.approvalStatus !== "APPROVED" || event.status === "CANCELLED")
      throw notFound("That event isn't open for registration.");
    if (displayStatus(event) !== "UPCOMING") throw badRequest("That event has already happened.");
    if (event._count.attendees >= event.maxAttendees) throw conflict("That event is full.");

    const already = await tx.eventAttendee.findUnique({ where: { userId_eventId: { userId, eventId } }, select: { id: true } });
    if (already) throw conflict("You're already registered for this event.");

    await tx.eventAttendee.create({ data: { userId, eventId } });
    await tx.activity.create({
      data: {
        type: "EVENT_JOIN",
        userId,
        eventId,
        description: `Registered for "${event.title}"`,
        metadata: { eventTitle: event.title, eventType: event.type, eventDate: event.date.toISOString() },
      },
    });
    return event;
  });

  await invalidateCache("activity-feed", "dashboard", "events");
  return { id: event.id };
}
