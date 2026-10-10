import { ArrowLink } from "@/components/home/arrow-link";
import { MaskLine, Reveal } from "@/components/home/motion-primitives";
import { SponsorLogo } from "@/components/support/sponsor-logo";
import type { Backer } from "@/components/support/support-data";
import { CURRENT_SPONSORS, FORGE } from "./forge-data";

/** The height that keeps a logo at most `maxWidth` wide, so a long wordmark shrinks to fit its card instead of overflowing it. */
const fit = (b: Backer, height: number, maxWidth: number) => {
  // A badge with its name beside it is as wide as the badge plus the letters, which grow with the badge.
  const widthPerHeight = b.mark ? b.w / b.h + 0.32 * b.name.length : b.w / b.h;
  return Math.min(height, Math.floor(maxWidth / widthPerHeight));
};

/** Who is backing the event, given room to breathe, with a standing invitation for the next logo. Links across to the sponsor page. */
export function ForgeSponsors() {
  return (
    <div className="mx-auto max-w-7xl px-5 pb-16 pt-20 sm:px-8 lg:pb-20 lg:pt-24">
      <Reveal>
        <p className="eyebrow mb-5">§ 04 · backed by</p>
      </Reveal>
      <h2 className="max-w-4xl text-[clamp(2rem,3.8vw,3.4rem)] leading-[1.02]">
        <MaskLine inView>
          The people making <span className="serif">it happen.</span>
        </MaskLine>
      </h2>
      <Reveal delay={0.08}>
        <p className="mt-6 max-w-2xl text-[1.12rem] leading-[1.7] text-[var(--ink)]/80">
          {FORGE.name} is put on by students and held up by its backers — many of whom bring the very challenges teams take on. These are
          the ones on the board so far.
        </p>
      </Reveal>

      <ul className="mt-9 grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3">
        {CURRENT_SPONSORS.map((s, i) => (
          <li key={s.name}>
            <Reveal delay={i * 0.08} className="h-full">
              <a
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${s.name}, opens their website`}
                style={{ background: s.tile ?? "var(--cream)" }}
                className="grid h-full min-h-[7rem] place-items-center rounded-2xl border-[2.5px] border-[var(--ink)]! p-3 shadow-[4px_4px_0_var(--ink)] transition-transform duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[7px_7px_0_var(--ink)] sm:shadow-[7px_7px_0_var(--ink)] sm:hover:shadow-[10px_10px_0_var(--ink)] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[var(--ink)] sm:min-h-[14rem] sm:p-8"
              >
                <SponsorLogo b={s} height={fit(s, 92, 250)} phoneHeight={fit(s, 52, 118)} link={false} />
              </a>
            </Reveal>
          </li>
        ))}
      </ul>

      <Reveal delay={0.12}>
        <div className="mt-8 flex flex-col items-start justify-between gap-5 rounded-2xl border-[2.5px] border-dashed border-[var(--ink)]! bg-[var(--cream)] p-6 sm:flex-row sm:items-center sm:p-8">
          <div>
            <p className="text-[1.5rem] font-extrabold leading-tight tracking-[-0.02em]">Want your logo on the board?</p>
            <p className="mt-1 font-semibold text-[var(--ink)]/70">Every kind of support is welcome — tiers start at $150.</p>
          </div>
          <ArrowLink href="/support-us" className="btn btn-ink shrink-0">
            Become a sponsor
          </ArrowLink>
        </div>
      </Reveal>
    </div>
  );
}
