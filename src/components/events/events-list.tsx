"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { MaskLine, Reveal } from "@/components/home/motion-primitives";
import { Badge, Pin, Scribble, Sticker, Tape } from "@/components/home/scrap";
import { StickerArt } from "@/components/home/sticker-art";
import { Thread } from "@/components/home/thread";
import { LINKS } from "@/components/home/data";
import { EVENTS_NEWEST_FIRST, type EventItem } from "@/data/events";
import { EventVisual } from "./event-visual";

const TONE_BG = { butter: "#ffe36e", mint: "#9af2c6", pink: "#ffb3cf", lilac: "#c7b3ff", sky: "#9bd7ff" } as const;
const TAPES = ["butter", "pink", "sky", "lilac", "signal"] as const;

/** Tall posters get cropped in the list so a card never turns into a skyscraper. */
const isPoster = (e: EventItem) => !!e.image && /1587|2942/.test(e.image.aspect);

function EventCard({ e, i, latest }: { e: EventItem; i: number; latest: boolean }) {
  const right = i % 2 === 1;
  return (
    <li className="grid grid-cols-[2.75rem_1fr] items-start lg:grid-cols-[1fr_8rem_1fr]">
      <span className="col-start-1 mt-10 grid place-items-center lg:col-start-2 lg:mt-14">
        <span data-knot className={`block size-6 ${right ? "lg:translate-x-[1.8rem]" : "lg:-translate-x-[1.8rem]"}`} />
      </span>

      <Reveal className={`col-start-2 pb-16 lg:pb-24 ${right ? "lg:col-start-3" : "lg:col-start-1"}`} y={40}>
        <article
          className={`group relative border-[2.5px] border-[var(--ink)] bg-[var(--cream)] shadow-[7px_7px_0_var(--ink)] transition-[transform,box-shadow] duration-300 [transition-timing-function:cubic-bezier(0.3,1.7,0.5,1)] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[11px_11px_0_var(--ink)] ${right ? "lg:-rotate-[0.6deg]" : "lg:rotate-[0.6deg]"}`}
          style={{ borderRadius: "1.25rem" }}
        >
          <Tape tone={TAPES[i % TAPES.length]} className="-top-3 left-8 z-10" rotate={-5} />

          {/* poster */}
          <div className="overflow-hidden p-3 pb-0">
            <div className="relative overflow-hidden rounded-[0.9rem] border-2 border-[var(--ink)]">
              <div className={`${isPoster(e) ? "max-h-[22rem]" : ""} overflow-hidden`}>
                <EventVisual event={e} sizes="(min-width: 1024px) 35vw, 90vw" />
              </div>
              <span className="absolute left-3 top-3">
                <Badge tone={e.tone === "mint" ? "signal" : e.tone} className="!text-[0.78rem]">
                  {e.type}
                </Badge>
              </span>
              {latest && (
                <span className="absolute right-3 top-3">
                  <Badge tone="butter" className="!text-[0.78rem] -rotate-3">
                    latest
                  </Badge>
                </span>
              )}
            </div>
          </div>

          <div className="p-6 pt-5 sm:p-8 sm:pt-6">
            <div className="flex items-baseline justify-between gap-4">
              <span className="serif text-[clamp(3.6rem,6vw,5.4rem)] leading-[0.8] text-[var(--signal-deep)]">{e.n}</span>
              <span className="code text-right text-[0.78rem] font-bold uppercase leading-snug tracking-wider text-[var(--ink)]/65">
                {e.dateLabel}
                <span className="block normal-case tracking-normal opacity-80">{e.location}</span>
              </span>
            </div>

            <h3 className="mt-4 text-[clamp(1.7rem,2.8vw,2.4rem)] leading-[1.04]">
              {/* the title's link stretches over the whole card, so the card is one big button */}
              <Link
                href={`/events/${e.slug}`}
                className="after:absolute after:inset-0 after:z-10 after:rounded-[1.25rem] after:content-['']"
              >
                {e.title}
              </Link>
            </h3>
            <p className="mt-1 text-[0.98rem] font-semibold text-[var(--ink)]/55">{e.subtitle}</p>
            <p className="mt-4 text-[1.04rem] leading-[1.65] text-[var(--ink)]/80">{e.summary}</p>

            <ul className="mt-5 flex flex-wrap gap-2">
              {e.tags.map((t) => (
                <li
                  key={t}
                  className="code rounded-full border-2 border-[var(--ink)] px-2.5 py-0.5 text-[0.7rem]"
                  style={{ background: TONE_BG[e.tone] }}
                >
                  {t}
                </li>
              ))}
            </ul>

            <span className="btn btn-sm btn-ink mt-6 pointer-events-none">
              Read the full story
              <span className="disc">
                <ArrowUpRight size={13} strokeWidth={2.6} />
              </span>
            </span>
          </div>
        </article>
      </Reveal>
    </li>
  );
}

