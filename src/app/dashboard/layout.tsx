"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/auth-provider";
import { HomeShell } from "@/components/home/home-shell";
import { Footer } from "@/components/home/footer";
import { DashTabs } from "@/components/dashboard/dash-tabs";
import { SkeletonPage } from "@/components/dashboard/skeleton";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Warm the routes people jump to most.
  useEffect(() => {
    if (!user) return;
    for (const href of ["/dashboard/leaderboard", "/dashboard/members", "/dashboard/activity"]) router.prefetch(href);
  }, [user, router]);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  return (
    <HomeShell>
      <main className="relative min-h-[100svh] bg-[var(--paper)] pb-24 pt-28 text-[var(--ink)] sm:pt-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          {loading || !user ? (
            <SkeletonPage />
          ) : (
            <>
              <DashTabs />
              {children}
            </>
          )}
        </div>
      </main>
      <Footer />
    </HomeShell>
  );
}
