"use client";

import { useState } from "react";
import { Activity, Calendar, GitCommit, GitPullRequest, type LucideIcon } from "lucide-react";
import { useApi, useVersionStream } from "@/components/dashboard/use-api";
import { Avatar, Empty, ErrorPanel, PageHeader, Pager, pageRange } from "@/components/dashboard/ui";
import { TONE_BG, type Tone } from "@/data/tones";
import { SkeletonRows, SkeletonShell } from "@/components/dashboard/skeleton";

interface ActivityItem {
  id: string;
  type: string;
  message: string;
  repo?: string;
  target?: string;
  time: string;
  timestamp: string;
  user?: { name: string; githubUsername?: string; avatar?: string };
}

const KINDS: Record<string, { icon: LucideIcon; tone: Tone }> = {
  commit: { icon: GitCommit, tone: "mint" },
  pull_request: { icon: GitPullRequest, tone: "butter" },
  issue: { icon: Activity, tone: "pink" },
  event_join: { icon: Calendar, tone: "lilac" },
};

const PER_PAGE = 20;

type FeedResponse = { activities?: ActivityItem[]; total?: number };

export default function ActivityPage() {
  const [page, setPage] = useState(1);
  const { data, error, loading, reload, refresh } = useApi<FeedResponse>(
    `/api/dashboard/global-activities?limit=${PER_PAGE}&offset=${(page - 1) * PER_PAGE}`,
    { timeoutMs: 30_000, errorMessage: "We couldn't load the activity feed just now." },
  );
  const items = data?.activities ?? [];
  const total = data?.total ?? 0;
  const pages = Math.ceil(total / PER_PAGE);

  // The server tells us when this changes; refresh quietly, without a loading flash.
  useVersionStream("activity-feed", refresh);

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="§ activity · what everyone's up to"
        title="Community"
        accent="activity."
        tone="mint"
        art="rocket"
        sub="Commits, pull requests and issues from across the club, as they happen."
      />

      {loading ? (
        <SkeletonShell label="Loading the feed" caption="loading the feed">
          <SkeletonRows count={7} />
        </SkeletonShell>
      ) : error ? (
        <ErrorPanel title="Couldn't load the feed" message={error} onRetry={reload} />
      ) : items.length === 0 ? (
        <Empty art="rocket" title="No activity yet" body="Start contributing and it will show up here." />
      ) : (
        <ul className="space-y-4">
          {items.map((a, i) => {
            const kind = KINDS[a.type.toLowerCase()] ?? { icon: Activity, tone: "sky" as Tone };
            const Icon = kind.icon;
            const avatar = a.user?.avatar || (a.user?.githubUsername ? `https://github.com/${a.user.githubUsername}.png` : null);
            return (
              <li
                key={`${a.id}-${a.timestamp}-${i}`}
                className="flex items-start gap-4 rounded-2xl border-[2.5px] border-[var(--ink)] bg-[var(--cream)] p-4 shadow-[4px_4px_0_var(--ink)] sm:p-5"
              >
                <span className="relative shrink-0">
                  {a.user ? (
                    <Avatar src={avatar} name={a.user.name} size={48} />
                  ) : (
                    <span
                      className="grid size-12 place-items-center rounded-full border-2 border-[var(--ink)]"
                      style={{ background: TONE_BG[kind.tone] }}
                    >
                      <Icon size={20} strokeWidth={2.4} />
                    </span>
                  )}
                  {a.user && (
                    <span
                      className="absolute -bottom-1 -right-1 grid size-6 place-items-center rounded-full border-2 border-[var(--ink)]"
                      style={{ background: TONE_BG[kind.tone] }}
                    >
                      <Icon size={12} strokeWidth={2.8} />
                    </span>
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="leading-snug">
                    {a.user && (
                      <span className="font-extrabold">
                        {a.user.name}
                        {a.user.githubUsername && <span className="font-medium text-[var(--ink)]/55"> @{a.user.githubUsername}</span>}{" "}
                      </span>
                    )}
                    {a.message}
                  </p>
                  <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                    {a.repo && (
                      <span
                        className="code rounded-md border-2 border-[var(--ink)] px-1.5 text-[0.72rem] font-bold"
                        style={{ background: TONE_BG[kind.tone] }}
                      >
                        {a.repo}
                      </span>
                    )}
                    {a.target && a.target !== a.repo && (
                      <span className="code rounded-md border-2 border-[var(--ink)] bg-white px-1.5 text-[0.72rem] font-bold">
                        {a.target}
                      </span>
                    )}
                    <span className="text-[0.85rem] text-[var(--ink)]/55">{a.time}</span>
                  </p>
                </div>
                <span
                  className="code hidden shrink-0 rounded-full border-2 border-[var(--ink)] px-3 py-0.5 text-[0.68rem] font-bold uppercase tracking-widest sm:block"
                  style={{ background: TONE_BG[kind.tone] }}
                >
                  {a.type.replace("_", " ")}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      <Pager page={page} pages={pages} onChange={setPage} label={pageRange(page, PER_PAGE, total, "activities")} />
    </div>
  );
}
