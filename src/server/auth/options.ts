import "server-only";
import type { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { authService } from "@/server/features/auth/auth.service";
import { enqueueGitHubSync } from "@/server/jobs/github-sync";

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
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ account, profile }) {
      const githubProfile = asGitHubProfile(profile);

      if (account?.provider !== "github" || !account.access_token || !githubProfile) {
        return false;
      }

      const user = await authService.upsertGitHubUser(githubProfile, account.access_token);
      // Wait only for QStash to acknowledge persistence of the job—not for the
      // GitHub sync itself. A fire-and-forget publish can be terminated when a
      // serverless auth request completes, leaving a new user unsynchronised.
      await enqueueGitHubSync(user.id, "login").catch((error) => {
        console.error("Unable to enqueue the initial GitHub sync:", error);
      });
      return true;
    },
    async jwt({ token, account, profile }) {
      const githubProfile = asGitHubProfile(profile);

      if (account?.provider === "github" && account.access_token && githubProfile) {
        const user = await authService.upsertGitHubUser(githubProfile, account.access_token);
        token.userId = user.id;
        token.role = user.role;
        token.githubUsername = user.githubUsername ?? githubProfile.login;
        token.leetcodeUsername = user.leetcodeUsername ?? undefined;
        token.githubAccessToken = account.access_token;
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
