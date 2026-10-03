"use client";

import Link from "next/link";
import { ArrowLeft, ArrowUpRight, MapPin, Clock, CalendarDays, Backpack, Users } from "lucide-react";
import { MaskLine, Reveal } from "@/components/home/motion-primitives";
import { Badge, Mark, Pin, Scribble, Tape } from "@/components/home/scrap";
import { StickerArt, type ArtId } from "@/components/home/sticker-art";
import { Thread } from "@/components/home/thread";
import { TornEdge } from "@/components/home/torn-edge";
import { EVENTS, type EventItem, type Round } from "@/data/events";
import { EventVisual } from "./event-visual";

const TONE_BG = { butter: "#ffe36e", mint: "#9af2c6", pink: "#ffb3cf", lilac: "#c7b3ff", sky: "#9bd7ff" } as const;
const ART: Record<EventItem["type"], ArtId> = { Orientation: "heart", Workshop: "fork", Flagship: "burst", Hackathon: "rocket", "Open talk": "play" };
const PAT: Record<EventItem["tone"], string> = { butter: "pat-dots", mint: "pat-grid", pink: "pat-gingham-pink", lilac: "pat-dots", sky: "pat-clouds" };

function Fact({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3 rounded-2xl border-2 border-[var(--ink)] bg-[var(--cream)] px-4 py-3 shadow-[3px_3px_0_var(--ink)]">
      <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full border-2 border-[var(--ink)] bg-[var(--butter)]">{icon}</span>
      <span>
        <span className="code block text-[0.66rem] font-bold uppercase tracking-widest text-[var(--ink)]/55">{label}</span>
        <span className="block font-semibold leading-snug">{children}</span>
      </span>
    </li>
  );
}

