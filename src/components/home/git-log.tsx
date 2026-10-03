"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { COMMITS, type Commit } from "./data";
import { MaskLine, Reveal } from "./motion-primitives";
import { ClotheslineLog } from "./clothesline-log";

const LANE_0 = 14; // px from the rail's left edge
const LANE_1 = 44;
const DOT_Y = "1.7rem";

/** One row's slice of the commit graph: main runs top-to-bottom, `talks` is a short-lived branch. */
function GraphRail({ commit, index }: { commit: Commit; index: number }) {
  const onTalks = commit.branch === "talks";
  const isFirst = index === 0;
  const isLast = index === COMMITS.length - 1;
  const prevTalks = COMMITS[index - 1]?.branch === "talks";
  const nextTalks = COMMITS[index + 1]?.branch === "talks";
  const dotX = onTalks ? LANE_1 : LANE_0;

  return (
    <div className="relative w-[64px] shrink-0 sm:w-[76px]" aria-hidden="true">
      {/* main lane. It starts at the first main commit and runs to the genesis commit. */}
      <span
        className="absolute w-px bg-[var(--signal-deep)]"
        style={{ left: LANE_0, top: isFirst || (onTalks && isFirst) ? DOT_Y : 0, bottom: isLast ? `calc(100% - ${DOT_Y})` : 0 }}
      />
      {/* talks lane */}
      {onTalks && (
        <span
          className="absolute w-px bg-[var(--amber)]"
          style={{ left: LANE_1, top: prevTalks ? 0 : DOT_Y, bottom: nextTalks ? 0 : "2.2rem" }}
        />
      )}
      {/* merge curve where `talks` rejoins main */}
      {onTalks && !nextTalks && (
        <svg className="absolute bottom-0 left-0" width={LANE_1 + 4} height="2.2rem" viewBox="0 0 48 35" preserveAspectRatio="none">
          <path d={`M${LANE_1} 0 C ${LANE_1} 20, ${LANE_0} 14, ${LANE_0} 35`} fill="none" stroke="var(--amber)" strokeWidth="1" />
        </svg>
      )}
      <span
        className={`absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-[var(--ink)] ${
          onTalks ? "border-[var(--amber)]" : "border-[var(--signal)]"
        }`}
        style={{ left: dotX, top: DOT_Y }}
      />
    </div>
  );
}

function Refs({ commit, index }: { commit: Commit; index: number }) {
  const refs: { label: string; tone: "head" | "main" | "tag" }[] = [];
  if (index === 0) refs.push({ label: "HEAD → talks", tone: "head" });
  if (commit.hash === "f055f09") refs.push({ label: "main", tone: "main" });
  if (index === COMMITS.length - 1) refs.push({ label: "tag: day-zero", tone: "tag" });
  if (!refs.length) return null;
  const tone = {
    head: "border-[var(--amber)]/50 text-[var(--amber)]",
    main: "border-[var(--signal)]/50 text-[var(--signal)]",
    tag: "border-[var(--line)] text-[var(--text-dim)]",
  } as const;
  return (
    <>
      {refs.map((r) => (
        <span key={r.label} className={`code rounded border px-1.5 py-px text-[0.66rem] ${tone[r.tone]}`}>
          {r.label}
        </span>
      ))}
    </>
  );
}

function CommitRow({ commit, index }: { commit: Commit; index: number }) {
  const Title = (
    <span className="inline-flex items-start gap-2 transition-colors duration-300 group-hover:text-[var(--signal)]">
      {commit.title}
      <ArrowUpRight className="mt-[0.35em] size-[0.55em] shrink-0 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
    </span>
  );

  return (
    <li className="flex">
      <GraphRail commit={commit} index={index} />
      <Reveal className="group min-w-0 flex-1 pb-14 pt-3 sm:pb-16">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between sm:gap-10">
          <div className="min-w-0 max-w-2xl">
            <div className="code mb-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[0.74rem]">
              <span className="text-[var(--signal)]">{commit.hash}</span>
              <Refs commit={commit} index={index} />
              <span className="text-[var(--text-dim)]">{commit.date}</span>
              <span className="text-[var(--text-dim)]/50">· {commit.type}</span>
            </div>
            <h3 className="text-[clamp(1.7rem,3.4vw,2.9rem)] font-semibold leading-[1.02] tracking-[-0.04em]">
              {commit.href ? <Link href={commit.href}>{Title}</Link> : Title}
            </h3>
            <p className="mt-4 max-w-xl leading-relaxed text-[var(--text-dim)]">{commit.summary}</p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {commit.tags.map((t) => (
                <li key={t} className="code rounded-full border border-[var(--line)] px-2.5 py-0.5 text-[0.68rem] text-[var(--text-dim)]">
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {commit.image && (
            <div
              className={`relative shrink-0 overflow-hidden rounded-lg bg-[var(--ink-3)] ring-1 ring-white/10 transition-transform duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06] ${
                commit.aspect === "landscape" ? "aspect-[4/3] w-56 lg:w-72" : "aspect-[3/4] w-36 lg:w-52"
              } ${index % 2 ? "sm:rotate-[2.5deg] group-hover:sm:rotate-0" : "sm:-rotate-[2.5deg] group-hover:sm:rotate-0"}`}
            >
              <Image src={commit.image} alt={commit.imageAlt ?? commit.title} fill sizes="300px" className="object-cover" />
            </div>
          )}
        </div>
      </Reveal>
    </li>
  );
}

export function VerticalLog() {
  return (
    <section className="relative bg-[var(--ink)] py-28 sm:py-40">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mb-16 grid gap-8 lg:mb-24 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <Reveal>
              <p className="eyebrow mb-8 text-[var(--signal)]">§ 04 — the log</p>
            </Reveal>
            <h2 className="text-[clamp(2.6rem,7vw,6.5rem)] font-semibold leading-[0.95] tracking-[-0.055em]">
              <MaskLine inView>Our history is</MaskLine>
              <MaskLine inView delay={0.1}>
                a <span className="serif text-[var(--signal)]">git log.</span>
              </MaskLine>
            </h2>
          </div>
          <Reveal delay={0.15} className="self-end lg:col-span-4">
            <p className="leading-relaxed text-[var(--text-dim)]">
              Few events, done well. We&apos;d rather run a handful a semester that stick than fill a calendar for optics — so every
              commit here is something people actually showed up for.
            </p>
          </Reveal>
        </div>

        <div className="code mb-8 text-[0.8rem] text-[var(--text-dim)]">
          <span className="text-[var(--signal)]">$</span> git log --graph --decorate
        </div>

        <ol>
          {COMMITS.map((c, i) => (
            <CommitRow key={c.hash} commit={c} index={i} />
          ))}
        </ol>

        <Reveal>
          <div className="ml-[64px] sm:ml-[76px]">
            <Link href="/events" className="btn btn-ghost">
              Browse every event
              <span className="disc"><ArrowUpRight size={15} strokeWidth={2.6} /></span>
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/** Phones and tablets get the vertical git graph; wide screens get the swaying clothesline. */
export function GitLog() {
  return (
    <div id="history">
      <div className="lg:hidden">
        <VerticalLog />
      </div>
      <div className="hidden lg:block">
        <ClotheslineLog />
      </div>
    </div>
  );
}
