import "server-only";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { unauthorized } from "@/server/http/api";

export interface AuthSession {
  userId: string;
  role: string;
  githubUsername: string;
  githubAccessToken: string;
}

export async function getSession(request: NextRequest): Promise<AuthSession | null> {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (
    !token ||
    typeof token.userId !== "string" ||
    typeof token.role !== "string" ||
    typeof token.githubUsername !== "string" ||
    typeof token.githubAccessToken !== "string"
  ) {
    return null;
  }

  return {
    userId: token.userId,
    role: token.role,
    githubUsername: token.githubUsername,
    githubAccessToken: token.githubAccessToken,
  };
}

export async function requireSession(request: NextRequest): Promise<AuthSession> {
  const session = await getSession(request);

  if (!session) {
    throw unauthorized();
  }

  return session;
}
