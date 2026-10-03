"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { m, useMotionValue, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "framer-motion";
import { Pin, Tape } from "./scrap";

type Pt = { x: number; y: number };

/** A smooth path that passes through every point, leaving and entering each one vertically (an S-curve between neighbours). */
function pathThrough(pts: Pt[]) {
  if (!pts.length) return "";
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    const my = (a.y + b.y) / 2;
    d += ` C ${a.x.toFixed(1)} ${my.toFixed(1)}, ${b.x.toFixed(1)} ${my.toFixed(1)}, ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
  }
  return d;
}

function Knot({ y, tipY, x }: { y: number; tipY: MotionValue<number>; x: number }) {
  const on = useTransform(tipY, (v) => (v >= y - 4 ? 1 : 0));
  const scale = useTransform(on, (v) => (v ? 1 : 0.4));
  return (
    <m.g style={{ opacity: on, scale, transformOrigin: `${x}px ${y}px` }}>
      <circle cx={x} cy={y} r="11" fill="#d6332c" stroke="#14140f" strokeWidth="2.5" />
      <circle cx={x - 3.5} cy={y - 3.5} r="3" fill="#fff" opacity=".65" />
    </m.g>
  );
}

/**
 * A red thread that stitches itself down the page as you scroll. It runs through every `[data-knot]` element inside
 * the wrapper (in document order) and ends with a needle that rides the tip of the stitch.
 */
export function Thread({
  children,
  className,
  amplitude,
  lean = 24,
}: {
  children: ReactNode;
  className?: string;
  amplitude?: number;
  lean?: number;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const base = useRef<SVGPathElement>(null);
  const [geo, setGeo] = useState<{ d: string; w: number; h: number; knots: Pt[] }>({ d: "", w: 0, h: 0, knots: [] });
  const tipY = useMotionValue(0);
  const needleX = useMotionValue(0);
  const needleY = useMotionValue(0);
  const needleR = useMotionValue(90);
  const lenRef = useRef(0);
  const [dash, setDash] = useState({ len: 0, shown: 0 });
  const { scrollY } = useScroll();

  // Measure every knot, relative to the wrapper.
  useLayoutEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const measure = () => {
      const box = el.getBoundingClientRect();
      const knots = [...el.querySelectorAll<HTMLElement>("[data-knot]")].map((k) => {
        const r = k.getBoundingClientRect();
        return { x: r.left - box.left + r.width / 2, y: r.top - box.top + r.height / 2 };
      });
      if (!knots.length) return;
      const anchors: Pt[] = [{ x: knots[0].x, y: 0 }, ...knots, { x: knots[knots.length - 1].x, y: box.height }];
      // Between neighbouring knots, add extra points that swing left and right: that is what makes the thread wavy.
      const amp = amplitude ?? (box.width < 768 ? 5 : 13);
      const spacing = box.width < 768 ? 110 : 150;
      const pts: Pt[] = [anchors[0]];
      let sign = 1;
      for (let i = 1; i < anchors.length; i++) {
        const a = anchors[i - 1];
        const b = anchors[i];
        const n = Math.max(1, Math.round((b.y - a.y) / spacing));
        for (let k = 1; k < n; k++) {
          const t = k / n;
          pts.push({ x: a.x + (b.x - a.x) * t + sign * amp, y: a.y + (b.y - a.y) * t });
          sign = -sign;
        }
        pts.push(b);
      }
      setGeo({ d: pathThrough(pts), w: box.width, h: box.height, knots });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    document.fonts?.ready.then(measure);
    window.addEventListener("load", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("load", measure);
    };
  }, [amplitude]);

  // Which stretch of thread is "stitched" depends on how far the reader's eye line has travelled.
  const update = () => {
    const el = wrap.current;
    const path = base.current;
    if (!el || !path || !geo.d) return;
    const len = path.getTotalLength();
    lenRef.current = len;
    const top = el.getBoundingClientRect().top;
    const eye = Math.min(Math.max(window.innerHeight * 0.58 - top, 0), geo.h);
    // The path is monotone in y, so the point at a given y can be bisected.
    let lo = 0;
    let hi = len;
    for (let i = 0; i < 22; i++) {
      const mid = (lo + hi) / 2;
      if (path.getPointAtLength(mid).y < eye) lo = mid;
      else hi = mid;
    }
    const p = path.getPointAtLength(lo);
    const q = path.getPointAtLength(Math.min(len, lo + 2));
    tipY.set(p.y);
    needleX.set(p.x);
    needleY.set(p.y);
    const heading = (Math.atan2(q.y - p.y, q.x - p.x) * 180) / Math.PI; // 90 = straight down
    needleR.set(lean + Math.max(-30, Math.min(30, (heading - 90) * 0.6)));
    setDash((d) => (Math.abs(d.shown - lo) > 0.5 || d.len !== len ? { len, shown: lo } : d));
  };
  useMotionValueEvent(scrollY, "change", update);
  useEffect(update, [geo]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div ref={wrap} className={`relative ${className ?? ""}`}>
      {geo.d && (
        <svg className="pointer-events-none absolute left-0 top-0 z-10 overflow-visible" width={geo.w} height={geo.h} aria-hidden="true">
          {/* the unstitched path, faint */}
          <path d={geo.d} fill="none" stroke="rgba(20,20,15,0.22)" strokeWidth="2.5" strokeDasharray="2 10" strokeLinecap="round" />
          {/* shadow + stitched thread */}
          <path
            d={geo.d}
            fill="none"
            stroke="rgba(0,0,0,0.18)"
            strokeWidth="6"
            strokeLinecap="round"
            transform="translate(2 4)"
            strokeDasharray={`${dash.shown} ${dash.len + 10}`}
          />
          <path
            ref={base}
            d={geo.d}
            fill="none"
            stroke="#d6332c"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeDasharray={`${dash.shown} ${dash.len + 10}`}
          />
          {geo.knots.map((k, i) => (
            <Knot key={i} x={k.x} y={k.y} tipY={tipY} />
          ))}
          {/* the pencil: tip on the thread, body leaning up and to the right */}
          <m.g
            style={{
              x: needleX,
              y: needleY,
              rotate: needleR,
              scale: geo.w < 768 ? 0.55 : 1,
              originX: 0.5,
              originY: 1,
              filter: "drop-shadow(3px 6px 4px rgba(0,0,0,0.28))",
            }}
          >
            <g transform="scale(0.78)" stroke="#14140f" strokeWidth="2.4" strokeLinejoin="round">
              {/* wood cone and lead */}
              <path d="M-10 -34 L10 -34 L2.6 -6 L-2.6 -6 Z" fill="#f1d6a8" />
              <path d="M-2.6 -6 L2.6 -6 L0 0 Z" fill="#d6332c" />
              <path d="M-6 -20 L-2.6 -6 M6 -20 L2.6 -6" strokeWidth="1.2" opacity=".5" />
              {/* hexagonal body: three facets */}
              <path d="M-10 -34 H-3.5 V-158 H-10 Z" fill="#f5776c" />
              <path d="M-3.5 -34 H3.5 V-158 H-3.5 Z" fill="#e4463e" />
              <path d="M3.5 -34 H10 V-158 H3.5 Z" fill="#b8322b" />
              <text
                transform="translate(0 -96) rotate(-90)"
                textAnchor="middle"
                fontSize="9"
                fill="#fff"
                stroke="none"
                style={{ fontFamily: "var(--f-pixel)", fontWeight: 700, letterSpacing: "0.1em" }}
              >
                USAR FOSS CLUB
              </text>
              {/* ferrule */}
              <rect x="-10" y="-176" width="20" height="18" fill="#c9ccd1" />
              <path d="M-10 -170 H10 M-10 -164 H10" strokeWidth="1.4" />
              {/* eraser */}
              <path d="M-10 -176 V-188 Q-10 -196 0 -196 Q10 -196 10 -188 V-176 Z" fill="#ffb3cf" />
            </g>
          </m.g>
        </svg>
      )}
      {children}
    </div>
  );
}

/** The tag hanging off the end of a thread: a knot, and a note pinned beside it. */
export function ThreadTail({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-[2.75rem_1fr] lg:grid-cols-[1fr_8rem_1fr]">
      <span className="col-start-1 grid place-items-center lg:col-start-2">
        <span data-knot className="block size-6" />
      </span>
      <div className="col-start-2 pb-24 pt-4 lg:col-start-3">
        <Pin r={-3} drag={false}>
          <div className="paper relative inline-block px-7 py-5">
            <Tape tone="pink" className="-top-3 left-1/2 -translate-x-1/2" rotate={-3} />
            <p className="hand text-[2rem] leading-none">{children}</p>
          </div>
        </Pin>
      </div>
    </div>
  );
}
