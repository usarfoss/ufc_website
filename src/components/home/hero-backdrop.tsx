"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { Tape } from "./scrap";

/** A cross-hatch of tiny plus signs, like registration marks on a printer's proof. */
const PLUSES: [number, number, string, number][] = [
  [6, 24, "#ffe36e", 0.5],
  [14, 58, "#9bd7ff", 0.4],
  [31, 16, "#ffb3cf", 0.45],
  [47, 9, "#9af2c6", 0.4],
  [58, 46, "#c7b3ff", 0.45],
  [66, 14, "#ffe36e", 0.35],
  [79, 30, "#ffb3cf", 0.4],
  [91, 52, "#9bd7ff", 0.4],
  [38, 64, "#9af2c6", 0.35],
  [23, 80, "#c7b3ff", 0.35],
];

/**
 * The hero's world, back to front: ink → soft colour glows → dot grid (lit under the pointer) →
 * ghost lettering → hand-drawn scribbles → registration marks → torn tape in the corners.
 * Everything is static: nothing here moves on its own.
 */
export function HeroBackdrop() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <div ref={root} className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      {/* glows */}
      <div className="aurora left-[44%] top-[-18%] size-[58vw]" style={{ ["--c" as string]: "rgba(46,229,143,0.28)" }} />
      <div className="aurora -left-[14%] top-[22%] size-[50vw]" style={{ ["--c" as string]: "rgba(199,179,255,0.22)" }} />
      <div className="aurora -right-[12%] top-[48%] size-[46vw]" style={{ ["--c" as string]: "rgba(255,179,207,0.18)" }} />

      {/* dot grid + pointer flashlight */}
      <div className="hero-dots absolute inset-0" />
      <div className="hero-dots-lit absolute inset-0" />

      {/* ghost lettering */}
      <p className="ghost-word absolute -bottom-[5vw] -right-[3vw] -rotate-6 text-[30vw]">OPEN</p>

      {/* hand-lettered doodle, very light */}
      <div className="absolute left-[13%] top-[15%] hidden -rotate-[5deg] select-none sm:block">
        <p className="hand whitespace-nowrap text-[clamp(2.6rem,9vw,8.5rem)] leading-[0.9] tracking-[0.02em] text-[rgba(232,236,227,0.09)]">
          USAR FOSS CLUB
        </p>
        <svg viewBox="0 0 600 24" className="-mt-1 w-[88%]" fill="none" preserveAspectRatio="none">
          <path
            d="M4 14 C 60 2, 110 24, 170 12 S 280 2, 340 14 S 460 24, 520 10 S 580 6, 596 12"
            stroke="rgba(255,227,110,0.16)"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
        <span className="hand absolute -right-6 -top-3 text-[clamp(1.4rem,3.2vw,3rem)] text-[rgba(255,227,110,0.2)]">✦</span>
        <span className="hand absolute -left-5 bottom-3 text-[clamp(1rem,2vw,2rem)] text-[rgba(255,179,207,0.22)]">✦</span>
      </div>

      {/* keep the headline readable */}
      <div className="absolute inset-0 bg-[radial-gradient(55%_48%_at_22%_46%,rgba(9,12,10,0.7),transparent_72%)]" />

      {/* scribbles */}
      <svg className="absolute inset-0 size-full" viewBox="0 0 1440 900" preserveAspectRatio="none" fill="none">
        <path
          d="M-20 690 C 160 600, 250 760, 430 700 S 700 560, 840 640 S 1110 780, 1250 560 S 1380 300, 1470 360"
          stroke="#ffb3cf"
          strokeOpacity="0.3"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="2 12"
        />
        <path
          d="M1010 120 c 30 -34 80 -34 98 2 c 14 30 -20 56 -54 40 c -30 -14 -20 -58 18 -62"
          stroke="#ffe36e"
          strokeOpacity="0.55"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      {PLUSES.map(([x, y, c, o], i) => (
        <span
          key={i}
          className="code absolute text-lg font-bold leading-none"
          style={{ left: `${x}%`, top: `${y}%`, color: c, opacity: o }}
        >
          +
        </span>
      ))}

      {/* one of the wall's hand-drawn flowers, filling the open space beside the headline */}
      <Image
        src="/flowers/flower-10.webp"
        alt=""
        width={205}
        height={212}
        sizes="144px"
        className="absolute left-[68%] top-[31%] hidden w-[clamp(5.5rem,9vw,9rem)] rotate-[14deg] drop-shadow-[0_3px_0_rgba(0,0,0,0.35)] md:block"
        draggable={false}
      />

      {/* tape across the corners */}
      <Tape tone="butter" className="!h-9 !w-[26rem] -left-24 top-24 opacity-90" rotate={-34} />
      <Tape tone="pink" className="!h-9 !w-[22rem] -right-20 top-40 opacity-80" rotate={38} />
    </div>
  );
}