function Hero({ e }: { e: EventItem }) {
  return (
    <section className={`${PAT[e.tone]} relative overflow-hidden pb-24 pt-36 text-[var(--ink)] sm:pb-32 sm:pt-44`} style={{ backgroundColor: TONE_BG[e.tone] }}>
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Link href="/events" className="btn btn-sm btn-paper mb-8">
            <span className="disc !order-first"><ArrowLeft size={13} strokeWidth={2.6} /></span>
            All events
          </Link>
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <Badge tone="butter" className="!bg-[var(--cream)]">{e.type}</Badge>
            <span className="code text-[0.78rem] font-bold uppercase tracking-widest">no. {e.n}</span>
          </div>
          <h1 className="text-[clamp(2.8rem,7vw,6.6rem)] leading-[0.95]">
            <MaskLine>{e.title}</MaskLine>
          </h1>
          <p className="serif mt-4 text-[clamp(1.5rem,2.6vw,2.4rem)] leading-[1.1] text-[var(--ink)]/75">{e.subtitle}</p>
          <p className="mt-6 max-w-xl text-[1.12rem] leading-[1.65] text-[var(--ink)]/80">{e.summary}</p>

          <ul className="mt-9 grid max-w-xl gap-3 sm:grid-cols-2">
            <Fact icon={<CalendarDays size={15} />} label="when">{e.dateLabel}</Fact>
            {e.time && <Fact icon={<Clock size={15} />} label="time">{e.time}</Fact>}
            <Fact icon={<MapPin size={15} />} label="where">{e.location}</Fact>
          </ul>
        </div>

        <div className="relative lg:col-span-5">
          <Pin r={3} drag={false} className="relative mx-auto w-full max-w-sm">
            <div className="polaroid relative">
              <Tape tone="butter" className="-top-3 left-8" rotate={-6} />
              <Tape tone="pink" className="-top-3 right-8" rotate={5} />
              <EventVisual event={e} sizes="(min-width: 1024px) 28vw, 90vw" priority />
              <p className="hand px-1 pb-2 pt-2 text-[1.3rem] leading-none">{e.title.toLowerCase()}</p>
            </div>
          </Pin>
          <div className="pointer-events-none absolute -right-2 -top-8 w-20 rotate-12 sm:w-24" aria-hidden="true">
            <StickerArt id={ART[e.type]} className="die-cut w-full" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Overview({ e }: { e: EventItem }) {
  return (
    <section className="relative bg-[var(--paper)] text-[var(--ink)]">
      <TornEdge color={TONE_BG[e.tone]} className="absolute inset-x-0 top-0 z-10 -translate-y-px" />
      <div className="mx-auto grid max-w-7xl gap-14 px-5 pb-20 pt-24 sm:px-8 lg:grid-cols-12 lg:pb-28 lg:pt-32">
        <div className="lg:col-span-7">
          <Reveal>
            <p className="eyebrow mb-6 text-[var(--signal-deep)]">§ 01 · what it was</p>
          </Reveal>
          <h2 className="text-[clamp(2.2rem,4.6vw,4.2rem)] leading-[1]">
            The <span className="serif text-[var(--signal-deep)]">story.</span>
          </h2>
          <div className="mt-8 space-y-5 text-[1.12rem] leading-[1.75] text-[var(--ink)]/80">
            {e.overview.map((p) => (
              <p key={p.slice(0, 30)}>{p}</p>
            ))}
          </div>
          <ul className="mt-8 flex flex-wrap gap-2">
            {e.tags.map((t) => (
              <li key={t} className="code rounded-full border-2 border-[var(--ink)] px-3 py-1 text-[0.74rem]" style={{ background: TONE_BG[e.tone] }}>
                {t}
              </li>
            ))}
          </ul>
        </div>

        <aside className="space-y-8 lg:col-span-5">
          {e.highlights && (
            <Pin r={-1.2} drag={false}>
              <div className="relative border-[2.5px] border-[var(--ink)] bg-[var(--cream)] p-6 shadow-[6px_6px_0_var(--ink)]" style={{ borderRadius: "1.25rem" }}>
                <Tape tone="butter" className="-top-3 left-8" rotate={-5} />
                <p className="code text-[0.7rem] font-bold uppercase tracking-widest text-[var(--signal-deep)]">the highlights</p>
                <ul className="mt-4 space-y-3">
                  {e.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-3 font-semibold leading-snug">
                      <span className="mt-[0.35em] block size-3 shrink-0 rotate-45 border-2 border-[var(--ink)]" style={{ background: TONE_BG[e.tone] }} />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            </Pin>
          )}
          {(e.whoFor || e.bring) && (
            <Pin r={1.2} drag={false}>
              <div className="paper relative p-6">
                <Tape tone="pink" className="-top-3 right-8" rotate={4} />
                {e.whoFor && (
                  <>
                    <p className="code flex items-center gap-2 text-[0.7rem] font-bold uppercase tracking-widest text-[var(--signal-deep)]"><Users size={14} /> who it was for</p>
                    <p className="mt-2 leading-[1.6] text-[var(--ink)]/80">{e.whoFor}</p>
                  </>
                )}
                {e.bring && (
                  <>
                    <p className="code mt-6 flex items-center gap-2 text-[0.7rem] font-bold uppercase tracking-widest text-[var(--signal-deep)]"><Backpack size={14} /> what to bring</p>
                    <ul className="mt-2 space-y-1.5 leading-snug">
                      {e.bring.map((b) => (
                        <li key={b} className="flex gap-2"><span className="pixel text-[var(--signal-deep)]">✦</span>{b}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </Pin>
          )}
        </aside>
      </div>
    </section>
  );
}

function Rounds({ rounds, tone }: { rounds: Round[]; tone: EventItem["tone"] }) {
  return (
    <section className="relative bg-[var(--paper)] pb-20 text-[var(--ink)] lg:pb-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <p className="eyebrow mb-6 text-[var(--signal-deep)]">§ 02 · the rounds</p>
        </Reveal>
        <h2 className="text-[clamp(2.2rem,4.6vw,4.2rem)] leading-[1]">
          Three ways to <span className="serif text-[var(--signal-deep)]">score.</span>
        </h2>
        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {rounds.map((r, i) => (
            <Pin key={r.name} r={[-1.4, 1, -0.8][i % 3]} drag={false} delay={i * 0.08} className="h-full">
              <article className="relative flex h-full flex-col border-[2.5px] border-[var(--ink)] bg-[var(--cream)] p-7 shadow-[7px_7px_0_var(--ink)]" style={{ borderRadius: "1.25rem" }}>
                <Tape tone={(["butter", "pink", "sky"] as const)[i % 3]} className="-top-3 left-8" rotate={-5} />
                <div className="flex items-start justify-between gap-3">
                  <span className="serif text-[4.4rem] leading-[0.8] text-[var(--signal-deep)]">{i + 1}</span>
                  <Badge tone={tone === "mint" ? "signal" : tone} className="!text-[0.74rem]">{r.when}</Badge>
                </div>
                <h3 className="mt-5 text-[1.9rem] leading-[1.02]">{r.name}</h3>
                <p className="serif mt-1 text-[1.3rem] text-[var(--ink)]/65">{r.tagline}</p>
                <p className="mt-4 leading-[1.65] text-[var(--ink)]/80">{r.body}</p>
                <p className="code mt-6 text-[0.68rem] font-bold uppercase tracking-widest text-[var(--signal-deep)]">how points worked</p>
                <ul className="mt-2 space-y-2">
                  {r.scoring.map((s) => {
                    const [what, pts] = s.split(": ");
                    return (
                      <li key={s} className="flex items-baseline justify-between gap-3 border-b-2 border-dashed border-[var(--ink)]/20 pb-1.5 text-[0.95rem] leading-snug">
                        <span>{what}</span>
                        <span className="code shrink-0 text-[0.78rem] font-bold">{pts}</span>
                      </li>
                    );
                  })}
                </ul>
              </article>
            </Pin>
          ))}
        </div>
      </div>
    </section>
  );
}

function Schedule({ e, n }: { e: EventItem; n: string }) {
  const days = e.schedule!;
  return (
    <section className="relative bg-[var(--paper)] pb-24 text-[var(--ink)] lg:pb-32">
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <Reveal>
          <p className="eyebrow mb-6 text-[var(--signal-deep)]">§ {n} · the schedule</p>
        </Reveal>
        <h2 className="text-[clamp(2.2rem,4.6vw,4.2rem)] leading-[1]">
          How the day <span className="serif text-[var(--signal-deep)]">went.</span>
        </h2>

        <Thread className="mt-14" amplitude={6} lean={-24}>
          {days.map((d, di) => (
            <div key={di}>
              {d.day && (
                <div className="grid grid-cols-[2.75rem_1fr]">
                  <span className="col-start-1 grid place-items-center pt-1">
                    <span data-knot className="block size-6" />
                  </span>
                  <h3 className="col-start-2 pb-8 pt-0 text-[1.9rem] leading-none">
                    <span className="marker rounded-sm px-2" style={{ ["--mark" as string]: TONE_BG[e.tone] }}>{d.day}</span>
                  </h3>
                </div>
              )}
              <ol>
                {d.items.map((it, i) => (
                  <li key={`${it.time}-${it.activity}`} className="grid grid-cols-[2.75rem_1fr]">
                    <span className="col-start-1 grid place-items-center pt-[0.7rem]">
                      <span data-knot className="block size-6" />
                    </span>
                    <Reveal className="col-start-2 pb-8" y={20}>
                      <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1 rounded-2xl border-2 border-[var(--ink)] bg-[var(--cream)] px-5 py-3.5 shadow-[4px_4px_0_var(--ink)]" style={{ rotate: `${(i % 2 ? 0.4 : -0.4)}deg` }}>
                        <span className="code min-w-[5.2rem] text-[0.86rem] font-bold text-[var(--signal-deep)]">{it.time}</span>
                        <span className="text-[1.08rem] font-semibold leading-snug">{it.activity}</span>
                      </div>
                    </Reveal>
                  </li>
                ))}
              </ol>
            </div>
          ))}
          <div className="h-6" />
        </Thread>
      </div>
    </section>
  );
}

function SpeakerCard({ e }: { e: EventItem }) {
  const s = e.speaker!;
  return (
    <section className="relative bg-[var(--paper)] pb-24 text-[var(--ink)] lg:pb-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <p className="eyebrow mb-6 text-[var(--signal-deep)]">§ 02 · the speaker</p>
        </Reveal>
        <div className="grid items-start gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h2 className="text-[clamp(2.2rem,4.6vw,4.2rem)] leading-[1]">{s.name}</h2>
            <p className="mt-6 text-[1.1rem] leading-[1.75] text-[var(--ink)]/80">{s.bio}</p>
            <p className="mt-6 text-[1.1rem] leading-[1.75]">
              <Mark tone={TONE_BG[e.tone]}>The talk:</Mark> <span className="text-[var(--ink)]/80">{s.topic}</span>
            </p>
            <ul className="mt-8 flex flex-wrap gap-3">
              {s.links.map((l) => (
                <li key={l.href}>
                  <a href={l.href} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-paper">
                    {l.label}
                    <span className="disc"><ArrowUpRight size={13} strokeWidth={2.6} /></span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-5">
            <Pin r={-2} drag={false}>
              <div className="paper relative p-7">
                <Tape tone="butter" className="-top-3 left-1/2 -translate-x-1/2" rotate={-3} />
                <p className="code text-[0.7rem] font-bold uppercase tracking-widest text-[var(--signal-deep)]">about the series</p>
                <p className="serif mt-3 text-[1.7rem] leading-[1.1]">Open Community Chintans</p>
                <p className="mt-3 leading-[1.6] text-[var(--ink)]/75">
                  Our online talk series. Different topics, different speakers, real conversations, and no gatekeeping. Event details and meet
                  links drop on WhatsApp.
                </p>
              </div>
            </Pin>
          </div>
        </div>
      </div>
    </section>
  );
}

function Neighbours({ e }: { e: EventItem }) {
  const idx = EVENTS.findIndex((x) => x.slug === e.slug);
  const prev = EVENTS[idx - 1];
  const next = EVENTS[idx + 1];
  const card = (ev: EventItem, dir: "earlier" | "later") => (
    <Link
      href={`/events/${ev.slug}`}
      className="group relative block border-[2.5px] border-[var(--ink)] bg-[var(--cream)] p-6 shadow-[6px_6px_0_var(--ink)] transition-[transform,box-shadow] duration-300 [transition-timing-function:cubic-bezier(0.3,1.7,0.5,1)] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[10px_10px_0_var(--ink)]"
      style={{ borderRadius: "1.25rem" }}
    >
      <p className="code text-[0.7rem] font-bold uppercase tracking-widest text-[var(--signal-deep)]">{dir === "earlier" ? "← the one before" : "the one after →"}</p>
      <p className="mt-2 text-[1.6rem] font-extrabold leading-[1.05]">{ev.title}</p>
      <p className="mt-1 text-[0.95rem] text-[var(--ink)]/60">{ev.dateLabel}</p>
    </Link>
  );
  return (
    <section className="relative bg-[var(--ink)] py-20 text-[var(--ink)] sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <p className="eyebrow mb-8 text-[var(--signal)]">keep reading</p>
        <div className="grid gap-6 md:grid-cols-2">
          {prev ? card(prev, "earlier") : <span />}
          {next ? card(next, "later") : <span />}
        </div>
        <div className="mt-12 flex flex-wrap items-center gap-6">
          <Link href="/events" className="btn btn-signal lit">
            Back to all events
            <span className="disc"><ArrowUpRight size={15} strokeWidth={2.6} /></span>
          </Link>
          <div className="hand flex items-center gap-2 text-2xl text-[var(--butter)]">
            <Scribble dir="up" className="h-10 w-12" />
            there's always a next one
          </div>
        </div>
      </div>
    </section>
  );
}

export function EventDetail({ event: e }: { event: EventItem }) {
  const hasRounds = !!e.rounds;
  return (
    <>
      <Hero e={e} />
      <Overview e={e} />
      {hasRounds && <Rounds rounds={e.rounds!} tone={e.tone} />}
      {e.speaker && <SpeakerCard e={e} />}
      {e.schedule && <Schedule e={e} n={hasRounds ? "03" : "02"} />}
      {e.registration && (
        <div className="bg-[var(--paper)] pb-20 text-center">
          <a href={e.registration.href} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-paper">
            {e.registration.label}
            <span className="disc"><ArrowUpRight size={13} strokeWidth={2.6} /></span>
          </a>
        </div>
      )}
      <Neighbours e={e} />
    </>
  );
}

