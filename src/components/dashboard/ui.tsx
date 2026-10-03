"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Badge, Tape } from "@/components/home/scrap";
import { StickerArt, type ArtId } from "@/components/home/sticker-art";
import { TONE_BG, type Tone } from "@/data/tones";
import { EASE } from "@/components/home/motion-primitives";

const PAT: Record<Tone, string> = {
  butter: "pat-dots",
  mint: "pat-grid",
  pink: "pat-gingham-pink",
  lilac: "pat-dots",
  sky: "pat-clouds",
};

/** The big coloured card at the top of every dashboard page. */
export function PageHeader({
  eyebrow,
  title,
  accent,
  sub,
  tone = "butter",
  art = "sparkle",
  children,
}: {
  eyebrow: string;
  title: string;
  /** The word set in the serif italic. */
  accent: string;
  sub?: ReactNode;
  tone?: Tone;
  art?: ArtId;
  /** Controls (tabs, buttons) shown under the sub text. */
  children?: ReactNode;
}) {
  return (
    <motion.header
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: EASE }}
      className={`${PAT[tone]} relative border-[2.5px] border-[var(--ink)] p-6 text-[var(--ink)] shadow-[8px_8px_0_var(--ink)] sm:p-9`}
      style={{ backgroundColor: TONE_BG[tone], borderRadius: "1.5rem" }}
    >
      <Tape tone="butter" className="-top-3 left-10" rotate={-5} />
      <Tape tone="pink" className="-top-3 right-24 hidden sm:block" rotate={4} />
      <div className="pointer-events-none absolute -right-3 -top-9 w-20 rotate-12 sm:w-24" aria-hidden="true">
        <StickerArt id={art} className="die-cut w-full" />
      </div>
      <p className="eyebrow mb-4 inline-block bg-[var(--cream)] px-2 py-1 text-[var(--signal-deep)]">{eyebrow}</p>
      <h1 className="text-[clamp(2.3rem,5.2vw,4.8rem)] leading-[0.98]">
        {title} <span className="serif">{accent}</span>
      </h1>
      {sub && <p className="mt-4 max-w-2xl text-[1.1rem] leading-[1.6] text-[var(--ink)]/75">{sub}</p>}
      {children && <div className="mt-6 flex flex-wrap items-center gap-3">{children}</div>}
    </motion.header>
  );
}

/** A sheet of paper, taped on. */
export function Panel({
  children,
  className = "",
  tape = true,
  tone = "butter",
}: {
  children: ReactNode;
  className?: string;
  tape?: boolean;
  tone?: "butter" | "pink" | "sky" | "lilac" | "signal";
}) {
  return (
    <section
      className={`relative border-[2.5px] border-[var(--ink)] bg-[var(--cream)] p-6 text-[var(--ink)] shadow-[6px_6px_0_var(--ink)] sm:p-8 ${className}`}
      style={{ borderRadius: "1.25rem" }}
    >
      {tape && <Tape tone={tone} className="-top-3 left-8" rotate={-4} />}
      {children}
    </section>
  );
}

/** The dark counterpart for charts that are drawn for a dark background. */
export function InkPanel({
  children,
  className = "",
  title,
  icon,
}: {
  children: ReactNode;
  className?: string;
  title: string;
  icon?: ReactNode;
}) {
  return (
    <section
      className={`dotgrid relative border-[2.5px] border-[var(--ink)] bg-[var(--ink-2)] p-6 text-[var(--text)] shadow-[6px_6px_0_var(--signal)] sm:p-8 ${className}`}
      style={{ borderRadius: "1.25rem" }}
    >
      <h2 className="mb-5 flex items-center gap-3 text-[1.4rem] leading-none">
        {icon}
        {title}
      </h2>
      {children}
    </section>
  );
}

export function Avatar({
  src,
  name,
  size = 48,
  className = "",
}: {
  src?: string | null;
  name?: string | null;
  size?: number;
  className?: string;
}) {
  const [broken, setBroken] = useState(false);
  const initial = (name?.trim()[0] ?? "?").toUpperCase();
  return (
    <span
      className={`grid shrink-0 place-items-center overflow-hidden rounded-full border-2 border-[var(--ink)] bg-[var(--butter)] ${className}`}
      style={{ width: size, height: size }}
    >
      {src && !broken ? (
        // eslint-disable-next-line @next/next/no-img-element -- remote GitHub avatars, tiny
        <img src={src} alt={name ?? "avatar"} className="size-full object-cover" onError={() => setBroken(true)} draggable={false} />
      ) : (
        <span className="pixel text-[0.45em] leading-none text-[var(--ink)]" style={{ fontSize: size * 0.42 }}>
          {initial}
        </span>
      )}
    </span>
  );
}

export function Loading({ label = "fetching the good stuff" }: { label?: string }) {
  return (
    <div className="grid place-items-center py-24" role="status" aria-live="polite">
      <div className="text-center">
        <motion.div
          className="mx-auto w-20"
          animate={{ y: [0, -14, 0], rotate: [-6, 6, -6] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
        >
          <StickerArt id="rocket" className="die-cut w-full" />
        </motion.div>
        <p className="hand mt-4 text-[1.8rem] leading-none text-[var(--ink)]/70">{label}…</p>
      </div>
    </div>
  );
}

export function ErrorPanel({ title, message, onRetry }: { title: string; message: string; onRetry?: () => void }) {
  return (
    <Panel tone="pink" className="!bg-[var(--pink)]">
      <h2 className="text-[1.8rem] leading-tight">{title}</h2>
      <p className="mt-2 text-[1.02rem] text-[var(--ink)]/75">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-sm btn-ink mt-5">
          Try again
        </button>
      )}
    </Panel>
  );
}

