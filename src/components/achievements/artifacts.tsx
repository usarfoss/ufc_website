"use client";

import { useId } from "react";
import { Tape } from "@/components/home/scrap";
import { StickerArt } from "@/components/home/sticker-art";
import type { Achievement } from "@/data/achievements";

type Props = Pick<Achievement, "name" | "headline" | "org" | "detail" | "also"> & { bg: string };

const ink = "#14140f";

/** Deterministic bars, so server and client render the same barcode. */
function Barcode({ seed = 0, className = "" }: { seed?: number; className?: string }) {
  const bars = Array.from({ length: 34 }, (_, i) => 1 + ((i * 7 + seed * 3 + (i % 3) * 5) % 4));
  return (
    <div className={`flex h-9 items-stretch gap-[2px] ${className}`} aria-hidden="true">
      {bars.map((w, i) => (
        <span key={i} className="bg-[var(--ink)]" style={{ width: w * 1.4 }} />
      ))}
    </div>
  );
}

/** GSoC: an enamel patch with a smiling sun and a ribbon. */
export function Patch({ headline, org }: Props) {
  const [top, year] = headline.split("’");
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[19rem]">
      <div className="absolute inset-0 spin-slow">
        <StickerArt id="sun" className="size-full" />
      </div>
      <div className="absolute inset-[22%] grid place-items-center rounded-full border-[3px] border-[var(--ink)] bg-[var(--cream)] text-center shadow-[inset_0_0_0_5px_#ffe36e]">
        <div className="leading-none">
          <p className="serif text-[clamp(2.1rem,4vw,3rem)]">{top}</p>
          <p className="pixel mt-1 text-[1.5rem]">’{year}</p>
        </div>
      </div>
      <div className="absolute inset-x-[-4%] bottom-[6%] rotate-[-5deg] border-[3px] border-[var(--ink)] bg-[var(--signal)] py-1.5 text-center shadow-[4px_4px_0_var(--ink)]">
        <p className="pixel text-[0.95rem] uppercase tracking-wide">{org}</p>
      </div>
    </div>
  );
}

/** FOSS United: a round passport stamp inked onto a page. */
function InkStamp({ headline, org, color, className }: { headline: string; org: string; color: string; className: string }) {
  const uid = useId().replace(/:/g, "");
  const ring = `${org.toUpperCase()} ✦ ${org.toUpperCase()} ✦ ${org.toUpperCase()} ✦ `;
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
      <defs>
        <path id={`r${uid}`} d="M100 100m-72 0a72 72 0 1 1 144 0a72 72 0 1 1-144 0" />
      </defs>
      <g fill="none" stroke={color} strokeWidth="5" opacity="0.92">
        <circle cx="100" cy="100" r="92" />
        <circle cx="100" cy="100" r="54" strokeWidth="3" />
      </g>
      <text fontSize="15" fill={color} fontWeight="700" letterSpacing="3" style={{ fontFamily: "var(--f-pixel)" }}>
        <textPath href={`#r${uid}`}>{ring}</textPath>
      </text>
      <text x="100" y="108" textAnchor="middle" fontSize="24" fill={color} fontWeight="700" style={{ fontFamily: "var(--f-pixel)" }}>
        {headline.toUpperCase()}
      </text>
    </svg>
  );
}

export function Stamp({ headline, org, also }: Props) {
  const second = also?.[0];
  return (
    <div className={`paper relative mx-auto w-full max-w-[22rem] overflow-hidden p-5 ${second ? "aspect-[1/1]" : "aspect-[5/4]"}`}>
      <p className="code text-[0.6rem] font-bold uppercase tracking-[0.25em] text-black/40">passport · visas &amp; entries</p>
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className="mt-5 block h-px bg-black/15" />
      ))}
      <InkStamp headline={headline} org={org} color="#0b874f" className={`absolute -right-2 rotate-[-14deg] ${second ? "top-[4%] w-[58%]" : "top-1/2 -translate-y-1/2 !w-[72%] w-[66%]"}`} />
      {second && <InkStamp headline={second.headline} org={second.org} color="#1b2a8a" className="absolute bottom-[10%] left-0 w-[48%] rotate-[10deg]" />}
      <p className={`hand absolute text-[1.35rem] leading-none text-black/55 ${second ? "bottom-3 right-5" : "bottom-3 left-5"}`}>{second ? "two entries approved ✓" : "entry approved ✓"}</p>
    </div>
  );
}

