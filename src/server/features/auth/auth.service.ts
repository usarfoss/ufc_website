import "server-only";
import { invalidateCache } from "@/server/cache/cache";
import { prisma } from "@/server/db/prisma";
import { encryptToken } from "@/server/security/token-encryption";

export interface GitHubIdentity {
  id: number;
  login: string;
  name?: string | null;
  email?: string | null;
  avatar_url?: string | null;
}

const resolveRole = (githubUsername: string): "ADMIN" | "MAINTAINER" =>
  githubUsername.toLowerCase() === process.env.ADMIN_GITHUB_USERNAME?.toLowerCase() ? "ADMIN" : "MAINTAINER";

/** Provisions and links the local profile to GitHub's immutable account identifier. */
export const authService = {
  async upsertGitHubUser(profile: GitHubIdentity, accessToken: string) {
    const githubId = String(profile.id);
    const role = resolveRole(profile.login);
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ githubId }, { githubUsername: profile.login }, ...(profile.email ? [{ email: profile.email }] : [])],
      },
    });

    const data = {
      githubId,
      githubUsername: profile.login,
      email: profile.email ?? undefined,
      avatar: profile.avatar_url ?? undefined,
      name: existingUser?.name ?? profile.name ?? profile.login,
      lastActive: new Date(),
      role,
      githubTokenCiphertext: encryptToken(accessToken),
      githubTokenUpdatedAt: new Date(),
    };

    if (existingUser) {
      const user = await prisma.user.update({
        where: { id: existingUser.id },
        data,
      });
      await invalidateCache("members");
      return user;
    }

    const user = await prisma.user.create({
      data: {
        ...data,
      },
    });
    await invalidateCache("members");
    return user;
  },
};
