"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from "framer-motion";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { LINKS, NAV_LINKS, SECTIONS } from "./data";
import { Logo } from "./logo";
import { Badge, Tape } from "./scrap";
import { StickerArt } from "./sticker-art";

const EASE = [0.16, 1, 0.3, 1] as const;

const scrollToId = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

const SOCIALS = [
  { label: "WhatsApp", href: LINKS.whatsapp, cls: "btn-signal" },
  { label: "Discord", href: LINKS.discord, cls: "btn-lilac" },
  { label: "Instagram", href: LINKS.instagram, cls: "btn-pink" },
  { label: "GitHub", href: LINKS.github, cls: "btn-paper" },
];

function MenuOverlay({ origin, onClose }: { origin: { x: number; y: number }; onClose: () => void }) {
  const reach = Math.hypot(Math.max(origin.x, innerWidth - origin.x), Math.max(origin.y, innerHeight - origin.y)) + 40;
  const jump = (id: string) => {
    onClose();
    window.setTimeout(() => scrollToId(id), 380);
  };

  return (
    <motion.div
      data-lenis-prevent
      className="pat-dots fixed inset-0 z-40 overflow-y-auto overscroll-contain bg-[var(--butter)] text-[var(--ink)]"
      initial={{ clipPath: `circle(0px at ${origin.x}px ${origin.y}px)` }}
      animate={{ clipPath: `circle(${reach}px at ${origin.x}px ${origin.y}px)` }}
      exit={{ clipPath: `circle(0px at ${origin.x}px ${origin.y}px)`, transition: { duration: 0.45, ease: [0.5, 0, 0.75, 0] } }}
      transition={{ duration: 0.75, ease: EASE }}
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
    >
      <div className="mx-auto grid min-h-full max-w-7xl gap-10 px-5 pb-12 pt-28 sm:px-8 sm:pt-32 lg:grid-cols-12 lg:items-center">
        <ul className="lg:col-span-7">
          {[{ label: "Home", href: "/" }, ...NAV_LINKS].map((l, i) => (
            <motion.li
              key={l.href}
              initial={{ opacity: 0, y: 60, rotate: 3 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ delay: 0.25 + i * 0.07, duration: 0.7, ease: EASE }}
            >
              <Link
                href={l.href}
                onClick={onClose}
                className="group relative flex items-baseline gap-4 py-1 text-[clamp(3rem,10vw,8rem)] font-extrabold leading-[0.95] tracking-[-0.045em] transition-transform duration-300 hover:translate-x-3"
              >
                <span className="code w-8 -translate-y-[0.4em] text-sm font-bold tracking-widest opacity-50 sm:w-12 sm:text-base">0{i}</span>
                <span className="relative">
                  <span className="relative z-10">{l.label}</span>
                  <span className="absolute inset-x-[-0.1em] bottom-[0.08em] z-0 h-[0.34em] origin-left scale-x-0 rounded-sm bg-[var(--pink)] transition-transform duration-300 group-hover:scale-x-100" />
                </span>
                <ArrowUpRight className="size-[0.55em] -translate-x-2 self-center opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
              </Link>
            </motion.li>
          ))}
        </ul>

        <div className="lg:col-span-5">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="eyebrow mb-4 text-[var(--ink)]/60">
            jump to a chapter
          </motion.p>
          <ul className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
            {SECTIONS.map((s, i) => (
              <motion.li key={s.id} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.05, duration: 0.5, ease: EASE }}>
                <button onClick={() => jump(s.id)} className="group flex w-full items-baseline gap-3 border-b-2 border-[var(--ink)]/15 py-2.5 text-left transition-colors hover:border-[var(--ink)]">
                  <span className="code text-xs font-bold text-[var(--signal-deep)]">§{s.n}</span>
                  <span className="text-lg font-bold tracking-tight transition-transform duration-300 group-hover:translate-x-1.5">{s.label}</span>
                </button>
              </motion.li>
            ))}
          </ul>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85, duration: 0.6, ease: EASE }} className="mt-10 flex flex-wrap gap-3">
            {SOCIALS.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className={`btn btn-sm ${s.cls}`}>
                {s.label}
                <span className="disc"><ArrowUpRight size={13} /></span>
              </a>
            ))}
          </motion.div>
        </div>
      </div>

      {/* decor */}
      <div className="pointer-events-none absolute bottom-6 right-6 hidden w-24 lg:block" aria-hidden="true">
        <motion.div animate={{ y: [0, -14, 0], rotate: [6, 12, 6] }} transition={{ repeat: Infinity, duration: 3.4, ease: "easeInOut" }}>
          <StickerArt id="rocket" className="die-cut w-full" />
        </motion.div>
      </div>
      <div className="pointer-events-none absolute right-[6%] top-28 hidden w-24 lg:block" aria-hidden="true">
        <motion.div animate={{ rotate: [-8, 8, -8] }} transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}>
          <StickerArt id="burst" className="die-cut w-full" />
        </motion.div>
      </div>
    </motion.div>
  );
}

