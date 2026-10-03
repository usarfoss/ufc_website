"use client";

import { useRef, useState } from "react";
import { motion, useInView, useMotionTemplate, useMotionValueEvent, useScroll, useSpring, useTransform } from "framer-motion";
import { FREEDOMS, type Freedom } from "./data";
import { MaskLine, Reveal } from "./motion-primitives";
import { Badge, PostIt, Polaroid, Tape, useFinePointer } from "./scrap";
import { Ransom } from "./ransom";
import { StickerArt } from "./sticker-art";
import { TornEdge } from "./torn-edge";

const EASE = [0.16, 1, 0.3, 1] as const;

const SCENES = [
  { bg: "#ffe36e", pat: "pat-dots" },
  { bg: "#9bd7ff", pat: "pat-clouds" },
  { bg: "#ffb3cf", pat: "pat-gingham-pink" },
  { bg: "#2ee58f", pat: "pat-grid" },
] as const;

/** One piece of a scene's collage. Springs in when its scene becomes active; draggable with a mouse. */
function Item({
  show,
  left,
  top,
  w,
  r = 0,
  delay = 0,
  z = 1,
  drag = true,
  children,
}: {
  show: boolean;
  left: number;
  top: number;
  w: number;
  r?: number;
  delay?: number;
  z?: number;
  drag?: boolean;
  children: React.ReactNode;
}) {
  const fine = useFinePointer();
  const out = { opacity: 0, y: 140, rotate: r + 30, scale: 0.55 };
  return (
    <motion.div
      data-sticker
      className={`absolute ${fine && drag ? "cursor-grab active:cursor-grabbing" : ""}`}
      style={{ left: `${left}%`, top: `${top}%`, width: `${w}%`, zIndex: z }}
      initial={out}
      animate={show ? { opacity: 1, y: 0, rotate: r, scale: 1 } : out}
      transition={show ? { type: "spring", stiffness: 130, damping: 13, delay } : { duration: 0.3 }}
      drag={fine && drag && show}
      dragMomentum={false}
      dragElastic={0.2}
      whileDrag={{ scale: 1.08, rotate: 0, zIndex: 60 }}
    >
      {children}
    </motion.div>
  );
}

function RunScene({ show }: { show: boolean }) {
  return (
    <>
      <Item show={show} left={5} top={3} w={50} r={-5} z={2}>
        <Polaroid src="/about-images/students_collab.jpg" alt="Students at a UFC session, laptops open" caption="show up. that's the whole rule." aspect="aspect-[3/4]" position="50% 30%" tone="pink" sizes="320px" />
      </Item>
      <Item show={show} left={50} top={5} w={47} r={7} z={3} delay={0.15}>
        <StickerArt id="ticket" className="die-cut w-full" />
      </Item>
      <Item show={show} left={56} top={40} w={22} r={-8} z={4} delay={0.3}>
        <motion.div animate={{ scale: [1, 1.14, 1] }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}>
          <StickerArt id="play" className="die-cut w-full" />
        </motion.div>
      </Item>
      <Item show={show} left={40} top={64} w={55} r={3} z={5} delay={0.4}>
        <PostIt color="mint">
          <Tape tone="pink" className="-top-3 left-1/2 -translate-x-1/2" rotate={-3} />
          any year · any branch · any stack
        </PostIt>
      </Item>
    </>
  );
}

