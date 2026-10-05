import type { CSSProperties, ReactNode } from "react";
import { Tape } from "@/components/home/scrap";

/**
 * Loading states for the dashboard. Instead of a spinner they show the shape of what is coming: the same paper cards, tape, rounded
 * boxes and calendar grid, drawn as pale dashed outlines that a highlighter stroke sweeps across. When the data arrives the real thing
 * takes the same place, so the page does not jump.
 */

const TAPES = ["butter", "pink", "sky", "lilac", "signal"] as const;

/** One placeholder shape. Give it a size with className, and `delay` to stagger the sweep. */
export function Bone({
  className = "",
  delay = 0,
  ink,
  radius,
  style,
}: {
  className?: string;
  delay?: number;
  ink?: boolean;
  radius?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      aria-hidden="true"
      className={`skel ${ink ? "skel-ink" : ""} block ${className}`}
      style={{ ["--d" as string]: `${delay}s`, ...(radius ? { ["--r" as string]: radius } : {}), ...style }}
    />
  );
}

/** Wraps a skeleton so screen readers hear "loading" once, and sighted people get a small handwritten note. */
export function SkeletonShell({
  label,
  caption,
  children,
  className = "",
}: {
  label: string;
  caption?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div role="status" aria-busy="true" aria-live="polite" className={className}>
      <span className="sr-only">{label}</span>
      {children}
      {caption && (
        <p className="hand mt-8 flex items-center justify-center gap-2 text-[1.5rem] leading-none text-[var(--ink)]/55" aria-hidden="true">
          <span className="skel-pencil" style={{ fontSize: "1.3rem" }}>
            ✎
          </span>
          {caption}
        </p>
      )}
    </div>
  );
}

/** A taped paper card, the same one the real pages use, holding placeholder shapes. */
export function PaperSkel({ index = 0, children, className = "" }: { index?: number; children: ReactNode; className?: string }) {
  return (
    <div
      className={`paper relative px-6 pb-6 pt-9 sm:px-7 ${className}`}
      style={{ rotate: `${[-0.7, 0.6, -0.4, 0.8][index % 4]}deg` }}
      aria-hidden="true"
    >
      <Tape tone={TAPES[index % TAPES.length]} className="-top-3 left-8" rotate={-4} />
      {children}
    </div>
  );
}

/** The page title: a small label, a big two-part title and a line under it. */
export function SkeletonHeader() {
  return (
    <div className="space-y-4" aria-hidden="true">
      <Bone className="h-3.5 w-52" />
      <div className="flex flex-wrap items-end gap-4">
        <Bone className="h-12 w-48 sm:h-16 sm:w-64" radius="0.8rem" delay={0.1} />
        <Bone className="h-12 w-56 sm:h-16 sm:w-72" radius="0.8rem" delay={0.2} ink />
      </div>
      <Bone className="h-4 w-full max-w-lg" delay={0.3} />
    </div>
  );
}

/** Event, member and review cards: a taped paper with chips, a title, a few lines and a button. */
export function SkeletonCards({ count = 4, className = "grid gap-x-8 gap-y-10 md:grid-cols-2" }: { count?: number; className?: string }) {
  return (
    <ul className={className} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <li key={i}>
          <PaperSkel index={i} className="h-full">
            <div className="flex gap-2">
              <Bone className="h-6 w-20" radius="999px" delay={i * 0.12} />
              <Bone className="h-6 w-16" radius="999px" delay={i * 0.12 + 0.1} />
            </div>
            <Bone className="mt-5 h-8 w-4/5" radius="0.7rem" delay={i * 0.12 + 0.15} ink />
            <div className="mt-4 space-y-2.5">
              <Bone className="h-3.5 w-full" delay={i * 0.12 + 0.2} />
              <Bone className="h-3.5 w-11/12" delay={i * 0.12 + 0.25} />
              <Bone className="h-3.5 w-2/3" delay={i * 0.12 + 0.3} />
            </div>
            <div className="mt-6 flex items-center gap-3 border-t-2 border-dashed border-[var(--ink)]/20 pt-4">
              <Bone className="size-8 shrink-0" radius="999px" delay={i * 0.12 + 0.35} />
              <Bone className="h-3.5 w-32" delay={i * 0.12 + 0.4} />
            </div>
            <Bone className="mt-5 h-10 w-full" radius="999px" delay={i * 0.12 + 0.45} ink />
          </PaperSkel>
        </li>
      ))}
    </ul>
  );
}

