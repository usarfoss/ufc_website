"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useSpring, useTransform, useVelocity, type MotionValue } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { GitGudSVG } from "@/components/event-svgs/GitGudSVG";
import { COMMITS, type Commit } from "./data";
import { StickerArt } from "./sticker-art";
import { TornEdge } from "./torn-edge";

const CARD_W = 250;
const PITCH = 372;
const PAD_L = 150;
const END_PAD = 560;
const ROPE_Y = 24;
const SAG = 20;

const LOG = [...COMMITS].reverse(); // oldest → newest, so scrolling moves forward in time

/** A wooden clothes-peg. `tone` is the commit's branch colour. */
function Peg({ tone }: { tone: string }) {
  return (
    <svg viewBox="0 0 22 56" className="absolute -top-[22px] left-1/2 z-10 h-14 w-[22px] -translate-x-1/2 drop-shadow-[0_3px_2px_rgba(0,0,0,0.3)]" aria-hidden="true">
      <rect x="3" y="2" width="16" height="52" rx="5" fill={tone} stroke="#14140f" strokeWidth="2.4" />
      <path d="M11 4v34" stroke="#14140f" strokeWidth="2.2" />
      <rect x="1" y="20" width="20" height="9" rx="3" fill="#cfd3c8" stroke="#14140f" strokeWidth="2.2" />
    </svg>
  );
}

function Visual({ c }: { c: Commit }) {
  const portrait = c.aspect !== "landscape";
  return (
    <div className={`relative w-full overflow-hidden bg-[#d9d6cb] ${portrait ? "aspect-[4/5]" : "aspect-[5/4]"}`}>
      {c.art === "gitgud" ? (
        <GitGudSVG />
      ) : (
        c.image && <Image src={c.image} alt={c.imageAlt ?? c.title} fill sizes="280px" className="object-cover object-top" draggable={false} />
      )}
    </div>
  );
}

