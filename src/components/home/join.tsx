"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Check, Copy } from "lucide-react";
import { LINKS } from "./data";
import { MaskLine, Reveal } from "./motion-primitives";
import { Logo } from "./logo";
import { PixelMark } from "./pixel-mark";
import { Badge, Pin, Scribble, Sticker, Tape } from "./scrap";

const CLONE = "git clone https://github.com/usarfoss/ufc_website";

const STEPS = [
  { n: "1", title: "Say hello", body: "Join the community chat. Event links and first-timer help land there." },
  { n: "2", title: "Read this site", body: "It's open source too. Clone it, run it, find something small to fix." },
  { n: "3", title: "Open your first PR", body: "A typo counts. We'll review it kindly and show you how to land it." },
];

/** The tear-off tabs along the bottom of the flyer. Order = how people usually find us. */
const TABS = [
  { label: "WhatsApp", note: "event links", href: LINKS.whatsapp, bg: "#9af2c6" },
  { label: "Discord", note: "talk shop", href: LINKS.discord, bg: "#c7b3ff" },
  { label: "Instagram", note: "posters", href: LINKS.instagram, bg: "#ffb3cf" },
  { label: "GitHub", note: "the code", href: LINKS.github, bg: "#ffe36e" },
];

const CONFETTI = ["#14140f", "#fbf6e6", "#ffe36e", "#ffb3cf", "#9bd7ff", "#c7b3ff"];

function Burst({ n }: { n: number }) {
  if (!n) return null;
  return (
    <div key={n} className="pointer-events-none absolute right-5 top-1/2 z-20" aria-hidden="true">
      {Array.from({ length: 22 }, (_, i) => {
        const a = (i / 22) * Math.PI * 2 + (i % 3) * 0.2;
        const d = 70 + (i % 5) * 26;
        return (
          <motion.span
            key={i}
            className="absolute block"
            style={{ width: 8 + (i % 3) * 3, height: 12 + (i % 2) * 6, background: CONFETTI[i % CONFETTI.length], borderRadius: i % 4 ? 2 : 99 }}
            initial={{ x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 }}
            animate={{ x: Math.cos(a) * d, y: Math.sin(a) * d - 40 + 90, rotate: (i % 2 ? 1 : -1) * (200 + i * 22), opacity: 0, scale: 0.6 }}
            transition={{ duration: 1.1 + (i % 4) * 0.1, ease: [0.2, 0.7, 0.3, 1] }}
          />
        );
      })}
    </div>
  );
}

function CopyCommand() {
  const [copied, setCopied] = useState(false);
  const [burst, setBurst] = useState(0);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(CLONE);
      setCopied(true);
      setBurst((b) => b + 1);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable (insecure context / permissions) — the command is still selectable */
    }
  };
  return (
    <div className="code relative flex items-center justify-between gap-3 rounded-xl bg-[var(--ink)] px-4 py-3.5 text-[0.78rem] text-[var(--paper)] sm:text-[0.85rem]">
      <span className="min-w-0 truncate">
        <span className="mr-2 text-[var(--signal)]">$</span>
        <span className="select-all">{CLONE}</span>
      </span>
      <button
        onClick={copy}
        aria-label={copied ? "Copied" : "Copy clone command"}
        className="btn btn-dot btn-xs btn-signal lit !h-9 !w-9 !shadow-[2px_2px_0_var(--cream)]"
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
      <Burst n={burst} />
    </div>
  );
}

