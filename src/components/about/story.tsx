"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { MaskLine, Reveal } from "@/components/home/motion-primitives";
import { Badge, Pin, Scribble, Tape } from "@/components/home/scrap";
import { StickerArt, type ArtId } from "@/components/home/sticker-art";
import { Thread } from "@/components/home/thread";
import { CHAPTERS, type Chapter } from "./story-data";

const TONES = { butter: "#ffe36e", mint: "#9af2c6", pink: "#ffb3cf", lilac: "#c7b3ff", sky: "#9bd7ff" } as const;
const ART: ArtId[] = ["sparkle", "fork", "heart", "rocket", "play", "burst"];

function ChapterCard({ c, i }: { c: Chapter; i: number }) {
  const right = i % 2 === 1;
  const tone = TONES[c.tone];
  return (
    <li className="grid grid-cols-[2.75rem_1fr] items-start lg:grid-cols-[1fr_8rem_1fr]">
      {/* knot: the thread passes through this */}
      <span className="col-start-1 mt-9 grid place-items-center lg:col-start-2 lg:mt-12">
        {/* alternate sides of the gutter so the thread weaves down the page instead of dropping straight */}
        <span data-knot className={`block size-6 ${right ? "lg:translate-x-[1.8rem]" : "lg:-translate-x-[1.8rem]"}`} />
      </span>

      <Reveal className={`col-start-2 pb-14 lg:pb-20 ${right ? "lg:col-start-3" : "lg:col-start-1"}`} y={40}>
        <article
          className={`relative border-[2.5px] border-[var(--ink)] bg-[var(--cream)] p-6 shadow-[7px_7px_0_var(--ink)] sm:p-8 ${right ? "lg:-rotate-[0.8deg]" : "lg:rotate-[0.8deg]"}`}
          style={{ borderRadius: "1.25rem" }}
        >
          <Tape tone={["butter", "pink", "sky", "lilac", "signal", "butter"][i] as "butter"} className="-top-3 left-8" rotate={-5} />

          <div className="flex items-start justify-between gap-4">
            <span className="serif text-[clamp(4.5rem,8vw,7rem)] leading-[0.8] text-[var(--signal-deep)]">{c.n}</span>
            <Badge tone={c.tone === "mint" ? "signal" : c.tone} className="!text-[0.78rem]">
              {c.tag}
            </Badge>
          </div>

          <h3 className="mt-5 text-[clamp(1.9rem,3.2vw,2.8rem)] leading-[1.02]">{c.title}</h3>

          <div className="mt-5 space-y-4 text-[1.06rem] leading-[1.7] text-[var(--ink)]/80">
            {c.body.map((para) => (
              <p key={para.slice(0, 24)}>{para}</p>
            ))}
          </div>

          {c.points && (
            <ul className="mt-6 space-y-2.5">
              {c.points.map((pt) => (
                <li key={pt} className="flex items-start gap-3 text-[1.02rem] font-semibold leading-snug">
                  <span className="mt-[0.35em] block size-3 shrink-0 rotate-45 border-2 border-[var(--ink)]" style={{ background: tone }} />
                  {pt}
                </li>
              ))}
            </ul>
          )}

          {c.link &&
            (c.link.external ? (
              <a href={c.link.href} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-paper mt-6">
                {c.link.label}
                <span className="disc">
                  <ArrowUpRight size={13} strokeWidth={2.6} />
                </span>
              </a>
            ) : (
              <Link href={c.link.href} className="btn btn-sm btn-paper mt-6">
                {c.link.label}
                <span className="disc">
                  <ArrowUpRight size={13} strokeWidth={2.6} />
                </span>
              </Link>
            ))}

          {/* a little sticker clinging to the corner */}
          <div
            className={`pointer-events-none absolute -top-7 w-14 sm:w-16 ${right ? "right-3 lg:-left-6 lg:right-auto" : "right-3 lg:-right-6"}`}
            style={{ rotate: `${right ? -12 : 12}deg` }}
            aria-hidden="true"
          >
            <StickerArt id={ART[i % ART.length]} className="die-cut w-full" />
          </div>
        </article>
      </Reveal>
    </li>
  );
}

/** Chapter 0, the opening statement, followed by the six knots of the story, all strung on one thread. */
export function Story() {
  return (
    <section id="story" className="relative bg-[var(--paper)] text-[var(--ink)]">
      <div className="mx-auto max-w-7xl px-5 pb-16 pt-40 sm:px-8 lg:pb-24 lg:pt-52">
        <Reveal>
          <p className="eyebrow mb-8 text-[var(--signal-deep)]">§ 00 · about, how it started</p>
        </Reveal>
        <h1 className="max-w-6xl text-[clamp(2.6rem,6.6vw,6.4rem)] leading-[0.98]">
          <MaskLine>It started with</MaskLine>
          <MaskLine delay={0.1}>a few friends</MaskLine>
          <MaskLine delay={0.2}>
            <span className="serif text-[var(--signal-deep)]">and some </span>
            <span className="serif underline decoration-[var(--signal)] decoration-[0.06em] underline-offset-[0.12em]">talking.</span>
          </MaskLine>
        </h1>
        <Reveal delay={0.1}>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-[var(--ink)]/70">
            Here&apos;s how a few friends at USAR started a club, got FOSS United behind it, and ended up with a community that builds
            things, argues a lot and throws a decent party. Follow the thread to read it.
          </p>
        </Reveal>
        <div className="hand mt-6 flex flex-col items-start text-2xl text-[var(--ink)]/60">
          scroll, the pencil draws as you go
          <Scribble dir="down" className="ml-10 h-12 w-14" />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 pb-8 sm:px-8">
        <Thread>
          <ol>
            {CHAPTERS.map((c, i) => (
              <ChapterCard key={c.n} c={c} i={i} />
            ))}
          </ol>

          {/* the tail: a tag hanging off the end of the thread, pointing at year one */}
          <div className="grid grid-cols-[2.75rem_1fr] lg:grid-cols-[1fr_8rem_1fr]">
            <span className="col-start-1 grid place-items-center lg:col-start-2">
              <span data-knot className="block size-6" />
            </span>
            <div className="col-start-2 pb-24 pt-4 lg:col-start-3">
              <Pin r={-3} drag={false}>
                <div className="paper relative inline-block px-7 py-5">
                  <Tape tone="pink" className="-top-3 left-1/2 -translate-x-1/2" rotate={-3} />
                  <p className="hand text-[2rem] leading-none">and then came year one.</p>
                </div>
              </Pin>
            </div>
          </div>
        </Thread>
      </div>
    </section>
  );
}
