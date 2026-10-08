import { MaskLine, Reveal } from "@/components/home/motion-primitives";
import { FORMAT } from "./forge-data";

/** How the event works, in three stages: the quiz that seeds the leaderboard, the issue hunt where you choose, and the finale where you build. The heart of the page for anyone deciding to enter. */
export function ForgeRounds() {
  return (
    <div className="mx-auto max-w-7xl px-5 pb-16 pt-20 sm:px-8 lg:pb-20 lg:pt-24">
      <Reveal>
        <p className="eyebrow mb-5">§ 02 · the format</p>
      </Reveal>
      <h2 className="max-w-4xl text-[clamp(2rem,3.8vw,3.4rem)] leading-[1.02]">
        <MaskLine inView>
          Three stages to a <span className="serif">real fix.</span>
        </MaskLine>
      </h2>
      <Reveal delay={0.08}>
        <p className="mt-6 max-w-2xl text-[1.12rem] leading-[1.7] text-[var(--ink)]/80">
          A quiz to seed the leaderboard, an issue hunt to choose your challenge, and a finale where you build it. Every point lands on the
          same live leaderboard.
        </p>
      </Reveal>

      <ol className="mt-10 grid gap-6 md:grid-cols-3">
        {FORMAT.map((f, i) => (
          <li key={f.name}>
            <Reveal delay={i * 0.08} className="h-full">
              <article className="flex h-full flex-col overflow-hidden rounded-2xl border-[2.5px] border-[var(--ink)]! bg-[var(--cream)] shadow-[6px_6px_0_var(--ink)]">
                <header className="border-b-[2.5px] border-[var(--ink)]! p-5 sm:p-6" style={{ background: f.tone }}>
                  <div className="flex items-center justify-between">
                    <span className="serif text-[2.6rem] leading-none">{String(i + 1).padStart(2, "0")}</span>
                    <span className="code rounded-full border-2 border-[var(--ink)]! bg-[var(--cream)] px-2.5 py-0.5 text-[0.66rem] font-bold uppercase tracking-widest">
                      {f.kicker}
                    </span>
                  </div>
                  <h3 className="mt-3 text-[1.5rem] leading-tight tracking-[-0.02em]">{f.name}</h3>
                  <p className="code mt-1 text-[0.72rem] font-bold uppercase tracking-widest text-[var(--ink)]/60">{f.tagline}</p>
                </header>

                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <p className="text-[1.05rem] leading-[1.7] text-[var(--ink)]/80">{f.body}</p>
                  <ul className="mt-6 space-y-2">
                    {f.points.map((p) => (
                      <li key={p} className="flex items-start gap-2.5 text-[0.98rem] font-semibold leading-snug">
                        <span className="mt-[0.45em] size-1.5 shrink-0 rounded-full bg-[var(--signal-deep)]" aria-hidden="true" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </Reveal>
          </li>
        ))}
      </ol>
    </div>
  );
}