function StudyScene({ show }: { show: boolean }) {
  return (
    <>
      <Item show={show} left={4} top={3} w={78} r={3} z={2}>
        <Polaroid src="/about-images/foss.jpg" alt="Logos of well-known open-source projects" caption="you already use all of this." aspect="aspect-[3/2]" tone="butter" sizes="460px" />
      </Item>
      <Item show={show} left={18} top={12} w={26} r={-10} z={6} delay={0.25} drag={false}>
        <motion.div animate={{ x: [0, 190, 90, 0], y: [0, 20, 80, 0], rotate: [-8, 10, -4, -8] }} transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}>
          <StickerArt id="magnifier" className="die-cut w-full" />
        </motion.div>
      </Item>
      <Item show={show} left={20} top={63} w={76} r={-2} z={4} delay={0.3}>
        <div className="paper code px-5 pb-5 pt-7 text-[0.78rem] leading-6">
          <Tape tone="sky" className="-top-3 left-8" rotate={-4} />
          <div className="text-[#6a6a58]">// you use all of this every day.</div>
          <div><span className="text-[var(--signal-deep)]">$</span> git clone --depth 1 &lt;anything&gt;</div>
          <div><span className="text-[var(--signal-deep)]">$</span> grep -r &quot;how does this work&quot; ./src</div>
          <div className="font-bold">→ 1,204 matches. start reading.</div>
        </div>
      </Item>
      <Item show={show} left={0} top={80} w={30} r={-9} z={5} delay={0.45}>
        <Badge tone="lilac">read the source</Badge>
      </Item>
    </>
  );
}

function ShareScene({ show }: { show: boolean }) {
  return (
    <>
      <Item show={show} left={3} top={3} w={39} r={-8} z={2}>
        <Polaroid src="/event-images/OCC1.png" alt="Open Community Chintan #01 poster" caption="talk #01" aspect="aspect-[1587/2245]" tone="butter" sizes="260px" />
      </Item>
      <Item show={show} left={37} top={12} w={39} r={6} z={3} delay={0.15}>
        <Polaroid src="/event-images/OCC2.png" alt="Open Community Chintan #02 poster" caption="talk #02" aspect="aspect-[1587/2245]" tone="sky" sizes="260px" />
      </Item>
      <Item show={show} left={4} top={67} w={52} r={-2} z={5} delay={0.35}>
        <PostIt color="butter">
          <Tape tone="signal" className="-top-3 left-1/2 -translate-x-1/2" rotate={-2} />
          talks are open to everyone — links drop on WhatsApp
        </PostIt>
      </Item>
      <Item show={show} left={62} top={64} w={34} r={8} z={5} delay={0.45}>
        <Badge tone="signal">pass it on</Badge>
      </Item>
      {show && (
        <motion.div
          className="pointer-events-none absolute z-[7] w-[15%]"
          animate={{ left: ["-18%", "108%"], top: ["72%", "34%", "52%", "8%"], rotate: [14, -14, 8, -20] }}
          transition={{ repeat: Infinity, duration: 10, ease: "easeInOut", repeatDelay: 1 }}
        >
          <StickerArt id="plane" className="die-cut w-full" />
        </motion.div>
      )}
    </>
  );
}

function ImproveScene({ show }: { show: boolean }) {
  return (
    <>
      <Item show={show} left={2} top={2} w={43} r={-6} z={2}>
        <Polaroid src="/foss-forge-2025.jpg" alt="FOSS Forge 2025 poster" caption="foss forge '25" aspect="aspect-[2942/4160]" tone="pink" sizes="280px" />
      </Item>
      <Item show={show} left={38} top={26} w={60} r={3} z={4} delay={0.2}>
        <div className="paper code overflow-hidden text-[0.78rem] leading-6">
          <Tape tone="butter" className="-top-3 right-10" rotate={5} />
          <div className="border-b border-black/10 px-4 pb-1 pt-4 text-[0.66rem] text-[#6a6a58]">club/culture.ts</div>
          <div className="bg-[rgba(255,107,94,0.2)] px-4 text-[#a52a1d]">- while (gatekeeping) {"{"}</div>
          <div className="bg-[rgba(46,229,143,0.28)] px-4 text-[#06653a]">+ while (contributing) {"{"}</div>
          <div className="px-4 text-[#6a6a58]">&nbsp;&nbsp;mergeKindly();</div>
          <div className="px-4 pb-3 text-[#6a6a58]">{"}"}</div>
        </div>
      </Item>
      <Item show={show} left={46} top={64} w={46} r={-11} z={6} delay={0.55} drag>
        <motion.div initial={false} animate={show ? { scale: [2.6, 1] } : { scale: 2.6 }} transition={{ delay: 0.7, duration: 0.35, ease: [0.2, 1.6, 0.4, 1] }}>
          <Badge tone="butter" className="!text-lg">✓ merged into main</Badge>
        </motion.div>
      </Item>
      <Item show={show} left={76} top={0} w={18} r={10} z={5} delay={0.4} drag={false}>
        <motion.div animate={{ y: [0, -20, 0], rotate: [-6, 6, -6] }} transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}>
          <StickerArt id="rocket" className="die-cut w-full" />
        </motion.div>
      </Item>
      <Item show={show} left={5} top={72} w={19} r={-10} z={5} delay={0.5}>
        <motion.div animate={{ rotate: [0, 12, -12, 0] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}>
          <StickerArt id="fork" className="die-cut w-full" />
        </motion.div>
      </Item>
    </>
  );
}

