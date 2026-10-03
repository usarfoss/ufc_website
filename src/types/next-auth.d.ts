import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: string;
      githubUsername?: string;
      leetcodeUsername?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    role?: string;
    githubUsername?: string;
    leetcodeUsername?: string;
    githubAccessToken?: string;
  }
}
