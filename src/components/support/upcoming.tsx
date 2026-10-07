import { Plus } from "lucide-react";
import { MaskLine, Reveal } from "@/components/home/motion-primitives";
import { SponsorLogo } from "./sponsor-logo";
import { CURRENT_SPONSORS, FORGE } from "./support-data";

/** The sponsors of FOSS Forge 2.0, given the room they deserve, with an empty place beside them. */
export function Upcoming() {
  return (
    <>
      <div className="mx-auto max-w-7xl px-5 pb-16 pt-20 sm:px-8 lg:pb-20 lg:pt-24">
        <Reveal>
          <p className="eyebrow mb-5">§ 01 · backing {FORGE.name} right now</p>
        </Reveal>
        <h2 className="max-w-4xl text-[clamp(2rem,3.8vw,3.4rem)] leading-[1.02]">
          <MaskLine inView>
            Our sponsors for <span className="serif">this year.</span>
          </MaskLine>
        </h2>

        <ul className="mt-9 grid gap-6 md:grid-cols-3">
          {CURRENT_SPONSORS.map((s, i) => (
            <li key={s.name}>
              <Reveal delay={i * 0.08} className="h-full">
                <div className="grid h-full min-h-[14rem] place-items-center rounded-2xl border-[2.5px] border-[var(--ink)]! bg-[var(--cream)] p-8 shadow-[7px_7px_0_var(--ink)]">
                  <SponsorLogo b={s} height={92} />
                </div>
              </Reveal>
            </li>
          ))}
          <li>
            <Reveal delay={0.16} className="h-full">
              <a
                href="#contact"
                className="group grid h-full min-h-[14rem] place-items-center rounded-2xl border-[2.5px] border-dashed border-[var(--ink)]! p-8 text-center transition-colors hover:bg-[var(--butter)]"
              >
                <span>
                  <span className="mx-auto grid size-12 place-items-center rounded-full border-2 border-[var(--ink)]! bg-[var(--cream)]">
                    <Plus size={22} strokeWidth={3} aria-hidden="true" />
                  </span>
                  <span className="mt-4 block text-[1.5rem] font-extrabold leading-tight tracking-[-0.02em]">Your logo here</span>
                  <span className="mt-1 block font-semibold text-[var(--ink)]/70">Join them. Details and tiers below.</span>
                </span>
              </a>
            </Reveal>
          </li>
        </ul>
      </div>
    </>
  );
}