const SCENE_BODY = [RunScene, StudyScene, ShareScene, ImproveScene];

function Copy({ f, show }: { f: Freedom; show: boolean }) {
  return (
    <motion.div animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: 36 }} transition={{ duration: 0.6, ease: EASE, delay: show ? 0.1 : 0 }}>
      <div className="flex items-end gap-5">
        <span className="serif die-num text-[clamp(8.5rem,16vw,15rem)] leading-[0.8]">{f.n}</span>
        <div className="pb-4 text-[clamp(2.8rem,5.4vw,5rem)] leading-none">
          <Ransom text={f.verb} seed={f.n * 3 + 1} delay={0.25} play={show} />
        </div>
      </div>
      <p className="serif mt-8 max-w-lg text-[clamp(1.5rem,2.3vw,2.1rem)] leading-[1.14]">{f.rule}</p>
      <p className="mt-4 max-w-md text-[1.02rem] leading-relaxed text-[var(--ink)]/80">
        <span className="code mr-2 rounded bg-[var(--ink)] px-1.5 py-0.5 text-[0.66rem] uppercase tracking-widest text-[var(--paper)]">at ufc</span>
        {f.ours}
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        {f.chips.map((c, i) => (
          <li
            key={c}
            className="code border-2 border-[var(--ink)] bg-[var(--cream)] px-3 py-1 text-[0.72rem] shadow-[3px_3px_0_var(--ink)]"
            style={{ rotate: `${(i % 2 ? 1 : -1) * (1 + i)}deg` }}
          >
            {c}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

function DesktopStage() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const bar = useSpring(p, { stiffness: 140, damping: 26, mass: 0.4 });

  // Each later scene is revealed by a circle growing out of the bottom-right corner.
  const r1 = useTransform(p, [0.17, 0.28], [0, 175]);
  const r2 = useTransform(p, [0.42, 0.53], [0, 175]);
  const r3 = useTransform(p, [0.67, 0.78], [0, 175]);
  const clips = [null, useMotionTemplate`circle(${r1}% at 86% 100%)`, useMotionTemplate`circle(${r2}% at 86% 100%)`, useMotionTemplate`circle(${r3}% at 86% 100%)`];

  useMotionValueEvent(p, "change", (v) => {
    let a = 0;
    for (let i = 1; i < FREEDOMS.length; i++) if (v >= i / FREEDOMS.length - 0.075) a = i; // content springs in as the wipe begins
    setActive(a);
  });

  // Scroll progress at which each scene is fully revealed and settled (after its wipe finishes, before the next begins).
  const STOPS = [0.05, 0.35, 0.6, 0.92];
  const tween = useRef(0);

  const jump = (i: number) => {
    const el = ref.current;
    if (!el) return;
    // offsetTop would be relative to the <section>, not the page, so measure against the document instead.
    const top = el.getBoundingClientRect().top + window.scrollY;
    const target = top + (el.offsetHeight - window.innerHeight) * STOPS[i];
    const from = window.scrollY;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    cancelAnimationFrame(tween.current);
    if (reduced) return window.scrollTo(0, target);
    const dur = Math.min(1400, 450 + Math.abs(target - from) * 0.35);
    const t0 = performance.now();
    const stop = () => cancelAnimationFrame(tween.current); // the reader grabbed the wheel: let go
    window.addEventListener("wheel", stop, { once: true, passive: true });
    window.addEventListener("touchstart", stop, { once: true, passive: true });
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / dur);
      window.scrollTo(0, from + (target - from) * (1 - Math.pow(1 - k, 3)));
      if (k < 1) tween.current = requestAnimationFrame(step);
    };
    tween.current = requestAnimationFrame(step);
  };

  return (
    <div ref={ref} className="relative hidden lg:block" style={{ height: `${FREEDOMS.length * 85 + 15}vh` }}>
      <TornEdge color="var(--paper)" className="absolute inset-x-0 top-0 z-30 -translate-y-px" />
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {FREEDOMS.map((f, i) => {
          const sc = SCENES[i];
          const Body = SCENE_BODY[i];
          const show = active === i;
          return (
            <motion.div
              key={f.n}
              className={`absolute inset-0 ${sc.pat}`}
              style={{ backgroundColor: sc.bg, clipPath: clips[i] ?? undefined, zIndex: i + 1 }}
            >
              <div className="mx-auto grid h-full w-full max-w-7xl grid-cols-12 items-center gap-8 px-8 pt-8">
                <div className="col-span-6 text-[var(--ink)]">
                  <Copy f={f} show={show} />
                  <div className="mt-10 flex items-center gap-4">
                    <div className="flex gap-2">
                      {FREEDOMS.map((x) => (
                        <button
                          key={x.n}
                          onClick={() => jump(x.n)}
                          aria-label={`Go to freedom ${x.n}: ${x.verb}`}
                          className={`btn btn-dot btn-xs ${x.n === i ? "btn-ink" : "btn-paper"}`}
                        >
                          <span className="code text-[0.8rem] font-bold">{x.n}</span>
                        </button>
                      ))}
                    </div>
                    <div className="relative h-[3px] flex-1 bg-[var(--ink)]/20">
                      <motion.div className="absolute inset-y-0 left-0 w-full origin-left bg-[var(--ink)]" style={{ scaleX: bar }} />
                    </div>
                  </div>
                </div>
                <div className="relative col-span-6 h-[min(74svh,44rem)]">
                  <Body show={show} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function MobileScene({ f }: { f: Freedom }) {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, margin: "-12% 0px" });
  const sc = SCENES[f.n];
  const Body = SCENE_BODY[f.n];
  return (
    <div ref={ref} className={`${sc.pat} relative overflow-hidden rounded-[2rem] px-5 py-12 text-[var(--ink)]`} style={{ backgroundColor: sc.bg }}>
      <Copy f={f} show={seen} />
      <div className="relative mx-auto mt-12 aspect-[1/1.12] w-full max-w-md">
        <Body show={seen} />
      </div>
    </div>
  );
}

export function Freedoms() {
  return (
    <section id="manifesto" className="relative bg-[var(--paper)] text-[var(--ink)]">
      <div className="mx-auto max-w-7xl px-5 pb-16 pt-36 sm:px-8 lg:pb-24 lg:pt-48">
        <Reveal>
          <p className="eyebrow mb-8 text-[var(--signal-deep)]">§ 01 — the premise</p>
        </Reveal>
        <h2 className="max-w-6xl text-[clamp(2.4rem,6vw,5.75rem)] font-semibold leading-[0.98] tracking-[-0.05em]">
          <MaskLine inView>Free software isn&apos;t free</MaskLine>
          <MaskLine inView delay={0.1}>
            as in <span className="serif text-[var(--signal-deep)]">beer.</span> It&apos;s free
          </MaskLine>
          <MaskLine inView delay={0.2}>
            as in{" "}
            <span className="serif underline decoration-[var(--signal)] decoration-[0.06em] underline-offset-[0.12em]">freedom</span>
            <span className="text-[var(--ink)]/35"> — four of them.</span>
          </MaskLine>
        </h2>
        <Reveal delay={0.1}>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-[var(--ink)]/65">
            The Free Software Foundation numbers them from zero, because programmers do. We built a club around each one — scroll to
            meet them.
          </p>
        </Reveal>
      </div>

      <DesktopStage />

      <div className="space-y-6 px-4 pb-20 sm:px-6 lg:hidden">
        {FREEDOMS.map((f) => (
          <MobileScene key={f.n} f={f} />
        ))}
      </div>
    </section>
  );
}
