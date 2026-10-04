"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { TEAM, LINKS, type Member } from "./data";
import { MaskLine, Reveal } from "./motion-primitives";
import { Badge, Pin, Polaroid, PostIt, Scribble, Sticker, Tape } from "./scrap";
import { Ransom } from "./ransom";
import { ChalkBackdrop } from "./team-chalk";

const PIN_TONES = ["#ff6b5e", "#ffe36e", "#2ee58f", "#c7b3ff", "#9bd7ff", "#ffb3cf"];
const TILT = [-3, 2.2, -1.6, 3, -2.4, 1.4, -3.2, 2.6, -1.2, 3.2, -2, 1.8];

/** Who is wired to whom on the wall: a chain through everyone, plus cross-links so it reads as a web. */
const STRINGS: [number, number][] = [
  ...TEAM.slice(1).map((_, i): [number, number] => [i, i + 1]),
  ...TEAM.flatMap((_, i): [number, number][] => (i % 2 === 0 && i + 5 < TEAM.length ? [[i, i + 5]] : [])),
];

function PushPin({ tone }: { tone: string }) {
  return (
    <span data-pin className="absolute -top-3 left-1/2 z-10 block size-6 -translate-x-1/2" aria-hidden="true">
      <svg viewBox="0 0 24 24" className="size-full drop-shadow-[0_3px_2px_rgba(0,0,0,0.45)]">
        <path d="M12 14 14 24 12 21 10 24z" fill="#9aa0a6" transform="translate(0 -1)" />
        <circle cx="12" cy="10" r="8.5" fill={tone} stroke="#14140f" strokeWidth="1.6" />
        <circle cx="9" cy="7" r="2.6" fill="#fff" opacity=".6" />
      </svg>
    </span>
  );
}

/** "HELLO my name is", the conference sticker, hand-lettered. */
function NameTag({ first }: { first: string }) {
  return (
    <div className="absolute -bottom-2 -right-1.5 z-10 w-[3.7rem] rotate-[5deg] sm:-bottom-4 sm:-right-4 sm:w-[7rem] overflow-hidden rounded-md bg-white shadow-[0_10px_16px_-6px_rgba(0,0,0,0.6)] ring-1 ring-black/25">
      <div className="bg-[#e5372f] px-1 pb-0.5 pt-1 text-center text-white sm:px-2 sm:pb-1 sm:pt-1.5">
        <p className="pixel text-[0.5rem] leading-none tracking-wider sm:text-[0.95rem]">HELLO</p>
        <p className="text-[0.28rem] font-semibold uppercase tracking-[0.14em] sm:text-[0.5rem]">my name is</p>
      </div>
      <p className="hand px-0.5 py-0.5 text-center text-[0.85rem] leading-none text-[#1b2a8a] sm:px-1 sm:py-1 sm:text-[1.5rem]">{first}</p>
    </div>
  );
}

function MemberCard({ m, i }: { m: Member; i: number }) {
  return (
    <Pin r={TILT[i % TILT.length]} delay={(i % 4) * 0.08} className="relative" z={2 + (i % 3)} hint="drag me">
      <figure className="polaroid relative">
        <PushPin tone={PIN_TONES[i % PIN_TONES.length]} />
        <div className="relative">
          <div className="relative aspect-square w-full overflow-hidden bg-[#d9d6cb]">
            <Image
              src={m.img}
              alt={`${m.name}, ${m.role}`}
              fill
              sizes="(min-width: 1024px) 260px, 45vw"
              className="object-cover"
              style={{ objectPosition: m.focus }}
              draggable={false}
            />
          </div>
          <NameTag first={m.name.split(" ")[0]} />
        </div>
        <figcaption className="px-1 pb-4 pt-3">
          <p className="pixel text-[0.68rem] uppercase leading-none text-[var(--signal-deep)]">{m.role}</p>
          <p className="hand mt-1.5 line-clamp-3 text-[1.12rem] leading-[1.02] text-[#2a2a20]">“{m.line}”</p>
        </figcaption>
      </figure>
    </Pin>
  );
}

