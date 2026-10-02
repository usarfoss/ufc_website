"use client";

import { motion, useAnimationFrame, useMotionValue, useScroll, useSpring, useTransform, useVelocity } from "framer-motion";
import { RIBBON_WORDS } from "./data";
import { StickerArt, type ArtId } from "./sticker-art";

const KINDS = ["software people", "designers", "hardware hackers", "roboticists", "ML tinkerers", "writers", "organisers", "first-timers", "everyone"];
const CHARMS: ArtId[] = ["heart", "bug", "floppy", "coffee", "sparkle", "rocket", "play", "fork"];
const wrap = (min: number, max: number, v: number) => {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
};

/** One tape. Drifts at a base speed, but lunges forward (or reverses) with the page's scroll velocity. */
function Strip({
  words,
  rotate,
  className,
  speed,
  serif,
  offset = 0,
}: {
  words: readonly string[];
  rotate: number;
  className: string;
  speed: number;
  serif?: boolean;
  offset?: number;
}) {
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, { damping: 50, stiffness: 400 });
  const boost = useTransform(smooth, [-3000, 0, 3000], [-6, 0, 6], { clamp: false });
  const x = useMotionValue(offset);

  useAnimationFrame((_, delta) => {
    // Scrolling down pushes each tape further the way it already travels; scrolling up slows or reverses it.
    const perSecond = speed + Math.sign(speed) * boost.get() * 2.5;
    x.set(wrap(-50, 0, x.get() + perSecond * (delta / 1000)));
  });
  const tx = useTransform(x, (v) => `${v}%`);

  const row = (
    <ul className="flex shrink-0 items-center" aria-hidden="true">
      {words.map((w, i) => (
        <li key={w} className="flex items-center">
          <span className={serif ? "serif px-6 text-3xl sm:text-4xl" : "pixel px-6 text-lg uppercase tracking-wide sm:text-2xl"}>{w}</span>
          <span className="die-flat mx-1 inline-block size-9 sm:size-11" style={{ rotate: `${(i % 2 ? 1 : -1) * (8 + (i % 3) * 5)}deg` }}>
            <StickerArt id={CHARMS[(i + (serif ? 3 : 0)) % CHARMS.length]} className="size-full" />
          </span>
        </li>
      ))}
    </ul>
  );

  return (
    <div
      className={`absolute left-[-6%] w-[112%] py-3 shadow-[0_10px_30px_-8px_rgba(0,0,0,0.6)] ${className}`}
      style={{ rotate: `${rotate}deg` }}
      role="presentation"
    >
      <div className="overflow-hidden">
        <motion.div className="flex w-max" style={{ x: tx }}>
          {row}
          {row}
        </motion.div>
      </div>
    </div>
  );
}

/**
 * Two crossing strips of tape, laid across the seam where the hero meets chapter 1 (so they take no height of their own).
 * Pointer-transparent: stickers resting on the hero floor underneath stay grabbable.
 */
export function Ribbon() {
  return (
    <div className="pointer-events-none relative z-20 h-0" role="presentation">
      <p className="sr-only">
        Open to {KINDS.join(", ")}. {RIBBON_WORDS.join(", ")}.
      </p>
      <Strip words={KINDS} rotate={-1.8} speed={4} className="top-[-3.9rem] bg-[var(--signal)] text-[var(--ink)] sm:top-[-4.4rem]" />
      <Strip words={RIBBON_WORDS} rotate={1.6} speed={-3.2} offset={-20} serif className="top-[-0.7rem] bg-[var(--butter)] text-[var(--ink)] sm:top-[-0.9rem]" />
    </div>
  );
}
