"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

/** True on devices with a mouse. Dragging stickers on touch screens would hijack page scroll. */
export function useFinePointer() {
  const [fine, setFine] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    setFine(mq.matches);
    const on = (e: MediaQueryListEvent) => setFine(e.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return fine;
}

type TapeTone = "butter" | "lilac" | "pink" | "sky" | "signal";
const TONE: Record<TapeTone, string> = {
  butter: "var(--butter)",
  lilac: "var(--lilac)",
  pink: "var(--pink)",
  sky: "var(--sky)",
  signal: "var(--signal)",
};

export function Tape({ tone = "butter", className, rotate = -4 }: { tone?: TapeTone; className?: string; rotate?: number }) {
  return (
    <span
      aria-hidden="true"
      className={`tape ${className ?? ""}`}
      style={{ ["--tape" as string]: TONE[tone], rotate: `${rotate}deg` }}
    />
  );
}

/**
 * Anything you could pin to a board. Positioned by the caller (className), rotated by `r`,
 * and draggable with a mouse. Dropping it leaves it where you put it.
 */
export function Pin({
  children,
  r = 0,
  className,
  drag = true,
  z = 1,
  delay = 0,
  hint,
}: {
  children: ReactNode;
  r?: number;
  className?: string;
  drag?: boolean;
  z?: number;
  delay?: number;
  hint?: string;
}) {
  const fine = useFinePointer();
  const canDrag = drag && fine;
  return (
    <motion.div
      data-sticker
      onDragStartCapture={(e) => e.preventDefault()}
      className={`${className ?? ""} ${canDrag ? "cursor-grab active:cursor-grabbing" : ""}`}
      style={{ zIndex: z, rotate: r }}
      initial={{ opacity: 0, scale: 0.8, y: 24 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{ type: "spring", stiffness: 160, damping: 16, delay }}
      drag={canDrag}
      dragMomentum={false}
      dragElastic={0.2}
      whileHover={canDrag ? { scale: 1.04, rotate: r * 0.4, zIndex: 40 } : undefined}
      whileDrag={{ scale: 1.1, rotate: 0, zIndex: 60 }}
      title={canDrag ? hint : undefined}
    >
      {children}
    </motion.div>
  );
}

export function Polaroid({
  src,
  alt,
  caption,
  aspect = "aspect-square",
  fit = "object-cover",
  tone = "butter",
  position,
  className,
  sizes = "280px",
}: {
  src: string;
  alt: string;
  caption: ReactNode;
  aspect?: string;
  fit?: string;
  tone?: TapeTone;
  position?: string;
  className?: string;
  sizes?: string;
}) {
  return (
    <figure className={`polaroid relative ${className ?? ""}`}>
      <Tape tone={tone} className="-top-3 left-1/2 -translate-x-1/2" rotate={-3} />
      <div className={`relative w-full overflow-hidden bg-[#d9d6cb] ${aspect}`}>
        <Image src={src} alt={alt} fill sizes={sizes} className={fit} style={{ objectPosition: position }} draggable={false} />
      </div>
      <figcaption className="hand px-1 pb-2 pt-2 text-[1.15rem] leading-[1.05] sm:text-[1.3rem]">{caption}</figcaption>
    </figure>
  );
}

const NOTE_COLORS = {
  butter: "var(--butter)",
  mint: "#9af2c6",
  pink: "var(--pink)",
  lilac: "var(--lilac)",
  sky: "var(--sky)",
} as const;

export function PostIt({
  children,
  color = "butter",
  className,
}: {
  children: ReactNode;
  color?: keyof typeof NOTE_COLORS;
  className?: string;
}) {
  return (
    <div className={`postit hand p-4 pb-6 text-[1.35rem] leading-[1.05] sm:text-[1.5rem] ${className ?? ""}`} style={{ ["--note" as string]: NOTE_COLORS[color] }}>
      {children}
    </div>
  );
}

/** A die-cut sticker: a transparent image (or any node) with a white border that follows its outline. */
export function Sticker({ src, alt, className, sizes = "200px" }: { src: string; alt: string; className?: string; sizes?: string }) {
  return (
    <div className={`die-cut relative ${className ?? ""}`}>
      <Image src={src} alt={alt} fill sizes={sizes} className="object-contain" draggable={false} />
    </div>
  );
}

/** A pill-shaped text sticker set in the pixel face. */
export function Badge({
  children,
  tone = "butter",
  className,
}: {
  children: ReactNode;
  tone?: TapeTone;
  className?: string;
}) {
  return (
    <span
      className={`die-cut pixel inline-block rounded-full px-4 py-1.5 text-sm uppercase text-[#14140f] ${className ?? ""}`}
      style={{ background: TONE[tone] }}
    >
      {children}
    </span>
  );
}

/** Hand-drawn style arrow. `d` variants curve left/right/down. */
export function Scribble({ className, variant = "curl" }: { className?: string; variant?: "curl" | "loop" | "straight" }) {
  const paths = {
    curl: "M4 6 C 40 -2, 70 30, 56 58 C 52 66, 42 62, 48 52 M48 52 L 42 60 M48 52 L 57 58",
    loop: "M6 8 C 30 -4, 60 14, 40 34 C 28 46, 18 30, 38 26 C 56 22, 70 44, 66 66 M66 66 L 58 58 M66 66 L 72 57",
    straight: "M4 40 C 30 36, 56 36, 82 30 M82 30 L 72 22 M82 30 L 72 38",
  } as const;
  return (
    <svg viewBox="0 0 90 76" className={className} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[variant]} />
    </svg>
  );
}

/** A highlighter stripe behind a phrase: a solid, slightly crooked pill, with ink text so it reads on any background. */
export function Mark({ children, tone = "var(--butter)", className }: { children: ReactNode; tone?: string; className?: string }) {
  return (
    <span
      className={`inline-block -rotate-[0.8deg] rounded-[0.3em] px-[0.35em] py-[0.02em] font-semibold text-[#14140f] shadow-[0_0.12em_0_rgba(0,0,0,0.25)] ${className ?? ""}`}
      style={{ background: tone }}
    >
      {children}
    </span>
  );
}
