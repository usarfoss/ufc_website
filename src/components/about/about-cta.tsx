"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { MaskLine, Reveal } from "@/components/home/motion-primitives";
import { Badge, Pin, Sticker } from "@/components/home/scrap";

export function AboutCta() {
  return (
    <section className="relative overflow-hidden bg-[var(--signal)] text-[var(--ink)]">
      <div className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-36">
        <Reveal>
          <p className="eyebrow mb-8">§ 03 · what&apos;s next</p>
        </Reveal>
        <h2 className="max-w-5xl text-[clamp(2.8rem,8vw,7.4rem)] leading-[0.92]">
          <MaskLine inView>Year two is</MaskLine>
          <MaskLine inView delay={0.1}>
            <span className="serif">yours to shape.</span>
          </MaskLine>
        </h2>
        <Reveal delay={0.1}>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-[var(--ink)]/75">
            Nobody guards the door and there&apos;s no entry exam. Come as you are. Whatever you build, design, write or organise,
            there&apos;s a place for it here.
          </p>
        </Reveal>
        <div className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-5">
          <Link href="/#join" className="btn btn-ink">
            Join the network
            <span className="disc">
              <ArrowUpRight size={15} strokeWidth={2.6} />
            </span>
          </Link>
          <Link href="/#team" className="btn btn-paper">
            Meet the team
            <span className="disc">
              <ArrowUpRight size={15} strokeWidth={2.6} />
            </span>
          </Link>
          <Link href="/events" className="btn btn-butter">
            See events
            <span className="disc">
              <ArrowUpRight size={15} strokeWidth={2.6} />
            </span>
          </Link>
        </div>

        <Pin r={-8} className="absolute right-[6%] top-16 hidden md:block" hint="drag me">
          <Badge tone="butter" className="!text-base">
            no experience needed
          </Badge>
        </Pin>
        <Pin r={9} className="absolute bottom-10 right-[12%] hidden w-28 lg:block" hint="drag me">
          <Sticker src="/collage/tux.webp" alt="Tux, the Linux penguin" className="aspect-[607/720] w-full" sizes="120px" />
        </Pin>
      </div>
    </section>
  );
}
