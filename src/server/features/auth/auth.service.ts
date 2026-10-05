import "server-only";
import { invalidateCache } from "@/server/cache/cache";
import { isAdminAccount } from "@/server/auth/roles";
import { prisma } from "@/server/db/prisma";
import { clearNeedsSignIn } from "@/server/auth/reauth";
import { clearPollBackoff } from "@/server/features/live/poll-state";
import { NEVER_EXPIRES } from "@/server/integrations/github-token";
import { encryptToken } from "@/server/security/token-encryption";

export interface GitHubIdentity {
  id: number;
  login: string;
  name?: string | null;
  email?: string | null;
  avatar_url?: string | null;
}

const resolveRole = (githubId: string, githubUsername: string): "ADMIN" | "MAINTAINER" =>
  isAdminAccount({ githubId, githubUsername }) ? "ADMIN" : "MAINTAINER";

/** Provisions and links the local profile to GitHub's immutable account identifier. */
export const authService = {
  /** True once a GitHub sync has ever been stored for this user. A brand new member has none, so their dashboard would be empty. */
  async hasStoredStats(userId: string) {
    return (await prisma.gitHubStats.count({ where: { userId } })) > 0;
  },

  /**
   * `tokens` is what GitHub handed over with the access token: a refresh token and the time (in seconds since 1970) the access token stops
   * working. Signing in also puts the member back in good standing: they are no longer asked to sign in again, and the live poll tries them again.
   */
  async upsertGitHubUser(
    profile: GitHubIdentity,
    accessToken: string,
    tokens: { refreshToken?: string | null; expiresAt?: number | null } = {},
  ) {
    const githubId = String(profile.id);
    const role = resolveRole(githubId, profile.login);

    // An account is identified by GitHub's numeric id, which never changes. A username or an email can be handed on to somebody else, so
    // they are never enough to be treated as the same person. The one exception: a profile made before it had an id (it has none yet) is
    // linked by its email.
    const existingUser =
      (await prisma.user.findUnique({ where: { githubId } })) ??
      (profile.email ? await prisma.user.findFirst({ where: { email: profile.email, githubId: null } }) : null);

    // A username belongs to whoever has it now. If another profile still carries it, its owner has renamed their account, so let it go.
    await prisma.user.updateMany({
      where: {
        githubUsername: profile.login,
        ...(existingUser ? { id: { not: existingUser.id } } : {}),
        OR: [{ githubId: null }, { githubId: { not: githubId } }],
      },
      data: { githubUsername: null },
    });

    // An email can only be on one profile. If it is already on somebody else's, we leave this person's email unset rather than fail their sign in.
    const emailTaken =
      !!profile.email &&
      !!(await prisma.user.findFirst({
        where: { email: profile.email, ...(existingUser ? { id: { not: existingUser.id } } : {}) },
        select: { id: true },
      }));

    const data = {
      githubId,
      githubUsername: profile.login,
      email: emailTaken ? undefined : (profile.email ?? undefined),
      avatar: profile.avatar_url ?? undefined,
      name: existingUser?.name ?? profile.name ?? profile.login,
      lastActive: new Date(),
      role,
      githubTokenCiphertext: encryptToken(accessToken),
      githubTokenUpdatedAt: new Date(),
      githubRefreshTokenCiphertext: tokens.refreshToken ? encryptToken(tokens.refreshToken) : null,
      // If GitHub reports no expiry this token does not run out. (A row with no expiry at all is one from before this was recorded.)
      githubTokenExpiresAt: tokens.expiresAt ? new Date(tokens.expiresAt * 1000) : NEVER_EXPIRES,
    };

    const user = existingUser
      ? await prisma.user.update({ where: { id: existingUser.id }, data })
      : await prisma.user.create({ data: { ...data } });

    // A fresh sign in is a good token: stop asking them to sign in again, and let the live poll try them again straight away.
    await Promise.all([clearNeedsSignIn(user.id), clearPollBackoff(user.id)]);
    console.info(
      `Sign in for ${profile.login}: GitHub token ${tokens.expiresAt ? `expires ${new Date(tokens.expiresAt * 1000).toISOString()}` : "has no expiry"}, refresh token ${tokens.refreshToken ? "received" : "not received"}.`,
    );
    await invalidateCache("members");
    return user;
  },
};
