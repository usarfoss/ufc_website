import { MaskLine, Reveal } from "@/components/home/motion-primitives";
import { Mark } from "@/components/home/scrap";
import { ELYSIAN, FORGE } from "./forge-data";

/** What the event is, for someone deciding whether to walk in: the fest it sits in, and what two days actually feel like. */
export function ForgeAbout() {
  return (
    <div className="mx-auto max-w-7xl px-5 pb-16 pt-16 sm:px-8 lg:pb-20 lg:pt-20">
      <Reveal>
        <p className="eyebrow mb-5 text-[var(--signal-deep)]">§ 01 · what it is</p>
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
              <Mark tone="var(--butter)">{ELYSIAN.footfall} people</Mark> in total. FOSS Forge is the open source part of it: two days set
              aside for reading code, breaking it, fixing it and getting it merged, out in the open where everyone can see.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="border-l-[3px] border-[var(--signal-deep)]! pl-6">
            <p className="code mb-2 text-[0.72rem] font-bold uppercase tracking-widest text-[var(--signal-deep)]">{FORGE.name}</p>
            <p>
              This is <Mark tone="var(--butter)">not a traditional hackathon</Mark>. Instead of one problem statement for everyone, you get a
              pool of real-world challenges from open-source projects, non-profits, communities and technical partners. You choose what to
              solve, compete with others on similar challenges, and earn points, rewards and prizes for what you actually accomplish.
            </p>
          </div>
        </Reveal>
      </div>

      <Reveal delay={0.12}>
        <ul className="mt-10 flex flex-wrap gap-2">
          {ELYSIAN.features.map((f) => (
            <li key={f} className="code rounded-full border-2 border-[var(--ink)]! bg-[var(--cream)] px-3 py-1 text-[0.78rem] font-bold">
              {f}
            </li>
          ))}
        </ul>
      </Reveal>
    </div>
  );
}
