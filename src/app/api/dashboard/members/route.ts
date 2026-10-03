import type { NextRequest } from "next/server";
import { getOrSetCached } from "@/server/cache/cache";
import { prisma } from "@/server/db/prisma";
import { json, withApiErrorHandling } from "@/server/http/api";

export const GET = withApiErrorHandling(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(Math.max(Number(searchParams.get("limit")) || 20, 1), 100);
  const offset = Math.max(Number(searchParams.get("offset")) || 0, 0);
  const search = searchParams.get("search")?.trim() || "";
  const sortBy = searchParams.get("sortBy") || "rank";
  const payload = await getOrSetCached("members", `${limit}:${offset}:${sortBy}:${search.toLowerCase()}`, 120, async () => {
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { githubUsername: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
            { location: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy:
          sortBy === "joined" ? { joinedAt: "desc" } : sortBy === "name" ? { name: "asc" } : { githubStats: { contributions: "desc" } },
        select: {
          id: true,
          name: true,
          email: true,
          githubUsername: true,
          location: true,
          bio: true,
          avatar: true,
          joinedAt: true,
          githubStats: { select: { commits: true, pullRequests: true, issues: true, contributions: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);
    const members = users.map((user, index) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      githubUsername: user.githubUsername,
      location: user.location,
      bio: user.bio,
      avatar: user.avatar,
      joinedAt: user.joinedAt.toISOString(),
      rank: offset + index + 1,
      points: (user.githubStats?.commits || 0) + (user.githubStats?.pullRequests || 0) * 5 + (user.githubStats?.issues || 0) * 2,
      githubStats: user.githubStats,
    }));

    return {
      success: true,
      members,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Math.floor(offset / limit) + 1,
      hasMore: offset + members.length < total,
      search: search || null,
    };
  });

  return json(payload);
});
