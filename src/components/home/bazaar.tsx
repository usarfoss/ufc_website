"use client";

import { Badge, Mark, Pin, Polaroid, PostIt, Sticker, Tape } from "./scrap";
import { MaskLine, Reveal } from "./motion-primitives";
import { NOTES } from "./data";

/** Left: the argument. Right: a pinboard of the people and things it's about. */
export function Bazaar() {
  return (
    <section id="bazaar" className="dotgrid relative overflow-hidden bg-[var(--ink)] py-28 sm:py-40">
      <div className="mx-auto grid max-w-7xl gap-16 px-5 sm:px-8 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <Reveal>
              <p className="eyebrow mb-8 text-[var(--signal)]">§ 02 — the bazaar</p>
            </Reveal>
            <h2 className="text-[clamp(2.6rem,5.6vw,5.4rem)] font-semibold leading-[0.95] tracking-[-0.055em]">
              <MaskLine inView>Open source was</MaskLine>
              <MaskLine inView delay={0.1}>
                never <span className="serif text-[var(--signal)]">one kind</span>
              </MaskLine>
              <MaskLine inView delay={0.2}>
                of person.
              </MaskLine>
            </h2>

            <Reveal delay={0.1}>
              <div className="mt-10 space-y-5 text-[1.12rem] leading-[1.65] text-[var(--text)]/80">
                <p>
                  The idea is simple: if you can <Mark>see</Mark> how something works, you can <Mark tone="var(--pink)">fix</Mark> it —
                  and if you can fix it, you can <Mark tone="#9af2c6">share</Mark> the fix. That turns software into a commons: built by
                  strangers, for strangers.
                </p>
                <p>
                  Eric Raymond called the closed way <em className="serif text-[1.15em] text-[var(--text)]">the cathedral</em> — a few people, behind doors. The
                  open way is <em className="serif text-[1.15em] text-[var(--signal)]">the bazaar</em>: everybody turns up, argues, trades and ships.
                </p>
                <p>
                  And look who turned up first. The compiler, the code that flew Apollo, the very first program — none of it came from one
                  type of person. A club that wants to do open source honestly can&apos;t be one type of club.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="mt-8 flex items-center gap-4">
                <div className="code grid grid-cols-2 overflow-hidden rounded-xl border border-[var(--line)] text-xs">
                  <div className="border-r border-[var(--line)] px-4 py-3 text-[var(--text-dim)]">
                    <p className="mb-1 text-[0.65rem] uppercase tracking-widest">cathedral</p>
                    <p className="line-through decoration-[var(--ember)]">few hands, closed doors</p>
                  </div>
                  <div className="px-4 py-3">
                    <p className="mb-1 text-[0.65rem] uppercase tracking-widest text-[var(--signal)]">bazaar</p>
                    <p>everyone, in the open</p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        {/* The board. Absolute collage on desktop, a rotated grid below that. */}
        <div className="lg:col-span-7">
          <div className="grid grid-cols-2 gap-x-5 gap-y-9 lg:relative lg:block lg:aspect-[1/1.32]">
            <Pin r={-4} className="lg:absolute lg:left-0 lg:top-0 lg:w-[34%]" z={3} hint="drag me">
              <Polaroid
                src="/collage/hamilton.webp"
                alt="Margaret Hamilton standing beside a stack of Apollo flight-software printouts as tall as she is"
                caption="Margaret Hamilton and the Apollo flight code her team wrote."
                aspect="aspect-[4/5]"
                position="50% 30%"
                tone="butter"
                sizes="300px"
              />
            </Pin>

            <Pin r={3} delay={0.1} className="lg:absolute lg:left-[33%] lg:top-[6%] lg:w-[33%]" z={4} hint="drag me">
              <Polaroid
                src="/collage/hopper.webp"
                alt="Rear Admiral Grace Hopper in uniform"
                caption="Grace Hopper: one of the first compilers — code in words, not numbers."
                aspect="aspect-[4/5]"
                position="50% 25%"
                tone="lilac"
                sizes="300px"
              />
            </Pin>

            <Pin r={-2} delay={0.2} className="lg:absolute lg:left-[66%] lg:top-[0.5%] lg:w-[33%]" z={2} hint="drag me">
              <Polaroid
                src="/collage/ada.webp"
                alt="Portrait of Ada Lovelace"
                caption="Ada Lovelace: the first published algorithm for a machine."
                aspect="aspect-[4/5]"
                position="50% 30%"
                tone="pink"
                sizes="300px"
              />
            </Pin>

            <Pin r={-5} delay={0.1} className="lg:absolute lg:left-[3%] lg:top-[47%] lg:w-[31%]" z={3} hint="drag me">
              <Polaroid
                src="/collage/arduino.webp"
                alt="An Arduino Uno open-hardware board"
                caption="Arduino: open hardware for everyone."
                tone="sky"
                fit="object-contain p-2"
                sizes="280px"
              />
            </Pin>

            <Pin r={2} delay={0.2} drag className="col-span-2 lg:absolute lg:left-[36%] lg:top-[50%] lg:w-[37%]" z={5} hint="drag me">
              <div className="paper px-6 pb-7 pt-8">
                <Tape tone="butter" className="-top-3 left-8" rotate={-6} />
                <Tape tone="sky" className="-top-2 right-8" rotate={5} />
                <p className="code text-[0.7rem] uppercase tracking-widest text-[var(--signal-deep)]">n. · open source</p>
                <p className="serif mt-2 text-[1.55rem] leading-[1.12]">
                  Code anyone can see, use, change and share.
                </p>
                <p className="hand mt-3 text-[1.35rem] leading-[1.05] text-[#3a3a2e]">
                  …which quietly means anyone can show up, too.
                </p>
              </div>
            </Pin>

            <Pin r={9} delay={0.3} className="lg:absolute lg:left-[75%] lg:top-[47%] lg:w-[24%]" z={6} hint="drag me">
              <Sticker src="/collage/tux.webp" alt="Tux, the Linux penguin" className="aspect-[607/720] w-full" sizes="200px" />
            </Pin>

            <Pin r={-8} delay={0.35} className="lg:absolute lg:left-[72%] lg:top-[67%] lg:w-[22%]" z={6} hint="drag me">
              <Sticker src="/collage/gnu.webp" alt="The GNU head" className="aspect-[720/704] w-full" sizes="180px" />
            </Pin>

            <Pin r={-6} delay={0.4} className="lg:absolute lg:left-[40%] lg:top-[75%] lg:w-[19%]" z={6} hint="drag me">
              <Sticker src="/collage/oshw.webp" alt="The open-source-hardware gear logo" className="aspect-[685/720] w-full" sizes="160px" />
            </Pin>

            <Pin r={-4} delay={0.45} className="lg:absolute lg:left-[5%] lg:top-[88%]" z={7} hint="drag me">
              <Badge tone="signal">free as in freedom</Badge>
            </Pin>

            <Pin r={5} delay={0.5} drag={false} className="hidden lg:absolute lg:left-[57%] lg:top-[90%] lg:block" z={1}>
              <div className="hand text-xl text-[var(--butter)]">
                <span className="max-w-[9rem] leading-none">software was always a team sport</span>
              </div>
            </Pin>
          </div>
        </div>
      </div>

      {/* Sticky-note philosophy */}
      <div className="mx-auto mt-12 max-w-7xl px-5 sm:px-8 lg:mt-16">
        <Reveal>
          <p className="eyebrow mb-10 text-[var(--text-dim)]">the philosophy, on sticky notes</p>
        </Reveal>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {NOTES.map((n, i) => (
            <Pin key={n.text} r={[-3, 2.5, -2, 3.5][i]} delay={i * 0.08} className="relative" z={2} hint="drag me">
              <PostIt color={n.color} className="min-h-[18rem] !text-[1.45rem]">
                <Tape tone="signal" className="-top-3 left-1/2 -translate-x-1/2" rotate={-2} />
                <span className="block text-[1.7rem] leading-[1.02]">{n.text}</span>
                <span className="mt-3 block font-[family-name:var(--font-body)] text-[0.88rem] font-medium leading-[1.4] opacity-80">{n.more}</span>
                {n.by && <span className="code mt-3 block text-[0.62rem] uppercase leading-snug tracking-wider opacity-60">— {n.by}</span>}
              </PostIt>
            </Pin>
          ))}
        </div>
      </div>
    </section>
  );
}
