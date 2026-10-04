"use client";

import { useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import Image from "next/image";
import {
  m,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
} from "framer-motion";
import { DOMAINS, STAGES } from "@/data/projects";
import type { Flagship, Part } from "@/data/flagship";
import { ArrowLink } from "./arrow-link";
import { LINKS } from "./data";
import { LogDiagram } from "./log-diagram";
import { DOMAIN_ART, DOMAIN_TONE, STAGE_TONE } from "./project-style";
import { Ransom } from "./ransom";
import { Badge, PostIt, Scribble, Tape, useFinePointer } from "./scrap";
import { smoothScrollTo } from "./smooth-scroll";
import { StickerArt } from "./sticker-art";
import { TornEdge } from "./torn-edge";

/**
 * Chapter 06, the workbench. Every project is a scene on its own coloured paper. The scene starts as an exploded drawing, the
 * layers of the project floating apart in space with a label on each. Scrolling pushes the layers back together, and when it is
 * done a stamp lands on it. The next scene is a torn sheet pulled up over the
 * last. People who ask for less motion get every scene already put together, one under the other.
 */

/** How far the page scrolls (in screen heights) for each project, and the rest after the last one. */
const SLOT = 1.35;
const REST = 0.95;

const clamp = (x: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, x));
const easeInOut = (x: number) => (x < 0.5 ? 4 * x ** 3 : 1 - (-2 * x + 2) ** 3 / 2);

const INK = "#14140f";
const PAPERS = [
  { bg: "#9bd7ff", pat: "pat-grid" },
  { bg: "#ffe36e", pat: "pat-dots" },
  { bg: "#ffb3cf", pat: "pat-gingham-pink" },
  { bg: "#9af2c6", pat: "pat-clouds" },
  { bg: "#ff9d7a", pat: "pat-dots" },
] as const;
const BLANK_PAPER = { bg: "#f7f2e4", pat: "pat-grid" } as const;
const paperFor = (i: number, item: Flagship | null) => (item ? PAPERS[i % PAPERS.length] : BLANK_PAPER);

const PLATE_TINT = ["#f7f2e4", "#ffe36e", "#c7b3ff", "#9af2c6"] as const;
const STAMPS = {
  live: { text: "live", color: "#0b874f" },
  built: { text: "built", color: INK },
  bench: { text: "building", color: "#c8372d" },
} as const;

const BLANK_PARTS: Flagship["parts"] = [
  { name: "Your idea", kind: "ui" },
  { name: "Mentors", kind: "code" },
  { name: "Your team", kind: "net" },
  { name: "Shipped", kind: "core" },
];

const REDUCED = "(prefers-reduced-motion: reduce)";
const subscribeReduced = (onChange: () => void) => {
  const mq = window.matchMedia(REDUCED);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
};
/** True when the reader asked for less motion. The server and the first client render both say false, so hydration always agrees. */
function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia(REDUCED).matches,
    () => false,
  );
}