export function Empty({ art = "heart", title, body, children }: { art?: ArtId; title: string; body: string; children?: ReactNode }) {
  return (
    <Panel className="text-center" tone="sky">
      <div className="mx-auto w-16 -rotate-6" aria-hidden="true">
        <StickerArt id={art} className="die-cut w-full" />
      </div>
      <h3 className="mt-5 text-[1.8rem] leading-tight">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-[var(--ink)]/70">{body}</p>
      {children && <div className="mt-6">{children}</div>}
    </Panel>
  );
}

/** Chunky previous / next with numbered pages in a sliding window. */
/** "1 to 20 of 53 members", for the line under a pager. Empty when there is nothing to count. */
export function pageRange(page: number, perPage: number, total: number, noun: string, suffix = "") {
  if (!total) return undefined;
  return `${(page - 1) * perPage + 1} to ${Math.min(page * perPage, total)} of ${total} ${noun}${suffix}`;
}

export function Pager({ page, pages, onChange, label }: { page: number; pages: number; onChange: (p: number) => void; label?: string }) {
  if (pages <= 1) return null;
  const windowSize = 5;
  let start = Math.max(1, page - Math.floor(windowSize / 2));
  const end = Math.min(pages, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);
  const nums = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  return (
    <nav aria-label="Pagination" className="mt-10 flex flex-col items-center gap-4">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button className="btn btn-sm btn-paper !px-3" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page">
          <ChevronLeft size={16} strokeWidth={2.8} />
        </button>
        {start > 1 && (
          <>
            <button className="btn btn-dot btn-xs btn-paper" onClick={() => onChange(1)}>
              1
            </button>
            {start > 2 && <span className="code px-1">…</span>}
          </>
        )}
        {nums.map((n) => (
          <button
            key={n}
            aria-current={n === page ? "page" : undefined}
            className={`btn btn-dot btn-xs ${n === page ? "btn-ink" : "btn-paper"}`}
            onClick={() => onChange(n)}
          >
            <span className="code text-[0.8rem] font-bold">{n}</span>
          </button>
        ))}
        {end < pages && (
          <>
            {end < pages - 1 && <span className="code px-1">…</span>}
            <button className="btn btn-dot btn-xs btn-paper" onClick={() => onChange(pages)}>
              {pages}
            </button>
          </>
        )}
        <button className="btn btn-sm btn-paper !px-3" disabled={page >= pages} onClick={() => onChange(page + 1)} aria-label="Next page">
          <ChevronRight size={16} strokeWidth={2.8} />
        </button>
      </div>
      {label && <p className="code text-[0.75rem] font-bold uppercase tracking-widest text-[var(--ink)]/55">{label}</p>}
    </nav>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  tone = "butter",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  tone?: Tone;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          data-lenis-prevent
          className="fixed inset-0 z-[70] grid place-items-center overflow-y-auto bg-[rgba(9,12,10,0.65)] p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <motion.div
            initial={{ y: 40, rotate: -2, scale: 0.95, opacity: 0 }}
            animate={{ y: 0, rotate: -0.6, scale: 1, opacity: 1 }}
            exit={{ y: 20, scale: 0.97, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            onClick={(e) => e.stopPropagation()}
            className="paper relative my-8 w-full max-w-lg p-7 sm:p-9"
            style={{ borderRadius: "1.25rem", border: "2.5px solid var(--ink)", boxShadow: "8px 8px 0 var(--ink)" }}
          >
            <Tape tone="butter" className="-top-3 left-10" rotate={-5} />
            <Tape tone="pink" className="-top-3 right-12" rotate={4} />
            <button onClick={onClose} aria-label="Close" className="btn btn-dot btn-xs btn-paper !absolute right-4 top-4">
              <X size={16} strokeWidth={2.8} />
            </button>
            <h2 className="pr-12 text-[clamp(1.8rem,3vw,2.4rem)] leading-[1.02]">
              <span className="marker rounded-sm px-1" style={{ ["--mark" as string]: TONE_BG[tone] }}>
                {title}
              </span>
            </h2>
            <div className="mt-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="code mb-1.5 block text-[0.72rem] font-bold uppercase tracking-widest text-[var(--ink)]/65">{label}</span>
      {children}
    </label>
  );
}

/** A small "saved / failed" note that slides in from the corner and leaves on its own. Replaces window.alert. */
export function useToast() {
  const [msg, setMsg] = useState<{ text: string; ok: boolean; id: number } | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const show = useCallback((text: string, ok = true) => {
    window.clearTimeout(timer.current);
    setMsg({ text, ok, id: Date.now() });
    timer.current = window.setTimeout(() => setMsg(null), 3800);
  }, []);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const node = (
    <AnimatePresence>
      {msg && (
        <motion.div
          key={msg.id}
          role="status"
          initial={{ y: 40, opacity: 0, rotate: 3 }}
          animate={{ y: 0, opacity: 1, rotate: -1.5 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          className="fixed bottom-5 right-5 z-[80] max-w-xs"
        >
          <Badge tone={msg.ok ? "signal" : "pink"} className="!block !rounded-2xl !px-5 !py-3 !text-[0.9rem] !normal-case !leading-snug">
            {msg.text}
          </Badge>
        </motion.div>
      )}
    </AnimatePresence>
  );
  return { show, node };
}

export const isStaff = (role?: string | null) => !!role && ["ADMIN", "MAINTAINER"].includes(role.toUpperCase());