/** DRDO: a classified file. The sensitive parts are, naturally, blacked out. */
export function Classified({ name, headline, org }: Props) {
  const Bar = ({ w }: { w: string }) => <span className="inline-block h-[0.95em] rounded-[2px] bg-[var(--ink)] align-middle" style={{ width: w }} />;
  return (
    <div className="relative mx-auto w-full max-w-[22rem]">
      <div className="absolute -top-3 left-0 h-6 w-28 rounded-t-xl border-[2.5px] border-b-0 border-[var(--ink)] bg-[#e9d3a0]" />
      <div className="relative rounded-xl rounded-tl-none border-[2.5px] border-[var(--ink)] bg-[#f1dca8] p-5 shadow-[6px_6px_0_var(--ink)]">
        <div className="paper -rotate-1 p-4">
          <Tape tone="butter" className="-top-3 left-6 !w-14" rotate={-4} />
          <p className="code text-[0.6rem] font-bold uppercase tracking-[0.25em] text-black/45">file no. 0001</p>
          <dl className="code mt-3 space-y-2 text-[0.8rem] leading-snug">
            <div><dt className="inline font-bold">SUBJECT: </dt><dd className="inline">{name}</dd></div>
            <div><dt className="inline font-bold">ROLE: </dt><dd className="inline">{headline}</dd></div>
            <div><dt className="inline font-bold">ORG: </dt><dd className="inline">{org}</dd></div>
            <div><dt className="inline font-bold">PROJECT: </dt><dd className="inline"><Bar w="5.5rem" /> <Bar w="3rem" /></dd></div>
            <div><dt className="inline font-bold">LOCATION: </dt><dd className="inline"><Bar w="7rem" /></dd></div>
            <div className="pt-1"><Bar w="100%" /></div>
            <div><Bar w="82%" /></div>
          </dl>
        </div>
        <span className="absolute -right-5 top-6 rotate-12 rounded-md border-[3px] border-[#d6332c] px-3 py-1 text-[#d6332c]" style={{ background: "rgba(255,255,255,0.35)" }}>
          <span className="pixel text-[1.15rem] tracking-widest">CLEARED</span>
        </span>
      </div>
    </div>
  );
}

const ZIG = (() => {
  const pts = ["0 0", "100% 0"];
  const n = 18;
  for (let i = 0; i <= n; i++) pts.push(`${100 - (i / n) * 100}% ${i % 2 ? "calc(100% - 9px)" : "100%"}`);
  return `polygon(${pts.join(",")})`;
})();

/** Zomato: an order receipt, because of course it is. */
export function Receipt({ name, headline, org }: Props) {
  return (
    <div className="mx-auto w-full max-w-[18rem] drop-shadow-[6px_8px_0_rgba(20,20,15,0.9)]">
      <div className="bg-white px-5 pb-8 pt-6 text-[var(--ink)]" style={{ clipPath: ZIG }}>
        <p className="pixel text-center text-[1.3rem] tracking-wide">ORDER RECEIPT</p>
        <p className="code mt-1 text-center text-[0.62rem] uppercase tracking-widest text-black/45">{org} · table for one</p>
        <div className="my-3 border-t-2 border-dashed border-black/30" />
        <dl className="code space-y-1.5 text-[0.76rem]">
          <div className="flex justify-between gap-3"><dt>1 × {headline}</dt><dd>done</dd></div>
          <div className="flex justify-between gap-3"><dt>customer</dt><dd className="text-right">{name.split(" ")[0]}</dd></div>
          <div className="flex justify-between gap-3"><dt>side of</dt><dd className="text-right">hard work</dd></div>
          <div className="flex justify-between gap-3"><dt>extra</dt><dd className="text-right">late nights</dd></div>
        </dl>
        <div className="my-3 border-t-2 border-dashed border-black/30" />
        <div className="flex items-baseline justify-between">
          <span className="code text-[0.7rem] font-bold">STATUS</span>
          <span className="pixel text-[1.15rem] text-[var(--signal-deep)]">DELIVERED ✓</span>
        </div>
        <Barcode seed={3} className="mt-4 justify-center" />
      </div>
    </div>
  );
}

/** Intern: the conference name tag. */
export function NameTag({ name, headline, org }: Props) {
  return (
    <div className="mx-auto w-full max-w-[19rem] overflow-hidden rounded-2xl border-[2.5px] border-[var(--ink)] bg-white shadow-[6px_6px_0_var(--ink)]">
      <div className="bg-[#e5372f] py-3 text-center text-white">
        <p className="pixel text-[2rem] leading-none tracking-wider">HELLO</p>
        <p className="mt-1 text-[0.72rem] font-bold uppercase tracking-[0.25em]">my name is</p>
      </div>
      <div className="px-4 pb-6 pt-5 text-center">
        <p className="hand text-[3rem] leading-[0.9] text-[#1b2a8a]">{name.split(" ")[0]}</p>
        <div className="mx-auto my-4 h-px w-3/4 bg-black/20" />
        <p className="serif text-[1.8rem] leading-none">{headline}</p>
        <p className="code mt-2 text-[0.72rem] font-bold uppercase tracking-widest text-black/55">@ {org}</p>
      </div>
    </div>
  );
}