/** A campus flyer with tear-off tabs. Each tab is a link; hover one and it peels away from the paper. */
function Flyer() {
  return (
    <Pin r={1.6} drag className="relative mx-auto w-full max-w-md" hint="drag me" z={3}>
      <div className="paper relative px-6 pb-0 pt-12 sm:px-8">
        <Tape tone="butter" className="-top-3 left-8" rotate={-6} />
        <Tape tone="pink" className="-top-3 right-8" rotate={5} />
        <span className="absolute -top-3 left-1/2 block size-6 -translate-x-1/2" aria-hidden="true">
          <svg viewBox="0 0 24 24" className="size-full drop-shadow-[0_3px_2px_rgba(0,0,0,0.4)]">
            <circle cx="12" cy="10" r="8.5" fill="#ff6b5e" stroke="#14140f" strokeWidth="1.6" />
            <circle cx="9" cy="7" r="2.6" fill="#fff" opacity=".6" />
          </svg>
        </span>

        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="pixel text-[3.4rem] leading-[0.9] tracking-wide sm:text-[4.4rem]">JOIN</p>
            <p className="pixel -mt-1 text-[3.4rem] leading-[0.9] tracking-wide text-[var(--signal-deep)] sm:text-[4.4rem]">UFC</p>
          </div>
          <Logo size={76} className="mt-1 shrink-0 -rotate-3 rounded-2xl border-2 border-black/80" />
        </div>
        <p className="serif mt-3 text-[1.6rem] leading-[1.05]">open source, open minds.</p>

        <ul className="hand mt-5 space-y-1 text-[1.5rem] leading-[1.05] text-[#2a2a20]">
          <li>✦ any year · any branch</li>
          <li>✦ coders, designers, hardware, words</li>
          <li>✦ bring curiosity. that&apos;s it.</li>
        </ul>

        <div className="code mt-5 flex items-center gap-2 text-[0.64rem] uppercase tracking-widest text-black/45">
          <span className="h-px flex-1 border-t border-dashed border-black/30" />
          tear one off
          <span className="h-px flex-1 border-t border-dashed border-black/30" />
        </div>

        {/* tear-off tabs */}
        <div className="-mx-6 mt-2 grid grid-cols-4 sm:-mx-8">
          {TABS.map((t, i) => (
            <a
              key={t.label}
              href={t.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${t.label} — ${t.note}`}
              className="group relative h-44 origin-top border-x border-dashed border-black/35 px-1 pb-3 pt-3 text-black transition-all duration-500 [transition-timing-function:cubic-bezier(0.2,1.4,0.4,1)] hover:z-10 hover:translate-y-3 hover:shadow-[0_14px_20px_-8px_rgba(0,0,0,0.5)]"
              style={{ background: t.bg, rotate: "0deg", ["--r" as string]: `${(i % 2 ? 1 : -1) * (5 + i)}deg` }}
              onMouseEnter={(e) => (e.currentTarget.style.rotate = e.currentTarget.style.getPropertyValue("--r"))}
              onMouseLeave={(e) => (e.currentTarget.style.rotate = "0deg")}
            >
              <span className="flex h-full flex-col items-center justify-between">
                <span className="pixel text-xl [writing-mode:vertical-rl] rotate-180">{t.label}</span>
                <span className="code text-[0.58rem] uppercase tracking-wider opacity-60 [writing-mode:vertical-rl] rotate-180">{t.note}</span>
                <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </span>
            </a>
          ))}
        </div>
      </div>
    </Pin>
  );
}

export function Join() {
  return (
    <section id="join" className="relative overflow-hidden bg-[var(--signal)] text-[var(--ink)]">
      <div className="pointer-events-none absolute -right-24 -top-24 opacity-[0.12]" aria-hidden="true">
        <PixelMark size={520} lit={[0, 2, 4, 5, 7]} className="text-[var(--ink)] [&_rect[fill='#2ee58f']]:fill-[var(--ink)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 py-28 sm:px-8 sm:py-40">
        <Reveal>
          <p className="eyebrow mb-8">§ 07 — the invitation</p>
        </Reveal>
        <Pin r={-8} delay={0.3} className="absolute right-6 top-24 z-10 hidden md:block lg:right-[8%] lg:top-28" hint="drag me">
          <Badge tone="butter" className="!text-base">no experience needed</Badge>
        </Pin>
        <Pin r={9} delay={0.45} className="absolute right-[18%] top-[16rem] z-10 hidden w-24 lg:block xl:w-32" hint="drag me">
          <Sticker src="/collage/ferris.webp" alt="Ferris, the Rust crab" className="aspect-[3/2] w-full" sizes="140px" />
        </Pin>
        <Pin r={-10} delay={0.55} className="absolute right-[4%] top-[19rem] z-10 hidden w-16 xl:block" hint="drag me">
          <Sticker src="/collage/gopher.webp" alt="The Go gopher" className="aspect-[250/340] w-full" sizes="80px" />
        </Pin>
        <h2 className="max-w-5xl text-[clamp(2.8rem,8.4vw,8rem)] font-semibold leading-[0.92] tracking-[-0.058em]">
          <MaskLine inView>Your first pull</MaskLine>
          <MaskLine inView delay={0.1}>
            request <span className="serif">starts here.</span>
          </MaskLine>
        </h2>

        <div className="mt-16 grid grid-cols-1 items-start gap-14 lg:mt-24 lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-7">
            <ol className="space-y-px overflow-hidden rounded-2xl border border-[var(--ink)]/15 bg-[var(--ink)]/15">
              {STEPS.map((s, i) => (
                <li key={s.n} className="bg-[var(--signal)]">
                  <Reveal delay={i * 0.08} className="flex gap-5 p-5 sm:p-6">
                    <span className="serif text-5xl leading-none">{s.n}</span>
                    <div>
                      <h3 className="text-xl font-semibold tracking-tight">{s.title}</h3>
                      <p className="mt-1 max-w-md leading-relaxed text-[var(--ink)]/70">{s.body}</p>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ol>
            <div className="relative mt-5">
              <CopyCommand />
              <div className="hand pointer-events-none absolute -bottom-12 right-2 hidden items-start gap-1 text-xl text-[var(--ink)] sm:flex">
                <Scribble dir="up" className="mt-1 h-9 w-11" />
                <span className="max-w-[10rem] leading-none">psst: this site is open source too</span>
              </div>
            </div>
            <p className="mt-16 text-sm text-[var(--ink)]/70">
              Already in?{" "}
              <Link href="/login" className="lnk font-bold underline decoration-[var(--ink)]/40 decoration-2 underline-offset-4 hover:no-underline" style={{ ["--hl" as string]: "var(--butter)" }}>
                Sign in with GitHub
              </Link>{" "}
              to see your dashboard and the leaderboard.
            </p>
          </div>

          <div className="min-w-0 lg:col-span-5">
            <Flyer />
          </div>
        </div>
      </div>
    </section>
  );
}
