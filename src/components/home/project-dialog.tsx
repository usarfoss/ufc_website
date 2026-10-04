"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { AnimatePresence, m } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { DOMAINS, STAGES, TIERS, type Domain, type Project } from "@/data/projects";
import { ArrowLink } from "./arrow-link";
import { LINKS } from "./data";
import { Badge, Tape } from "./scrap";
import { DOMAIN_ART, DOMAIN_TONE, STAGE_TONE } from "./project-style";
import { StickerArt } from "./sticker-art";

/** Stands in for a screenshot that was never taken: the project's colour, a grid, and a sticker for its kind. */
export function ProjectArt({ domain, mini = false }: { domain: Domain; mini?: boolean }) {
  return (
    <div className="pat-grid absolute inset-0 grid place-items-center" style={{ background: DOMAINS[domain].color }}>
      <div className="flex flex-col items-center gap-3">
        <StickerArt id={DOMAIN_ART[domain]} className={`die-cut ${mini ? "w-7" : "w-28 sm:w-36"}`} />
        {!mini && <p className="hand text-[1.6rem] leading-none text-[var(--ink)]/70">no screenshot yet, go read the code</p>}
      </div>
    </div>
  );
}

function address(p: Project) {
  return (p.live ?? p.repo).replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function Window({ p }: { p: Project }) {
  const wide = p.image ? p.image.w / p.image.h > 1.45 : true;
  return (
    <div className="overflow-hidden rounded-xl border-[3px] border-[var(--ink)] bg-[var(--ink)] shadow-[5px_5px_0_var(--ink)]">
      <div className="flex items-center gap-2 border-b-[3px] border-[var(--ink)] bg-[var(--cream)] px-3 py-2">
        {["#ff6b5e", "#ffe36e", "#2ee58f"].map((c) => (
          <span key={c} className="size-3 rounded-full border-2 border-[var(--ink)]" style={{ background: c }} />
        ))}
        <span className="code ml-2 min-w-0 flex-1 truncate rounded-md border-2 border-[var(--ink)] bg-white px-2 py-0.5 text-[0.68rem]">
          {address(p)}
        </span>
      </div>
      <div className="relative aspect-[16/10]">
        {p.image ? (
          <Image
            src={p.image.src}
            alt={`A screenshot of ${p.title}`}
            fill
            sizes="(min-width: 1024px) 640px, 90vw"
            className={wide ? "object-cover object-top" : "object-contain"}
            draggable={false}
          />
        ) : (
          <ProjectArt domain={p.domain} />
        )}
      </div>
    </div>
  );
}

function Details({ p }: { p: Project }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
      <div className="min-w-0 lg:col-span-7">
        <Window p={p} />
      </div>
      <div className="flex min-w-0 flex-col lg:col-span-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={DOMAIN_TONE[p.domain]} className="!px-3 !py-1 !text-[0.7rem]">
            {DOMAINS[p.domain].label}
          </Badge>
          <Badge tone={STAGE_TONE[p.stage]} className="!px-3 !py-1 !text-[0.7rem] -rotate-2">
            {STAGES[p.stage].short}
          </Badge>
          {p.tier > 0 && (
            <span className="code text-[0.7rem] font-bold uppercase tracking-wider text-[var(--ink)]/65">
              {TIERS[p.tier as 1 | 2 | 3].mark} {TIERS[p.tier as 1 | 2 | 3].label}
            </span>
          )}
        </div>
        <h3 id="project-title" className="mt-4 text-[clamp(2rem,4vw,3.1rem)] font-semibold leading-[0.98] tracking-[-0.045em]">
          {p.title}
        </h3>
        <a
          href={`https://github.com/${p.github}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-4 flex w-fit items-center gap-3"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://github.com/${p.github}.png?size=96`}
            alt=""
            width={44}
            height={44}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="size-11 rounded-full border-2 border-[var(--ink)] bg-[var(--cream)]"
          />
          <span className="leading-tight">
            <span className="block font-bold">{p.by}</span>
            <span className="code text-xs text-[var(--ink)]/60 group-hover:underline">@{p.github}</span>
          </span>
        </a>
        <p className="mt-5 text-[1.05rem] leading-[1.6] text-[var(--ink)]/80">{p.blurb}</p>
        <ul className="mt-5 flex flex-wrap gap-2" aria-label="Built with">
          {p.stack.map((s) => (
            <li key={s} className="code rounded-full border-2 border-[var(--ink)] bg-[var(--cream)] px-2.5 py-0.5 text-[0.7rem] font-bold">
              {s}
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-wrap gap-3">
          {p.live && (
            <ArrowLink href={p.live} className="btn btn-signal btn-sm" size={13}>
              Open it live
            </ArrowLink>
          )}
          <ArrowLink href={p.repo} className="btn btn-ink btn-sm" size={13}>
            Read the code
          </ArrowLink>
          {p.linkedin && (
            <ArrowLink href={p.linkedin} className="btn btn-paper btn-sm" size={13}>
              LinkedIn post
            </ArrowLink>
          )}
        </div>
      </div>
    </div>
  );
}

function NextBatch() {
  return (
    <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
      <div className="relative mx-auto aspect-square w-48 lg:col-span-4 lg:w-full lg:max-w-xs">
        <div className="pat-dots absolute inset-0 rounded-[1.5rem] border-[3px] border-dashed border-[var(--ink)] bg-[var(--butter)]" />
        <StickerArt id="rocket" className="die-cut absolute inset-[18%] size-[64%] -rotate-6" />
      </div>
      <div className="min-w-0 lg:col-span-8">
        <p className="eyebrow text-[var(--signal-deep)]">an empty drawer</p>
        <h3 id="project-title" className="mt-3 text-[clamp(2.2rem,5vw,4rem)] font-semibold leading-[0.95] tracking-[-0.05em]">
          Yours could be <span className="serif text-[var(--signal-deep)]">next.</span>
        </h3>
        <p className="mt-5 max-w-xl text-[1.1rem] leading-[1.6] text-[var(--ink)]/80">
          We run the Project Bootcamp every year, and batch 02 is on its way. Bring an idea you have always wanted to build, or just bring
          curiosity, and the mentors will help you ship it. The news drops in our chats first.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <ArrowLink href={LINKS.discord} className="btn btn-lilac" size={15}>
            Join the Discord
          </ArrowLink>
          <ArrowLink href={LINKS.whatsapp} className="btn btn-signal" size={15}>
            WhatsApp group
          </ArrowLink>
        </div>
      </div>
    </div>
  );
}

type Props = {
  projects: Project[];
  /** The project being shown, or "next" for the empty batch 02 drawer. */
  index: number | "next";
  /** Where the drawer was on screen, so the card can slide out of it. */
  origin: { x: number; y: number } | null;
  onIndex: (index: number | "next") => void;
  onClose: () => void;
};

/** The pulled-out drawer: the project's screenshot, who built it, and where to find it. Esc closes, the arrow keys flip through. */
export function ProjectDialog({ projects, index, origin, onIndex, onClose }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const step = (dir: 1 | -1) => {
    if (index === "next") return;
    onIndex((index + dir + projects.length) % projects.length);
  };
  // The key handler below is set up once, so it reads the latest step and close through refs.
  const stepRef = useRef(step);
  const closeRef = useRef(onClose);
  useEffect(() => {
    stepRef.current = step;
    closeRef.current = onClose;
  });

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    closeBtn.current?.focus();
    const html = document.documentElement;
    const overflow = html.style.overflow;
    html.style.overflow = "hidden"; // keep the page where it is while the drawer is out
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeRef.current();
      } else if (e.key === "ArrowRight") stepRef.current(1);
      else if (e.key === "ArrowLeft") stepRef.current(-1);
      else if (e.key === "Tab" && root.current) {
        const items = root.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      html.style.overflow = overflow;
      previous?.focus?.();
    };
  }, []);

  const dx = origin ? origin.x - innerWidth / 2 : 0;
  const dy = origin ? origin.y - innerHeight / 2 : 40;
  const project = index === "next" ? null : projects[index];

  return (
    <m.div
      data-lenis-prevent
      className="fixed inset-0 z-[80] flex overflow-y-auto overscroll-contain bg-[rgba(8,16,48,0.82)] p-3 sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-title"
    >
      <m.div
        ref={root}
        className="paper relative m-auto w-full max-w-5xl rounded-[1.5rem] border-[3px] border-[var(--ink)] px-4 pb-5 pt-14 text-[var(--ink)] shadow-[10px_10px_0_var(--ink)] sm:px-7 sm:pb-7 sm:pt-9"
        initial={{ opacity: 0, scale: 0.22, x: dx, y: dy, rotate: -4 }}
        animate={{ opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 30, transition: { duration: 0.2 } }}
        transition={{ type: "spring", stiffness: 210, damping: 24 }}
      >
        <Tape tone="butter" className="-top-3 left-10" rotate={-4} />
        <Tape tone="pink" className="-top-3 right-24" rotate={5} />
        <div className="absolute right-3 top-3 z-10">
          <button ref={closeBtn} type="button" onClick={onClose} aria-label="Close" className="btn btn-dot btn-paper">
            <X size={16} strokeWidth={3} />
          </button>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <m.div
            key={index}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.18 }}
          >
            {project ? <Details p={project} /> : <NextBatch />}
          </m.div>
        </AnimatePresence>

        {project && typeof index === "number" && (
          <div className="mt-6 flex items-center justify-between gap-4 border-t-2 border-dashed border-[var(--ink)]/25 pt-4">
            <button type="button" onClick={() => step(-1)} className="btn btn-sm btn-paper" aria-label="Previous project">
              <ChevronLeft size={16} strokeWidth={3} /> Prev
            </button>
            <p className="code text-xs font-bold uppercase tracking-[0.2em] text-[var(--ink)]/55" aria-live="polite">
              {String(index + 1).padStart(2, "0")} / {projects.length}
            </p>
            <button type="button" onClick={() => step(1)} className="btn btn-sm btn-paper" aria-label="Next project">
              Next <ChevronRight size={16} strokeWidth={3} />
            </button>
          </div>
        )}
      </m.div>
    </m.div>
  );
}
