import { ArrowLink } from "@/components/home/arrow-link";
import { MaskLine, Reveal } from "@/components/home/motion-primitives";
import { ContributionArt } from "./contribution-art";
import { Ticket } from "./ticket";
import { BROCHURE, FORGE } from "./support-data";

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