const address = (p: Flagship) => (p.live ?? p.repo).replace(/^https?:\/\//, "").replace(/\/$/, "");

/* ------------------------------------------------------------------ the little drawings on each layer */

/** What is drawn on a layer, by kind: lines of code, a database, a network, a chip. */
function LayerArt({ kind, faint }: { kind: Part["kind"]; faint?: boolean }) {
  const common = { stroke: INK, strokeWidth: 3, strokeLinecap: "round", strokeLinejoin: "round" } as const;
  return (
    <svg viewBox="0 0 320 180" className={`absolute inset-0 size-full ${faint ? "opacity-45" : ""}`} fill="none" aria-hidden="true">
      {kind === "code" && (
        <g>
          {(
            [
              [0, 150, "#c8372d"],
              [18, 190, INK],
              [18, 110, "#0b874f"],
              [36, 160, INK],
              [36, 80, "#1b3a9a"],
              [18, 130, INK],
              [0, 60, "#c8372d"],
              [18, 176, INK],
            ] as const
          ).map(([x, w, c], i) => (
            <rect key={i} x={28 + x} y={30 + i * 17} width={w} height={9} rx={4.5} fill={c} opacity={c === INK ? 0.78 : 1} />
          ))}
        </g>
      )}
      {kind === "data" && (
        <g {...common}>
          <path d="M40 54v62c0 12 22 20 46 20s46-8 46-20V54" fill="#fff" />
          <ellipse cx="86" cy="54" rx="46" ry="16" fill="#ffe36e" />
          <path d="M40 85c0 12 22 20 46 20s46-8 46-20" />
          <rect x="156" y="42" width="124" height="96" rx="8" fill="#fff" />
          <path d="M156 66h124M156 90h124M156 114h124M206 42v96" />
          <rect x="160" y="46" width="42" height="16" rx="4" fill="#ff9d7a" stroke="none" />
        </g>
      )}
      {kind === "net" && (
        <g {...common}>
          <path d="M60 52 160 92 262 48M60 52l30 80 70-40M90 132l150 10-78-50M262 48l-22 94" />
          {(
            [
              [60, 52, 14, "#ffb3cf"],
              [262, 48, 14, "#9bd7ff"],
              [90, 132, 14, "#ffe36e"],
              [240, 142, 14, "#9af2c6"],
              [160, 92, 22, "#ff9d7a"],
            ] as const
          ).map(([x, y, r, c]) => (
            <circle key={`${x}${y}`} cx={x} cy={y} r={r} fill={c} />
          ))}
        </g>
      )}
      {kind === "core" && (
        <g {...common}>
          <path d="M108 40v16M134 40v16M160 40v16M186 40v16M212 40v16M108 124v16M134 124v16M160 124v16M186 124v16M212 124v16M84 64h16M84 90h16M84 116h16M220 64h16M220 90h16M220 116h16" />
          <rect x="100" y="56" width="128" height="68" rx="9" fill="#14140f" />
          <rect x="116" y="68" width="96" height="44" rx="5" fill="#2ee58f" stroke="none" />
          <path d="M132 90h22l8-14 12 28 8-14h10" stroke={INK} />
        </g>
      )}
    </svg>
  );
}

/* ------------------------------------------------------------------ the top layer: what you can see */

/** What you see on the top layer: the screenshot, or for Kwaque a drawn log whose records are appended as the project comes together. */
function Screen({ p, dev }: { p: Flagship; dev: MotionValue<number> }) {
  const image = p.image;
  if (p.diagram === "log") return <LogDiagram dev={dev} />;
  if (!image) return null;
  return (
    <Image
      src={image.src}
      alt={`A screenshot of ${p.title}`}
      fill
      sizes="(min-width: 1024px) 560px, 90vw"
      className={image.w / image.h > 1.45 ? "object-cover object-top" : "object-contain"}
      loading="eager"
      draggable={false}
    />
  );
}

function BrowserTop({ p, dev }: { p: Flagship | null; dev: MotionValue<number> }) {
  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden rounded-xl border-[3px] border-[var(--ink)] bg-[var(--ink)] shadow-[6px_6px_0_rgba(20,20,15,0.3)]">
      <div className="flex items-center gap-1.5 border-b-[3px] border-[var(--ink)] bg-[var(--cream)] px-2.5 py-1.5 sm:gap-2 sm:px-3 sm:py-2">
        {["#ff6b5e", "#ffe36e", "#2ee58f"].map((c) => (
          <span key={c} className="size-2.5 rounded-full border-2 border-[var(--ink)] sm:size-3" style={{ background: c }} />
        ))}
        <span className="code ml-1.5 min-w-0 flex-1 truncate rounded-md border-2 border-[var(--ink)] bg-white px-2 py-px text-[0.58rem] text-[var(--ink)] sm:text-[0.66rem]">
          {p ? address(p) : "your-idea.dev"}
        </span>
      </div>
      <div className="relative min-h-0 flex-1 bg-[#0b0b12]">
        {p ? (
          <Screen p={p} dev={dev} />
        ) : (
          <div className="pat-grid absolute inset-0 grid place-items-center bg-[var(--cream)]">
            <StickerArt id="rocket" className="die-cut w-[16%] min-w-10 -rotate-6" />
            <span className="hand absolute bottom-2 left-3 text-lg text-[var(--ink)]/55 sm:text-2xl">not drawn yet</span>
          </div>
        )}
        {p && (
          <div className="pixel pointer-events-none absolute bottom-1.5 left-1.5 z-10 text-[0.5rem] uppercase tracking-[0.16em] sm:text-[0.58rem]">
            <span className="whitespace-nowrap rounded bg-[var(--cream)]/95 px-1.5 py-0.5 text-[var(--ink)]">
              {p.stage === "bench" ? "in progress" : p.stage === "live" ? "live" : "built"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ the exploded stack */

type Pose = { c: MotionValue<number>; ax: MotionValue<number>; az: MotionValue<number> };

/**
 * One layer of the stack. It sits `i` steps below the top layer when exploded and slides up to join the pile as `c` falls to 0.
 * Its label is a flat tag that is turned back to face you, so it stays readable however far the stack is tipped over.
 */
function Layer({
  i,
  part,
  pose,
  top,
  dev,
  project,
  blank,
}: {
  i: number;
  part: Part;
  pose: Pose;
  top?: boolean;
  dev: MotionValue<number>;
  project: Flagship | null;
  blank: boolean;
}) {
  const { c, ax, az } = pose;
  const depth = useTransform(c, (v) => -i * v);
  const pileX = useTransform(c, (v) => (1 - v) * i * 7);
  const pileY = useTransform(c, (v) => (1 - v) * i * 9);
  const pileR = useTransform(c, (v) => (1 - v) * i * (i % 2 ? 1.7 : -1.3));
  const transform = useMotionTemplate`translateZ(calc(var(--gap) * ${depth} - ${i * 0.7}px)) translate(${pileX}px, ${pileY}px) rotate(${pileR}deg)`;
  const face = useMotionTemplate`rotateZ(${useTransform(az, (v) => -v)}deg) rotateX(${useTransform(ax, (v) => -v)}deg)`;
  const tagOpacity = useTransform(c, [0.25, 0.7], [0, 1]);
  const tint = PLATE_TINT[i];

  return (
    <m.div className="absolute inset-0 [backface-visibility:hidden] [transform-style:preserve-3d]" style={{ transform }}>
      {top ? (
        <BrowserTop p={project} dev={dev} />
      ) : (
        <div
          className={`absolute inset-0 overflow-hidden rounded-xl border-[3px] bg-[var(--cream)] shadow-[6px_6px_0_rgba(20,20,15,0.3)] ${blank ? "border-dashed border-[var(--ink)]/70" : "border-[var(--ink)]"}`}
          style={{ backgroundColor: blank ? "#f7f2e4" : tint }}
        >
          <div className="absolute inset-x-0 top-0 flex h-6 items-center justify-between gap-2 border-b-[3px] border-[var(--ink)] bg-[var(--cream)] px-2.5 sm:h-7">
            {part.url ? (
              <span className="code min-w-0 flex-1 truncate rounded-md border-2 border-[var(--ink)] bg-white px-2 text-[0.52rem] leading-[1.15rem] text-[var(--ink)] sm:text-[0.6rem] sm:leading-[1.25rem]">
                {part.url}
              </span>
            ) : (
              <span className="pixel text-[0.5rem] uppercase tracking-[0.18em] text-[var(--ink)] sm:text-[0.58rem]">layer 0{i + 1}</span>
            )}
            <span className="flex gap-1" aria-hidden="true">
              <span className="size-1.5 rounded-full bg-[var(--ink)]" />
              <span className="size-1.5 rounded-full bg-[var(--ink)]/40" />
            </span>
          </div>
          <div className="absolute inset-x-0 bottom-0 top-6 sm:top-7">
            {part.image ? (
              <Image
                src={part.image}
                alt={`${project?.title ?? "Project"}: ${part.name}`}
                fill
                sizes="(min-width: 1024px) 560px, 90vw"
                className="object-cover object-top"
                loading="eager"
                draggable={false}
              />
            ) : (
              <LayerArt kind={part.kind} faint={blank} />
            )}
          </div>
        </div>
      )}

      {/* the label: a leader line out of the layer's right edge, then a tag */}
      <m.div
        className="absolute left-full top-1/2 z-10 flex items-center [transform-style:preserve-3d] [transform-origin:0_50%]"
        style={{ transform: face, opacity: tagOpacity }}
      >
        <span className="block h-[3px] w-5 bg-[var(--ink)] sm:w-9" />
        <span className="size-2.5 shrink-0 rounded-full border-[3px] border-[var(--ink)] bg-[var(--butter)] sm:size-3" />
        <span
          className="code ml-1 whitespace-nowrap border-2 text-[var(--ink)] border-[var(--ink)] bg-[var(--cream)] px-1.5 py-0.5 text-[0.62rem] font-bold shadow-[2px_2px_0_var(--ink)] sm:px-2.5 sm:py-1 sm:text-[0.86rem] sm:shadow-[3px_3px_0_var(--ink)]"
          style={{ rotate: `${(i % 2 ? 1 : -1) * 2}deg` }}
        >
          {part.name}
        </span>
      </m.div>
    </m.div>
  );
}

/** The dashed lines that run through the corners of an exploded drawing, showing where each layer goes back. */
function AssemblyLines({ c }: { c: MotionValue<number> }) {
  const transform = useMotionTemplate`rotateX(-90deg) scaleY(${c})`;
  const opacity = useTransform(c, [0.1, 0.5], [0, 0.85]);
  return (
    <>
      {["left-0 top-0", "right-0 top-0", "left-0 top-full", "right-0 top-full"].map((pos) => (
        <m.span
          key={pos}
          aria-hidden="true"
          className={`absolute h-[calc(var(--gap)*3)] w-0 border-l-[3px] border-dashed border-[var(--ink)] [transform-origin:0_0] ${pos}`}
          style={{ opacity, transform }}
        />
      ))}
    </>
  );
}

function Stack({
  project,
  parts,
  blank,
  pose,
  dev,
  scale,
}: {
  project: Flagship | null;
  parts: Flagship["parts"];
  blank: boolean;
  pose: Pose;
  dev: MotionValue<number>;
  scale: MotionValue<number>;
}) {
  const lift = useTransform(pose.c, (v) => -v * 1.15);
  const transform = useMotionTemplate`translateY(calc(var(--gap) * ${lift})) rotateX(${pose.ax}deg) rotateZ(${pose.az}deg) scale(${scale})`;
  const groundOpacity = useTransform(pose.c, [0, 1], [0.12, 0.3]);
  return (
    <div className="pointer-events-none absolute inset-0 grid place-items-center [perspective-origin:50%_30%] [perspective:1500px]">
      <m.div
        aria-hidden="true"
        className="absolute bottom-[3%] h-[8%] w-[70%] rounded-[50%] bg-[var(--ink)] blur-xl"
        style={{ opacity: groundOpacity }}
      />
      <m.div
        className="relative aspect-[16/10] w-[var(--pw)] will-change-transform [--gap:calc(var(--pw)*0.33)] [--pw:min(23rem,70vw,40svh)] [transform-style:preserve-3d] sm:[--pw:min(32rem,52vw,50svh)] lg:[--pw:min(38rem,37vw,58svh)]"
        style={{ transform }}
      >
        <AssemblyLines c={pose.c} />
        {[3, 2, 1, 0].map((i) => (
          <Layer key={i} i={i} part={parts[i]} pose={pose} top={i === 0} dev={dev} project={project} blank={blank} />
        ))}
      </m.div>
    </div>
  );
}

/* ------------------------------------------------------------------ one scene */

/** A stamp that thunks down on the finished project. */
function Stamp({ text, color, stamp }: { text: string; color: string; stamp: MotionValue<number> }) {
  const opacity = useTransform(stamp, [0, 0.5], [0, 0.95]);
  const scale = useTransform(stamp, [0, 1], [2.6, 1]);
  return (
    <m.div
      aria-hidden="true"
      className="pixel pointer-events-none absolute bottom-[4%] right-[2%] z-20 will-change-transform -rotate-[10deg] rounded-lg border-[4px] px-3 py-1 text-[0.8rem] uppercase tracking-[0.16em] sm:px-4 sm:py-1.5 sm:text-[1.25rem] lg:right-[6%]"
      style={{ opacity, scale, color, borderColor: color, backgroundColor: "rgba(247,242,228,0.95)" }}
    >
      {text}
    </m.div>
  );
}

/** Things that pop onto the scene once the project is together: a sticker, the marker-pen note, a few sparkles. */
function Pops({ item, stamp, note }: { item: Flagship | null; stamp: MotionValue<number>; note: string }) {
  const scale = useTransform(stamp, [0, 1], [0, 1]);
  const noteScale = useTransform(stamp, [0.2, 1], [0.4, 1]);
  const opacity = useTransform(stamp, [0, 0.4], [0, 1]);
  return (
    <>
      <m.div
        className="will-change-transform absolute right-[2%] top-[2%] z-10 w-[17%] max-w-24 rotate-[12deg] lg:right-[3%] lg:top-[4%] lg:w-[14%]"
        style={{ scale }}
        aria-hidden="true"
      >
        <StickerArt id={item ? DOMAIN_ART[item.domain] : "heart"} className="die-cut w-full" />
      </m.div>
      <m.div
        className="will-change-transform absolute left-[1%] top-[2%] z-10 w-[9%] max-w-12 -rotate-[14deg]"
        style={{ scale }}
        aria-hidden="true"
      >
        <StickerArt id="sparkle" className="twinkle w-full" />
      </m.div>
      <m.div
        className="will-change-transform absolute left-[4%] top-[58%] z-10 hidden w-[6%] max-w-8 rotate-[10deg] lg:block"
        style={{ scale }}
        aria-hidden="true"
      >
        <StickerArt id="sparkle" className="twinkle w-full" />
      </m.div>
      <m.div
        className="will-change-transform absolute bottom-[2%] left-[0%] z-10 hidden w-[34%] max-w-[15rem] -rotate-[4deg] lg:block"
        style={{ scale: noteScale, opacity }}
      >
        <PostIt color="butter" className="!p-3 !pb-5 !text-[1.25rem]">
          <Tape tone="pink" className="-top-3 left-1/2 -translate-x-1/2" rotate={-3} />
          {note}
        </PostIt>
      </m.div>
      <m.div className="absolute bottom-[19%] left-[27%] z-10 hidden text-[var(--ink)] lg:block" style={{ opacity }} aria-hidden="true">
        <Scribble className="h-12 w-16" dir="up-right" />
      </m.div>
    </>
  );
}

/** A hand-written nudge that is only there while the project is still in pieces. */
function Hint({ c }: { c: MotionValue<number> }) {
  const opacity = useTransform(c, [0.55, 0.95], [0, 1]);
  return (
    <m.div
      aria-hidden="true"
      className="pointer-events-none absolute left-[2%] top-[3%] z-10 hidden -rotate-[5deg] text-[var(--ink)] lg:block"
      style={{ opacity }}
    >
      <p className="hand text-[1.5rem] leading-none">scroll to put it back together</p>
      <Scribble className="ml-24 mt-1 h-12 w-16" dir="down-right" />
    </m.div>
  );
}

const BURST = ["#ff6b5e", "#ffe36e", "#2ee58f", "#c7b3ff", "#ff6b5e", "#9bd7ff", "#ffe36e", "#2ee58f"] as const;
/** Bits of confetti thrown off where the stamp lands. */
function Burst({ stamp }: { stamp: MotionValue<number> }) {
  return (
    <div className="pointer-events-none absolute bottom-[10%] right-[12%] z-20 size-0 lg:right-[16%]" aria-hidden="true">
      {BURST.map((color, i) => (
        <BurstBit key={i} i={i} color={color} stamp={stamp} />
      ))}
    </div>
  );
}
function BurstBit({ i, color, stamp }: { i: number; color: string; stamp: MotionValue<number> }) {
  const a = (i / BURST.length) * Math.PI * 2 + 0.4;
  const reach = 56 + (i % 3) * 22;
  const x = useTransform(stamp, [0.7, 1], [0, Math.cos(a) * reach]);
  const y = useTransform(stamp, [0.7, 1], [0, Math.sin(a) * reach]);
  const opacity = useTransform(stamp, [0.7, 0.78, 1], [0, 1, 0.9]);
  const rotate = useTransform(stamp, [0.7, 1], [0, 140 + i * 30]);
  return (
    <m.span
      className="absolute size-2.5 border-2 border-[var(--ink)] sm:size-3"
      style={{ x, y, opacity, rotate, background: color, borderRadius: i % 2 ? "50%" : 2 }}
    />
  );
}

/** The big outlined word behind the stack, sliding sideways as you scroll. */
function Backword({ text, t }: { text: string; t: MotionValue<number> }) {
  const x = useTransform(t, [-1, 1], ["10%", "-14%"]);
  return (
    <m.p
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-[8%] select-none whitespace-nowrap will-change-transform text-[clamp(7rem,27vw,26rem)] font-extrabold uppercase leading-[0.8] tracking-[-0.06em] text-transparent lg:bottom-[4%]"
      style={{ x, WebkitTextStroke: "3px rgba(20,20,15,0.16)" }}
    >
      {text}
    </m.p>
  );
}

function Author({ p }: { p: Flagship }) {
  return (
    <a href={`https://github.com/${p.github}`} target="_blank" rel="noopener noreferrer" className="group flex w-fit items-center gap-2.5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://github.com/${p.github}.png?size=96`}
        alt=""
        width={40}
        height={40}
        loading="lazy"
        referrerPolicy="no-referrer"
        className="size-8 -rotate-3 rounded-md border-[3px] border-[var(--ink)] bg-[var(--cream)] shadow-[2px_2px_0_var(--ink)] sm:size-10"
      />
      <span className="leading-tight">
        <span className="hand block text-[0.9rem] text-[var(--ink)]/70 sm:text-[1.05rem]">built by</span>
        <span className="block text-[0.95rem] font-bold sm:text-lg">{p.by}</span>
      </span>
    </a>
  );
}

function Copy({ item, index, show }: { item: Flagship | null; index: number; show: boolean }) {
  const num = item ? String(index + 1) : "?";
  const title = item ? item.title : "Yours";
  return (
    <m.div animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: 36 }} transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}>
      {item && (
        <div className="mb-2 flex flex-wrap items-center gap-2 lg:mb-4">
          <Badge tone={DOMAIN_TONE[item.domain]} className="!px-2.5 !py-0.5 !text-[0.62rem] sm:!px-3 sm:!py-1 sm:!text-[0.72rem]">
            {DOMAINS[item.domain].label}
          </Badge>
          <Badge tone={STAGE_TONE[item.stage]} className="-rotate-2 !px-2.5 !py-0.5 !text-[0.62rem] sm:!px-3 sm:!py-1 sm:!text-[0.72rem]">
            {STAGES[item.stage].short}
          </Badge>
        </div>
      )}
      <div className="flex items-end gap-3 sm:gap-5">
        <span className="serif die-num text-[clamp(4.2rem,15vw,12rem)] leading-[0.8] lg:text-[clamp(7rem,11vw,11rem)]">{num}</span>
        <div className="min-w-0 pb-1 text-[clamp(1.9rem,8.6vw,2.6rem)] leading-none lg:pb-3 lg:text-[clamp(2.4rem,4.4vw,4.4rem)]">
          <Ransom text={title} seed={index * 3 + 2} delay={0.15} play={show} />
        </div>
      </div>
      {item ? (
        <>
          <p className="serif mt-3 line-clamp-4 max-w-xl text-[clamp(1.05rem,4.6vw,1.3rem)] leading-[1.18] sm:text-[1.4rem] lg:mt-6 lg:line-clamp-none lg:text-[clamp(1.35rem,2vw,1.85rem)]">
            {item.blurb}
          </p>
          <div className="mt-3 lg:mt-5 [@media(max-height:700px)]:hidden lg:[@media(max-height:700px)]:block">
            <Author p={item} />
          </div>
          <ul className="mt-3 hidden flex-wrap gap-2 sm:flex lg:mt-5" aria-label="Built with">
            {item.stack.map((s, i) => (
              <li
                key={s}
                className="code border-2 border-[var(--ink)] bg-[var(--cream)] px-2.5 py-0.5 text-[0.68rem] shadow-[3px_3px_0_var(--ink)] lg:px-3 lg:py-1 lg:text-[0.74rem]"
                style={{ rotate: `${(i % 2 ? 1 : -1) * (1 + (i % 3))}deg` }}
              >
                {s}
              </li>
            ))}
          </ul>
          <div className="mt-3 flex flex-wrap gap-2 lg:mt-6">
            {item.live && (
              <ArrowLink href={item.live} className="btn btn-signal btn-sm lg:!py-3 lg:!pl-6 lg:!pr-3.5 lg:!text-base" size={15}>
                Open it live
              </ArrowLink>
            )}
            <ArrowLink href={item.repo} className="btn btn-ink btn-sm lg:!py-3 lg:!pl-6 lg:!pr-3.5 lg:!text-base" size={15}>
              Read the code
            </ArrowLink>
          </div>
        </>
      ) : (
        <>
          <p className="serif mt-3 max-w-xl text-[clamp(1.05rem,4.6vw,1.3rem)] leading-[1.18] sm:text-[1.4rem] lg:mt-6 lg:text-[clamp(1.35rem,2vw,1.85rem)]">
            Every project here began as somebody&apos;s idea in our chats. Bring yours, and the mentors will help you ship it.
          </p>
          <p className="hand mt-2 text-[1.05rem] text-[var(--ink)]/65 sm:text-[1.3rem]">batch 02 of the Project Bootcamp is on its way</p>
          <div className="mt-3 flex flex-wrap gap-2 lg:mt-6">
            <ArrowLink href={LINKS.discord} className="btn btn-lilac btn-sm lg:!py-3 lg:!pl-6 lg:!pr-3.5 lg:!text-base" size={15}>
              Join the Discord
            </ArrowLink>
            <ArrowLink href={LINKS.whatsapp} className="btn btn-signal btn-sm lg:!py-3 lg:!pl-6 lg:!pr-3.5 lg:!text-base" size={15}>
              WhatsApp group
            </ArrowLink>
          </div>
        </>
      )}
    </m.div>
  );
}

type Motion = { tiltX: MotionValue<number>; tiltY: MotionValue<number>; sway: MotionValue<number> };

/** The numbers that run one scene, all worked out from where the page is: `f` counts scenes, so scene `index` is at `t = f - index`. */
function Scene({
  item,
  index,
  total,
  f,
  motion,
  nav,
  layout,
  show,
}: {
  item: Flagship | null;
  index: number;
  total: number;
  f: MotionValue<number>;
  motion: Motion;
  nav?: ReactNode;
  layout: "stage" | "flow";
  show: boolean;
}) {
  const t = useTransform(f, (x) => x - index);
  const enter = useTransform(t, (x) => (index === 0 ? 1 : easeInOut(clamp((x + 0.38) / 0.38))));
  const c = useTransform(t, (x) => 1 - easeInOut(clamp(x / 0.42)));
  const dev = useTransform(t, (x) => clamp((x - 0.04) / 0.38));
  const stamp = useTransform(t, (x) => clamp((x - 0.42) / 0.12));
  const leave = useTransform(t, (x) => clamp((x - 0.62) / 0.38));

  const ax = useTransform([c, motion.tiltY], ([cv, ty]: number[]) => 58 * cv + ty * 5);
  const az = useTransform([c, motion.tiltX, motion.sway], ([cv, tx, sw]: number[]) => -34 * cv - 1.6 * (1 - cv) + tx * 7 + sw);
  const scale = useTransform([c, stamp], ([cv, st]: number[]) => 1 - cv * 0.24 + Math.sin(st * Math.PI) * 0.035);
  const pose: Pose = { c, ax, az };

  const wipeY = useTransform(enter, (e) => `${(1 - e) * 104}%`);
  const settleY = useTransform(leave, (l) => `${-l * 9}%`);
  const settleScale = useTransform(leave, (l) => 1 - l * 0.05);
  const paper = paperFor(index, item);
  const parts = item?.parts ?? BLANK_PARTS;
  const stamped = item ? STAMPS[item.stage] : { text: "open", color: "#0b874f" };

  const inner = (
    <div className="mx-auto grid h-full w-full max-w-7xl grid-cols-1 grid-rows-[auto_minmax(0,1fr)] gap-1 px-5 pb-3 pt-[4.6rem] sm:px-8 lg:grid-cols-12 lg:grid-rows-1 lg:items-center lg:gap-6 lg:pb-0 lg:pt-8">
      <div className="relative z-10 text-[var(--ink)] lg:col-span-6 lg:max-w-[38rem]">
        <Copy item={item} index={index} show={show} />
        {nav}
      </div>
      <div className="relative min-h-[19rem] lg:min-h-0 lg:col-span-6 lg:h-[min(78svh,46rem)]">
        <Stack project={item} parts={parts} blank={!item} pose={pose} dev={dev} scale={scale} />
        <Pops item={item} stamp={stamp} note={item?.note ?? "your idea goes here"} />
        <Hint c={c} />
        <Stamp text={stamped.text} color={stamped.color} stamp={stamp} />
        <Burst stamp={stamp} />
      </div>
    </div>
  );

  if (layout === "flow")
    return (
      <article
        aria-label={`Project ${index + 1} of ${total}: ${item?.title ?? "yours"}`}
        className={`${paper.pat} relative overflow-hidden rounded-[1.6rem] border-[3px] border-[var(--ink)] py-8 shadow-[8px_8px_0_var(--ink)]`}
        style={{ backgroundColor: paper.bg }}
      >
        <div className="relative min-h-[44rem] lg:min-h-0 lg:py-10">
          <Backword text={item?.title ?? "next"} t={t} />
          {inner}
        </div>
      </article>
    );

  return (
    <m.article
      aria-label={`Project ${index + 1} of ${total}: ${item?.title ?? "yours"}`}
      className={`${paper.pat} absolute inset-0 will-change-transform`}
      style={{ backgroundColor: paper.bg, y: wipeY, zIndex: index + 1 }}
      inert={!show}
    >
      {index > 0 && (
        <>
          <TornEdge color="#14140f" flip className="absolute inset-x-0 bottom-full z-20 -translate-y-[3px] opacity-85" />
          <TornEdge color={paper.bg} flip className="absolute inset-x-0 bottom-full z-20 translate-y-px" />
        </>
      )}
      <m.div className="absolute inset-0 overflow-hidden will-change-transform" style={{ y: settleY, scale: settleScale }}>
        <Backword text={item?.title ?? "next"} t={t} />
        {inner}
      </m.div>
    </m.article>
  );
}

/** The numbered dots, and a line that fills as you scroll. They also jump to a project. */
function Nav({
  names,
  active,
  progress,
  onJump,
}: {
  names: string[];
  active: number;
  progress: MotionValue<number>;
  onJump: (i: number) => void;
}) {
  return (
    <div className="mt-3 flex items-center gap-3 sm:gap-4 lg:mt-8">
      <ol className="flex gap-1.5 sm:gap-2">
        {names.map((n, i) => (
          <li key={n}>
            <button
              type="button"
              onClick={() => onJump(i)}
              aria-label={`Go to project ${i + 1}: ${n}`}
              aria-current={i === active ? "step" : undefined}
              className={`btn btn-dot btn-xs ${i === active ? "btn-ink" : "btn-paper"}`}
            >
              <span className="code text-[0.8rem] font-bold">{i === names.length - 1 ? "+" : i + 1}</span>
            </button>
          </li>
        ))}
      </ol>
      <div className="relative h-[3px] flex-1 bg-[var(--ink)]/20">
        <m.div className="absolute inset-y-0 left-0 w-full origin-left bg-[var(--ink)]" style={{ scaleX: progress }} />
      </div>
    </div>
  );
}

/** The scroll-driven version: the page pins here and the scenes play as you scroll. */
function BenchStage({ projects }: { projects: Flagship[] }) {
  const items: (Flagship | null)[] = [...projects, null];
  const total = items.length;
  const names = items.map((s) => s?.title ?? "your project");
  const track = useRef<HTMLDivElement>(null);
  const handle = useRef(0);
  const fine = useFinePointer();
  const [active, setActive] = useState(0);
  const [base, setBase] = useState(0);
  const range = (total - 1) * SLOT + REST;
  const { scrollYProgress: v } = useScroll({ target: track, offset: ["start start", "end end"] });
  const raw = useTransform(v, (x) => (x * range) / SLOT);
  // The page position is eased a little, so wheel clicks and flicks glide instead of stepping.
  const f = useSpring(raw, { stiffness: 120, damping: 26, mass: 0.5 });
  const progress = useSpring(v, { stiffness: 140, damping: 26, mass: 0.4 });
  useMotionValueEvent(f, "change", (x) => {
    setActive(Math.min(total - 1, Math.max(0, Math.floor(x + 0.2))));
    setBase(Math.min(total - 1, Math.max(0, Math.floor(x))));
  });

  // The stack leans after the pointer, and swings a little when you scroll fast, like the clothesline does.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const tiltX = useSpring(px, { stiffness: 90, damping: 18 });
  const tiltY = useSpring(py, { stiffness: 90, damping: 18 });
  const sway = useSpring(
    useTransform(useVelocity(f), (vel) => clamp(vel * -5, -5, 5)),
    { stiffness: 70, damping: 9 },
  );
  const motion: Motion = { tiltX, tiltY, sway };

  const jump = (i: number) => {
    const el = track.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    smoothScrollTo(top + (((i + 0.56) * SLOT) / range) * (el.offsetHeight - window.innerHeight), handle);
  };

  return (
    <div ref={track} className="relative" style={{ height: `${(1 + range) * 100}svh` }}>
      {/* the first scene's paper is torn along its top edge, and the last one along its bottom, so neither meets the blueprint in a straight line */}
      <TornEdge color={PAPERS[0].bg} flip className="pointer-events-none absolute inset-x-0 bottom-full z-30 translate-y-px" />
      <TornEdge color={BLANK_PAPER.bg} className="pointer-events-none absolute inset-x-0 top-full z-30 -translate-y-px" />
      <div
        className="cv-auto sticky top-0 h-[100svh] overflow-hidden"
        onPointerMove={
          fine
            ? (e) => {
                const r = e.currentTarget.getBoundingClientRect();
                px.set(((e.clientX - r.left) / r.width - 0.5) * 2);
                py.set(((e.clientY - r.top) / r.height - 0.5) * 2);
              }
            : undefined
        }
      >
        {items.map((s, i) =>
          // Only the scene on screen and the one about to be pulled up are drawn, so the page never carries more than two 3D stacks.
          i === base || i === base + 1 ? (
            <Scene
              key={s?.slug ?? "blank"}
              item={s}
              index={i}
              total={total}
              f={f}
              motion={motion}
              layout="stage"
              show={i === active}
              nav={<Nav names={names} active={active} progress={progress} onJump={jump} />}
            />
          ) : (
            <div
              key={s?.slug ?? "blank"}
              className="absolute inset-0"
              style={{ backgroundColor: paperFor(i, s).bg, zIndex: i + 1, transform: i > active ? "translateY(104%)" : undefined }}
              aria-hidden="true"
            />
          ),
        )}
        <p className="sr-only" aria-live="polite">
          Project {active + 1} of {total}: {names[active]}
        </p>
      </div>
    </div>
  );
}

/** For people who ask for less motion: every project already put together, one under the other. */
function BenchList({ projects }: { projects: Flagship[] }) {
  const items: (Flagship | null)[] = [...projects, null];
  const settled = useMotionValue(0);
  const still: Motion = { tiltX: settled, tiltY: settled, sway: settled };
  return (
    <ol className="mx-auto max-w-[78rem] space-y-10 px-3 sm:px-6">
      {items.map((s, i) => (
        <li key={s?.slug ?? "blank"}>
          <FlowScene item={s} index={i} total={items.length} motion={still} />
        </li>
      ))}
    </ol>
  );
}

/** One scene, finished, with nothing to scroll. The numbers are held at "put together and stamped". */
function FlowScene({ item, index, total, motion }: { item: Flagship | null; index: number; total: number; motion: Motion }) {
  const f = useMotionValue(index + 0.66);
  return <Scene item={item} index={index} total={total} f={f} motion={motion} layout="flow" show />;
}

export function ProjectBench({ projects }: { projects: Flagship[] }) {
  const reduced = usePrefersReducedMotion();
  return reduced ? <BenchList projects={projects} /> : <BenchStage projects={projects} />;
}
