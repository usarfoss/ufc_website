"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/features/auth/auth-provider";

/** Composes client-wide state at the application root. */
export function AppProviders({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
