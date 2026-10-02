"use client";

import { motion } from "framer-motion";
import { ArrowDown, ArrowRight } from "lucide-react";
import { HeroBackdrop } from "./hero-backdrop";
import { MaskLine } from "./motion-primitives";
import { HeroPile } from "./hero-pile";
import { Ransom } from "./ransom";
import { Badge, Mark, Scribble } from "./scrap";
import { StickerArt } from "./sticker-art";

const EASE = [0.16, 1, 0.3, 1] as const;

const go = (id: string) => (e: React.MouseEvent) => {
  e.preventDefault();
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
};

export function Hero() {
  return (
    <section className="grain relative isolate flex min-h-[100svh] flex-col overflow-hidden">
      <HeroBackdrop />

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-end px-5 pb-[19rem] pt-28 sm:px-8 sm:pb-44 sm:pt-32 lg:pb-28">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
          className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2"
        >
          <Badge tone="signal" className="!px-3.5 !py-1 !text-[0.78rem]">
            <span className="mr-2 inline-block size-2 animate-pulse rounded-full bg-[var(--ink)]" />
            open to everyone
          </Badge>
          <span className="hand -rotate-1 text-[1.55rem] leading-none text-[var(--butter)]">a student community at USAR · GGSIPU, Delhi</span>
        </motion.div>

        <h1 className="relative text-[clamp(3.3rem,15.5vw,5.6rem)] leading-[0.86] tracking-[-0.038em] sm:text-[clamp(4.2rem,10.2vw,10.2rem)]">
          <MaskLine delay={0.15}>Open Source,</MaskLine>
          <span className="mt-[0.08em] flex flex-wrap items-end gap-x-[0.2em]">
            <MaskLine delay={0.28} className="!w-auto">Open</MaskLine>
            <Ransom text="Minds." seed={2} delay={0.7} scale={0.84} className="-rotate-1 pb-[0.02em]" />
          </span>

          <StickerArt id="sparkle" className="twinkle pointer-events-none absolute right-[30%] top-[80%] hidden w-[0.2em] sm:block" />
        </h1>

        <motion.div
          data-pile-avoid
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.9, ease: EASE }}
          className="mt-8 max-w-[33rem] lg:mt-10"
        >
          <p className="text-[1.18rem] leading-[1.55] text-[var(--text)]/85 sm:text-[1.28rem]">
            We read code, break it, fix it and give it back. UFC is where <Mark>curious students</Mark> become{" "}
            <Mark tone="var(--pink)">contributors</Mark> —{" "}
            <span className="underline decoration-[var(--signal)] decoration-wavy decoration-2 underline-offset-[7px]">in public, together,</span>{" "}
            and with nobody asking permission.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-5">
            <a href="#join" onClick={go("join")} className="btn btn-signal lit">
              Join the network
              <span className="disc"><ArrowRight size={15} strokeWidth={2.6} /></span>
            </a>
            <a href="#manifesto" onClick={go("manifesto")} className="btn btn-ghost">
              Read the manifesto
              <span className="disc"><ArrowDown size={15} strokeWidth={2.6} /></span>
            </a>
          </div>
        </motion.div>
      </div>

      {/* Stickers fall in from the top and pile up along the floor. */}
      <HeroPile />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.6, duration: 1 }}
        className="hand pointer-events-none absolute right-6 top-[34%] z-[7] hidden items-start gap-2 text-[1.7rem] text-[var(--butter)] lg:flex xl:right-14"
      >
        <Scribble variant="curl" className="mt-4 h-12 w-14 -scale-x-100 rotate-[60deg]" />
        <span className="max-w-[9.5rem] -rotate-3 leading-none">go on — grab a sticker and throw it!</span>
      </motion.div>
    </section>
  );
}