export function EventsList() {
  return (
    <section className="relative bg-[var(--paper)] text-[var(--ink)]">
      <div className="mx-auto max-w-7xl px-5 pb-16 pt-40 sm:px-8 lg:pb-24 lg:pt-52">
        <Reveal>
          <p className="eyebrow mb-8 text-[var(--signal-deep)]">§ 00 · events</p>
        </Reveal>
        <h1 className="max-w-6xl text-[clamp(2.6rem,6.6vw,6.4rem)] leading-[0.98]">
          <MaskLine>Not many events,</MaskLine>
          <MaskLine delay={0.1}>
            <span className="serif underline decoration-[var(--signal)] decoration-[0.06em] underline-offset-[0.12em]">done properly.</span>
          </MaskLine>
        </h1>
        <Reveal delay={0.1}>
          <div className="mt-8 grid max-w-4xl gap-x-12 gap-y-4 text-[1.1rem] leading-[1.7] text-[var(--ink)]/75 md:grid-cols-2">
            <p>
              Offline events take up a lot of time, and we know it. So we don&apos;t run many. A few a semester, done well, beat a packed
              calendar that&apos;s mostly there for show.
            </p>
            <p>
              We don&apos;t chase sponsors to pay for a tech club either. This space is for people who genuinely want to be here. Click any
              event on the thread to read the whole story.
            </p>
          </div>
        </Reveal>
        <div className="hand mt-6 flex flex-col items-start text-2xl text-[var(--ink)]/60">
          newest first, scroll down to travel back in time
          <Scribble dir="down" className="ml-10 h-12 w-14" />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 pb-8 sm:px-8">
        <Thread>
          <ol>
            {EVENTS_NEWEST_FIRST.map((e, i) => (
              <EventCard key={e.slug} e={e} i={i} latest={i === 0} />
            ))}
          </ol>

          <div className="grid grid-cols-[2.75rem_1fr] lg:grid-cols-[1fr_8rem_1fr]">
            <span className="col-start-1 grid place-items-center lg:col-start-2">
              <span data-knot className="block size-6" />
            </span>
            <div className="col-start-2 pb-24 pt-4 lg:col-start-3">
              <Pin r={-3} drag={false}>
                <div className="paper relative inline-block px-7 py-5">
                  <Tape tone="pink" className="-top-3 left-1/2 -translate-x-1/2" rotate={-3} />
                  <p className="hand text-[2rem] leading-none">and it all started here.</p>
                </div>
              </Pin>
            </div>
          </div>
        </Thread>
      </div>
    </section>
  );
}

export function EventsCta() {
  return (
    <section className="relative overflow-hidden bg-[var(--signal)] text-[var(--ink)]">
      <div className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-36">
        <Reveal>
          <p className="eyebrow mb-8">§ 01 · don&apos;t miss the next one</p>
        </Reveal>
        <h2 className="max-w-5xl text-[clamp(2.8rem,8vw,7.4rem)] leading-[0.92]">
          <MaskLine inView>Stay in</MaskLine>
          <MaskLine inView delay={0.1}>
            <span className="serif">the loop.</span>
          </MaskLine>
        </h2>
        <Reveal delay={0.1}>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-[var(--ink)]/75">
            Event details and meet links go up on WhatsApp first. Updates and posters land on Instagram. Join whichever you like and you
            won&apos;t miss a thing.
          </p>
        </Reveal>
        <div className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-5">
          <a href={LINKS.whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-ink">
            WhatsApp community
            <span className="disc">
              <ArrowUpRight size={15} strokeWidth={2.6} />
            </span>
          </a>
          <a href={LINKS.instagram} target="_blank" rel="noopener noreferrer" className="btn btn-pink">
            Instagram
            <span className="disc">
              <ArrowUpRight size={15} strokeWidth={2.6} />
            </span>
          </a>
          <a href={LINKS.discord} target="_blank" rel="noopener noreferrer" className="btn btn-lilac">
            Discord
            <span className="disc">
              <ArrowUpRight size={15} strokeWidth={2.6} />
            </span>
          </a>
        </div>
        <Pin r={-8} className="absolute right-[6%] top-16 hidden md:block" hint="drag me">
          <Badge tone="butter" className="!text-base">
            everyone&apos;s invited
          </Badge>
        </Pin>
        <Pin r={9} className="absolute bottom-10 right-[12%] hidden w-24 lg:block" hint="drag me">
          <div className="die-cut w-full">
            <StickerArt id="rocket" className="w-full" />
          </div>
        </Pin>
        <Pin r={-6} className="absolute bottom-24 right-[26%] hidden w-24 lg:block" hint="drag me">
          <Sticker src="/collage/tux.webp" alt="Tux, the Linux penguin" className="aspect-[607/720] w-full" sizes="110px" />
        </Pin>
      </div>
    </section>
  );
}
