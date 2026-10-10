import { ArrowLink } from "@/components/home/arrow-link";
import { MaskLine, Reveal } from "@/components/home/motion-primitives";
import { ContributionArt } from "@/components/support/contribution-art";
import { Ticket } from "@/components/support/ticket";
import { ELYSIAN, FORGE, REGISTER } from "./forge-data";

/** Flat sky blue, the lit-up "2.0" graph, and the whole event on one ticket beneath it. The twin of the Support us hero, from the other side. */
export function ForgeHero() {
  return (
    <div className="mx-auto max-w-7xl px-5 pb-14 pt-32 sm:px-8 sm:pt-36 lg:pb-16">
      <div className="grid items-center gap-12 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <Reveal>
            <p className="eyebrow mb-6">§ foss forge 2.0 · the flagship</p>
          </Reveal>
          <h1 className="text-[clamp(2.9rem,6.4vw,6rem)] leading-[0.95]">
            <MaskLine>Two days of</MaskLine>
            <MaskLine delay={0.1}>
              <span className="serif underline decoration-[var(--signal)] decoration-[0.06em] underline-offset-[0.12em]">open source.</span>
            </MaskLine>
          </h1>
          <Reveal delay={0.1}>
            <p className="mt-7 max-w-lg text-[1.18rem] leading-[1.6] text-[var(--ink)]/80">
              Our open source festival is back at {FORGE.venue}, inside {FORGE.fest}. Not your usual hackathon: pick from a pool of
              real-world issues, compete with others on the same challenge, and ship a contribution that can actually be used.
            </p>
          </Reveal>
          <div className="mt-9 flex flex-wrap items-center gap-x-4 gap-y-4">
            <ArrowLink href={REGISTER} className="btn btn-ink">
              Register on Unstop
            </ArrowLink>
            <ArrowLink href="#format" className="btn btn-paper">
              See the format
            </ArrowLink>
          </div>
          <Reveal delay={0.2}>
            <p className="code mt-6 text-[0.8rem] font-bold uppercase tracking-widest text-[var(--ink)]/55">
              Registration closes 18 Oct · part of {FORGE.fest}, {ELYSIAN.footfall} people
            </p>
          </Reveal>
        </div>

        <div className="lg:col-span-6">
          <ContributionArt caption="every square a commit, make a few of them yours" />
        </div>
      </div>

      <Reveal delay={0.1} className="mt-14">
        <Ticket />
      </Reveal>
    </div>
  );
}
