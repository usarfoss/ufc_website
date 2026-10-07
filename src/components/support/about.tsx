import { MaskLine, Reveal } from "@/components/home/motion-primitives";
import { Mark } from "@/components/home/scrap";
import { ELYSIAN, FORGE } from "./support-data";

/** What the event is, in plain words: the fest it sits in, and what changes from last year. Two short passages, no boxes. */
export function About() {
  return (
    <div className="mx-auto max-w-7xl px-5 pb-16 pt-16 sm:px-8 lg:pb-20 lg:pt-20">
      <Reveal>
        <p className="eyebrow mb-5 text-[var(--signal-deep)]">§ 02 · what you would be backing</p>
      </Reveal>
      <h2 className="max-w-5xl text-[clamp(2rem,3.8vw,3.4rem)] leading-[1.02]">
        <MaskLine inView>
          A festival of open source, inside <span className="serif text-[var(--signal-deep)]">a bigger one.</span>
        </MaskLine>
      </h2>

      <div className="mt-10 grid gap-x-14 gap-y-10 text-[1.12rem] leading-[1.75] text-[var(--ink)]/80 lg:grid-cols-2">
        <Reveal>
          <div className="border-l-[3px] border-[var(--ink)]! pl-6">
            <p className="code mb-2 text-[0.72rem] font-bold uppercase tracking-widest text-[var(--ink)]/55">the fest</p>
            <p>
              {FORGE.fest} is the techfest at USAR, and across its events it has drawn{" "}
              <Mark tone="var(--butter)">{ELYSIAN.footfall} people</Mark> in total. It runs everything from hackathons and design and
              robotics competitions to workshops and speaker sessions. FOSS Forge is the open source part of it.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="border-l-[3px] border-[var(--signal-deep)]! pl-6">
            <p className="code mb-2 text-[0.72rem] font-bold uppercase tracking-widest text-[var(--signal-deep)]">{FORGE.name}</p>
            <p>
              Last year was two days of teams of three taking on Git Clash, the Pokémon YAML Showdown and the Repo Sprint, with one live
              leaderboard for everyone to watch. This year we are keeping that festival feel and pushing the creativity further. We are also
              bringing in <Mark tone="var(--butter)">large organisations and non-profits</Mark>, so teams get to work on things that matter
              beyond a scoreboard.
            </p>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
