"use client";

import { LogOut, RefreshCw } from "lucide-react";
import { useAuth } from "@/features/auth/auth-provider";
import { GithubIcon } from "@/components/ui/social-icons";
import { Pin, Tape } from "@/components/home/scrap";
import { Avatar, PageHeader, Panel } from "@/components/dashboard/ui";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b-2 border-dashed border-[var(--ink)]/20 py-3 last:border-0">
      <dt className="code text-[0.72rem] font-bold uppercase tracking-widest text-[var(--ink)]/55">{label}</dt>
      <dd className="font-semibold">{children}</dd>
    </div>
  );
}

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const avatar = user?.image || (user?.githubUsername ? `https://github.com/${user.githubUsername}.png` : null);

  return (
    <div className="space-y-10">
      <PageHeader eyebrow="§ settings · your account" title="Your" accent="settings." tone="sky" art="sun" sub="Your account and integration status, nothing hidden." />

      <div className="grid items-start gap-8 lg:grid-cols-2">
        <Pin r={-1} drag={false}>
          <Panel tone="pink">
            <div className="flex items-center gap-5">
              <Avatar src={avatar} name={user?.name} size={72} />
              <div className="min-w-0">
                <h2 className="truncate text-[1.7rem] leading-tight">{user?.name ?? "Member"}</h2>
                <p className="code text-[0.78rem] font-bold uppercase tracking-widest text-[var(--ink)]/55">{user?.role}</p>
              </div>
            </div>
            <dl className="mt-6">
              <Row label="Email">{user?.email ?? "Not shared"}</Row>
              <Row label="GitHub">{user?.githubUsername ? `@${user.githubUsername}` : "Not connected"}</Row>
              <Row label="LeetCode">{user?.leetcodeUsername ? `@${user.leetcodeUsername}` : "Not linked"}</Row>
            </dl>
            <button onClick={() => void logout()} className="btn btn-pink mt-6">
              Sign out
              <span className="disc"><LogOut size={15} strokeWidth={2.6} /></span>
            </button>
          </Panel>
        </Pin>

        <Pin r={1} drag={false} delay={0.1}>
          <div className="paper relative px-6 pb-7 pt-9 sm:px-8">
            <Tape tone="signal" className="-top-3 right-10" rotate={4} />
            <h2 className="flex items-center gap-3 text-[1.5rem] leading-none">
              <GithubIcon className="size-6" />
              GitHub integration
            </h2>
            <p className="mt-5 text-[1.12rem] font-semibold leading-snug">
              {user?.githubUsername ? (
                <>Connected as <span className="marker rounded-sm px-1" style={{ ["--mark" as string]: "#9af2c6" }}>@{user.githubUsername}</span>.</>
              ) : (
                "No GitHub account is connected right now."
              )}
            </p>
            <p className="mt-4 flex items-start gap-3 text-[0.95rem] leading-relaxed text-[var(--ink)]/70">
              <RefreshCw size={18} strokeWidth={2.4} className="mt-0.5 shrink-0" />
              Your GitHub data syncs on its own, in the background, after you sign in and on a regular refresh. There's no manual sync button because you don't
              need one.
            </p>
          </div>
        </Pin>
      </div>
    </div>
  );
}
