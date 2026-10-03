"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { SiteNav } from "./site-nav";
import "./home.css";

/** Client frame for the landing page: smooth scrolling, the navigation, and pausing what nobody can see. */
export function HomeShell({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  // Smooth scrolling. Lenis is loaded once the page is idle, so it never competes with first paint.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let stopped = false;
    let frame = 0;
    let destroy = () => {};
    const start = async () => {
      const { default: Lenis } = await import("@studio-freight/lenis");
      if (stopped) return;
      const lenis = new Lenis({ duration: 1.1, easing: (t: number) => 1 - Math.pow(1 - t, 3), smoothWheel: true });
      const raf = (time: number) => {
        lenis.raf(time);
        frame = requestAnimationFrame(raf);
      };
      frame = requestAnimationFrame(raf);
      destroy = () => lenis.destroy();
    };
    // Safari has no requestIdleCallback, so fall back to a short timer.
    const w: Partial<Window> = window;
    const idle = w.requestIdleCallback
      ? w.requestIdleCallback(() => void start(), { timeout: 1500 })
      : window.setTimeout(() => void start(), 200);
    return () => {
      stopped = true;
      if (w.cancelIdleCallback) w.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
      cancelAnimationFrame(frame);
      destroy();
    };
  }, []);

  // Every section that is off screen gets `data-off`, which pauses the CSS animations inside it (see home.css).
  // A phone then only animates what is actually in front of the person.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => entries.forEach((e) => e.target.toggleAttribute("data-off", !e.isIntersecting)), {
      rootMargin: "300px 0px",
    });
    el.querySelectorAll("section, footer").forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  return (
    <div ref={root} className="ufc-home">
      <SiteNav />
      {children}
    </div>
  );
}
