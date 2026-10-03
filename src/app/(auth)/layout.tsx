import type { ReactNode } from "react";

/** The auth pages draw their own page (components/auth); this group only exists to keep /login out of the app shell. */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return children;
}
