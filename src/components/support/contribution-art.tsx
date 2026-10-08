/**
 * The art is a contribution graph, the kind that fills up on a GitHub profile, with the squares that spell "2.0" lit up. It is plain markup
 * and CSS (no canvas, no images): each square is a cell of a grid, and the lit ones pop in one column after another. Shared by the Support us
 * page and the FOSS Forge 2.0 event page, so the "2.0" is drawn once and never drifts between them.
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

export function ContributionArt({ caption = "every square a commit, yours could be next" }: { caption?: string }) {
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
        <span>{caption}</span>
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
