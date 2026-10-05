import "server-only";
import type { ActivityType, Prisma } from "@prisma/client";

/**
 * How long activity pulled in from outside services is kept. Only GitHub and LeetCode activity expires: it is re-imported on every sync,
 * so old copies are only clutter. Everything about events (proposals, decisions, registrations) and members joining is part of the club's
 * own record and is never deleted or hidden by age.
 *
 * One definition, used by the cleanup job, the GitHub import and every list that shows activity, so they cannot disagree.
 */
export const ACTIVITY_RETENTION_MS = 36 * 60 * 60 * 1000;

/** The kinds of activity that come from a service and so expire. */
export const SERVICE_ACTIVITY_TYPES: ActivityType[] = [
  "COMMIT",
  "PULL_REQUEST",
  "ISSUE",
  "LEETCODE_EASY",
  "LEETCODE_MEDIUM",
  "LEETCODE_HARD",
];

/** Service activity created before this moment is too old to show, keep or re-import. */
export const activityCutoff = () => new Date(Date.now() - ACTIVITY_RETENTION_MS);

/** For lists: everything except service activity that has expired. Event and member activity always passes. */
export const notExpired = (): Prisma.ActivityWhereInput => ({
  OR: [{ type: { notIn: SERVICE_ACTIVITY_TYPES } }, { createdAt: { gte: activityCutoff() } }],
});

/** For the cleanup job: exactly the rows that have expired, and nothing about events. */
export const expired = (): Prisma.ActivityWhereInput => ({ type: { in: SERVICE_ACTIVITY_TYPES }, createdAt: { lt: activityCutoff() } });