function HangingCard({ c, i, sway }: { c: Commit; i: number; sway: MotionValue<number> }) {
  const k = [1, 0.8, 1.2, 0.95, 1.1, 0.85][i % 6];
  const rot = useTransform(sway, (v) => v * k);
  const talks = c.branch === "talks";
  const tone = talks ? "#f5a623" : "#2ee58f";
  const left = PAD_L + i * PITCH;
  const head = i === LOG.length - 1;
  const first = i === 0;

  return (
    <div className="absolute top-0" style={{ left, width: CARD_W }}>
      <div className="sway" style={{ ["--s" as string]: `${1 + (i % 3) * 0.45}deg`, ["--dur" as string]: `${4.6 + (i % 4) * 0.7}s`, animationDelay: `${-i * 0.9}s` }}>
        <motion.div style={{ rotate: rot, transformOrigin: "50% 0" }} whileHover={{ scale: 1.04, zIndex: 20 }} transition={{ type: "spring", stiffness: 300, damping: 18 }} className="relative pt-5">
          <Peg tone={tone} />
          <figure className="polaroid relative">
            <Visual c={c} />
            <figcaption className="hand px-1 pb-2 pt-2 text-[1.3rem] leading-none">{c.date}</figcaption>
          </figure>

          <div className="paper -mt-1 mx-2 -rotate-1 px-4 pb-4 pt-5">
            <div className="code mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.68rem]">
              <span className="text-[var(--signal-deep)]">{c.hash}</span>
              {head && <span className="rounded border border-[#a06b00]/60 px-1 text-[#a06b00]">HEAD → talks</span>}
              {first && <span className="rounded border border-black/30 px-1 text-black/55">tag: day-zero</span>}
              <span className="text-black/45">· {talks ? "branch talks" : c.type}</span>
            </div>
            <h3 className="text-[1.55rem] font-semibold leading-[1.02] tracking-[-0.04em]">
              {c.href ? (
                <Link href={c.href} className="inline-flex items-start gap-1 hover:text-[var(--signal-deep)]">
                  {c.title}
                  <ArrowUpRight className="mt-1 size-[0.6em] shrink-0" />
                </Link>
              ) : (
                c.title
              )}
            </h3>
            <p className="mt-2 line-clamp-3 text-[0.84rem] leading-snug text-black/65">{c.summary}</p>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {c.tags.map((t) => (
                <li key={t} className="code rounded-full border border-black/20 bg-white/60 px-2 py-px text-[0.62rem]">
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

const TRACK_W = PAD_L + LOG.length * PITCH + END_PAD;

function ropePath() {
  const xs = LOG.map((_, i) => PAD_L + i * PITCH + CARD_W / 2);
  let d = `M -200 ${ROPE_Y - 8} L ${xs[0]} ${ROPE_Y}`;
  for (let i = 0; i < xs.length - 1; i++) {
    const mid = (xs[i] + xs[i + 1]) / 2;
    d += ` Q ${mid} ${ROPE_Y + SAG * 2} ${xs[i + 1]} ${ROPE_Y}`;
  }
  d += ` L ${TRACK_W + 200} ${ROPE_Y - 8}`;
  return d;
}

function Clouds() {
  const clouds = [
    { top: "9%", w: 380, h: 90, d: "120s", o: 0.95, delay: "0s" },
    { top: "34%", w: 520, h: 120, d: "160s", o: 0.8, delay: "-60s" },
    { top: "62%", w: 420, h: 100, d: "140s", o: 0.85, delay: "-30s" },
    { top: "80%", w: 560, h: 130, d: "190s", o: 0.7, delay: "-110s" },
  ];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {clouds.map((c, i) => (
        <div
          key={i}
          className="drift absolute left-0 rounded-full bg-white blur-2xl"
          style={{ top: c.top, width: c.w, height: c.h, opacity: c.o, ["--drift" as string]: c.d, animationDelay: c.delay }}
        />
      ))}
      {[{ top: "16%", d: "46s", delay: "-8s", s: 1 }, { top: "52%", d: "62s", delay: "-30s", s: 0.7 }].map((b, i) => (
        <div key={i} className="drift absolute left-0" style={{ top: b.top, ["--drift" as string]: b.d, animationDelay: b.delay, scale: b.s }}>
          <svg width="46" height="22" viewBox="0 0 46 22" fill="none" stroke="#14140f" strokeWidth="2.6" strokeLinecap="round" className="flap">
            <path d="M2 14C8 2 16 2 23 12 30 2 38 2 44 14" />
          </svg>
        </div>
      ))}
    </div>
  );
}

export function ClotheslineLog() {
  const [vp, setVp] = useState({ w: 1440, h: 900 });
  useEffect(() => {
    const on = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    on();
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);

  const ref = useRef<HTMLElement>(null);
  const travel = Math.max(0, TRACK_W - vp.w);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const x = useTransform(p, [0, 1], [0, -travel]);
  const sway = useTransform(useSpring(useVelocity(p), { damping: 40, stiffness: 300 }), [-1.2, 0, 1.2], [14, 0, -14], { clamp: true });
  const bar = useSpring(p, { stiffness: 140, damping: 26, mass: 0.4 });

  return (
    <section ref={ref} className="relative" style={{ height: travel + vp.h }}>
      <TornEdge color="var(--paper)" className="absolute inset-x-0 top-0 z-30" />
      <div className="sticky top-0 h-[100svh] overflow-hidden bg-[linear-gradient(to_bottom,#6cbcff,#bfe3ff_58%,#e6f4ff)] text-[var(--ink)]">
        <Clouds />

        <div className="absolute right-[5%] top-20 z-[5] w-28 xl:w-36">
          <div className="bob">
            <StickerArt id="sun" className="die-cut w-full" />
          </div>
        </div>

        {/* heading, pinned */}
        <div className="absolute inset-x-0 top-20 z-20 mx-auto max-w-7xl px-8">
          <p className="eyebrow mb-3 inline-block bg-[var(--paper)] px-2 py-1 text-[var(--signal-deep)]">§ 04 — the log</p>
          <h2 className="text-[clamp(2.4rem,4.8vw,4.6rem)] font-semibold leading-[0.95] tracking-[-0.055em]">
            Our history is a <span className="serif">git log.</span>
          </h2>
          <p className="code mt-3 inline-block rounded bg-[var(--ink)] px-2.5 py-1 text-[0.74rem] text-[var(--text)]">
            <span className="text-[var(--signal)]">$</span> git log --reverse --graph · few events, done well
          </p>
        </div>

        {/* the clothesline */}
        <motion.div className="absolute left-0 z-10" style={{ x, top: "clamp(215px, 29vh, 285px)", width: TRACK_W }}>
          <svg className="absolute left-0 top-0 overflow-visible" width={TRACK_W} height={ROPE_Y + SAG * 2 + 10} aria-hidden="true">
            <path d={ropePath()} fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth="5" transform="translate(0 4)" />
            <path d={ropePath()} fill="none" stroke="#e7c98a" strokeWidth="4" strokeLinecap="round" />
            <path d={ropePath()} fill="none" stroke="#b58a3c" strokeWidth="4" strokeLinecap="round" strokeDasharray="2 9" />
          </svg>
          <div className="relative" style={{ top: ROPE_Y - 22 }}>
            {LOG.map((c, i) => (
              <HangingCard key={c.hash} c={c} i={i} sway={sway} />
            ))}

            {/* final sign */}
            <div className="absolute top-0" style={{ left: PAD_L + LOG.length * PITCH }}>
              <div className="sway" style={{ ["--s" as string]: "2deg", ["--dur" as string]: "5.2s" }}>
                <div className="relative pt-5">
                  <Peg tone="#c7b3ff" />
                  <div className="paper w-64 rotate-2 px-6 pb-6 pt-7 text-center">
                    <p className="hand text-3xl leading-none">to be continued…</p>
                    <p className="mt-2 text-sm text-black/60">The next commit is yours.</p>
                    <Link href="/events" className="btn btn-signal btn-sm mt-4">
                      Browse every event
                      <span className="disc"><ArrowUpRight size={13} strokeWidth={2.6} /></span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* scroll progress */}
        <div className="absolute inset-x-0 bottom-5 z-20 mx-auto flex max-w-7xl items-center gap-4 px-8">
          <span className="hand text-xl">keep scrolling →</span>
          <div className="relative h-[3px] flex-1 bg-[var(--ink)]/20">
            <motion.div className="absolute inset-y-0 left-0 w-full origin-left bg-[var(--ink)]" style={{ scaleX: bar }} />
          </div>
          <span className="code text-xs">{LOG[0].date.split(" ").pop()} → {LOG[LOG.length - 1].date.split(" ").pop()}</span>
        </div>
      </div>
    </section>
  );
}
