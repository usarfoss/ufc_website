"use client";

import { useEffect, useState } from "react";
import { Activity, Calendar, GitCommit, GitPullRequest, Star, Trophy, type LucideIcon } from "lucide-react";
import { useAuth } from "@/features/auth/auth-provider";
import { useApi, useVersionStream } from "@/components/dashboard/use-api";
import GitHubHeatmap from "@/components/ui/github-heatmap";
import LeetCodeHeatmap from "@/components/ui/leetcode-heatmap";
import { GithubIcon } from "@/components/ui/social-icons";
import { Pin, Tape } from "@/components/home/scrap";
import { Avatar, Empty, ErrorPanel, PageHeader, Pager, Panel, pageRange } from "@/components/dashboard/ui";
import { SkeletonDashboard, SkeletonRows } from "@/components/dashboard/skeleton";
import { TONE_BG, type Tone } from "@/data/tones";

interface Stat {
  value: string;
  change: string;
  icon: string;
  color: string;
}
interface DashboardStats {
  totalCommits: Stat;
  pullRequests: Stat;
  leaderboardRank: Stat;
}
interface RecentActivity {
  type: string;
  message: string;
  repo: string;
  time: string;
  user?: { name: string; githubUsername?: string };
}

const ICONS: Record<string, LucideIcon> = { GitCommit, GitPullRequest, Trophy, Star };
const STAT_META: Record<keyof DashboardStats, { label: string; tone: Tone }> = {
  totalCommits: { label: "Total commits", tone: "mint" },
  pullRequests: { label: "Pull requests", tone: "butter" },
  leaderboardRank: { label: "Leaderboard rank", tone: "pink" },
};

