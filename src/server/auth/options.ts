import "server-only";
import type { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { authService } from "@/server/features/auth/auth.service";
import { prisma } from "@/server/db/prisma";
import { syncGitHubUser } from "@/server/features/github/github-sync.service";
import { enqueueGitHubSync } from "@/server/jobs/github-sync";
import { enqueueLeetCodeSync } from "@/server/jobs/leetcode-sync";

interface GitHubProfile {
  id: number;
  login: string;
  name?: string | null;
  email?: string | null;
  avatar_url?: string | null;
}

const asGitHubProfile = (profile: unknown): GitHubProfile | null => {
  if (!profile || typeof profile !== "object") {
    return null;
  }

  const candidate = profile as Partial<GitHubProfile>;

  return typeof candidate.id === "number" && typeof candidate.login === "string"
    ? {
        id: candidate.id,
        login: candidate.login,
        name: candidate.name ?? null,
        email: candidate.email ?? null,
        avatar_url: candidate.avatar_url ?? null,
      }
    : null;
};

/**
 * What GitHub sent with the access token besides the token itself: a refresh token, and when the access token runs out. GitHub gives this
 * app's tokens 8 hours, so the app renews them from the refresh token (see integrations/github-token.ts) instead of asking people to sign in again.
 */
const tokensOf = (account: { refresh_token?: string; expires_at?: number; expires_in?: number }) => ({
  refreshToken: account.refresh_token ?? null,
  expiresAt: account.expires_at ?? (account.expires_in ? Math.floor(Date.now() / 1000) + Number(account.expires_in) : null),
});

/** How long a first sign in will wait for the GitHub sync before letting the person in and finishing it in the background. */
const FIRST_SYNC_WAIT_MS = 7_000;

/** Runs the sync now, but gives up waiting after `ms`. Resolves true only if it finished in time. */
const syncWithin = (userId: string, ms: number) =>
  new Promise<boolean>((resolve) => {
    const timer = setTimeout(() => resolve(false), ms);
    syncGitHubUser(userId)
      .then(() => resolve(true))
      .catch((error) => {
        console.error("The first GitHub sync failed:", error);
        resolve(false);
      })
      .finally(() => clearTimeout(timer));
  });

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID ?? "",
      clientSecret: process.env.GITHUB_SECRET ?? "",
      authorization: {
        params: {
          scope: "read:user user:email read:org",
        },
      },
    }),
  ],
  // Seven days, not the default thirty: the token carries the member's GitHub access token, so it should not live for long.
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
  },
  jwt: { maxAge: 7 * 24 * 60 * 60 },
  callbacks: {
    async signIn({ account, profile }) {
      const githubProfile = asGitHubProfile(profile);

      if (account?.provider !== "github" || !account.access_token || !githubProfile) {
        return false;
      }

      const user = await authService.upsertGitHubUser(githubProfile, account.access_token, tokensOf(account));

      // Someone signing in for the first time has no numbers yet, and the dashboard they land on would show zeros until a background job
      // finished. So the first sign in waits for the sync (up to a few seconds). Later sign ins already have data and sync in the background.
      // LeetCode, if they have linked it, is refreshed in the background on every sign in, the same as GitHub (it never needs the wait).
      if (user.leetcodeUsername) {
        await enqueueLeetCodeSync(user.id, "login").catch((error) => console.error("Unable to enqueue the LeetCode sync:", error));
      }

      if (!(await authService.hasStoredStats(user.id)) && (await syncWithin(user.id, FIRST_SYNC_WAIT_MS))) {
        return true;
      }

      // Wait only for QStash to acknowledge persistence of the job—not for the
      // GitHub sync itself. A fire-and-forget publish can be terminated when a
      // serverless auth request completes, leaving a new user unsynchronised.
      await enqueueGitHubSync(user.id, "login").catch((error) => {
        console.error("Unable to enqueue the initial GitHub sync:", error);
      });
      return true;
    },
    async jwt({ token, account, profile, trigger }) {
      const githubProfile = asGitHubProfile(profile);

      if (account?.provider === "github" && account.access_token && githubProfile) {
        const user = await authService.upsertGitHubUser(githubProfile, account.access_token, tokensOf(account));
        token.userId = user.id;
        token.role = user.role;
        token.githubUsername = user.githubUsername ?? githubProfile.login;
        token.leetcodeUsername = user.leetcodeUsername ?? undefined;
        token.githubAccessToken = account.access_token;
      }

      // The settings page asks for a refresh after someone links or unlinks LeetCode, so the new username shows without signing in again.
      if (trigger === "update" && typeof token.userId === "string") {
        const fresh = await prisma.user.findUnique({ where: { id: token.userId }, select: { leetcodeUsername: true } });
        token.leetcodeUsername = fresh?.leetcodeUsername ?? undefined;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && typeof token.userId === "string") {
        session.user.id = token.userId;
        session.user.role = typeof token.role === "string" ? token.role.toLowerCase() : "member";
        session.user.githubUsername = typeof token.githubUsername === "string" ? token.githubUsername : undefined;
        session.user.leetcodeUsername = typeof token.leetcodeUsername === "string" ? token.leetcodeUsername : undefined;
      }

      return session;
    },
  },
};
