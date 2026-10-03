"use client";

import { createContext, type ReactNode, useContext } from "react";
import { SessionProvider, signIn, signOut, useSession } from "next-auth/react";

export interface AuthUser {
  id: string;
  email?: string | null;
  name?: string | null;
  role: string;
  githubUsername?: string;
  leetcodeUsername?: string;
  image?: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  loginWithGitHub: () => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

function AuthStateProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const user = session?.user
    ? {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
        githubUsername: session.user.githubUsername,
        leetcodeUsername: session.user.leetcodeUsername,
        image: session.user.image,
      }
    : null;

  const value: AuthContextValue = {
    user,
    loginWithGitHub: async () => {
      await signIn("github", { callbackUrl: "/dashboard" });
    },
    logout: async () => {
      await signOut({ callbackUrl: "/" });
    },
    loading: status === "loading",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AuthStateProvider>{children}</AuthStateProvider>
    </SessionProvider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
