"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

type Face = "display" | "serif" | "pixel" | "hand" | "code";
type Tile = { bg: string; face: Face; r: number; dy: number; clip: number };

const FACES: Record<Face, React.CSSProperties> = {
  display: { fontFamily: "var(--font-display)", fontWeight: 800, letterSpacing: "-0.05em" },
  serif: { fontFamily: "var(--font-editorial)", fontStyle: "italic", fontWeight: 400 },
  pixel: { fontFamily: "var(--f-pixel)", fontWeight: 700 },
  hand: { fontFamily: "var(--f-hand)", fontWeight: 700 },
  code: { fontFamily: "var(--font-code)", fontWeight: 700, letterSpacing: "-0.08em" },
};

/** Ragged "scissor cut" outlines, so no two tiles look like clean rectangles. */
const CLIPS = [
  "polygon(2% 6%, 18% 0, 40% 4%, 64% 0, 98% 3%, 100% 36%, 96% 68%, 100% 96%, 70% 100%, 38% 96%, 6% 100%, 0 70%, 3% 34%)",
  "polygon(0 4%, 30% 0, 58% 5%, 100% 0, 97% 30%, 100% 62%, 95% 100%, 62% 96%, 30% 100%, 3% 95%, 6% 60%, 0 32%)",
  "polygon(4% 0, 36% 5%, 70% 0, 100% 6%, 96% 38%, 100% 70%, 97% 100%, 66% 95%, 34% 100%, 0 96%, 4% 64%, 0 30%)",
];

const BGS = ["#f7f2e4", "#ffe36e", "#ffb3cf", "#9af2c6", "#c7b3ff", "#9bd7ff", "#ffffff", "#ff9d7a"];
const FACE_ORDER: Face[] = ["display", "serif", "pixel", "hand", "code", "serif", "display"];

/** Deterministic, so SSR and hydration agree. Neighbouring tiles never share a colour. */
function tilesFor(text: string, seed: number): Tile[] {
  return [...text].map((_, i) => {
    const n = (i * 7 + seed * 5) % 17;
    return {
      bg: BGS[(i * 3 + seed) % BGS.length],
      face: FACE_ORDER[(i + seed) % FACE_ORDER.length],
      r: ((n % 7) - 3) * 1.7,
      dy: ((n % 5) - 2) * 0.035,
      clip: (i + seed) % CLIPS.length,
    };
  });
}

/**
 * Ransom-note lettering: every character is its own scrap of paper in its own typeface.
 * Sizes are in em, so it scales with whatever font-size the parent sets.
 */
export function Ransom({
  text,
  seed = 0,
  delay = 0,
  className,
  scale = 1,
  play,
}: {
  text: string;
  seed?: number;
  delay?: number;
  className?: string;
  scale?: number;
  /** Drive the drop-in yourself (e.g. when a scene becomes active). Omit to play once on scroll-into-view. */
  play?: boolean;
}) {
  const tiles = tilesFor(text, seed);
  // Watch the (never-clipped) wrapper, not the tiles: tiles start above any overflow:hidden parent and would never intersect.
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInView(ref, { once: true, margin: "0px 0px -8% 0px" });
  const go = play ?? seen;
  return (
    <span
      ref={ref}
      className={`inline-flex items-end ${className ?? ""}`}
      style={{ gap: "0.03em", fontSize: `${scale}em` }}
      aria-label={text}
      role="text"
    >
      {[...text].map((ch, i) => {
        const t = tiles[i];
        const space = ch === " ";
        return (
          <motion.span
            key={`${ch}-${i}`}
            aria-hidden="true"
            className="relative inline-block select-none text-[#14140f]"
            style={{
              ...FACES[t.face],
              background: space ? "transparent" : t.bg,
              clipPath: space ? undefined : CLIPS[t.clip],
              padding: space ? "0 0.14em" : /[gjpqy]/.test(ch) ? "0.02em 0.1em 0.24em" : "0.02em 0.1em 0.06em", // descenders need room or the scissors cut them off
              lineHeight: 1,
              translate: `0 ${t.dy}em`,
              filter: space ? undefined : "drop-shadow(0 0.035em 0.03em rgba(0,0,0,.45))",
            }}
            initial={{ y: "-1.4em", rotate: t.r - 22, opacity: 0 }}
            animate={go ? { y: 0, rotate: t.r, opacity: 1 } : { y: "-1.4em", rotate: t.r - 22, opacity: 0 }}
            transition={{ type: "spring", stiffness: 150, damping: 13, delay: delay + i * 0.07 }}
            whileHover={{
              rotate: t.r + (i % 2 ? 7 : -7),
              y: "-0.12em",
              scale: 1.1,
              transition: { type: "spring", stiffness: 400, damping: 10 },
            }}
          >
            {space ? " " : ch}
          </motion.span>
        );
      })}
    </span>
  );
}
