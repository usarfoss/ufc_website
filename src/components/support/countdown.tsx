"use client";

import { useSyncExternalStore } from "react";
import { FORGE } from "./support-data";

const START = new Date(FORGE.starts).getTime();
/** The morning after the second day. */
const END = START + 2 * 24 * 60 * 60 * 1000;

// One tick a second. The server (and the first paint in the browser) have no clock to show, so they get 0.
const subscribe = (tick: () => void) => {
  const timer = setInterval(tick, 1000);
  return () => clearInterval(timer);
};
const seconds = () => Math.floor(Date.now() / 1000);
const unknown = () => 0;
const pad = (n: number) => String(n).padStart(2, "0");

/** Time left until the first day of FOSS Forge 2.0, in one line. */
export function Countdown({ big = false }: { big?: boolean }) {
  const now = useSyncExternalStore(subscribe, seconds, unknown) * 1000;
  const ready = now > 0;

  if (ready && now >= END) return <p className="font-bold">FOSS Forge 2.0 is done. Thank you to everyone who backed it.</p>;
  if (ready && now >= START) return <p className="font-bold">It is on right now.</p>;

  const total = ready ? Math.floor((START - now) / 1000) : 0;
  const parts = [
    ["d", ready ? Math.floor(total / 86400) : null],
    ["h", ready ? Math.floor((total % 86400) / 3600) : null],
    ["m", ready ? Math.floor((total % 3600) / 60) : null],
    ["s", ready ? total % 60 : null],
  ] as const;

  if (big) {
    return (
      <p role="timer" aria-label={`Time left until FOSS Forge 2.0 starts on ${FORGE.short}`} className="flex gap-2.5 sm:gap-3">
        {parts.map(([unit, value]) => (
          <span key={unit} className="min-w-[3.6rem] rounded-lg bg-[var(--ink)] px-2 py-2 text-center text-[var(--signal)]">
            <span className="pixel block text-[1.9rem] leading-none tabular-nums">{value === null ? "--" : pad(value)}</span>
            <span className="code mt-1.5 block text-[0.58rem] font-bold uppercase tracking-widest text-[var(--text-dim)]">
              {{ d: "days", h: "hours", m: "mins", s: "secs" }[unit]}
            </span>
          </span>
        ))}
      </p>
    );
  }

  return (
    <p role="timer" aria-label={`Time left until FOSS Forge 2.0 starts on ${FORGE.short}`} className="flex items-baseline gap-x-3">
      {parts.map(([unit, value]) => (
        <span key={unit} className="tabular-nums">
          <span className="pixel text-[1.7rem] leading-none">{value === null ? "--" : pad(value)}</span>
          <span className="code ml-0.5 text-[0.75rem] font-bold uppercase text-[var(--ink)]/55">{unit}</span>
        </span>
      ))}
    </p>
  );
}
