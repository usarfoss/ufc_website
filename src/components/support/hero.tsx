import { MapPin, PartyPopper } from "lucide-react";
import { ArrowLink } from "@/components/home/arrow-link";
import { MaskLine, Reveal } from "@/components/home/motion-primitives";
import { Barcode } from "@/components/home/scrap";
import { Countdown } from "./countdown";
import { BROCHURE, ELYSIAN, FORGE } from "./support-data";

/**
 * The art is a contribution graph, the kind that fills up on a GitHub profile, with the squares that spell "2.0" lit up. It is plain markup
 * and CSS (no canvas, no images): each square is a cell of a grid, and the lit ones pop in one column after another.
 */
const COLS = 17;
const ROWS = 9;
/** 5 wide, 7 tall. 1 is a lit square. */
const TWO = ["01110", "10001", "00001", "00010", "00100", "01000", "11111"];
const ZERO = ["01110", "10001", "10011", "10101", "11001", "10001", "01110"];
const DOT = ["0", "0", "0", "0", "0", "0", "1"];

const lit = new Set<string>();
const place = (glyph: string[], left: number) =>
  glyph.forEach((row, y) =>
    [...row].forEach((c, x) => {
      if (c === "1") lit.add(`${left + x},${y + 1}`);
    }),
  );
place(TWO, 2);
place(DOT, 8);
place(ZERO, 10);

/** The quiet squares get four strengths of white, from a fixed pattern so the server and the browser draw the same thing. */
const LEVELS = [0.16, 0.24, 0.32, 0.42];
const strength = (x: number, y: number) => LEVELS[(x * 7 + y * 13 + ((x * y) % 5)) % 4];

function ContributionArt() {
  return (
    <figure aria-label="A contribution graph with the squares that spell 2.0 lit up" className="mx-auto w-full max-w-[34rem]">
      <div className="grid gap-1 sm:gap-1.5" style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }} aria-hidden="true">
        {Array.from({ length: COLS * ROWS }, (_, i) => {
          const x = i % COLS;
          const y = Math.floor(i / COLS);
          const on = lit.has(`${x},${y}`);
          return on ? (
            <span
              key={i}
              className="forge-cell aspect-square w-full rounded-[22%] border-2 border-[var(--ink)]! bg-[var(--signal)]"
              style={{ animationDelay: `${0.15 + x * 0.045}s` }}
            />
          ) : (
            <span key={i} className="aspect-square w-full rounded-[22%]" style={{ background: `rgba(255,255,255,${strength(x, y)})` }} />
          );
        })}
      </div>
      <figcaption className="code mt-4 flex items-center justify-between gap-3 text-[0.7rem] font-bold uppercase tracking-widest text-[var(--ink)]/65">
        <span>every square a commit, yours could be next</span>
        <span className="flex items-center gap-1.5" aria-hidden="true">
          less
          {LEVELS.map((a) => (
            <span key={a} className="size-3 rounded-[3px]" style={{ background: `rgba(255,255,255,${a})` }} />
          ))}
          <span className="size-3 rounded-[3px] border-2 border-[var(--ink)]! bg-[var(--signal)]" />
          more
        </span>
      </figcaption>
    </figure>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <span className="code block text-[0.68rem] font-bold uppercase tracking-widest text-[var(--ink)]/55">{children}</span>;
}

/** A punched circle on the perforation: it is the page's own colour, so the ticket looks cut. */
const notch = "absolute z-10 size-6 rounded-full border-[2.5px] border-[var(--ink)]! bg-[var(--sky)]";

/** Everything you need to know, as the ticket you would hold: the dates, the place, and a stub with the clock on it. */
function Ticket() {
  return (
    <div
      data-ticket
      className="relative grid rounded-2xl border-[2.5px] border-[var(--ink)]! bg-[var(--cream)] shadow-[7px_7px_0_var(--ink)] lg:grid-cols-[1.1fr_1fr_1.15fr]"
    >
      <div className="flex items-center gap-5 px-6 py-6 sm:px-8">
        <div>
          <Label>admit all · when</Label>
          <p className="mt-1 flex items-baseline gap-2">
            <span className="serif text-[clamp(3.6rem,6vw,5rem)] leading-[0.85] tracking-[-0.04em]">21–22</span>
            <span className="pixel text-[1.5rem] uppercase leading-none">Oct</span>
          </p>
          <p className="mt-2 font-bold text-[var(--ink)]/70">2026 · Wednesday and Thursday</p>
        </div>
      </div>

      <div className="grid content-center gap-5 border-t-2 border-[var(--ink)]/15! px-6 py-6 sm:px-8 lg:border-l-2 lg:border-t-0">
        <div>
          <Label>where</Label>
          <p className="mt-0.5 flex items-center gap-2 text-[1.12rem] font-extrabold leading-snug">
            <MapPin size={17} className="shrink-0" aria-hidden="true" />
            {FORGE.venue}
          </p>
        </div>
        <div>
          <Label>part of</Label>
          <p className="mt-0.5 flex items-center gap-2 text-[1.12rem] font-extrabold leading-snug">
            <PartyPopper size={17} className="shrink-0" aria-hidden="true" />
            {FORGE.fest}, {ELYSIAN.footfall} people in total
          </p>
        </div>
      </div>

      <div
        data-brochure
        className="relative border-t-2 border-dashed border-[var(--ink)]/60! px-6 py-6 sm:px-8 lg:border-l-2 lg:border-t-0"
      >
        <span className={`${notch} -left-3 -top-3`} aria-hidden="true" />
        <span className={`${notch} -right-3 -top-3 lg:-bottom-3 lg:left-[-0.75rem] lg:right-auto lg:top-auto`} aria-hidden="true" />
        <Label>doors open in</Label>
        <div className="mt-2">
          <Countdown big />
        </div>
        <Barcode bars={34} seed={3} className="mt-4 !h-7 opacity-70" />
      </div>
    </div>
  );
}

/** Flat sky blue, one big idea (the graph), and everything you need to know in a single strip beneath it. */
export function SupportHero() {
  return (
    <div className="mx-auto max-w-7xl px-5 pb-14 pt-32 sm:px-8 sm:pt-36 lg:pb-16">
      <div className="grid items-center gap-12 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <Reveal>
            <p className="eyebrow mb-6">§ support us</p>
          </Reveal>
          <h1 className="text-[clamp(2.9rem,6.4vw,6rem)] leading-[0.95]">
            <MaskLine>Back the next</MaskLine>
            <MaskLine delay={0.1}>
              <span className="serif underline decoration-[var(--signal)] decoration-[0.06em] underline-offset-[0.12em]">FOSS Forge.</span>
            </MaskLine>
          </h1>
          <Reveal delay={0.1}>
            <p className="mt-7 max-w-lg text-[1.18rem] leading-[1.6] text-[var(--ink)]/80">
              Our open source festival, run by students inside the {FORGE.fest} techfest. We welcome every kind of sponsor, and the first
              logos are already on the board.
            </p>
          </Reveal>
          <div className="mt-9 flex flex-wrap items-center gap-x-4 gap-y-4">
            <ArrowLink href="#contact" className="btn btn-ink">
              Become a sponsor
            </ArrowLink>
            <a href={BROCHURE} download className="btn btn-paper" data-brochure>
              Download the brochure
            </a>
          </div>
        </div>

        <div className="lg:col-span-6">
          <ContributionArt />
        </div>
      </div>

      <Reveal delay={0.1} className="mt-14">
        <Ticket />
      </Reveal>
    </div>
  );
}
