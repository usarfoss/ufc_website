"use client";

import type { ReactNode } from "react";
import { LazyMotion } from "framer-motion";
import { AuthProvider } from "@/features/auth/auth-provider";

// The animation engine loads after first paint instead of shipping with the first bundle. `strict` makes any
// leftover full-size `motion.*` component throw in development, so the saving can't quietly regress.
const loadFeatures = () => import("@/components/motion-features").then((mod) => mod.default);

/** Composes client-wide state at the application root. */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <AuthProvider>{children}</AuthProvider>
    </LazyMotion>
  );
}
