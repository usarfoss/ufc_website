"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "@studio-freight/lenis";
import { SiteNav } from "./site-nav";
import "./home.css";

/** Client frame for the landing page: smooth scrolling and the navigation. */
export function HomeShell({ children }: { children: ReactNode }) {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const lenis = new Lenis({ duration: 1.1, easing: (t: number) => 1 - Math.pow(1 - t, 3), smoothWheel: true });
    let frame = requestAnimationFrame(function raf(time) {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    });
    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  return (
    <div className="ufc-home">
      <SiteNav />
      {children}
    </div>
  );
}
