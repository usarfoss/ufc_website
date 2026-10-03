"use client";

import Image from "next/image";
import { MaskLine, Reveal } from "@/components/home/motion-primitives";
import { Badge, Pin, Scribble, Sticker, Tape } from "@/components/home/scrap";
import { Ransom } from "@/components/home/ransom";
import { StickerArt, type ArtId } from "@/components/home/sticker-art";
import { TornEdge } from "@/components/home/torn-edge";
import { ACHIEVEMENTS, type Achievement } from "@/data/achievements";
import { ARTIFACTS } from "./artifacts";
import { OrgLogo } from "./org-logo";

type Scene = { bg: string; pat: string; charm: ArtId; tape: "butter" | "pink" | "sky" | "lilac" | "signal" };

const SCENES: Scene[] = [
  { bg: "#ffe36e", pat: "pat-dots", charm: "sparkle", tape: "pink" },
  { bg: "#9bd7ff", pat: "pat-clouds", charm: "rocket", tape: "butter" },
  { bg: "#9af2c6", pat: "pat-grid", charm: "magnifier", tape: "pink" },
  { bg: "#ffb3cf", pat: "pat-gingham-pink", charm: "coffee", tape: "butter" },
  { bg: "#c7b3ff", pat: "pat-dots", charm: "heart", tape: "signal" },
  { bg: "#ffb98a", pat: "pat-dots", charm: "burst", tape: "sky" },
  { bg: "#2ee58f", pat: "pat-grid", charm: "floppy", tape: "pink" },
];

/** Hero collage: everyone pinned up at once, a taste of what's below. */
const FAN: { left: string; top: string; w: string; r: number }[] = [
  { left: "2%", top: "6%", w: "27%", r: -7 },
  { left: "30%", top: "0%", w: "27%", r: 4 },
  { left: "60%", top: "8%", w: "27%", r: -3 },
  { left: "14%", top: "34%", w: "25%", r: 6 },
  { left: "42%", top: "30%", w: "26%", r: -5 },
  { left: "70%", top: "38%", w: "25%", r: 7 },
  { left: "30%", top: "62%", w: "26%", r: -2 },
];

function Polaroid({ a, caption, tape = "butter" }: { a: Achievement; caption?: string; tape?: Scene["tape"] }) {
  return (
    <figure className="polaroid relative">
      <Tape tone={tape} className="-top-3 left-1/2 -translate-x-1/2" rotate={-3} />
      <div className="relative aspect-square w-full overflow-hidden bg-[#d9d6cb]">
        <Image src={a.photo} alt={a.name} fill sizes="(min-width: 1024px) 24vw, 70vw" className="object-cover" style={{ objectPosition: a.focus }} draggable={false} />
      </div>
      <figcaption className="hand px-1 pb-2 pt-2 text-[1.25rem] leading-none">{caption ?? a.name.split(" ")[0]}</figcaption>
    </figure>
  );
}

function Hero() {
  return (
    <section className="dotgrid relative isolate overflow-hidden bg-[var(--ink)] text-[var(--text)]">
      <div className="pointer-events-none absolute -right-[10%] top-[-10%] -z-10 size-[60vw] max-h-[800px] max-w-[800px] bg-[radial-gradient(closest-side,rgba(46,229,143,0.16),transparent_72%)]" aria-hidden="true" />
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-24 pt-40 sm:px-8 lg:grid-cols-12 lg:pb-32 lg:pt-44">
        <div className="lg:col-span-6">
          <Reveal>
            <p className="eyebrow mb-8 text-[var(--signal)]">§ 00 — achievements</p>
          </Reveal>
          <h1 className="text-[clamp(2.8rem,7vw,6.6rem)] leading-[0.95]">
            <MaskLine>Our people are</MaskLine>
            <span className="mt-[0.06em] block">
              <Ransom text="going" seed={1} delay={0.4} scale={0.9} />
            </span>
            <span className="mt-[0.06em] block">
              <Ransom text="places." seed={6} delay={0.7} scale={0.9} />
            </span>
          </h1>
          <Reveal delay={0.1}>
            <p className="mt-9 max-w-md text-[1.18rem] leading-[1.65] text-[var(--text)]/80">
              A club is only as good as what its members do next. Open source programs, internships, research labs and real jobs. Here are seven stories
              so far, and we&apos;re proud of every one.
            </p>
          </Reveal>
          <div className="hand mt-8 flex flex-col items-start text-[1.7rem] text-[var(--butter)]">
            scroll to read them
            <Scribble dir="down" className="ml-8 mt-1 h-12 w-14" />
          </div>
        </div>

        {/* pinned-up photos */}
        <div className="relative mx-auto aspect-[5/6] w-full max-w-[34rem] lg:col-span-6 lg:max-w-none lg:aspect-[6/6]">
          {ACHIEVEMENTS.map((a, i) => (
            <div key={a.name} className="absolute" style={{ left: FAN[i].left, top: FAN[i].top, width: FAN[i].w, zIndex: 2 + i }}>
              <Pin r={FAN[i].r} delay={0.2 + i * 0.09} hint="drag me">
                <Polaroid a={a} tape={SCENES[i].tape} />
              </Pin>
            </div>
          ))}
          <Pin r={9} delay={1} className="absolute right-[2%] top-[62%] hidden w-24 sm:block" hint="drag me">
            <Sticker src="/collage/tux.webp" alt="Tux, the Linux penguin" className="aspect-[607/720] w-full" sizes="110px" />
          </Pin>
          <Pin r={-8} delay={1.1} className="absolute left-[2%] top-[72%] hidden sm:block" hint="drag me">
            <Badge tone="signal">proud of you</Badge>
          </Pin>
        </div>
      </div>
    </section>
  );
}

