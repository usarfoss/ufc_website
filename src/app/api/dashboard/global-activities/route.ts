import type { NextRequest } from "next/server";
import { getOrSetCached } from "@/server/cache/cache";
import { requireSession } from "@/server/auth/session";
import { prisma } from "@/server/db/prisma";
import { json, withApiErrorHandling } from "@/server/http/api";

export const GET = withApiErrorHandling(async (request: NextRequest) => {
  await requireSession(request);
  const { searchParams } = new URL(request.url);
  const limit = Math.min(Math.max(Number(searchParams.get("limit")) || 50, 1), 100);
  const offset = Math.max(Number(searchParams.get("offset")) || 0, 0);
  const payload = await getOrSetCached("activity-feed", `global:${limit}:${offset}`, 30, async () => {
    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: limit,
        skip: offset,
        include: {
          user: { select: { name: true, githubUsername: true, avatar: true } },
          event: { select: { title: true } },
        },
      }),
      prisma.activity.count(),
    ]);

    const formattedActivities = activities.map((activity) => ({
      id: activity.id,
      type: activity.type.toLowerCase(),
      message: activity.description,
      repo: (activity.metadata as { repo?: string } | null)?.repo || null,
      target: activity.event?.title || "GitHub",
      time: timeAgo(activity.createdAt),
      timestamp: activity.createdAt.toISOString(),
      user: {
        name: activity.user.name || "Anonymous",
        githubUsername: activity.user.githubUsername,
        avatar: activity.user.avatar,
      },
    }));

    return {
      success: true,
      activities: formattedActivities,
      total,
      hasMore: offset + formattedActivities.length < total,
      nextCursor: offset + formattedActivities.length < total ? String(offset + formattedActivities.length) : null,
    };
  });

  return json(payload);
});

function timeAgo(date: Date) {
  const minutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60_000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minutes ago`;
  if (minutes < 1_440) return `${Math.floor(minutes / 60)} hours ago`;
  return `${Math.floor(minutes / 1_440)} days ago`;
}
