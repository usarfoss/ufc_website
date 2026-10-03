"use client";

import { useMemo, useState } from "react";
import { m } from "framer-motion";
import { Crown, Search, TrendingUp, Users } from "lucide-react";
import { useAuth } from "@/features/auth/auth-provider";
import { GithubIcon } from "@/components/ui/social-icons";
import { Badge, Tape } from "@/components/home/scrap";
import { useApi, useVersionStream } from "@/components/dashboard/use-api";
import { Avatar, Empty, ErrorPanel, Loading, PageHeader, Panel } from "@/components/dashboard/ui";

interface LeaderboardUser {
  id: string;
  name: string;
  githubUsername?: string;
  leetcodeUsername?: string;
  avatar?: string;
  stats: { commits: number; pullRequests: number; issues: number; contributions: number };
  leetcodeStats?: { totalSolved: number; easySolved: number; mediumSolved: number; hardSolved: number } | null;
  githubPoints: number;
  leetcodePoints: number;
  rank: number;
  points: number;
}

type SortBy = "totalPoints" | "github" | "leetcode";
type Row = LeaderboardUser & { score: number; place: number };

const LeetCodeMark = () => (
  <svg className="size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z" />
  </svg>
);

const SORTS: { key: SortBy; label: string; icon: React.ReactNode }[] = [
  { key: "totalPoints", label: "Combined", icon: <TrendingUp size={15} strokeWidth={2.6} /> },
  { key: "github", label: "GitHub", icon: <GithubIcon className="size-4" /> },
  { key: "leetcode", label: "LeetCode", icon: <LeetCodeMark /> },
];

const scoreOf = (u: LeaderboardUser, by: SortBy) => (by === "github" ? u.githubPoints : by === "leetcode" ? u.leetcodePoints : u.points);

/** The same weights the server uses to turn activity into points (app/api/dashboard/leaderboard). */
const RULES = [
  { n: "+1", what: "commit", tone: "#9af2c6" },
  { n: "+5", what: "pull request", tone: "#ffe36e" },
  { n: "+2", what: "issue", tone: "#ffb3cf" },
  { n: "+2", what: "easy problem", tone: "#9af2c6" },
  { n: "+4", what: "medium problem", tone: "#ffe36e" },
  { n: "+6", what: "hard problem", tone: "#ffb3cf" },
];

const PODIUM = [
  { place: 1, label: "1st", bg: "#ffe36e", block: "h-44 sm:h-56", order: "order-2", rot: 0 },
  { place: 2, label: "2nd", bg: "#dfe3e6", block: "h-32 sm:h-40", order: "order-1", rot: -1.5 },
  { place: 3, label: "3rd", bg: "#ffb98a", block: "h-24 sm:h-28", order: "order-3", rot: 1.5 },
];
const MEDAL_BG: Record<number, string> = { 1: "#ffe36e", 2: "#dfe3e6", 3: "#ffb98a" };

function Cell({ n, label, w = "w-[4.25rem]" }: { n?: number; label: string; w?: string }) {
  return (
    <div className={`${w} shrink-0 text-center leading-none`} title={label}>
      <div className={`text-[1.05rem] font-extrabold ${n === undefined ? "text-[var(--ink)]/25" : ""}`}>{n ?? "–"}</div>
    </div>
  );
}

