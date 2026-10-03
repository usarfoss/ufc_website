"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Activity, Calendar, GitCommit, GitPullRequest, Star, Trophy, type LucideIcon } from "lucide-react";
import { useAuth } from "@/features/auth/auth-provider";
import { useApi } from "@/components/dashboard/use-api";
import GitHubHeatmap from "@/components/ui/github-heatmap";
import { GithubIcon } from "@/components/ui/social-icons";
import { Pin, Tape } from "@/components/home/scrap";
import { Avatar, Empty, ErrorPanel, InkPanel, Loading, PageHeader, Pager, Panel, pageRange } from "@/components/dashboard/ui";
import { TONE_BG, type Tone } from "@/data/tones";

// d3 is only needed by members who have linked LeetCode, so it is fetched when that card renders rather than with the page.
const LeetCodeHeatmap = dynamic(() => import("@/components/ui/leetcode-heatmap"), { ssr: false });

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

const LeetCodeMark = () => (
  <svg className="size-6 text-[#ffa116]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z" />
  </svg>
);

export default function DashboardPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;
  const statsReq = useApi<{ stats?: DashboardStats }>("/api/dashboard/stats", {
    errorMessage: "We couldn't load your dashboard just now.",
  });
  const activityReq = useApi<{ activities?: RecentActivity[]; total?: number }>(
    `/api/dashboard/activities?limit=${PER_PAGE}&offset=${(page - 1) * PER_PAGE}`,
  );
  const stats = statsReq.data?.stats ?? null;
  const loading = statsReq.loading;
  const error = statsReq.error;
  const recent = activityReq.data?.activities ?? [];
  const activitiesLoading = activityReq.loading;
  const total = activityReq.data?.total ?? 0;
  const pages = Math.ceil(total / PER_PAGE);

  const first = user?.name?.split(" ")[0] || "friend";
  const avatar = user?.image || (user?.githubUsername ? `https://github.com/${user.githubUsername}.png` : null);

  if (loading) return <Loading />;
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
      {user?.leetcodeUsername && (
        <InkPanel title="LeetCode submissions" icon={<LeetCodeMark />}>
          <LeetCodeHeatmap username={user.leetcodeUsername} />
        </InkPanel>
      )}

      {/* recent activity */}
      <section>
        <h2 className="mb-6 text-[clamp(1.9rem,3.4vw,2.8rem)] leading-none">
          Recent <span className="serif text-[var(--signal-deep)]">activity.</span>
        </h2>
        {activitiesLoading ? (
          <Loading label="loading activity" />
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
