/** The drawing-board details behind the workshop: instruments, callouts and a few notes. Static white line art, nothing moves. */

type Tool = "gear" | "protractor" | "ruler" | "square" | "compass" | "cross";

function Instrument({ kind, className = "" }: { kind: Tool; className?: string }) {
  const wide = kind === "ruler";
  return (
    <svg
      viewBox={wide ? "0 0 170 44" : "0 0 120 120"}
      className={`absolute ${className}`}
      fill="none"
      stroke="rgba(255,255,255,0.42)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {kind === "gear" && (
        <>
          <circle cx="60" cy="60" r="37" />
          <circle cx="60" cy="60" r="11" />
          <circle cx="60" cy="60" r="24" strokeDasharray="3 6" />
          {Array.from({ length: 10 }, (_, i) => (
            <rect key={i} x="53" y="7" width="14" height="16" rx="2.5" transform={`rotate(${i * 36} 60 60)`} />
          ))}
        </>
      )}
      {kind === "protractor" && (
        <>
          <path d="M8 84 A52 52 0 0 1 112 84 Z" />
          <path d="M26 84 A34 34 0 0 1 94 84" />
          {Array.from({ length: 19 }, (_, i) => {
            const a = Math.PI - (i * Math.PI) / 18;
            const long = i % 3 === 0;
            const r1 = 52;
            const r2 = long ? 43 : 47;
            return (
              <path key={i} d={`M${60 + r1 * Math.cos(a)} ${84 - r1 * Math.sin(a)} L${60 + r2 * Math.cos(a)} ${84 - r2 * Math.sin(a)}`} />
            );
          })}
          <path d="M60 84 L60 78 M54 84 L66 84" />
        </>
      )}
      {kind === "ruler" && (
        <>
          <rect x="4" y="6" width="162" height="32" rx="4" />
          {Array.from({ length: 33 }, (_, i) => (
            <path key={i} d={`M${10 + i * 4.75} 6 L${10 + i * 4.75} ${i % 4 === 0 ? 22 : 15}`} />
          ))}
        </>
      )}
      {kind === "square" && (
        <>
          <path d="M12 12 L12 108 L108 108 Z" />
          <path d="M30 56 L30 90 L64 90 Z" />
          <circle cx="24" cy="94" r="3" />
        </>
      )}
      {kind === "compass" && (
        <>
          <circle cx="60" cy="14" r="6" />
          <path d="M60 20 L28 108 M60 20 L92 108" />
          <path d="M28 108 L25 116 M92 108 L92 116" />
          <path d="M36 86 L84 86" />
          <path d="M16 100 A56 56 0 0 1 22 78" strokeDasharray="3 5" />
        </>
      )}
      {kind === "cross" && (
        <>
          <circle cx="60" cy="60" r="20" />
          <path d="M60 24 L60 96 M24 60 L96 60" />
        </>
      )}
    </svg>
  );
}

function Note({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <p className={`hand absolute select-none whitespace-nowrap leading-none text-white/45 ${className}`}>{children}</p>;
}

export function BlueprintDoodles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* around the heading */}
      <Instrument kind="gear" className="-right-2 top-[2.6rem] w-20 rotate-6 sm:right-[5%] sm:top-[6rem] sm:w-44" />
      <Instrument kind="protractor" className="right-[24%] top-[3rem] hidden w-32 -rotate-12 lg:block" />
      <Instrument kind="ruler" className="left-[3%] top-[3rem] w-36 -rotate-3 sm:w-48" />
      <Instrument kind="cross" className="right-[22%] top-[14rem] hidden w-14 lg:block" />
      <Instrument kind="square" className="right-[2%] top-[24rem] hidden w-24 rotate-12 md:block" />
      <Note className="right-[5%] top-[19.5rem] hidden -rotate-3 text-2xl lg:block">fig. 1: where the gears go</Note>
      <Note className="left-[4%] top-[6.3rem] hidden -rotate-3 text-xl xl:block">scale 1:1, mostly</Note>
    </div>
  );
}

/** A dimension line, the way engineers measure things: a span with arrowheads and the number in the middle. */
export function DimensionLine({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div className={`flex items-center gap-3 text-white/60 ${className}`} aria-hidden="true">
      <svg viewBox="0 0 12 24" className="h-5 w-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M2 12 L10 12 M5 7 L1 12 L5 17 M1 3 L1 21" />
      </svg>
      <span className="h-px flex-1 bg-current opacity-60" />
      <span className="code whitespace-nowrap text-[0.7rem] uppercase tracking-[0.22em]">{label}</span>
      <span className="h-px flex-1 bg-current opacity-60" />
      <svg viewBox="0 0 12 24" className="h-5 w-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M10 12 L2 12 M7 7 L11 12 L7 17 M11 3 L11 21" />
      </svg>
    </div>
  );
}
