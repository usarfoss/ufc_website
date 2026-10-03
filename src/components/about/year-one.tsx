"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { MaskLine, Reveal } from "@/components/home/motion-primitives";
import { Badge, Mark, Pin, PostIt, Scribble, Sticker, Tape } from "@/components/home/scrap";
import { Ransom } from "@/components/home/ransom";
import { TornEdge } from "@/components/home/torn-edge";
import { YEAR_ONE_NOTES } from "./story-data";

type Tone = "butter" | "pink" | "sky" | "lilac" | "signal";

function Shot({ children, caption, tone, r, className }: { children: React.ReactNode; caption: string; tone: Tone; r: number; className?: string }) {
  return (
    <Pin r={r} className={className} hint="drag me">
      <figure className="polaroid relative">
        <Tape tone={tone} className="-top-3 left-1/2 -translate-x-1/2" rotate={-3} />
        {children}
        <figcaption className="hand px-1 pb-2 pt-2 text-[1.2rem] leading-[1.02]">{caption}</figcaption>
      </figure>
    </Pin>
  );
}

const frame = "relative w-full overflow-hidden bg-[#d9d6cb]";

export function YearOne() {
  return (
    <section id="year-one" className="dotgrid relative overflow-hidden bg-[var(--ink)] pb-28 pt-28 sm:pb-40 sm:pt-40">
      <TornEdge color="var(--butter)" className="absolute inset-x-0 top-0 z-10 -translate-y-px" />

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid items-end gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <Reveal>
              <p className="eyebrow mb-8 text-[var(--signal)]">§ 02 · year one</p>
            </Reveal>
            <h2 className="text-[clamp(2.6rem,6.4vw,6.2rem)] leading-[0.95]">
              <MaskLine inView>Our first year was</MaskLine>
              <span className="mt-[0.06em] block">
                <Ransom text="amazing." seed={3} delay={0.2} scale={0.9} />
              </span>
            </h2>
          </div>
          <Reveal delay={0.1} className="lg:col-span-4">
            <p className="max-w-sm text-[1.1rem] leading-[1.65] text-[var(--text)]/80">
              We had <Mark>a really good time</Mark>, honestly. A club should be fun first. The learning kind of happens while
              you&apos;re busy enjoying it.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <div className="mt-12 grid gap-x-10 gap-y-5 text-[1.08rem] leading-[1.7] text-[var(--text)]/80 lg:mt-16 lg:grid-cols-2">
            <p>
              We kicked things off with an orientation, then ran Git Gud so a room full of people could make their first{" "}
              <span className="code text-[0.95em] text-[var(--signal)]">git commit</span>. After that came a session on AI coding with a mini
              hackathon, and two online talks, one on threat modelling and one on getting into GSoC. Anyone could join.
            </p>
            <p>
              Then FOSS Forge happened: two days of Git Clash, a Pokémon YAML showdown and a repo sprint, as part of ELYSIAN. In between
              there were trips, parties, a group chat that never slept and plenty of late nights that turned classmates into friends. We
              started the year as a few people with an idea and finished it as a community.
            </p>
          </div>
        </Reveal>

        {/* the scrapbook */}
        <div className="mt-20 grid grid-cols-2 gap-x-6 gap-y-14 md:grid-cols-6 lg:mt-28 lg:gap-x-8">
          <Shot r={-3} tone="pink" caption="day zero: a stage, a projector and a room of curious people." className="col-span-2 md:col-span-3 lg:col-span-2">
            <div className={`${frame} aspect-[4/3]`}>
              <Image src="/about-images/team.jpg" alt="UFC members introducing the club on stage at the orientation" fill sizes="(min-width:1024px) 30vw, 90vw" className="object-cover object-top" draggable={false} />
            </div>
          </Shot>

          <Shot r={2.5} tone="butter" caption="git gud: commits, branches and a first PR." className="col-span-2 md:col-span-3 lg:col-span-2">
            <div className={`${frame} aspect-[4/3]`}>
              <Image src="/event-images/git-gud.webp" alt="Git Gud poster: Git and GitHub intro, October 10" fill sizes="(min-width:1024px) 30vw, 90vw" className="object-cover" draggable={false} />
            </div>
          </Shot>

          <Shot r={-2} tone="sky" caption="FOSS Forge '25: two days, a lot of pull requests." className="col-span-1 md:col-span-2 lg:col-span-1">
            <div className={`${frame} aspect-[2942/4160]`}>
              <Image src="/foss-forge-2025.jpg" alt="FOSS Forge 2025 poster" fill sizes="240px" className="object-cover" draggable={false} />
            </div>
          </Shot>

          <Shot r={3} tone="lilac" caption="open talk #01: threat models." className="col-span-1 md:col-span-2 lg:col-span-1">
            <div className={`${frame} aspect-[1587/2245]`}>
              <Image src="/event-images/OCC1.png" alt="Open Community Chintan #01 poster" fill sizes="240px" className="object-cover" draggable={false} />
            </div>
          </Shot>

          <Shot r={-3.5} tone="signal" caption="open talk #02: all roads lead to open source." className="col-span-1 md:col-span-2 lg:col-span-1">
            <div className={`${frame} aspect-[1587/2245]`}>
              <Image src="/event-images/OCC2.png" alt="Open Community Chintan #02 poster" fill sizes="240px" className="object-cover" draggable={false} />
            </div>
          </Shot>

          <Shot r={2} tone="pink" caption="the terminal, our natural habitat." className="col-span-1 md:col-span-3 lg:col-span-2">
            <div className={`${frame} aspect-[3/2]`}>
              <Image src="/about-images/terminal_run.jpg" alt="A terminal window running on a laptop" fill sizes="(min-width:1024px) 30vw, 45vw" className="object-cover" draggable={false} />
            </div>
          </Shot>

          <Shot r={-2.5} tone="butter" caption="builders collaborating." className="col-span-2 md:col-span-3 lg:col-span-2">
            <div className={`${frame} aspect-[16/10]`}>
              <Image src="/about-images/students_collab.jpg" alt="Students collaborating around laptops" fill sizes="(min-width:1024px) 30vw, 90vw" className="object-cover" draggable={false} />
            </div>
          </Shot>
        </div>

        {/* what the year was made of */}
        <div className="mt-24 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {YEAR_ONE_NOTES.map((t, i) => (
            <Pin key={t} r={[-3, 2.5, -2, 3.5][i]} delay={i * 0.08} className="relative" z={2} hint="drag me">
              <PostIt color={(["butter", "mint", "pink", "lilac"] as const)[i]} className="min-h-[9rem]">
                <Tape tone="signal" className="-top-3 left-1/2 -translate-x-1/2" rotate={-2} />
                {t}
              </PostIt>
            </Pin>
          ))}
        </div>

        <div className="relative mt-20 flex flex-wrap items-center gap-6">
          <Link href="/events" className="btn btn-signal lit">
            See all our events
            <span className="disc"><ArrowUpRight size={15} strokeWidth={2.6} /></span>
          </Link>
          <div className="hand flex items-center gap-2 text-2xl text-[var(--butter)]">
            <Scribble dir="left" flip className="h-9 w-12" />
            the full timeline lives there
          </div>
        </div>
      </div>

      <Pin r={10} drag className="absolute right-[4%] top-28 hidden w-24 lg:block" hint="drag me">
        <Sticker src="/collage/oggy.webp" alt="Oggy and the Cockroaches meme sticker" className="aspect-square w-full !drop-shadow-none" sizes="100px" />
      </Pin>
      <Pin r={-8} drag className="absolute bottom-24 right-[6%] hidden w-20 lg:block" hint="drag me">
        <Badge tone="butter">best year ever</Badge>
      </Pin>
    </section>
  );
}
