"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Calendar, Home, LogOut, Settings, Shield, Trophy, Users, type LucideIcon } from "lucide-react";
import { useAuth } from "@/features/auth/auth-provider";
import { isStaff } from "./ui";

type Tab = { name: string; href: string; icon: LucideIcon; staff?: boolean };

// Events is staff-only, as before: the page creates and moderates events.
const TABS: Tab[] = [
  { name: "Overview", href: "/dashboard", icon: Home },
  { name: "Leaderboard", href: "/dashboard/leaderboard", icon: Trophy },
  { name: "Events", href: "/dashboard/events", icon: Calendar, staff: true },
  { name: "Members", href: "/dashboard/members", icon: Users },
  { name: "Activity", href: "/dashboard/activity", icon: Activity },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
  { name: "Admin", href: "/dashboard/admin", icon: Shield, staff: true },
];

export function DashTabs() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const staff = isStaff(user?.role);

  return (
    <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
      <nav aria-label="Dashboard" className="rail -mx-1 flex max-w-full gap-2.5 overflow-x-auto px-1 pb-3 pt-1">
        {TABS.filter((t) => !t.staff || staff).map((t) => {
          const on = t.href === "/dashboard" ? pathname === t.href : pathname?.startsWith(t.href);
          const Icon = t.icon;
          return (
            <Link
              key={t.href}
              href={t.href}
              aria-current={on ? "page" : undefined}
              className={`btn btn-sm shrink-0 ${on ? "btn-ink" : t.name === "Admin" ? "btn-butter" : "btn-paper"}`}
              style={on ? { rotate: "-1deg" } : undefined}
            >
              <Icon size={15} strokeWidth={2.6} />
              {t.name}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-3 pb-3">
        <button onClick={() => void logout()} className="btn btn-sm btn-pink">
          Sign out
          <span className="disc"><LogOut size={13} strokeWidth={2.6} /></span>
        </button>
      </div>
    </div>
  );
}
