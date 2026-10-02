"use client";

import { useId } from "react";

const INK = "#14140f";
const S = { stroke: INK, strokeWidth: 3.5, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const hand = { fontFamily: "var(--f-hand)", fontWeight: 700 } as const;
const pixel = { fontFamily: "var(--f-pixel)", fontWeight: 700 } as const;

export type ArtId =
  | "heart" | "bug" | "floppy" | "coffee" | "burst" | "lgtm" | "bubble" | "magnifier" | "play"
  | "plane" | "rocket" | "fork" | "ticket" | "sparkle" | "seal" | "sun";

/** Natural pixel size of each piece of art, used by the physics pile. */
export const ART_SIZE: Record<ArtId, [number, number]> = {
  heart: [96, 92], bug: [96, 104], floppy: [92, 92], coffee: [92, 100], burst: [116, 116], lgtm: [128, 70],
  bubble: [188, 112], magnifier: [100, 100], play: [92, 92], plane: [112, 100], rocket: [78, 120], fork: [92, 96],
  ticket: [176, 98], sparkle: [70, 70], seal: [150, 150], sun: [130, 130],
};

/** Original sticker illustrations. Flat colour, thick outline; add the .die-cut class at the call site for the white border. */
export function StickerArt({ id, className }: { id: ArtId; className?: string }) {
  const uid = useId().replace(/:/g, "");
  const [w, h] = ART_SIZE[id];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} fill="none" aria-hidden="true">
      {id === "heart" && (
        <g {...S} transform="translate(2 2) scale(.92)">
          <path d="M48 88C8 58 10 22 33 22c9 0 15 6 15 12 0-6 6-12 15-12 23 0 25 36-15 66z" fill="#ff7aa8" />
          <path d="M24 38c0-6 4-10 9-10" stroke="#fff" strokeWidth="4" />
        </g>
      )}
      {id === "bug" && (
        <g {...S}>
          <path d="M30 40 12 28M30 56 8 56M32 72 14 86M66 40l18-12M66 56h22M64 72l18 14M40 14 34 4M56 14l6-10" />
          <ellipse cx="48" cy="62" rx="22" ry="30" fill="#2ee58f" />
          <circle cx="48" cy="28" r="13" fill="#14140f" />
          <path d="M48 36v54" />
          <circle cx="38" cy="58" r="3.4" fill={INK} stroke="none" />
          <circle cx="58" cy="52" r="3.4" fill={INK} stroke="none" />
          <circle cx="40" cy="76" r="3.4" fill={INK} stroke="none" />
          <circle cx="44" cy="26" r="2.4" fill="#fff" stroke="none" />
          <circle cx="53" cy="26" r="2.4" fill="#fff" stroke="none" />
        </g>
      )}
      {id === "floppy" && (
        <g {...S}>
          <path d="M10 14a4 4 0 0 1 4-4h58l10 10v58a4 4 0 0 1-4 4H14a4 4 0 0 1-4-4z" fill="#5aa9ff" />
          <rect x="26" y="10" width="34" height="22" fill="#e6ebf0" />
          <rect x="46" y="14" width="8" height="14" fill={INK} />
          <rect x="20" y="46" width="52" height="36" rx="3" fill="#fbf6e6" />
          <path d="M28 58h36M28 68h24" strokeWidth="2.6" />
        </g>
      )}
      {id === "coffee" && (
        <g {...S}>
          <path className="steam" d="M34 22c-6-6 6-10 0-18M48 22c-6-6 6-10 0-18M62 22c-6-6 6-10 0-18" strokeWidth="3" />
          <path d="M72 44h8a10 10 0 0 1 0 22h-9" fill="none" />
          <path d="M14 34h60v26a24 24 0 0 1-24 24h-12a24 24 0 0 1-24-24z" fill="#fbf6e6" />
          <ellipse cx="44" cy="34" rx="30" ry="7" fill="#7a4a2b" />
          <path d="M26 52h36" stroke="#2ee58f" strokeWidth="5" />
          <rect x="10" y="90" width="68" height="3" rx="1.5" fill={INK} stroke="none" opacity=".3" />
        </g>
      )}
      {id === "burst" && (
        <g {...S}>
          <path d="m58 4 9 16 17-8 2 19 19 3-10 16 14 13-18 7 4 19-19-3-5 18-14-13-14 13-5-18-19 3 4-19-18-7 14-13-10-16 19-3 2-19 17 8z" fill="#ffe36e" />
          <text x="58" y="66" textAnchor="middle" fontSize="23" fill={INK} stroke="none" style={pixel}>FREE!</text>
        </g>
      )}
      {id === "lgtm" && (
        <g {...S}>
          <rect x="5" y="9" width="118" height="52" rx="14" fill="#2ee58f" />
          <text x="48" y="44" textAnchor="middle" fontSize="27" fill={INK} stroke="none" style={pixel}>LGTM</text>
          <path d="m88 36 8 8 16-18" strokeWidth="6" />
        </g>
      )}
      {id === "bubble" && (
        <g {...S}>
          <path d="M20 8h138a14 14 0 0 1 14 14v46a14 14 0 0 1-14 14H70L40 104V82H20A14 14 0 0 1 6 68V22A14 14 0 0 1 20 8z" fill="#fff" />
          <text x="89" y="44" textAnchor="middle" fontSize="27" fill={INK} stroke="none" style={hand}>works on</text>
          <text x="89" y="72" textAnchor="middle" fontSize="27" fill={INK} stroke="none" style={hand}>my machine</text>
        </g>
      )}
      {id === "magnifier" && (
        <g {...S}>
          <path d="m64 64 26 26" strokeWidth="11" stroke="#7a4a2b" />
          <path d="m64 64 26 26" strokeWidth="5" stroke="#b5835a" />
          <circle cx="42" cy="42" r="30" fill="rgba(255,255,255,.55)" strokeWidth="6" />
          <path d="M26 38a18 18 0 0 1 14-14" stroke="#fff" strokeWidth="5" />
        </g>
      )}
      {id === "play" && (
        <g {...S}>
          <circle cx="46" cy="46" r="40" fill="#2ee58f" />
          <path d="M36 28v36l32-18z" fill="#fbf6e6" />
        </g>
      )}
      {id === "plane" && (
        <g {...S}>
          <path d="M6 48 106 8 62 94 50 62z" fill="#fff" />
          <path d="m50 62 56-54-66 50z" fill="#d9e2ee" />
          <path d="m50 62 6 22 10-14z" fill="#c4cfdc" />
        </g>
      )}
      {id === "rocket" && (
        <g {...S}>
          <path className="flame" d="M28 82c0 18 10 30 10 30s10-12 10-30z" fill="#ffb400" style={{ transformOrigin: "38px 82px" }} />
          <path d="M39 8c18 14 20 40 16 62H23c-4-22-2-48 16-62z" fill="#fbf6e6" />
          <path d="M23 52 8 70v10l16-6zM55 52l15 18v10l-16-6z" fill="#ff6b5e" />
          <circle cx="39" cy="36" r="9" fill="#9bd7ff" />
        </g>
      )}
      {id === "fork" && (
        <g {...S}>
          <path d="M26 24v50M26 54c0-14 40-8 40-26" strokeWidth="5" />
          <circle cx="26" cy="20" r="11" fill="#ffe36e" />
          <circle cx="26" cy="76" r="11" fill="#2ee58f" />
          <circle cx="66" cy="24" r="11" fill="#ffb3cf" />
        </g>
      )}
      {id === "ticket" && (
        <g {...S}>
          <path d="M10 14h156v22a10 10 0 0 0 0 26v22H10V62a10 10 0 0 0 0-26z" fill="#fff" />
          <path d="M122 14v70" strokeDasharray="2 7" strokeWidth="2.6" />
          <rect x="10" y="14" width="108" height="14" fill="#ff7aa8" stroke="none" />
          <text x="64" y="52" textAnchor="middle" fontSize="22" fill={INK} stroke="none" style={pixel}>ADMIT</text>
          <text x="64" y="76" textAnchor="middle" fontSize="22" fill={INK} stroke="none" style={pixel}>ANYONE</text>
          <text x="144" y="56" textAnchor="middle" fontSize="20" fill={INK} stroke="none" style={pixel}>№0</text>
        </g>
      )}
      {id === "sparkle" && (
        <path {...S} d="M35 4C38 24 46 32 66 35 46 38 38 46 35 66 32 46 24 38 4 35 24 32 32 24 35 4z" fill="#ffe36e" />
      )}
      {id === "seal" && (
        <g>
          <defs>
            <path id={`ring-${uid}`} d="M75 75m-50 0a50 50 0 1 1 100 0a50 50 0 1 1-100 0" />
          </defs>
          <circle cx="75" cy="75" r="70" fill="#2ee58f" stroke={INK} strokeWidth="3.5" />
          <circle cx="75" cy="75" r="30" fill="#14140f" />
          <g className="spin-slow" style={{ transformOrigin: "75px 75px" }}>
            <text fontSize="13.5" fill={INK} style={pixel} letterSpacing="1.5">
              <textPath href={`#ring-${uid}`}>OPEN SOURCE ✦ OPEN MINDS ✦ OPEN SOURCE ✦ OPEN MINDS ✦</textPath>
            </text>
          </g>
          {[[63, 63, 1], [75, 63, 0], [87, 63, 1], [63, 75, 0], [75, 75, 1], [87, 75, 0], [63, 87, 1], [75, 87, 0], [87, 87, 1]].map(([x, y, on]) => (
            <rect key={`${x}-${y}`} x={x - 4.5} y={y - 4.5} width="9" height="9" rx="1.5" fill={on ? "#2ee58f" : "none"} stroke={on ? "none" : "#2ee58f"} strokeOpacity=".5" />
          ))}
        </g>
      )}
      {id === "sun" && (
        <g {...S}>
          <g className="spin-slow" style={{ transformOrigin: "65px 65px" }}>
            {Array.from({ length: 12 }, (_, i) => (
              <path key={i} d="M65 6v14" transform={`rotate(${i * 30} 65 65)`} strokeWidth="6" stroke="#ffb400" />
            ))}
          </g>
          <circle cx="65" cy="65" r="34" fill="#ffe36e" />
          <circle cx="54" cy="60" r="3.4" fill={INK} stroke="none" />
          <circle cx="76" cy="60" r="3.4" fill={INK} stroke="none" />
          <path d="M52 74c8 9 18 9 26 0" strokeWidth="3.4" />
          <circle cx="46" cy="72" r="5" fill="#ff9ab8" stroke="none" opacity=".7" />
          <circle cx="84" cy="72" r="5" fill="#ff9ab8" stroke="none" opacity=".7" />
        </g>
      )}
    </svg>
  );
}
