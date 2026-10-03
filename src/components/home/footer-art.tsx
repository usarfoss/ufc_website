"use client";

import { m, useAnimationControls } from "framer-motion";
import { Ransom } from "./ransom";
import { StickerArt } from "./sticker-art";

/** Giant ransom-note wordmark, plus a rocket that actually takes you back to the top. */
export function FooterArt() {
  const controls = useAnimationControls();

  const launch = async () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    await controls.start({ y: -1400, rotate: 0, transition: { duration: 1.2, ease: [0.5, 0, 1, 0.6] } });
    controls.set({ y: 260, opacity: 0 });
    controls.start({ y: 0, opacity: 1, transition: { type: "spring", stiffness: 120, damping: 14, delay: 0.4 } });
  };

  return (
    <div className="relative">
      <m.button
        onClick={launch}
        animate={controls}
        whileHover={{ y: -6, rotate: -4 }}
        className="absolute right-[6%] top-[-1.5rem] z-20 w-16 sm:right-[8%] sm:w-24"
        aria-label="Back to top"
      >
        <StickerArt id="rocket" className="die-cut w-full" />
        <span className="hand absolute left-1/2 top-full mt-1 hidden w-28 -translate-x-1/2 -rotate-3 text-center text-xl leading-none text-[var(--butter)] sm:block">
          back to the top ↑
        </span>
      </m.button>

      <div className="pointer-events-none select-none overflow-hidden pt-16 text-center" aria-hidden="true">
        <div className="-mb-[0.12em] text-[clamp(7rem,30vw,28rem)] leading-[0.8]">
          <Ransom text="UFC" seed={4} />
        </div>
      </div>
    </div>
  );
}
