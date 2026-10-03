"use client";

import { MaskLine, Reveal } from "@/components/home/motion-primitives";
import { Badge, Pin, Scribble, Sticker, Tape } from "@/components/home/scrap";
import { StickerArt, type ArtId } from "@/components/home/sticker-art";
import { TornEdge } from "@/components/home/torn-edge";
import { BELIEFS } from "./story-data";

const ART: ArtId[] = ["heart", "burst", "fork", "rocket"];
const TAPES = ["pink", "sky", "butter", "signal"] as const;

export function Philosophy() {
  return (
    <section id="philosophy" className="pat-dots relative overflow-hidden bg-[var(--butter)] pb-28 pt-28 text-[var(--ink)] sm:pb-40 sm:pt-40">
      <TornEdge color="var(--paper)" className="absolute inset-x-0 top-0 z-10 -translate-y-px" />

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <p className="eyebrow mb-8 inline-block bg-[var(--cream)] px-2 py-1 text-[var(--signal-deep)]">§ 01 · our philosophy</p>
        </Reveal>
        <h2 className="max-w-5xl text-[clamp(2.6rem,7vw,6.6rem)] leading-[0.95]">
          <MaskLine inView>Open source,</MaskLine>
          <MaskLine inView delay={0.1}>
            for <span className="serif underline decoration-[var(--signal)] decoration-[0.07em] underline-offset-[0.1em]">everyone.</span>
          </MaskLine>
        </h2>
        <Reveal delay={0.1}>
          <p className="mt-8 max-w-2xl text-[1.15rem] leading-[1.7] text-[var(--ink)]/80">
            We don&apos;t have a long manifesto. There are four things we care about, and everything else we do comes from them.
          </p>
        </Reveal>

        <ol className="mt-16 grid gap-x-8 gap-y-14 md:grid-cols-2 lg:mt-24">
          {BELIEFS.map((b, i) => (
            <li key={b.n}>
              <Pin r={[-1.6, 1.4, 1.2, -1.4][i]} delay={(i % 2) * 0.1} drag={false} className="relative h-full">
                <article className="relative h-full border-[2.5px] border-[var(--ink)] bg-[var(--cream)] p-7 shadow-[7px_7px_0_var(--ink)] sm:p-9" style={{ borderRadius: "1.25rem" }}>
                  <Tape tone={TAPES[i]} className="-top-3 left-9" rotate={-5} />
                  <div className="flex items-start justify-between gap-4">
                    <span className="serif text-[clamp(5rem,9vw,8rem)] leading-[0.78] text-[var(--signal-deep)]">{b.n}</span>
                    <div className="w-16 rotate-6 sm:w-20" aria-hidden="true">
                      <StickerArt id={ART[i]} className="die-cut w-full" />
                    </div>
                  </div>
                  <h3 className="mt-6 text-[clamp(1.9rem,3.2vw,2.8rem)] leading-[1.02]">{b.title}</h3>
                  <p className="mt-4 max-w-md text-[1.08rem] leading-[1.7] text-[var(--ink)]/80">{b.body}</p>
                </article>
              </Pin>
            </li>
          ))}
        </ol>

        <div className="relative mt-16 flex flex-wrap items-center gap-4">
          <Badge tone="signal" className="!text-base">this is the whole manifesto</Badge>
          <div className="hand flex items-center gap-2 text-[1.7rem] text-[var(--ink)]/70">
            <Scribble dir="left" flip className="h-9 w-12" />
            disagree with any of it? open an issue. we mean it.
          </div>
        </div>
      </div>

      <Pin r={-9} className="absolute right-[5%] top-24 hidden w-24 lg:block" hint="drag me">
        <Sticker src="/collage/gnu.webp" alt="The GNU head, symbol of the free-software movement" className="aspect-[720/704] w-full" sizes="110px" />
      </Pin>
      <Pin r={8} className="absolute bottom-16 right-[8%] hidden w-24 lg:block" hint="drag me">
        <Sticker src="/collage/tux.webp" alt="Tux, the Linux penguin" className="aspect-[607/720] w-full" sizes="110px" />
      </Pin>
    </section>
  );
}
