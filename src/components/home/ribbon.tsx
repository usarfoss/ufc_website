"use client";

import { useEffect, useRef } from "react";
import { useScroll, useSpring, useVelocity } from "framer-motion";
import { RIBBON_WORDS } from "./data";
import { StickerArt, type ArtId } from "./sticker-art";

const KINDS = [
  "software people",
  "designers",
  "hardware hackers",
  "roboticists",
  "ML tinkerers",
  "writers",
  "organisers",
  "first-timers",
  "everyone",
];
const CHARMS: ArtId[] = ["heart", "bug", "floppy", "coffee", "sparkle", "rocket", "play", "fork"];
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
  const smooth = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const box = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  // The tape slides on the compositor (a Web Animation), so it costs no main-thread time per frame. Scrolling only
  // changes its playback rate: the track is two identical rows, so sliding 50% of its width and starting over is seamless.
  useEffect(() => {
    const el = track.current;
    const holder = box.current;
    if (!el || !holder || !el.animate) return;
    const dir = Math.sign(speed);
    const base = Math.abs(speed); // percent of the track per second
    const duration = (50 / base) * 1000;
    const anim = el.animate([{ transform: "translateX(-50%)" }, { transform: "translateX(0%)" }], {
      duration,
      iterations: Infinity,
      easing: "linear",
    });
    // Start far from time zero so the tape can run backwards (scrolling up) without hitting the start; `offset` sets where it begins.
    anim.currentTime = duration * (100_000 + (offset + 50) / 50);
    const setRate = (v: number) => {
      const boost = v / 500; // 0 at rest, about +-6 at 3000px/s
      anim.playbackRate = (dir * (base + boost * 2.5)) / base;
    };
    setRate(smooth.get());
    const stop = smooth.on("change", setRate);
    // Nobody can see the tape: pause it (and the little animated charms on it).
    const io = new IntersectionObserver(
      ([e]) => {
        holder.toggleAttribute("data-off", !e.isIntersecting);
        if (e.isIntersecting) anim.play();
        else anim.pause();
      },
      { rootMargin: "100px 0px" },
    );
    io.observe(holder);
    return () => {
      stop();
      io.disconnect();
      anim.cancel();
    };
  }, [speed, offset, smooth]);

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
      ref={box}
      className={`absolute left-[-6%] w-[112%] py-3 shadow-[0_10px_30px_-8px_rgba(0,0,0,0.6)] ${className}`}
      style={{ rotate: `${rotate}deg` }}
      role="presentation"
    >
      <div className="overflow-hidden">
        <div ref={track} className="flex w-max will-change-transform">
          {row}
          {row}
        </div>
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
      <Strip
        words={RIBBON_WORDS}
        rotate={1.6}
        speed={-3.2}
        offset={-20}
        serif
        className="top-[-0.7rem] bg-[var(--butter)] text-[var(--ink)] sm:top-[-0.9rem]"
      />
    </div>
  );
}