/** Rows with a round picture, two lines and a chip on the right. Used for the activity feed and the leaderboard. */
export function SkeletonRows({ count = 6 }: { count?: number }) {
  return (
    <ul className="space-y-4" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <li
          key={i}
          className="flex items-center gap-4 rounded-2xl border-[2.5px] border-[var(--ink)]/25 border-dashed bg-[var(--cream)] p-4 sm:p-5"
          style={{ opacity: 1 - i * 0.09 }}
        >
          <Bone className="size-11 shrink-0" radius="999px" delay={i * 0.1} ink />
          <div className="min-w-0 flex-1 space-y-2.5">
            <Bone className="h-4 w-3/5" delay={i * 0.1 + 0.1} />
            <Bone className="h-3 w-2/5" delay={i * 0.1 + 0.2} />
          </div>
          <Bone className="hidden h-7 w-20 sm:block" radius="999px" delay={i * 0.1 + 0.3} />
        </li>
      ))}
    </ul>
  );
}

/** The calendar's grid of boxes, filling in like ink spreading. The very shape of the real calendar, so nothing moves when it arrives. */
export function SkeletonCalendar() {
  return (
    <div className="mt-7" aria-hidden="true">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Bone key={i} className="h-[4.25rem]" radius="1rem" delay={i * 0.12} />
        ))}
      </div>
      <div className="rail mt-7 overflow-x-auto pb-3">
        <div className="flex min-w-[760px] gap-[4px]">
          {Array.from({ length: 53 }, (_, w) => (
            <div key={w} className="flex flex-1 flex-col gap-[4px]">
              {Array.from({ length: 7 }, (_, d) => (
                <span
                  key={d}
                  className="skel-cell block aspect-square rounded-[4px] border border-[var(--ink)]/20 bg-[var(--ink)]/10"
                  style={{ ["--w" as string]: w + d }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** The overview: a polaroid, three stat cards, the calendar, and the first rows of activity. */
export function SkeletonDashboard() {
  return (
    <SkeletonShell label="Loading your dashboard" caption="sketching your dashboard" className="space-y-12">
      <SkeletonHeader />
      <div className="grid items-start gap-8 lg:grid-cols-12">
        <div className="lg:col-span-3" aria-hidden="true">
          <div className="polaroid relative mx-auto max-w-[15rem] -rotate-2 p-3 pb-4">
            <Tape tone="pink" className="-top-3 left-1/2 -translate-x-1/2" rotate={-3} />
            <Bone className="aspect-square w-full" radius="0.2rem" ink />
            <Bone className="mt-3 h-5 w-2/3" delay={0.2} />
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-3 lg:col-span-9">
          {[0, 1, 2].map((i) => (
            <PaperSkel key={i} index={i}>
              <Bone className="h-16 w-24" radius="0.8rem" delay={i * 0.15} ink />
              <Bone className="mt-4 h-3 w-28" delay={i * 0.15 + 0.1} />
            </PaperSkel>
          ))}
        </div>
      </div>
      <div className="rounded-3xl border-[2.5px] border-dashed border-[var(--ink)]/30 bg-[var(--cream)] p-6 sm:p-8" aria-hidden="true">
        <Bone className="h-3.5 w-36" />
        <Bone className="mt-3 h-10 w-72 max-w-full" radius="0.8rem" delay={0.1} ink />
        <SkeletonCalendar />
      </div>
      <div>
        <Bone className="mb-6 h-10 w-56" radius="0.8rem" ink />
        <SkeletonRows count={3} />
      </div>
    </SkeletonShell>
  );
}

/** The leaderboard: three podium steps, then the rows. */
export function SkeletonLeaderboard() {
  return (
    <SkeletonShell label="Counting points" caption="counting points" className="space-y-12">
      <SkeletonHeader />
      <div className="grid items-end gap-6 sm:grid-cols-3" aria-hidden="true">
        {[1, 0, 2].map((rank, i) => (
          <PaperSkel key={i} index={i}>
            <Bone className="mx-auto size-16" radius="999px" delay={i * 0.12} ink />
            <Bone className="mx-auto mt-4 h-5 w-32" delay={i * 0.12 + 0.1} />
            <Bone className="mx-auto mt-3 h-9 w-24" radius="0.7rem" delay={i * 0.12 + 0.2} />
            <div style={{ height: rank === 0 ? "3rem" : rank === 1 ? "1.5rem" : "0.5rem" }} />
          </PaperSkel>
        ))}
      </div>
      <SkeletonRows count={6} />
    </SkeletonShell>
  );
}

/** A generic page, for the moment before we know which one it is: the tab strip, a title and a few cards. */
export function SkeletonPage() {
  return (
    <SkeletonShell label="Checking your pass" caption="checking your pass" className="space-y-10">
      <div className="flex gap-2.5" aria-hidden="true">
        {[24, 32, 20, 28, 24].map((w, i) => (
          <Bone key={i} className="h-10" radius="999px" style={{ width: `${w * 4}px` }} delay={i * 0.1} />
        ))}
      </div>
      <SkeletonHeader />
      <SkeletonCards count={4} />
    </SkeletonShell>
  );
}
