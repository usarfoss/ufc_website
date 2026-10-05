"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { CalendarCheck, Flame, Star, Trophy } from "lucide-react";
import { Tape } from "@/components/home/scrap";

/**
 * The year-at-a-glance calendar used for both GitHub and LeetCode: 53 weeks of boxes, a month label above each new month, streak
 * and best-day numbers, and a tooltip. It always draws the whole grid, even for someone with no activity yet, because an empty
 * calendar is still a calendar. The callers fetch the data and pick the colours.
 */
export interface ApiDay {
  date: string;
  count: number;
}

type Cell = { key: string; date: Date; count: number; week: number; weekday: number; level: 0 | 1 | 2 | 3 | 4; future: boolean };

const CELL = 15;
const GAP = 4;
const STEP = CELL + GAP;
const LEFT = 34; // room for weekday labels
const TOP = 24; // room for month labels
const WEEKS = 53;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Local-time "YYYY-MM-DD", so a day is never shifted by the timezone. */
const keyOf = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? "" : "s"}`;

function build(data: ApiDay[]) {
  const counts = new Map(data.map((d) => [d.date.slice(0, 10), d.count]));
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  // Columns are Sunday-first weeks, ending with the week that contains today.
  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay() - (WEEKS - 1) * 7);

  const cells: Cell[] = [];
  let max = 0;
  for (let w = 0; w < WEEKS; w++) {
    for (let d = 0; d < 7; d++) {
      const date = new Date(start);
      date.setDate(start.getDate() + w * 7 + d);
      const key = keyOf(date);
      const count = counts.get(key) ?? 0;
      max = Math.max(max, count);
      cells.push({ key, date, count, week: w, weekday: d, level: 0, future: date > today });
    }
  }
  for (const c of cells) {
    c.level = c.count === 0 || max === 0 ? 0 : (Math.min(4, Math.max(1, Math.ceil((c.count / max) * 4))) as 1 | 2 | 3 | 4);
  }

  const live = cells.filter((c) => !c.future);
  const total = live.reduce((n, c) => n + c.count, 0);
  const activeDays = live.filter((c) => c.count > 0).length;
  const best = live.reduce((b, c) => (c.count > b.count ? c : b), live[0]);

  let longest = 0;
  let run = 0;
  for (const c of live) {
    run = c.count > 0 ? run + 1 : 0;
    longest = Math.max(longest, run);
  }
  // Current streak: today may still be empty (the day isn't over), so don't let that break it.
  let current = 0;
  for (let i = live.length - 1; i >= 0; i--) {
    if (live[i].count > 0) current++;
    else if (i === live.length - 1) continue;
    else break;
  }

  // A month label above the first column that starts in that month, skipping one that would collide with the one before.
  const labels: { x: number; text: string }[] = [];
  let lastMonth = -1;
  for (let w = 0; w < WEEKS; w++) {
    const m = cells[w * 7].date.getMonth();
    if (m !== lastMonth) {
      if (!labels.length || w * STEP - labels[labels.length - 1].x > 38) labels.push({ x: w * STEP, text: MONTHS[m] });
      lastMonth = m;
    }
  }

  return { cells, total, activeDays, best, longest, current, labels };
}

function Stat({ icon, n, label, tone }: { icon: ReactNode; n: ReactNode; label: string; tone: string }) {
  return (
    <li className="flex items-center gap-3 rounded-2xl border-2 border-[var(--ink)] bg-white px-4 py-3 shadow-[3px_3px_0_var(--ink)]">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl border-2 border-[var(--ink)]" style={{ background: tone }}>
        {icon}
      </span>
      <span className="leading-none">
        <span className="block text-[1.5rem] font-extrabold">{n}</span>
        <span className="code mt-1 block text-[0.6rem] font-bold uppercase tracking-widest text-[var(--ink)]/55">{label}</span>
      </span>
    </li>
  );
}

/** The card the calendar sits on: heading, the count in handwriting, and room for whatever state the caller is in. */
export function CalendarCard({
  label,
  eyebrow = "the last 12 months",
  title,
  accent,
  icon,
  count,
  shadow,
  children,
}: {
  label: string;
  eyebrow?: string;
  title: ReactNode;
  accent?: ReactNode;
  icon: ReactNode;
  count?: string;
  /** The colour of the offset shadow under the card. */
  shadow: string;
  children: ReactNode;
}) {
  return (
    <section
      className="relative border-[2.5px] border-[var(--ink)] bg-[var(--cream)] p-6 text-[var(--ink)] sm:p-8"
      style={{ borderRadius: "1.5rem", boxShadow: `7px 7px 0 ${shadow}` }}
      aria-label={label}
    >
      <Tape tone="butter" className="-top-3 left-10" rotate={-5} />
      <Tape tone="signal" className="-top-3 right-16 hidden sm:block" rotate={4} />

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2" style={{ color: shadow }}>
            {eyebrow}
          </p>
          <h2 className="flex items-start gap-3 text-[clamp(1.8rem,3.2vw,2.6rem)] leading-[1.02]">
            <span className="mt-[0.1em] size-[0.95em] shrink-0 [&>svg]:size-full">{icon}</span>
            <span>
              {title}{" "}
              <span className="serif" style={{ color: shadow }}>
                {accent}
              </span>
            </span>
          </h2>
        </div>
        {count && <p className="hand text-[1.7rem] leading-none text-[var(--ink)]/70">{count}</p>}
      </header>

      {children}
    </section>
  );
}

export function ActivityCalendar({
  days,
  unit,
  palette,
  tipShadow,
  footerNote,
  emptyNote,
}: {
  days: ApiDay[];
  /** "contribution", "submission". */
  unit: string;
  /** Five colours, from an empty day to the busiest. */
  palette: readonly [string, string, string, string, string];
  tipShadow: string;
  footerNote: string;
  /** Shown above the grid when there is nothing to show yet. */
  emptyNote?: ReactNode;
}) {
  const [tip, setTip] = useState<{ x: number; y: number; cell: Cell } | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const model = useMemo(() => build(days), [days]);

  // Start scrolled to "now" on narrow screens.
  useEffect(() => {
    if (scroller.current) scroller.current.scrollLeft = scroller.current.scrollWidth;
  }, [model]);

  const width = LEFT + WEEKS * STEP;
  const height = TOP + 7 * STEP;
  const quiet = model.total === 0;

  const showTip = (el: SVGRectElement, cell: Cell) => {
    const f = frame.current?.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    if (f) setTip({ x: r.left - f.left + r.width / 2, y: r.top - f.top, cell });
  };

  return (
    <>
      <ul className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon={<Flame size={20} strokeWidth={2.4} />} n={plural(model.current, "day")} label="current streak" tone="#ffb98a" />
        <Stat icon={<Star size={20} strokeWidth={2.4} />} n={plural(model.longest, "day")} label="longest streak" tone="#ffe36e" />
        <Stat icon={<CalendarCheck size={20} strokeWidth={2.4} />} n={model.activeDays} label="active days" tone="#9af2c6" />
        <Stat
          icon={<Trophy size={20} strokeWidth={2.4} />}
          n={quiet ? "-" : model.best.count}
          label={quiet ? "best day" : `best day, ${model.best.date.toLocaleDateString(undefined, { day: "numeric", month: "short" })}`}
          tone="#c7b3ff"
        />
      </ul>

      {quiet && emptyNote && (
        <div className="mt-6 rounded-2xl border-2 border-dashed border-[var(--ink)]/40 p-5 text-center">{emptyNote}</div>
      )}

      <div ref={frame} className="relative mt-7">
        <div ref={scroller} className="rail overflow-x-auto pb-3 pt-1">
          <svg
            role="img"
            aria-label={`${plural(model.total, unit)} across ${plural(model.activeDays, "active day")} in the last year`}
            viewBox={`0 0 ${width} ${height}`}
            width="100%"
            className="block h-auto max-w-none"
            style={{ minWidth: 760 }}
            onMouseLeave={() => setTip(null)}
          >
            {model.labels.map((l) => (
              <text key={l.text + l.x} x={LEFT + l.x} y={13} className="code" fontSize="11" fontWeight="700" fill="rgba(20,20,15,0.6)">
                {l.text}
              </text>
            ))}
            {[1, 3, 5].map((d) => (
              <text key={d} x={0} y={TOP + d * STEP + CELL - 3} className="code" fontSize="10.5" fontWeight="700" fill="rgba(20,20,15,0.5)">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d]}
              </text>
            ))}
            {model.cells.map((c) =>
              c.future ? null : (
                <rect
                  key={c.key}
                  className="cal-cell"
                  style={{ ["--w" as string]: c.week }}
                  x={LEFT + c.week * STEP}
                  y={TOP + c.weekday * STEP}
                  width={CELL}
                  height={CELL}
                  rx={4}
                  fill={palette[c.level]}
                  stroke="#14140f"
                  strokeOpacity={c.level === 0 ? 0.14 : 0.9}
                  strokeWidth={c.level === 0 ? 1 : 1.6}
                  onMouseEnter={(e) => showTip(e.currentTarget, c)}
                  onFocus={(e) => showTip(e.currentTarget, c)}
                />
              ),
            )}
          </svg>
        </div>

        {tip && (
          <div
            className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full"
            style={{ left: tip.x, top: tip.y - 8 }}
            role="status"
          >
            <div
              className="whitespace-nowrap rounded-xl border-2 border-[var(--ink)] bg-[var(--ink)] px-3 py-2 text-center text-[var(--cream)]"
              style={{ boxShadow: `3px 3px 0 ${tipShadow}` }}
            >
              <p className="text-[0.95rem] font-extrabold leading-none">{plural(tip.cell.count, unit)}</p>
              <p className="code mt-1.5 text-[0.62rem] font-bold uppercase tracking-widest opacity-70">
                {tip.cell.date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
              </p>
            </div>
          </div>
        )}
      </div>

      <footer className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="code text-[0.66rem] font-bold uppercase tracking-widest text-[var(--ink)]/50">{footerNote}</p>
        <div className="flex items-center gap-2 text-[0.8rem] font-bold text-[var(--ink)]/65">
          less
          <span className="flex gap-1.5">
            {palette.map((f, i) => (
              <span
                key={f}
                className="size-4 rounded-[5px] border-[1.5px] border-[var(--ink)]"
                style={{ background: f, borderColor: i === 0 ? "rgba(20,20,15,0.2)" : "#14140f" }}
              />
            ))}
          </span>
          more
        </div>
      </footer>
    </>
  );
}
