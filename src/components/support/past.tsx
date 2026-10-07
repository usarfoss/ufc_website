import Image from "next/image";
import Link from "next/link";
import { MaskLine, Reveal } from "@/components/home/motion-primitives";
import { SponsorLogo } from "./sponsor-logo";
import { PAST_BACKERS } from "./support-data";

/** Who has backed our earlier events, event by event, with their real logos. */
export function Past() {
  return (
    <>
      <div className="mx-auto max-w-7xl px-5 pb-16 pt-20 sm:px-8 lg:pb-20 lg:pt-24">
        <Reveal>
          <p className="eyebrow mb-5">§ 03 · who has backed us before</p>
        </Reveal>
        <h2 className="max-w-4xl text-[clamp(2rem,3.8vw,3.4rem)] leading-[1.02]">
          <MaskLine inView>
            Backers of <span className="serif">our earlier events.</span>
          </MaskLine>
        </h2>

        <ul className="mt-9 grid gap-6 md:grid-cols-3">
          {PAST_BACKERS.map((p, i) => (
            <li key={p.event}>
              <Reveal delay={i * 0.07} className="h-full">
                <div className="flex h-full flex-col rounded-2xl border-[2.5px] border-[var(--ink)]! bg-[var(--cream)] p-6 shadow-[6px_6px_0_var(--ink)]">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="code text-[0.72rem] font-bold uppercase tracking-widest text-[var(--ink)]/55">{p.when}</p>
                      <Link
                        href={p.href}
                        className="mt-1 inline-block text-[1.5rem] font-extrabold leading-tight tracking-[-0.03em] hover:underline"
                      >
                        {p.event}
                      </Link>
                    </div>
                    {p.poster && (
                      <Link href={p.href} className="shrink-0 -rotate-3" aria-label={`${p.event}, read about it`}>
                        <Image
                          src={p.poster}
                          alt="Poster of FOSS Forge 2025"
                          width={56}
                          height={79}
                          sizes="56px"
                          className="rounded-sm border-2 border-[var(--ink)]! shadow-[3px_3px_0_var(--ink)]"
                        />
                      </Link>
                    )}
                  </div>
                  <ul className="mt-6 flex flex-1 flex-wrap items-center gap-x-9 gap-y-5">
                    {p.backers.map((b) => (
                      <li key={b.name}>
                        <SponsorLogo b={b} height={46} />
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