const ACTIVITY: Record<string, { icon: LucideIcon; tone: Tone }> = {
  commit: { icon: GitCommit, tone: "mint" },
  pull_request: { icon: GitPullRequest, tone: "butter" },
  event_join: { icon: Calendar, tone: "lilac" },
  issue: { icon: Activity, tone: "pink" },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;
  const statsReq = useApi<{ stats?: DashboardStats; lastSynced?: string | null }>("/api/dashboard/stats", {
    errorMessage: "We couldn't load your dashboard just now.",
  });
  const activityReq = useApi<{ activities?: RecentActivity[]; total?: number }>(
    `/api/dashboard/activities?limit=${PER_PAGE}&offset=${(page - 1) * PER_PAGE}`,
  );
  const stats = statsReq.data?.stats ?? null;

  // A brand new member has not been synced yet, so the first numbers arrive a few seconds after they land here. Pick them up when
  // the server says they changed, and check on a timer too (for deployments without the live stream), for about a minute.
  const waitingForSync = statsReq.data !== null && !statsReq.data.lastSynced;
  const { refresh: refreshStats } = statsReq;
  const { refresh: refreshActivity } = activityReq;
  useVersionStream("dashboard", refreshStats);
  useVersionStream("activity-feed", refreshActivity);
  useEffect(() => {
    if (!waitingForSync) return;
    let tries = 0;
    const timer = window.setInterval(() => {
      refreshStats();
      refreshActivity();
      if (++tries >= 15) window.clearInterval(timer);
    }, 4_000);
    return () => window.clearInterval(timer);
  }, [waitingForSync, refreshStats, refreshActivity]);
  const loading = statsReq.loading;
  const error = statsReq.error;
  const recent = activityReq.data?.activities ?? [];
  const activitiesLoading = activityReq.loading;
  const total = activityReq.data?.total ?? 0;
  const pages = Math.ceil(total / PER_PAGE);

  const first = user?.name?.split(" ")[0] || "friend";
  const avatar = user?.image || (user?.githubUsername ? `https://github.com/${user.githubUsername}.png` : null);

  if (loading) return <SkeletonDashboard />;
  if (error) return <ErrorPanel title="Something went sideways" message={error} onRetry={statsReq.reload} />;

  const statKeys = stats ? (Object.keys(STAT_META) as (keyof DashboardStats)[]).filter((k) => stats[k]) : [];

  return (
    <div className="space-y-12">
      <PageHeader
        eyebrow="§ overview · your dashboard"
        title="Welcome back,"
        accent={`${first}.`}
        tone="butter"
        art="fork"
        sub="Here's what's been happening with your contributions."
      >
        {user?.githubUsername && (
          <a href={`https://github.com/${user.githubUsername}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-ink">
            <GithubIcon className="size-4" />@{user.githubUsername}
          </a>
        )}
      </PageHeader>

      {waitingForSync && (
        <Panel>
          <p className="text-[1.05rem]">
            <span className="font-bold">Syncing your GitHub history.</span> Your commits and pull requests are being counted right now. This
            takes a few seconds, and this page fills in by itself.
          </p>
        </Panel>
      )}

      {/* identity + stats */}
      <div className="grid items-start gap-8 lg:grid-cols-12">
        <Pin r={-2.5} drag={false} className="lg:col-span-3">
          <figure className="polaroid relative mx-auto max-w-[15rem]">
            <Tape tone="pink" className="-top-3 left-1/2 -translate-x-1/2" rotate={-3} />
            <Avatar src={avatar} name={user?.name} size={216} className="!size-auto aspect-square w-full !rounded-none !border-0" />
            <figcaption className="hand px-1 pb-2 pt-2 text-[1.5rem] leading-none">{user?.name ?? "you"}</figcaption>
          </figure>
        </Pin>

        <div className="grid gap-6 sm:grid-cols-3 lg:col-span-9">
          {stats ? (
            statKeys.map((k, i) => {
              const s = stats[k];
              const Icon = ICONS[s.icon] ?? Activity;
              const meta = STAT_META[k];
              return (
                <Pin key={k} r={[-1.6, 1.4, -1][i % 3]} drag={false} delay={i * 0.08}>
                  <div className="paper relative px-6 pb-6 pt-9">
                    <Tape tone={(["signal", "butter", "pink"] as const)[i % 3]} className="-top-3 left-1/2 -translate-x-1/2" rotate={-2} />
                    <span
                      className="absolute -right-3 -top-5 grid size-12 rotate-6 place-items-center rounded-2xl border-2 border-[var(--ink)] shadow-[3px_3px_0_var(--ink)]"
                      style={{ background: TONE_BG[meta.tone] }}
                    >
                      <Icon size={22} strokeWidth={2.4} />
                    </span>
                    <p className="serif text-[clamp(3.4rem,5.4vw,5rem)] leading-[0.9]">{s.value}</p>
                    <p className="code mt-3 text-[0.72rem] font-bold uppercase tracking-widest text-[var(--ink)]/60">{meta.label}</p>
                  </div>
                </Pin>
              );
            })
          ) : (
            <Panel className="sm:col-span-3">
              <p className="text-[1.05rem]">
                No numbers yet. Your GitHub data syncs in the background after you sign in, so check back in a little while.
              </p>
            </Panel>
          )}
        </div>
      </div>

      {/* heatmaps */}
      {user?.githubUsername && <GitHubHeatmap username={user.githubUsername} />}
      {user?.leetcodeUsername && <LeetCodeHeatmap username={user.leetcodeUsername} />}

      {/* recent activity */}
      <section>
        <h2 className="mb-6 text-[clamp(1.9rem,3.4vw,2.8rem)] leading-none">
          Recent <span className="serif text-[var(--signal-deep)]">activity.</span>
        </h2>
        {activitiesLoading ? (
          <SkeletonRows count={3} />
        ) : recent.length ? (
          <ul className="space-y-4">
            {recent.map((a, i) => {
              const meta = ACTIVITY[a.type] ?? { icon: Activity, tone: "sky" as Tone };
              const Icon = meta.icon;
              return (
                <li
                  key={i}
                  className="flex items-start gap-4 rounded-2xl border-[2.5px] border-[var(--ink)] bg-[var(--cream)] p-4 shadow-[4px_4px_0_var(--ink)] sm:p-5"
                >
                  <span
                    className="grid size-11 shrink-0 place-items-center rounded-full border-2 border-[var(--ink)]"
                    style={{ background: TONE_BG[meta.tone] }}
                  >
                    <Icon size={19} strokeWidth={2.4} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="leading-snug">
                      {a.user && (
                        <span className="font-extrabold">
                          {a.user.name}
                          {a.user.githubUsername && (
                            <span className="font-medium text-[var(--ink)]/55"> @{a.user.githubUsername}</span>
                          )}{" "}
                        </span>
                      )}
                      {a.message}
                    </p>
                    <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.85rem]">
                      {a.repo && (
                        <span
                          className="code rounded-md border-2 border-[var(--ink)] px-1.5 text-[0.72rem] font-bold"
                          style={{ background: TONE_BG[meta.tone] }}
                        >
                          {a.repo}
                        </span>
                      )}
                      <span className="text-[var(--ink)]/55">{a.time}</span>
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <Empty art="rocket" title="Nothing here yet" body="Start contributing and your activity will show up here." />
        )}
        <Pager page={page} pages={pages} onChange={setPage} label={pageRange(page, PER_PAGE, total, "activities")} />
      </section>
    </div>
  );
}