function Story({ a, i, prev }: { a: Achievement; i: number; prev: string }) {
  const sc = SCENES[i];
  const Art = ARTIFACTS[a.artifact];
  const flip = i % 2 === 1;
  const roles = [{ headline: a.headline, org: a.org, detail: a.detail, logo: a.logo }, ...(a.also ?? [])];
  return (
    <section className={`${sc.pat} relative overflow-hidden text-[var(--ink)]`} style={{ backgroundColor: sc.bg }}>
      <TornEdge color={prev} className="absolute inset-x-0 top-0 z-10 -translate-y-px" />
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-12 lg:gap-8 lg:py-28">
        {/* words */}
        <div className={`lg:col-span-6 ${flip ? "lg:order-2" : ""}`}>
          <Reveal>
            <div className="flex items-end gap-5">
              <span className="serif die-num text-[clamp(7rem,13vw,12rem)] leading-[0.78]">{i + 1}</span>
              <p className="code mb-3 rounded bg-[var(--ink)] px-2 py-1 text-[0.68rem] font-bold uppercase tracking-widest text-[var(--paper)]">{a.org}</p>
            </div>
          </Reveal>
          <h2 className="mt-8 text-[clamp(2rem,4.2vw,3.6rem)] leading-[1.02]">
            <MaskLine inView>{a.name}</MaskLine>
          </h2>
          <div className="mt-6 space-y-8">
            {roles.map((r, ri) => (
              <div key={r.org}>
                <div className="flex flex-wrap items-end gap-x-5 gap-y-3 text-[clamp(1.9rem,4vw,3.4rem)]">
                  {r.headline.split(" ").map((w, k) => (
                    <Ransom key={`${w}-${k}`} text={w} seed={i * 4 + k + 2 + ri * 5} delay={0.15 + k * 0.25 + ri * 0.4} scale={1} />
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
                  <p className="flex flex-wrap items-baseline gap-x-3 text-[clamp(1.6rem,2.6vw,2.2rem)]">
                    <span className="hand">at</span>
                    <span className="marker rounded-sm px-1 font-extrabold tracking-[-0.03em]" style={{ ["--mark" as string]: "var(--cream)" }}>{r.org}</span>
                  </p>
                  <Pin r={ri % 2 ? 4 : -4} drag={false} delay={0.2 + ri * 0.1}>
                    <OrgLogo logo={r.logo} org={r.org} height={72} />
                  </Pin>
                </div>
                <p className="mt-3 max-w-sm text-[1.02rem] leading-snug text-[var(--ink)]/70">{r.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* things */}
        <div className={`relative lg:col-span-6 ${flip ? "lg:order-1" : ""}`}>
          <div className="relative mx-auto grid max-w-xl gap-8 sm:grid-cols-2 sm:items-center lg:max-w-none">
            <Pin r={flip ? 4 : -4} className="relative z-10 mx-auto w-[78%] sm:w-full" hint="drag me">
              <Polaroid a={a} caption={a.name.split(" ")[0].toLowerCase()} tape={sc.tape} />
            </Pin>
            <Pin r={flip ? -3 : 3} delay={0.15} className="relative z-20 sm:-ml-12 sm:mt-24" hint="drag me">
              <Art name={a.name} headline={a.headline} org={a.org} detail={a.detail} also={a.also} bg={sc.bg} />
            </Pin>
          </div>
          <div className="pointer-events-none absolute -top-8 right-2 w-20 rotate-12 sm:w-24" aria-hidden="true">
            <StickerArt id={sc.charm} className="die-cut w-full" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function Wall() {
  return (
    <>
      <Hero />
      {ACHIEVEMENTS.map((a, i) => (
        <Story key={a.name} a={a} i={i} prev={i === 0 ? "#090c0a" : SCENES[i - 1].bg} />
      ))}
    </>
  );
}