function PodiumSlot({ row, def, by }: { row?: Row; def: (typeof PODIUM)[number]; by: SortBy }) {
  return (
    <div className={`${def.order} flex min-w-0 flex-col items-center`}>
      {row ? (
        <m.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 + (def.place === 1 ? 0.15 : 0), type: "spring", stiffness: 140, damping: 14 }}
          className="relative flex w-full flex-col items-center px-1 text-center"
        >
          {def.place === 1 && <Crown className="mb-1 size-9 -rotate-6 fill-[var(--butter)] text-[var(--ink)]" strokeWidth={2.2} />}
          <Avatar src={row.avatar} name={row.name} size={def.place === 1 ? 92 : 72} className="shadow-[3px_3px_0_var(--ink)]" />
          <p className="mt-3 w-full truncate text-[clamp(1rem,1.8vw,1.35rem)] font-extrabold leading-tight">{row.name}</p>
          {row.githubUsername && <p className="code w-full truncate text-[0.7rem] font-bold text-[var(--ink)]/55">@{row.githubUsername}</p>}
        </m.div>
      ) : (
        <div className="flex w-full flex-col items-center px-1 text-center">
          <span className="grid size-16 place-items-center rounded-full border-2 border-dashed border-[var(--ink)]/45 text-2xl font-extrabold text-[var(--ink)]/40">
            ?
          </span>
          <p className="hand mt-3 text-[1.3rem] leading-none text-[var(--ink)]/55">could be you</p>
        </div>
      )}
      <div
        className={`rise-block relative mt-4 flex w-full flex-col items-center justify-start border-[2.5px] border-b-0 border-[var(--ink)] pt-3 shadow-[5px_0_0_var(--ink)] ${def.block}`}
        style={{
          background: def.bg,
          borderRadius: "1rem 1rem 0 0",
          ["--d" as string]: `${def.place === 1 ? 250 : def.place === 2 ? 100 : 0}ms`,
        }}
      >
        <span className="serif text-[clamp(2.6rem,5vw,4.6rem)] leading-[0.85]">{def.place}</span>
        {row && (
          <span className="code mt-2 rounded-full border-2 border-[var(--ink)] bg-[var(--cream)] px-3 py-0.5 text-[0.78rem] font-bold">
            {scoreOf(row, by)} pts
          </span>
        )}
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [sortBy, setSortBy] = useState<SortBy>("totalPoints");
  const [query, setQuery] = useState("");
  const { data, error, loading, reload, refresh } = useApi<{ users?: LeaderboardUser[] }>("/api/dashboard/leaderboard?sortBy=totalPoints", {
    errorMessage: "We couldn't load the leaderboard just now.",
  });
  const all = useMemo(() => data?.users ?? [], [data]);

  // The server tells us when this changes; refresh quietly, without a loading flash.
  useVersionStream("leaderboard", refresh);

  // Ranked by the current sort. Ties share a place (1, 2, 2, 4), like a real scoreboard.
  const rows: Row[] = useMemo(() => {
    const sorted = [...all].sort((a, b) => scoreOf(b, sortBy) - scoreOf(a, sortBy));
    return sorted.map((u) => {
      const score = scoreOf(u, sortBy);
      const first = sorted.findIndex((x) => scoreOf(x, sortBy) === score);
      return { ...u, score, place: first + 1 };
    });
  }, [all, sortBy]);

  const top = rows[0]?.score ?? 0;
  const isMe = (r: LeaderboardUser) =>
    !!user && (r.id === user.id || (!!user.githubUsername && r.githubUsername?.toLowerCase() === user.githubUsername.toLowerCase()));
  const meIndex = rows.findIndex(isMe);
  const me = meIndex >= 0 ? rows[meIndex] : null;
  const ahead =
    me && meIndex > 0
      ? rows
          .slice(0, meIndex)
          .reverse()
          .find((r) => r.score > me.score)
      : null;

  const filtered = query.trim()
    ? rows.filter((r) => `${r.name} ${r.githubUsername ?? ""}`.toLowerCase().includes(query.trim().toLowerCase()))
    : rows;

  const totals = useMemo(
    () => ({
      members: all.length,
      points: all.reduce((n, u) => n + scoreOf(u, sortBy), 0),
      commits: all.reduce((n, u) => n + u.stats.commits, 0),
      prs: all.reduce((n, u) => n + u.stats.pullRequests, 0),
    }),
    [all, sortBy],
  );

  if (loading) return <Loading label="counting points" />;
  if (error && !all.length) return <ErrorPanel title="Couldn't load the leaderboard" message={error} onRetry={reload} />;

  const showGithub = sortBy !== "leetcode";
  const showLeet = sortBy !== "github";
  const unit = sortBy === "totalPoints" ? "points" : sortBy === "github" ? "github pts" : "leetcode pts";
  const podiumRows = rows.slice(0, 3);

  return (
    <div className="space-y-12">
      <PageHeader
        eyebrow="§ leaderboard · friendly competition"
        title="The club"
        accent="leaderboard."
        tone="pink"
        art="sparkle"
        sub="Points come from commits, pull requests, issues and LeetCode problems. They're for fun, so nobody is competing against you."
      >
        {SORTS.map((s) => (
          <button
            key={s.key}
            onClick={() => setSortBy(s.key)}
            aria-pressed={sortBy === s.key}
            className={`btn btn-sm ${sortBy === s.key ? "btn-ink" : "btn-paper"}`}
          >
            {s.icon}
            {s.label}
          </button>
        ))}
        <span className="ml-auto hidden items-center gap-2 sm:flex">
          <Badge tone="signal" className="!px-3 !py-1 !text-[0.72rem]">
            <span className="mr-2 inline-block size-2 animate-pulse rounded-full bg-[var(--ink)]" />
            updates live
          </Badge>
        </span>
      </PageHeader>

      {rows.length === 0 ? (
        <Empty
          art="rocket"
          title="The board is empty"
          body="Nobody has any points yet. Make a commit, open a PR or solve a problem and it'll show up here."
        />
      ) : (
        <>
          {/* the board in numbers */}
          <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { n: totals.members, l: "on the board", tone: "#c7b3ff" },
              { n: totals.points.toLocaleString(), l: `${unit} earned`, tone: "#ffe36e" },
              { n: totals.commits.toLocaleString(), l: "commits", tone: "#9af2c6" },
              { n: totals.prs.toLocaleString(), l: "pull requests", tone: "#ffb3cf" },
            ].map((s) => (
              <li
                key={s.l}
                className="rounded-2xl border-[2.5px] border-[var(--ink)] px-5 py-4 shadow-[4px_4px_0_var(--ink)]"
                style={{ background: s.tone }}
              >
                <p className="serif text-[clamp(2.2rem,3.6vw,3.2rem)] leading-[0.9]">{s.n}</p>
                <p className="code mt-2 text-[0.64rem] font-bold uppercase tracking-widest text-[var(--ink)]/65">{s.l}</p>
              </li>
            ))}
          </ul>

          {/* where you stand */}
          {me ? (
            <section
              className="relative border-[2.5px] border-[var(--ink)] bg-[var(--ink)] p-6 text-[var(--cream)] shadow-[7px_7px_0_var(--signal)] sm:p-8"
              style={{ borderRadius: "1.5rem" }}
            >
              <Tape tone="signal" className="-top-3 left-10" rotate={-4} />
              <div className="flex flex-wrap items-center gap-x-8 gap-y-5">
                <div className="flex items-center gap-4">
                  <Avatar src={me.avatar} name={me.name} size={64} />
                  <div className="leading-tight">
                    <p className="code text-[0.7rem] font-bold uppercase tracking-widest text-[var(--signal)]">where you stand</p>
                    <p className="serif text-[clamp(3rem,5vw,4.4rem)] leading-[0.9]">#{me.place}</p>
                  </div>
                </div>
                <div className="min-w-[14rem] flex-1">
                  <p className="text-[1.15rem] font-bold leading-snug">
                    {me.place === 1 ? (
                      <>
                        You&apos;re leading the club with <span className="text-[var(--butter)]">{me.score} points</span>. Don&apos;t look
                        back.
                      </>
                    ) : ahead ? (
                      <>
                        <span className="text-[var(--butter)]">
                          {ahead.score - me.score + 1} {ahead.score - me.score + 1 === 1 ? "point" : "points"}
                        </span>{" "}
                        to pass {ahead.name} and move up.
                      </>
                    ) : (
                      <>You&apos;re on the board with {me.score} points.</>
                    )}
                  </p>
                  <div className="mt-3 h-3.5 overflow-hidden rounded-full border-2 border-[var(--cream)]/80 bg-[var(--cream)]/10">
                    <div
                      className="grow-bar h-full rounded-full bg-[var(--signal)]"
                      style={{ width: `${top ? Math.max(4, (me.score / top) * 100) : 0}%` }}
                    />
                  </div>
                  <p className="code mt-1.5 text-[0.66rem] font-bold uppercase tracking-widest opacity-60">
                    {me.score} of the leader&apos;s {top} points
                  </p>
                </div>
              </div>
            </section>
          ) : (
            <Panel tone="sky">
              <p className="hand text-[1.7rem] leading-none">you&apos;re not on the board yet</p>
              <p className="mt-3 max-w-xl text-[var(--ink)]/75">
                Your first commit, pull request or solved problem puts you on it. Your GitHub data syncs on its own in the background after
                you sign in.
              </p>
            </Panel>
          )}

          {/* podium */}
          <section>
            <h2 className="mb-10 flex items-center gap-3 text-[clamp(1.9rem,3.4vw,2.8rem)] leading-none">
              <Crown className="size-8" strokeWidth={2.4} />
              The <span className="serif text-[var(--signal-deep)]">podium.</span>
            </h2>
            <div className="mx-auto grid max-w-3xl grid-cols-3 items-end gap-3 sm:gap-5">
              {PODIUM.map((def) => (
                <PodiumSlot key={def.place} def={def} row={podiumRows[def.place - 1]} by={sortBy} />
              ))}
            </div>
            <div className="mx-auto h-3 max-w-3xl border-2 border-[var(--ink)] bg-[var(--ink)]" aria-hidden="true" />
          </section>

          {/* the table */}
          <section>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <h2 className="text-[clamp(1.9rem,3.4vw,2.8rem)] leading-none">
                Everyone, <span className="serif text-[var(--signal-deep)]">ranked.</span>
              </h2>
              <label className="relative block w-full sm:w-72">
                <span className="sr-only">Find a member</span>
                <Search
                  className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[var(--ink)]/55"
                  strokeWidth={2.8}
                />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Find someone…"
                  className="field !py-2 !pl-11 !text-[0.95rem]"
                />
              </label>
            </div>

            <div
              className="border-[2.5px] border-[var(--ink)] bg-[var(--cream)] shadow-[7px_7px_0_var(--ink)]"
              style={{ borderRadius: "1.25rem" }}
            >
              {/* column heads */}
              <div
                className="code hidden items-center gap-4 border-b-[2.5px] border-[var(--ink)] bg-[var(--ink)] px-5 py-3 text-[0.64rem] font-bold uppercase tracking-widest text-[var(--cream)] md:flex"
                style={{ borderRadius: "1rem 1rem 0 0" }}
              >
                <span className="w-12 text-center">rank</span>
                <span className="min-w-0 flex-1">member</span>
                {showGithub && (
                  <div className="hidden xl:flex">
                    <span className="w-[4.25rem] text-center">commits</span>
                    <span className="w-[4.25rem] text-center">PRs</span>
                    <span className="w-[4.25rem] text-center">issues</span>
                  </div>
                )}
                {showLeet && (
                  <div className="hidden xl:flex">
                    <span className="w-[4.25rem] text-center">easy</span>
                    <span className="w-[4.25rem] text-center">medium</span>
                    <span className="w-[4.25rem] text-center">hard</span>
                  </div>
                )}
                <span className="w-56 text-right">{unit}</span>
              </div>

              {filtered.length === 0 ? (
                <p className="px-6 py-12 text-center text-[var(--ink)]/65">Nobody matches &ldquo;{query}&rdquo;.</p>
              ) : (
                <ol>
                  {filtered.map((r, i) => {
                    const mine = isMe(r);
                    const medal = r.place <= 3 ? MEDAL_BG[r.place] : undefined;
                    return (
                      <m.li
                        key={r.id}
                        layout="position"
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: Math.min(i, 12) * 0.035, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                        className={`flex flex-wrap items-center gap-x-4 gap-y-2 border-b-2 border-dashed border-[var(--ink)]/20 px-4 py-3.5 last:border-b-0 sm:px-5 ${mine ? "bg-[var(--signal)]/35" : ""}`}
                      >
                        <span className="grid w-12 shrink-0 place-items-center">
                          {medal ? (
                            <span
                              className="grid size-10 place-items-center rounded-full border-2 border-[var(--ink)] text-[1.15rem] font-extrabold shadow-[2px_2px_0_var(--ink)]"
                              style={{ background: medal }}
                            >
                              {r.place}
                            </span>
                          ) : (
                            <span className="serif text-[1.9rem] leading-none text-[var(--ink)]/55">{r.place}</span>
                          )}
                        </span>

                        <div className="flex min-w-0 flex-1 basis-44 items-center gap-3">
                          <Avatar src={r.avatar} name={r.name} size={44} />
                          <div className="min-w-0 leading-tight">
                            <p className="flex items-center gap-2 text-[1.05rem] font-extrabold">
                              <span className="truncate">{r.name}</span>
                              {mine && (
                                <span className="pixel shrink-0 rounded-full border-2 border-[var(--ink)] bg-[var(--butter)] px-2 text-[0.68rem] leading-5">
                                  YOU
                                </span>
                              )}
                            </p>
                            {r.githubUsername && (
                              <p className="code truncate text-[0.7rem] font-bold text-[var(--ink)]/55">@{r.githubUsername}</p>
                            )}
                            {/* below xl the stat columns are hidden, so the numbers live under the name */}
                            <p className="mt-0.5 text-[0.74rem] font-semibold text-[var(--ink)]/60 xl:hidden">
                              {showGithub && `${r.stats.commits} commits · ${r.stats.pullRequests} PRs · ${r.stats.issues} issues`}
                              {sortBy === "totalPoints" && r.leetcodeStats ? " · " : ""}
                              {showLeet &&
                                r.leetcodeStats &&
                                `${r.leetcodeStats.easySolved}/${r.leetcodeStats.mediumSolved}/${r.leetcodeStats.hardSolved} E/M/H`}
                            </p>
                          </div>
                        </div>

                        {showGithub && (
                          <div className="hidden xl:flex">
                            <Cell n={r.stats.commits} label="commits" />
                            <Cell n={r.stats.pullRequests} label="pull requests" />
                            <Cell n={r.stats.issues} label="issues" />
                          </div>
                        )}
                        {showLeet && (
                          <div className="hidden xl:flex">
                            <Cell n={r.leetcodeStats?.easySolved} label="easy" />
                            <Cell n={r.leetcodeStats?.mediumSolved} label="medium" />
                            <Cell n={r.leetcodeStats?.hardSolved} label="hard" />
                          </div>
                        )}

                        <div className="w-full shrink-0 sm:w-56">
                          <p className="text-right text-[1.45rem] font-extrabold leading-none">{r.score}</p>
                          <div className="mt-1.5 h-2.5 overflow-hidden rounded-full border-2 border-[var(--ink)] bg-white">
                            <div
                              className="grow-bar h-full rounded-full"
                              style={{
                                width: `${top ? Math.max(3, (r.score / top) * 100) : 0}%`,
                                background: medal ?? "var(--signal)",
                                ["--d" as string]: `${Math.min(i, 12) * 40}ms`,
                              }}
                            />
                          </div>
                        </div>
                      </m.li>
                    );
                  })}
                </ol>
              )}
            </div>
            <p className="code mt-4 flex items-center gap-2 text-[0.66rem] font-bold uppercase tracking-widest text-[var(--ink)]/50">
              <Users size={13} /> showing {filtered.length} of {rows.length}
            </p>
          </section>

          {/* how points work */}
          <section>
            <h2 className="mb-6 text-[clamp(1.9rem,3.4vw,2.8rem)] leading-none">
              How the points <span className="serif text-[var(--signal-deep)]">work.</span>
            </h2>
            <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              {RULES.map((r) => (
                <li
                  key={r.what}
                  className="rounded-2xl border-[2.5px] border-[var(--ink)] px-4 py-4 text-center shadow-[4px_4px_0_var(--ink)]"
                  style={{ background: r.tone }}
                >
                  <p className="serif text-[2.6rem] leading-[0.9]">{r.n}</p>
                  <p className="code mt-2 text-[0.66rem] font-bold uppercase leading-snug tracking-widest text-[var(--ink)]/70">{r.what}</p>
                </li>
              ))}
            </ul>
            <p className="mt-5 max-w-2xl text-[0.98rem] leading-relaxed text-[var(--ink)]/70">
              Combined adds your GitHub and LeetCode points together. The board refreshes by itself, so you can leave this page open and
              watch it move.
            </p>
          </section>
        </>
      )}
    </div>
  );
}
