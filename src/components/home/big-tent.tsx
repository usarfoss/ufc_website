"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ROLES, type Role } from "./data";
import { MaskLine, Reveal } from "./motion-primitives";
import { RoleArt } from "./role-art";
import Image from "next/image";
import { Pin, Scribble, Tape } from "./scrap";

const EASE = [0.16, 1, 0.3, 1] as const;

const MARK = { mint: "#9af2c6", pink: "var(--pink)", lilac: "var(--lilac)", butter: "var(--butter)", sky: "var(--sky)" } as const;

function RoleNote({ role }: { role: Role }) {
  return (
    <motion.div
      key={role.id}
      initial={{ opacity: 0, y: 40, rotate: -5, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, rotate: -1.2, scale: 1 }}
      exit={{ opacity: 0, y: -30, rotate: 4, scale: 0.95 }}
      transition={{ duration: 0.55, ease: EASE }}
      className="paper relative px-6 pb-8 pt-10 sm:px-10"
    >
      <Tape tone="butter" className="-top-3 left-10" rotate={-5} />
      <Tape tone="pink" className="-top-2 right-24" rotate={4} />

      <div className="absolute -right-3 -top-12 w-28 rotate-[8deg] sm:-right-6 sm:-top-14 sm:w-36" aria-hidden="true">
        <RoleArt id={role.id} className="die-cut w-full" />
      </div>

      <p className="hand text-2xl text-[#5c5a48]">for</p>
      <h3 className="-mt-1 text-[clamp(2.2rem,4.4vw,3.6rem)] font-semibold leading-none tracking-[-0.05em]">{role.title}</h3>
      <p className="serif mt-4 max-w-md text-[1.35rem] leading-[1.15] text-[#2a2a20]">{role.pitch}</p>

      <p className="code mt-7 text-[0.68rem] uppercase tracking-widest text-[var(--signal-deep)]">you could</p>
      <ul className="mt-2 space-y-2">
        {role.can.map((c) => (
          <li key={c} className="flex gap-3 text-[1.02rem] leading-snug">
            <span className="pixel mt-px text-[var(--signal-deep)]">✦</span>
            {c}
          </li>
        ))}
      </ul>

      <p className="code mt-6 text-[0.68rem] uppercase tracking-widest text-[var(--signal-deep)]">tools you&apos;ll meet</p>
      <ul className="mt-2 flex flex-wrap gap-2">
        {role.tools.map((t) => (
          <li key={t} className="code rounded-full border border-[var(--line-dark)] bg-white/60 px-2.5 py-0.5 text-[0.72rem]">
            {t}
          </li>
        ))}
      </ul>

      <p className="hand mt-7 max-w-[85%] text-[1.6rem] leading-[1.05]">
        <span className="marker" style={{ ["--mark" as string]: MARK[role.tone] }}>
          first contribution → {role.first}
        </span>
      </p>

      {/* the mascots of this tribe */}
      <div className="pointer-events-none absolute -bottom-14 right-3 flex items-end sm:right-8" aria-hidden="true">
        {role.stickers.map((src, i) => (
          <motion.div
            key={src}
            className="die-cut relative -ml-3 size-[4.4rem] sm:size-[5.4rem]"
            initial={{ opacity: 0, y: 40, scale: 0.4, rotate: 0 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotate: (i % 2 ? 1 : -1) * (8 + i * 4) }}
            transition={{ type: "spring", stiffness: 160, damping: 11, delay: 0.35 + i * 0.1 }}
          >
            <Image src={`/collage/${src}.webp`} alt="" fill sizes="90px" className="object-contain" draggable={false} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

const COMMITMENTS = [
  { t: "Not just code", b: "Work is framed so a designer, a writer or a hardware person always has a place to start.", c: "mint", r: -2 },
  { t: "Ask anything", b: "No question is too basic. The chat exists for exactly those.", c: "lilac", r: 1.5 },
  { t: "Be kind", b: "Assume good faith. Review the work, never the person.", c: "pink", r: -1.2 },
] as const;

export function BigTent() {
  const [active, setActive] = useState<Role["id"]>("design");
  const role = ROLES.find((r) => r.id === active)!;

  return (
    <section id="big-tent" className="gingham relative overflow-hidden py-28 text-[var(--ink)] sm:py-40">
      <div className="mx-auto grid max-w-7xl gap-14 px-5 sm:px-8 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Reveal>
            <p className="eyebrow mb-8 inline-block bg-[var(--paper)] px-2 py-1 text-[var(--signal-deep)]">§ 03 — the big tent</p>
          </Reveal>
          <h2 className="text-[clamp(2.6rem,5.4vw,5.2rem)] font-semibold leading-[1.02] tracking-[-0.055em]">
            <MaskLine inView>
              <span className="marker" style={{ ["--mark" as string]: MARK.mint }}>
                Software
              </span>{" "}
              people.
            </MaskLine>
            <MaskLine inView delay={0.08}>
              <span className="marker" style={{ ["--mark" as string]: MARK.lilac }}>
                Designers.
              </span>
            </MaskLine>
            <MaskLine inView delay={0.16}>
              <span className="marker" style={{ ["--mark" as string]: MARK.butter }}>
                Hardware
              </span>{" "}
              hackers.
            </MaskLine>
            <MaskLine inView delay={0.24}>
              <span className="serif">You.</span>
            </MaskLine>
          </h2>

          <Reveal delay={0.1}>
            <p className="mt-8 max-w-md rounded-sm bg-[var(--paper)]/90 p-1 text-[1.05rem] leading-relaxed text-[var(--ink)]/80">
              <span className="font-semibold text-[var(--ink)]">Here&apos;s the gap.</span> Most open source only asks for code, so everyone
              else quietly assumes it isn&apos;t for them. We&apos;d like to close that. Pick what describes you — we&apos;ll show you where
              you fit.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="mt-8 flex items-center gap-2 text-[var(--ink)]/70">
              <p className="hand text-xl">I&apos;m someone who…</p>
              <Scribble dir="down" className="h-9 w-11" />
            </div>
            <ul className="mt-3 flex flex-wrap gap-2.5" role="tablist" aria-label="Pick what describes you">
              {ROLES.map((r) => {
                const on = r.id === active;
                return (
                  <li key={r.id}>
                    <button
                      role="tab"
                      aria-selected={on}
                      onClick={() => setActive(r.id)}
                      className={`btn btn-sm !px-4 ${on ? "btn-ink -rotate-1" : "btn-paper"}`}
                    >
                      {r.chip}
                    </button>
                  </li>
                );
              })}
            </ul>
          </Reveal>
        </div>

        <div className="relative lg:col-span-7">
          <div className="relative mx-auto max-w-2xl pt-10 lg:pt-6" role="tabpanel">
            <AnimatePresence mode="wait">
              <RoleNote role={role} key={role.id} />
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* The commitments */}
      <div className="mx-auto mt-24 max-w-7xl px-5 sm:px-8 lg:mt-32">
        <Reveal>
          <h3 className="serif mb-10 text-[clamp(2rem,4vw,3.4rem)] leading-none">
            What{" "}
            <span className="marker" style={{ ["--mark" as string]: MARK.mint }}>
              we promise
            </span>{" "}
            in return
          </h3>
        </Reveal>
        <div className="grid gap-8 md:grid-cols-3">
          {COMMITMENTS.map((c, i) => (
            <Pin key={c.t} r={c.r} delay={i * 0.1} className="relative" hint="drag me">
              <div className="paper relative px-6 pb-7 pt-9">
                <Tape tone={c.c === "mint" ? "signal" : c.c} className="-top-3 left-1/2 -translate-x-1/2" rotate={-2} />
                <p className="pixel text-sm uppercase text-[var(--signal-deep)]">0{i + 1}</p>
                <h4 className="mt-1 text-2xl font-semibold tracking-[-0.03em]">{c.t}</h4>
                <p className="mt-2 leading-relaxed text-[var(--ink)]/70">{c.b}</p>
              </div>
            </Pin>
          ))}
        </div>
      </div>
    </section>
  );
}
