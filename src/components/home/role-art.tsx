import type { RoleId } from "./data";

const INK = "#14140f";

/** Original sticker illustrations, one per kind of contributor. Flat colour, thick outline, offset shadow. */
export function RoleArt({ id, className }: { id: RoleId; className?: string }) {
  const common = { stroke: INK, strokeWidth: 3.5, strokeLinecap: "round", strokeLinejoin: "round" } as const;
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" aria-hidden="true">
      {id === "dev" && (
        <g {...common}>
          <rect x="14" y="26" width="96" height="76" rx="9" fill={INK} opacity="0.22" transform="translate(5 5)" />
          <rect x="10" y="22" width="96" height="76" rx="9" fill="#fff" />
          <path d="M10 31a9 9 0 0 1 9-9h78a9 9 0 0 1 9 9v7H10z" fill="#2ee58f" />
          <circle cx="22" cy="30" r="2.6" fill={INK} stroke="none" />
          <circle cx="32" cy="30" r="2.6" fill={INK} stroke="none" />
          <path d="M40 58 27 69l13 11M76 58l13 11-13 11M62 55l-9 28" />
        </g>
      )}
      {id === "design" && (
        <g {...common}>
          <circle cx="63" cy="65" r="46" fill={INK} opacity="0.22" />
          <circle cx="58" cy="60" r="46" fill="#ffb3cf" />
          <path d="M22 88C34 28 70 106 96 34" strokeWidth="5" />
          <path d="M22 88 38 50M96 34l-8 34" strokeWidth="2.4" strokeDasharray="1 6" />
          <rect x="14" y="80" width="16" height="16" fill="#fff" />
          <rect x="88" y="26" width="16" height="16" fill="#fff" />
          <circle cx="38" cy="50" r="6" fill="#c7b3ff" />
          <circle cx="88" cy="68" r="6" fill="#c7b3ff" />
        </g>
      )}
      {id === "hardware" && (
        <g {...common}>
          <rect x="31" y="31" width="64" height="64" rx="8" fill={INK} opacity="0.22" />
          <path d="M44 18v14M60 18v14M76 18v14M44 88v14M60 88v14M76 88v14M18 44h14M18 60h14M18 76h14M88 44h14M88 60h14M88 76h14" stroke="#ffb400" strokeWidth="6" strokeLinecap="butt" />
          <rect x="28" y="28" width="64" height="64" rx="8" fill="#2d3b33" />
          <circle cx="40" cy="40" r="4" fill="#ecefe4" stroke="none" />
          <path d="m64 40-14 22h10l-4 18 16-24H62z" fill="#2ee58f" />
        </g>
      )}
      {id === "data" && (
        <g {...common}>
          <circle cx="63" cy="65" r="46" fill={INK} opacity="0.22" />
          <circle cx="58" cy="60" r="46" fill="#9bd7ff" />
          <path d="M28 40 58 32M28 40 58 62M28 60 58 32M28 60 58 62M28 60 58 90M28 80 58 62M28 80 58 90M58 32 90 46M58 62 90 46M58 62 90 76M58 90 90 76" strokeWidth="2" />
          {[[28, 40], [28, 60], [28, 80], [58, 32], [58, 62], [58, 90], [90, 46], [90, 76]].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="7" fill="#fff" />
          ))}
          <circle cx="90" cy="46" r="3.5" fill="#2ee58f" stroke="none" />
        </g>
      )}
      {id === "words" && (
        <g {...common}>
          <rect x="26" y="20" width="62" height="84" rx="5" fill={INK} opacity="0.22" transform="translate(5 5)" />
          <rect x="22" y="16" width="62" height="84" rx="5" fill="#fff" />
          <path d="M34 34h38M34 46h38M34 58h26M34 70h32" strokeWidth="3" />
          <g transform="rotate(38 88 62)">
            <rect x="82" y="22" width="14" height="58" fill="#ffe36e" />
            <path d="M82 80h14l-7 16z" fill="#f7f2e4" />
            <path d="M89 92v4" />
            <rect x="82" y="14" width="14" height="10" fill="#ffb3cf" />
          </g>
        </g>
      )}
      {id === "people" && (
        <g {...common}>
          <path d="M18 24h64a8 8 0 0 1 8 8v30a8 8 0 0 1-8 8H48l-14 14V70h-16a8 8 0 0 1-8-8V32a8 8 0 0 1 8-8z" fill={INK} opacity="0.22" transform="translate(5 5)" />
          <path d="M14 20h64a8 8 0 0 1 8 8v30a8 8 0 0 1-8 8H44L30 80V66H14a8 8 0 0 1-8-8V28a8 8 0 0 1 8-8z" fill="#ffb3cf" />
          <circle cx="30" cy="43" r="3.4" fill={INK} stroke="none" />
          <circle cx="46" cy="43" r="3.4" fill={INK} stroke="none" />
          <circle cx="62" cy="43" r="3.4" fill={INK} stroke="none" />
          <path d="M64 70h38a8 8 0 0 1 8 8v22a8 8 0 0 1-8 8H94v10L82 108H64a8 8 0 0 1-8-8V78a8 8 0 0 1 8-8z" fill="#2ee58f" />
          <path d="m83 100-9-8c-6-5-1-13 5-9l4 4 4-4c6-4 11 4 5 9z" fill="#fff" strokeWidth="2.5" />
        </g>
      )}
      {id === "newbie" && (
        <g {...common}>
          <ellipse cx="62" cy="100" rx="40" ry="9" fill={INK} opacity="0.22" />
          <path d="M20 96c4-14 18-18 42-18s38 4 42 18z" fill="#b5835a" />
          <path d="M62 80V44" strokeWidth="5" />
          <path d="M62 56C44 56 30 46 28 28c18-2 32 6 34 28z" fill="#2ee58f" />
          <path d="M62 46c0-16 12-26 30-26 2 18-10 28-30 26z" fill="#9af2c6" />
          <circle cx="40" cy="90" r="2.5" fill={INK} stroke="none" />
          <circle cx="82" cy="88" r="2.5" fill={INK} stroke="none" />
        </g>
      )}
    </svg>
  );
}