/** WWDC: a conference ticket with a tear-off stub. */
export function Ticket({ headline, org, bg }: Props) {
  const [what, who] = headline.split(" ").reduce<[string, string]>((acc, w, i, a) => (i < a.length - 1 ? [acc[0] + (acc[0] ? " " : "") + w, acc[1]] : [acc[0], w]), ["", ""]);
  return (
    <div className="relative mx-auto flex w-full max-w-[26rem] overflow-hidden rounded-2xl border-[2.5px] border-[var(--ink)] bg-[var(--cream)] shadow-[6px_6px_0_var(--ink)]">
      <span className="absolute left-[69%] top-[-12px] z-10 size-6 rounded-full border-[2.5px] border-[var(--ink)]" style={{ background: bg }} />
      <span className="absolute bottom-[-12px] left-[69%] z-10 size-6 rounded-full border-[2.5px] border-[var(--ink)]" style={{ background: bg }} />
      <div className="flex-[7] border-r-2 border-dashed border-[var(--ink)]/40 p-5">
        <p className="code text-[0.6rem] font-bold uppercase tracking-[0.25em] text-black/45">{org} presents</p>
        <p className="serif mt-2 text-[clamp(1.9rem,3.2vw,2.6rem)] leading-[0.95]">{what}</p>
        <p className="pixel mt-1 text-[1.5rem] uppercase text-[var(--signal-deep)]">{who}</p>
        <Barcode seed={5} className="mt-4" />
      </div>
      <div className="flex flex-[3] flex-col items-center justify-between bg-[var(--butter)] px-2 py-4 text-center">
        <p className="pixel text-[0.78rem] leading-tight">ADMIT<br />ONE</p>
        <p className="serif -rotate-90 whitespace-nowrap text-[1.4rem]">№ 26</p>
        <span className="text-xl">★</span>
      </div>
    </div>
  );
}

/** NSUT: a page from a research notebook. */
export function Notebook({ headline, org }: Props) {
  return (
    <div
      className="relative mx-auto w-full max-w-[22rem] rounded-r-xl border-[2.5px] border-[var(--ink)] py-6 pl-14 pr-5 shadow-[6px_6px_0_var(--ink)]"
      style={{
        backgroundColor: "#fbf8ee",
        backgroundImage: "linear-gradient(rgba(60,100,200,0.22) 1px, transparent 1px)",
        backgroundSize: "100% 1.9rem",
        backgroundPosition: "0 0.9rem",
      }}
    >
      <span className="absolute inset-y-0 left-11 w-px bg-[#e5372f]/60" aria-hidden="true" />
      <div className="absolute inset-y-4 left-3 flex flex-col justify-around" aria-hidden="true">
        {Array.from({ length: 6 }, (_, i) => (
          <span key={i} className="block size-3.5 rounded-full border-2 border-[var(--ink)] bg-[var(--paper)]" />
        ))}
      </div>
      <p className="code text-[0.6rem] font-bold uppercase tracking-[0.25em] text-black/40">lab notebook · entry 07</p>
      <p className="hand mt-3 text-[2.5rem] leading-[0.95]">{headline}</p>
      <p className="hand mt-1 text-[1.9rem] leading-none">
        @ <span className="relative inline-block">{org}<svg viewBox="0 0 100 20" preserveAspectRatio="none" className="absolute -inset-x-2 -bottom-1 h-3 w-[calc(100%+1rem)]" fill="none" aria-hidden="true"><path d="M2 12 C 20 2, 50 20, 98 6" stroke="#2ee58f" strokeWidth="4" strokeLinecap="round" /></svg></span>
      </p>
      <p className="hand mt-5 text-[1.45rem] leading-[1.1] text-black/65">hypothesis: this goes well.</p>
      <p className="hand text-[1.45rem] leading-[1.1] text-black/65">result: it did ✓</p>
    </div>
  );
}

export const ARTIFACTS = { patch: Patch, stamp: Stamp, classified: Classified, receipt: Receipt, nametag: NameTag, ticket: Ticket, notebook: Notebook } as const;