export function Team() {
  const board = useRef<HTMLDivElement>(null);
  const paths = useRef<(SVGPathElement | null)[]>([]);

  // Red string, redrawn every frame so it follows cards as they're dragged, hovered or swayed.
  useEffect(() => {
    const el = board.current;
    if (!el) return;
    let raf = 0;
    // Only touch the SVG when a string really moved. Rewriting an unchanged path still makes the browser repaint it, and these
    // strings span the whole wall, so doing that sixty times a second was the single most expensive thing on the page.
    // Positions snap to a quarter pixel, far below anything the eye can see, so a card's gentle sway doesn't count as movement.
    const snap = (n: number) => Math.round(n * 4) / 4;
    const last: string[] = [];
    const draw = () => {
      const br = el.getBoundingClientRect();
      const pts = Array.from(el.querySelectorAll<HTMLElement>("[data-pin]")).map((p) => {
        const r = p.getBoundingClientRect();
        return { x: snap(r.left + r.width / 2 - br.left), y: snap(r.top + r.height / 2 - br.top) };
      });
      STRINGS.forEach(([a, b], i) => {
        const A = pts[a];
        const B = pts[b];
        if (!A || !B) return;
        const dist = Math.hypot(A.x - B.x, A.y - B.y);
        const d = `M${A.x} ${A.y} Q${snap((A.x + B.x) / 2)} ${snap((A.y + B.y) / 2 + Math.min(70, dist * 0.14))} ${B.x} ${B.y}`;
        if (last[i] === d) return;
        last[i] = d;
        paths.current[i]?.setAttribute("d", d); // shadow
        paths.current[i + STRINGS.length]?.setAttribute("d", d); // string
      });
    };
    const loop = () => {
      draw();
      raf = requestAnimationFrame(loop);
    };
    // Only redraw while the board is on screen; off screen there is no loop at all.
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !raf) raf = requestAnimationFrame(loop);
      else if (!e.isIntersecting) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    });
    io.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  return (
    <section id="team" className="relative bg-[var(--ink)] pb-28 pt-28 sm:pb-40 sm:pt-40">
      <ChalkBackdrop />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mb-14 grid items-end gap-8 lg:mb-20 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <Reveal>
              <p className="eyebrow mb-8 text-[var(--signal)]">§ 05 — the core leads</p>
            </Reveal>
            <h2 className="text-[clamp(2.6rem,7vw,6.5rem)] font-semibold leading-[0.95] tracking-[-0.055em]">
              <MaskLine inView>The humans behind the</MaskLine>
              <span className="mt-[0.06em] block">
                <Ransom text="community." seed={7} delay={0.2} scale={0.88} />
              </span>
            </h2>
          </div>
          <Reveal delay={0.15} className="lg:col-span-4">
            <p className="max-w-sm leading-relaxed text-[var(--text-dim)]">The students who keep this community alive.</p>
          </Reveal>
        </div>

        {/* The wall */}
        <div className="relative">
          <div className="hand pointer-events-none absolute -top-[4.6rem] left-[calc(50%+6rem)] hidden items-end gap-2 text-2xl text-[var(--butter)] md:flex">
            <Scribble dir="down-left" flip className="mb-1 h-9 w-12" />
            <span className="max-w-[14rem] -rotate-2 leading-none">yes, the photos are draggable. yes, the string follows.</span>
          </div>

          <div className="hand absolute -top-7 left-1/2 z-20 -translate-x-1/2 -rotate-2">
            <div className="paper px-6 py-1 text-3xl">
              <Tape tone="butter" className="-left-6 top-0" rotate={-35} />
              <Tape tone="pink" className="-right-6 top-0" rotate={35} />
              the wall
            </div>
          </div>

          <div
            ref={board}
            className="cork relative rounded-[1.5rem] border-[12px] border-[#6b4423] p-5 pb-[4.5rem] pt-12 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.8)] sm:border-[16px] sm:p-9 sm:pb-14 sm:pt-14"
          >
            <svg className="pointer-events-none absolute inset-0 z-[1] size-full" aria-hidden="true">
              {STRINGS.map((_, i) => (
                <g key={i}>
                  <path
                    ref={(el) => {
                      paths.current[i] = el;
                    }}
                    fill="none"
                    stroke="rgba(0,0,0,0.28)"
                    strokeWidth="4"
                    transform="translate(2 3)"
                  />
                  <path
                    ref={(el) => {
                      paths.current[i + STRINGS.length] = el;
                    }}
                    fill="none"
                    stroke="#d6332c"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                  />
                </g>
              ))}
            </svg>

            <div className="relative z-[2] grid grid-cols-2 gap-x-5 gap-y-12 sm:gap-y-14 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-16">
              {TEAM.map((m, i) => (
                <MemberCard key={m.name} m={m} i={i} />
              ))}

              {/* extras to fill the wall */}
              <Pin r={3} delay={0.2} className="relative" z={3} hint="drag me">
                <Polaroid
                  src="/about-images/team-group.webp"
                  alt="The UFC team standing together on a stage, arms around each other's shoulders"
                  caption="the team, all in one frame. we're friendly."
                  aspect="aspect-[16/9]"
                  position="50% 40%"
                  tone="sky"
                  sizes="260px"
                />
              </Pin>

              <Pin r={-2} delay={0.1} className="relative" z={3} hint="drag me">
                <div className="paper relative px-3 pb-5 pt-7 text-center [container-type:inline-size] sm:px-5 sm:pb-6 sm:pt-8">
                  <Tape tone="signal" className="-top-3 left-1/2 -translate-x-1/2" rotate={-2} />
                  <p className="pixel whitespace-nowrap text-[23cqw] leading-none tracking-normal sm:text-4xl sm:tracking-wide">WANTED</p>
                  <p className="serif mt-2 text-[30cqw] leading-none text-[var(--signal-deep)] sm:text-[2.6rem]">you.</p>
                  <p className="code mt-3 text-[0.62rem] sm:text-[0.7rem] leading-snug text-black/65">
                    contributors of every kind
                    <br />
                    reward: your name in <span className="font-bold">git blame</span>
                  </p>
                </div>
              </Pin>

              <Pin r={-4} delay={0.3} className="relative" z={4} hint="drag me">
                <PostIt color="lilac" className="min-h-[11rem]">
                  <Tape tone="pink" className="-top-3 left-1/2 -translate-x-1/2" rotate={3} />
                  psst, we accept pull requests for this wall, too.{" "}
                  <a
                    href={LINKS.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="lnk underline decoration-2 underline-offset-2 hover:no-underline"
                    style={{ ["--hl" as string]: "#fff" }}
                  >
                    github ↗
                  </a>
                </PostIt>
              </Pin>

              {/* Shares the last row with the cards above it: two columns wide on desktop and tablet, a slim strip on phones. */}
              <div className="relative -mt-12 h-0 sm:mt-0 sm:h-auto sm:min-h-[9rem] md:min-h-[11rem] col-span-2 flex items-center justify-center">
                <Pin r={-8} delay={0.35} className="absolute left-[2%] top-2 w-14 sm:left-[4%] sm:top-[6%] sm:w-28" hint="drag me">
                  <Sticker src="/collage/wilber.webp" alt="Wilber, the GIMP mascot" className="aspect-square w-full" sizes="120px" />
                </Pin>
                <Pin r={9} delay={0.45} className="absolute left-[30%] top-3 w-16 sm:left-[34%] sm:top-[24%] sm:w-32" hint="drag me">
                  <Sticker src="/collage/ferris.webp" alt="Ferris, the Rust crab" className="aspect-[3/2] w-full" sizes="140px" />
                </Pin>
                <Pin r={-4} delay={0.5} className="absolute left-[58%] top-4 sm:bottom-[4%] sm:top-auto sm:left-[62%]" hint="drag me">
                  <Badge tone="butter" className="!px-2.5 !py-1 !text-[0.62rem] sm:!px-4 sm:!py-1.5 sm:!text-sm">
                    now hiring: you
                  </Badge>
                </Pin>
              </div>
            </div>
          </div>

          <Pin r={10} delay={0.4} className="absolute -right-5 top-[10%] z-30 hidden w-24 xl:block" hint="drag me">
            <Sticker src="/collage/tux.webp" alt="Tux, the Linux penguin" className="aspect-[607/720] w-full" sizes="110px" />
          </Pin>
          <Pin r={-9} delay={0.5} className="absolute -left-5 bottom-[12%] z-30 hidden w-20 xl:block" hint="drag me">
            <Sticker src="/collage/gopher.webp" alt="The Go gopher" className="aspect-[250/340] w-full" sizes="90px" />
          </Pin>
        </div>
      </div>
    </section>
  );
}