export function SiteNav() {
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.3 });
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState<string | null>(null);
  const [section, setSection] = useState<(typeof SECTIONS)[number] | null>(null);

  const measure = useCallback(() => {
    let current: (typeof SECTIONS)[number] | null = null;
    for (const s of SECTIONS) {
      const el = document.getElementById(s.id);
      if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.45) current = s;
    }
    setSection(current);
  }, []);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(y > 240 && y > prev && !menuOpen);
    measure();
  });

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const toggleMenu = (el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    setOrigin({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
    setMenuOpen((v) => !v);
  };

  return (
    <>
      <motion.header
        animate={{ y: hidden ? "-130%" : 0 }}
        transition={{ duration: 0.45, ease: EASE }}
        className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-4"
      >
        <nav
          aria-label="Primary"
          className="relative mx-auto flex max-w-7xl items-center justify-between gap-3 rounded-2xl border-[2.5px] border-[var(--ink)] bg-[var(--cream)] px-3 py-2 text-[var(--ink)] shadow-[5px_5px_0_var(--signal)] sm:px-4"
          style={{ rotate: "-0.25deg" }}
        >
          <Tape tone="butter" className="-top-3.5 left-[16%] !w-16" rotate={-6} />
          <Tape tone="pink" className="-top-3.5 right-[22%] !w-16" rotate={5} />

          <Link href="/" className="group flex items-center gap-2.5" aria-label="UFC — home">
            <span className="block size-11 overflow-hidden rounded-xl border-2 border-[var(--ink)] shadow-[2px_2px_0_var(--signal)] transition-transform duration-500 [transition-timing-function:cubic-bezier(0.3,1.7,0.5,1)] group-hover:rotate-[10deg] group-hover:scale-110">
              <Logo size={44} className="size-full" />
            </span>
            <span className="leading-none">
              <span className="block text-[1.5rem] font-extrabold tracking-[-0.05em]">UFC</span>
              <span className="hand -mt-0.5 hidden -rotate-2 text-[1.05rem] text-[var(--ink)]/65 sm:block">usar foss club</span>
            </span>
          </Link>

          <ul className="hidden items-center gap-1 md:flex" onMouseLeave={() => setHovered(null)}>
            {NAV_LINKS.map((l) => (
              <li key={l.href} className="relative">
                <Link
                  href={l.href}
                  onMouseEnter={() => setHovered(l.href)}
                  onFocus={() => setHovered(l.href)}
                  className="relative z-10 block rounded-xl px-4 py-2 text-[0.98rem] font-bold tracking-tight"
                >
                  {l.label}
                </Link>
                {hovered === l.href && (
                  <motion.span
                    layoutId="nav-blob"
                    className="absolute inset-0 rounded-xl border-2 border-[var(--ink)] bg-[var(--butter)] shadow-[2px_2px_0_var(--ink)]"
                    style={{ rotate: "-2deg" }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2 sm:gap-3">
            <AnimatePresence mode="wait">
              {section && (
                <motion.button
                  key={section.id}
                  onClick={() => scrollToId(section.id)}
                  initial={{ opacity: 0, y: 14, rotate: -6 }}
                  animate={{ opacity: 1, y: 0, rotate: -2 }}
                  exit={{ opacity: 0, y: -14, rotate: 4 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className="hidden xl:block"
                  aria-label={`You are in chapter ${section.n}: ${section.label}`}
                >
                  <Badge tone="butter" className="!px-3 !py-1 !text-[0.78rem] !shadow-none">§{section.n} · {section.label}</Badge>
                </motion.button>
              )}
            </AnimatePresence>

            <a
              href="#join"
              onClick={(e) => {
                e.preventDefault();
                scrollToId("join");
              }}
              className="btn btn-signal btn-sm"
            >
              Join
              <span className="disc"><ArrowUpRight size={13} /></span>
            </a>
            <button
              onClick={(e) => toggleMenu(e.currentTarget)}
              className="btn btn-butter btn-dot btn-xs"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={17} strokeWidth={2.6} /> : <Menu size={17} strokeWidth={2.6} />}
            </button>
          </div>

          {/* reading progress, as a strip of tape along the bottom edge */}
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-[7px] left-5 right-5 h-[4px] origin-left rounded-full bg-[var(--signal)] shadow-[0_0_0_2px_var(--ink)]"
            style={{ scaleX: progress }}
          />
        </nav>
      </motion.header>

      <AnimatePresence>{menuOpen && <MenuOverlay origin={origin} onClose={() => setMenuOpen(false)} />}</AnimatePresence>
    </>
  );
}
