import type { CSSProperties, ElementType, ReactNode } from "react";

export const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Reveal and MaskLine are plain markup plus CSS (see home.css). A tiny inline script in the root layout
 * (reveal-script.ts) adds `data-in` once they scroll into view. They never wait for React or framer-motion,
 * so the words are on screen as soon as the HTML and CSS arrive, even on a slow phone.
 * The script can add `data-in` before React hydrates, hence suppressHydrationWarning on the two wrappers.
 */

/** Fades and lifts its children in once, when they scroll into view. */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <div
      data-reveal="r"
      suppressHydrationWarning
      className={className}
      style={{ ["--rd" as string]: `${delay}s`, ["--ry" as string]: `${y}px` } as CSSProperties}
    >
      {children}
    </div>
  );
}

/** A line of display type that slides up out of a clipping mask. */
export function MaskLine({
  children,
  delay = 0,
  as: Tag = "span",
  className,
  inView = false,
}: {
  children: ReactNode;
  delay?: number;
  as?: ElementType;
  className?: string;
  /** Wait for scroll-into-view instead of animating on mount. */
  inView?: boolean;
}) {
  // The wrapper (never moved) is what gets observed: the sliding child starts fully outside its own mask.
  return (
    <Tag
      data-reveal={inView ? "m" : undefined}
      suppressHydrationWarning
      className={`block overflow-hidden pb-[0.12em] -mb-[0.12em] ${className ?? ""}`}
    >
      <span className={`mask-line ${inView ? "" : "mask-line-now"}`} style={{ ["--md" as string]: `${delay}s` } as CSSProperties}>
        {children}
      </span>
    </Tag>
  );
}
