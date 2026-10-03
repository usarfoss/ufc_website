"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Image from "next/image";
import Matter from "matter-js";
import { StickerArt, ART_SIZE, type ArtId } from "./sticker-art";

export type PileItem = {
  id: string;
  w: number;
  h: number;
  /** Treat the body as a circle (seals, coins) so it rolls instead of tipping over. */
  round?: boolean;
  node: ReactNode;
};

/** A pile item from one of our SVG doodles. */
export const artItem = (id: ArtId, round = false): PileItem => ({
  id,
  w: ART_SIZE[id][0],
  h: ART_SIZE[id][1],
  round,
  node: <StickerArt id={id} className="die-cut size-full" />,
});

/** A pile item from a picture in /public. `outline: false` swaps the white die-cut border for a soft shadow. */
export const imgItem = (id: string, src: string, alt: string, w: number, h: number, outline = true): PileItem => ({
  id,
  w,
  h,
  node: (
    <div className={`${outline ? "die-cut" : "soft-shadow"} relative size-full`}>
      <Image src={src} alt={alt} fill sizes={`${w}px`} className="object-contain" draggable={false} />
    </div>
  ),
});

const { Engine, World, Bodies, Body, Constraint, Sleeping } = Matter;

/**
 * Stickers that really fall: they drop in from above, tumble, bounce and settle on the floor of the
 * container. Grab one with the mouse or a finger and fling it. Only the stickers take pointer events,
 * so the page underneath stays clickable and scrollable.
 *
 * `leftInset` (0–1) walls off the left part of the floor on wide screens, keeping the sandbox clear of the copy and buttons.
 */
