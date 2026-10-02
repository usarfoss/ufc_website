"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { motion, useInView } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

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
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      {children}
    </motion.div>
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
  // Observe the (unclipped) wrapper: the sliding child starts fully outside its own mask,
  // so an observer on it would never see it intersect.
  const ref = useRef<HTMLElement>(null);
  const seen = useInView(ref, { once: true, margin: "-10% 0px" });
  const shown = inView ? seen : true;
  return (
    <Tag ref={ref} className={`block overflow-hidden pb-[0.12em] -mb-[0.12em] ${className ?? ""}`}>
      <motion.span
        className="block"
        initial={{ y: "112%" }}
        animate={{ y: shown ? 0 : "112%" }}
        transition={{ duration: 1.1, delay, ease: EASE }}
      >
        {children}
      </motion.span>
    </Tag>
  );
}
