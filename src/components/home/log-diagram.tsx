"use client";

import { useId } from "react";
import { m, useTransform, type MotionValue } from "framer-motion";

const ROWS = [74, 150, 226, 302];
const SEGMENTS = 8;
const X0 = 150;
const STEP = 58;

/**
 * Kwaque has no screenshot, so here is the idea instead: a distributed log. Records arrive from the left and are appended to
 * the end of a partition, one after another, never rewritten. As the sheet is developed (`dev`, 0 to 1) the logs grow.
 */
export function LogDiagram({ dev }: { dev: MotionValue<number> }) {
  const clip = useId().replace(/:/g, "");
  const grow = useTransform(dev, (d) => Math.max(0.001, d));
  const headX = useTransform(dev, (d) => X0 + d * ((SEGMENTS - 1) * STEP + 46));

  return (
    <svg
      viewBox="0 0 640 376"
      preserveAspectRatio="xMidYMid meet"
      className="absolute inset-0 size-full bg-[#0b0e0c]"
      role="img"
      aria-label="Records being appended to the end of four log partitions"
    >
      <defs>
        <pattern id={`${clip}-dots`} width="22" height="22" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.2" fill="rgba(232,236,227,0.13)" />
        </pattern>
        <clipPath id={clip}>
          <m.rect x="0" y="0" width="640" height="376" style={{ scaleX: grow, transformOrigin: "0px 0px", transformBox: "view-box" }} />
        </clipPath>
      </defs>
      <rect width="640" height="376" fill={`url(#${clip}-dots)`} />

      {/* the producer, sending records into every partition */}
      <circle cx="46" cy="188" r="26" fill="none" stroke="#f7f2e4" strokeWidth="2.5" />
      <text x="46" y="192" textAnchor="middle" fontFamily="var(--font-code)" fontSize="11" fill="#f7f2e4">
        app
      </text>
      {ROWS.map((y) => (
        <path
          key={y}
          d={`M72 188 C 100 188, 104 ${y + 17}, ${X0 - 12} ${y + 17}`}
          fill="none"
          stroke="rgba(247,242,228,0.45)"
          strokeWidth="2"
          strokeDasharray="3 6"
          strokeLinecap="round"
        />
      ))}

      {/* the partitions */}
      {ROWS.map((y, r) => (
        <g key={y}>
          <text x={X0 - 20} y={y + 21} textAnchor="end" fontFamily="var(--font-code)" fontSize="11" fill="#8f9a94">
            {`p${r}`}
          </text>
          <line
            x1={X0 - 8}
            x2={X0 + SEGMENTS * STEP + 6}
            y1={y + 17}
            y2={y + 17}
            stroke="rgba(247,242,228,0.12)"
            strokeWidth="34"
            strokeLinecap="round"
          />
          <g clipPath={`url(#${clip})`}>
            {Array.from({ length: SEGMENTS }, (_, k) => {
              const newest = k === SEGMENTS - 1;
              return (
                <g key={k}>
                  <rect
                    x={X0 + k * STEP}
                    y={y}
                    width="46"
                    height="34"
                    rx="7"
                    fill={newest ? "#ffe36e" : r % 2 ? "#9af2c6" : "#2ee58f"}
                    stroke="#0b0e0c"
                    strokeWidth="2.5"
                  />
                  <text
                    x={X0 + k * STEP + 23}
                    y={y + 22}
                    textAnchor="middle"
                    fontFamily="var(--font-code)"
                    fontSize="13"
                    fontWeight="700"
                    fill="#0b0e0c"
                  >
                    {k * 4 + r}
                  </text>
                </g>
              );
            })}
          </g>
        </g>
      ))}

      {/* the write head, always at the end */}
      <m.g style={{ x: headX }}>
        <path d={`M0 18 L0 358`} stroke="#ffe36e" strokeWidth="2.5" strokeDasharray="4 6" strokeLinecap="round" />
        <text x="-8" y="14" textAnchor="end" fontFamily="var(--font-code)" fontSize="11" fill="#ffe36e">
          append
        </text>
      </m.g>
    </svg>
  );
}