export function StickerPile({
  items,
  className,
  leftInset = 0,
  startWhenVisible = false,
  sizeBoost = 1,
  wideBoost = 1,
  mobileScale = 0.6,
  avoidSelector,
}: {
  items: PileItem[];
  className?: string;
  leftInset?: number;
  /** Hold the drop until the pile scrolls into view (for pits further down the page). */
  startWhenVisible?: boolean;
  /** Multiplies every sticker's size, for pits with room to spare. */
  sizeBoost?: number;
  /** Extra size multiplier on screens ≥ 1024px only. */
  wideBoost?: number;
  /** Final size multiplier below 640px (phones). Smaller than the default keeps stickers from burying the content. */
  mobileScale?: number;
  /** CSS selector of an element (the hero copy + buttons) the pile must never reach. The left wall sits just right of it. */
  avoidSelector?: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  const els = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const box = host.current;
    if (!box) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let W = box.clientWidth;
    let H = box.clientHeight;
    const scale = W < 640 ? mobileScale : (W < 1024 ? 0.8 : 1 * wideBoost) * sizeBoost;
    const wanted = W < 640 ? items.slice(0, 7) : items;

    const engine = Engine.create({ enableSleeping: true });
    engine.gravity.y = 1.15;
    const world = engine.world;

    // Left wall: tracks the right edge of the copy block, so stickers can never pile onto the buttons.
    const computeL = () => {
      if (W < 1024) return 0;
      let l = W * leftInset;
      const el = avoidSelector ? document.querySelector(avoidSelector) : null;
      if (el) l = Math.max(0, el.getBoundingClientRect().right - box.getBoundingClientRect().left + 28);
      return W - l < 420 ? 0 : l; // not enough room left for a sandbox: no wall, rely on click-through instead
    };
    let L = computeL();
    const T = 200; // wall thickness
    const walls = [
      Bodies.rectangle(W / 2, H + T / 2, W * 3, T, { isStatic: true }), // floor
      Bodies.rectangle(L - T / 2, H / 2 - 600, T, H + 1400, { isStatic: true }),
      Bodies.rectangle(W + T / 2, H / 2 - 600, T, H + 1400, { isStatic: true }),
      Bodies.rectangle(W / 2, -1100, W * 3, T, { isStatic: true }), // ceiling, far above the hero: a hard throw comes back down
    ];
    World.add(world, walls);

    type Entry = { item: PileItem; body: Matter.Body; el: HTMLDivElement | null; spawned: boolean; s: number };
    els.current.forEach((el, i) => {
      if (el && i >= wanted.length) el.style.display = "none";
    });

    const entries: Entry[] = wanted.map((item, i) => {
      const s = scale;
      const w = item.w * s;
      const h = item.h * s;
      const margin = Math.max(w, h) / 2 + 12;
      const x = L + margin + Math.random() * Math.max(1, W - L - margin * 2);
      const y = reduced ? H - h / 2 - Math.random() * 60 : -h - 40;
      const body = item.round
        ? Bodies.circle(x, y, w / 2, { restitution: 0.45, friction: 0.35, frictionAir: 0.01, density: 0.002 })
        : Bodies.rectangle(x, y, w, h, {
            chamfer: { radius: Math.min(w, h) * 0.14 },
            restitution: 0.38,
            friction: 0.4,
            frictionAir: 0.012,
            density: 0.002,
          });
      // Long, thin stickers (badges) would otherwise tip onto their ends; make them stubborn to rotate.
      if (Math.max(w, h) / Math.min(w, h) > 2.2) Body.setInertia(body, body.inertia * 6);
      Body.setAngle(body, (Math.random() - 0.5) * (Math.max(w, h) / Math.min(w, h) > 2.2 ? 0.4 : 1.4));
      Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.16);
      return { item, body, el: els.current[i], spawned: false, s };
    });

    const place = (e: Entry) => {
      if (!e.el) return;
      const { x, y } = e.body.position;
      e.el.style.transform = `translate3d(${x - e.item.w / 2}px, ${y - e.item.h / 2}px, 0) rotate(${e.body.angle}rad) scale(${e.s})`;
    };

    const spawn = (e: Entry) => {
      e.spawned = true;
      World.add(world, e.body);
      if (e.el) {
        e.el.style.opacity = "1";
        e.el.style.pointerEvents = "auto";
      }
      place(e);
    };

    const timers: number[] = [];
    if (reduced) {
      entries.forEach(spawn);
      for (let i = 0; i < 360; i++) Engine.update(engine, 16);
      entries.forEach(place);
    }
    const begin = () =>
      entries.forEach((e, i) => timers.push(window.setTimeout(() => spawn(e), (startWhenVisible ? 150 : 1100) + i * 240)));
    let startIo: IntersectionObserver | null = null;
    if (!reduced) {
      if (startWhenVisible) {
        startIo = new IntersectionObserver(
          ([en]) => {
            if (en.isIntersecting) {
              begin();
              startIo?.disconnect();
            }
          },
          { threshold: 0.35 },
        );
        startIo.observe(box);
      } else begin();
    }

    // ── pointer: a spring between the finger and the point you grabbed ──
    type Grab = { c: Matter.Constraint; hw: number };
    const grabs = new Map<number, Grab>();
    const heldBodies = new Set<Matter.Body>();
    const passes = new Map<number, { target: HTMLElement; x: number; y: number }>();
    let z = 10;
    const cleanups: (() => void)[] = [];

    entries.forEach((e) => {
      const el = e.el;
      if (!el || reduced) return;
      const local = (ev: PointerEvent) => {
        const r = box.getBoundingClientRect();
        return { x: ev.clientX - r.left, y: ev.clientY - r.top };
      };
      /** A button or link visible *through* this sticker's box (stickers sit above the copy). */
      const buttonUnder = (ev: PointerEvent): HTMLElement | null => {
        for (const n of document.elementsFromPoint(ev.clientX, ev.clientY)) {
          if (n === el || el.contains(n)) continue;
          const h = n as HTMLElement;
          if (h.closest?.("[data-sticker]")) continue;
          const t = h.closest?.("a[href], button, [role='button']") as HTMLElement | null;
          if (t) return t;
        }
        return null;
      };
      const down = (ev: PointerEvent) => {
        if (!e.spawned) return;
        ev.preventDefault();
        el.setPointerCapture(ev.pointerId);
        const under = buttonUnder(ev);
        if (under) {
          // Don't steal the click: remember it, and forward it on release if the pointer didn't travel.
          passes.set(ev.pointerId, { target: under, x: ev.clientX, y: ev.clientY });
          return;
        }
        el.style.zIndex = String(++z);
        el.style.cursor = "grabbing";
        const p = local(ev);
        const b = e.body;
        b.sleepThreshold = Infinity; // a held sticker must never doze off mid-drag
        Sleeping.set(b, false);
        const dx = p.x - b.position.x;
        const dy = p.y - b.position.y;
        const cos = Math.cos(-b.angle);
        const sin = Math.sin(-b.angle);
        const c = Constraint.create({
          pointA: { x: p.x, y: p.y },
          bodyB: b,
          pointB: { x: dx * cos - dy * sin, y: dx * sin + dy * cos },
          stiffness: 0.2,
          damping: 0.2,
          length: 0,
        });
        World.add(world, c);
        grabs.set(ev.pointerId, { c, hw: (e.item.w * e.s) / 2 });
        heldBodies.add(b);
      };
      const move = (ev: PointerEvent) => {
        const g = grabs.get(ev.pointerId);
        if (!g) {
          if (!passes.has(ev.pointerId)) el.style.cursor = buttonUnder(ev) ? "pointer" : "";
          return;
        }
        const p = local(ev);
        // Keep the finger inside the sandbox so the spring never stretches against a wall (that's what made it judder).
        g.c.pointA.x = Math.min(Math.max(p.x, L + g.hw * 0.6), W - g.hw * 0.6);
        g.c.pointA.y = Math.min(p.y, H - 6);
        if (g.c.bodyB) Sleeping.set(g.c.bodyB, false);
      };
      const up = (ev: PointerEvent) => {
        const pass = passes.get(ev.pointerId);
        if (pass) {
          passes.delete(ev.pointerId);
          if (Math.hypot(ev.clientX - pass.x, ev.clientY - pass.y) < 7) pass.target.click();
          return;
        }
        const g = grabs.get(ev.pointerId);
        if (!g) return;
        World.remove(world, g.c);
        grabs.delete(ev.pointerId);
        if (g.c.bodyB) {
          g.c.bodyB.sleepThreshold = 60;
          heldBodies.delete(g.c.bodyB);
        }
        el.style.cursor = "";
      };
      el.addEventListener("pointerdown", down);
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerup", up);
      el.addEventListener("pointercancel", up);
      cleanups.push(() => {
        el.removeEventListener("pointerdown", down);
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerup", up);
        el.removeEventListener("pointercancel", up);
      });
    });

    // ── loop ──
    let raf = 0;
    let last = performance.now();
    let visible = true;
    const io = new IntersectionObserver(([en]) => (visible = en.isIntersecting));
    io.observe(box);

    // Fixed 60 Hz steps, however slow the frame: a laggy machine gets a choppier fall, never a slow-motion one.
    const STEP = 1000 / 60;
    let acc = 0;
    const loop = (now: number) => {
      const dt = Math.min(120, now - last);
      last = now;
      if (visible && !document.hidden) {
        acc += dt;
        let steps = 0;
        while (acc >= STEP && steps < 6) {
          Engine.update(engine, STEP);
          acc -= STEP;
          steps++;
        }
        if (steps === 6) acc = 0;
        for (const e of entries) {
          if (!e.spawned) continue;
          // Tunnelling guard: a hard fling must never punch through the floor.
          const v = e.body.velocity;
          const sp = Math.hypot(v.x, v.y);
          if (sp > 38) Body.setVelocity(e.body, { x: (v.x / sp) * 38, y: (v.y / sp) * 38 });
          // Gentle self-righting so lettered stickers come to rest readable, not upside-down. Skipped while held.
          if (!e.item.round && !e.body.isSleeping && !heldBodies.has(e.body)) {
            Body.setAngularVelocity(e.body, e.body.angularVelocity - Math.sin(e.body.angle) * 0.0035);
          }
          place(e);
        }
      } else acc = 0;
      raf = requestAnimationFrame(loop);
    };
    if (!reduced) raf = requestAnimationFrame(loop);

    const ro = new ResizeObserver(() => {
      const nw = box.clientWidth;
      const nh = box.clientHeight;
      if (nw === W && nh === H) return;
      W = nw;
      H = nh;
      relayout();
    });
    const relayout = () => {
      L = computeL();
      Body.setPosition(walls[0], { x: W / 2, y: H + T / 2 });
      Body.setPosition(walls[1], { x: L - T / 2, y: H / 2 - 600 });
      Body.setPosition(walls[2], { x: W + T / 2, y: H / 2 - 600 });
      Body.setPosition(walls[3], { x: W / 2, y: -1100 });
      for (const e of entries) {
        const { x, y } = e.body.position;
        const hw = (e.item.w * e.s) / 2;
        Body.setPosition(e.body, { x: Math.min(Math.max(x, L + hw), W - hw), y: Math.min(y, H - 10) });
        Sleeping.set(e.body, false);
      }
    };
    ro.observe(box);
    const avoidEl = avoidSelector ? document.querySelector(avoidSelector) : null;
    const avoidRo = new ResizeObserver(relayout);
    if (avoidEl) avoidRo.observe(avoidEl);

    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      cleanups.forEach((fn) => fn());
      io.disconnect();
      startIo?.disconnect();
      ro.disconnect();
      avoidRo.disconnect();
      World.clear(world, false);
      Engine.clear(engine);
    };
  }, [items, leftInset, startWhenVisible, sizeBoost, wideBoost, mobileScale, avoidSelector]);

  return (
    <div ref={host} className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}>
      {items.map((it, i) => (
        <div
          key={it.id}
          ref={(el) => {
            els.current[i] = el;
          }}
          data-sticker
          className="absolute left-0 top-0 cursor-grab opacity-0 will-change-transform"
          style={{ width: it.w, height: it.h, touchAction: "none", transformOrigin: "center", pointerEvents: "none" }}
        >
          {it.node}
        </div>
      ))}
    </div>
  );
}
