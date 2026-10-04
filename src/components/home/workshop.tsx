import { FLAGSHIP } from "@/data/flagship";
import { DOMAINS, PROJECTS } from "@/data/projects";
import { ArrowLink } from "./arrow-link";
import { BlueprintDoodles } from "./blueprint-doodles";
import { MaskLine, Reveal } from "./motion-primitives";
import { ProjectBench } from "./project-bench";
import { Pin, Scribble, Tape } from "./scrap";
import { TornEdge } from "./torn-edge";

/** The bootcamp projects that do not get a scene of their own, filed in the archive. A few of them are shown here as index cards. */
const FEATURED = new Set([...FLAGSHIP.map((p) => p.slug), "park-conscious"]);
const FILED = PROJECTS.filter((p) => !FEATURED.has(p.slug));
const CARDS = FILED.slice(0, 10);
const TILT = [-4, 3, -2, 5, -5, 2, -3, 4, -2, 3];
const TAPE = ["butter", "pink", "sky", "lilac", "signal"] as const;

/**
 * Chapter 06. The projects the community is proudest of, each one an exploded drawing that goes back together as you scroll. The projects live in src/data/flagship.ts. The whole first bootcamp (all of src/data/projects.ts) is for the archive.
 */
export function Workshop() {
  return (
    <section id="workshop" className="blueprint relative overflow-x-clip pt-28 text-[var(--cream)] sm:pt-40">
      {/* the chalkboard above, torn along the edge so the blueprint shows through */}
      <TornEdge color="var(--ink)" className="absolute inset-x-0 top-0 z-20 -translate-y-px" />
      <BlueprintDoodles />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <p className="eyebrow mb-8 text-[var(--butter)]">§ 06 — the workshop</p>
        </Reveal>
        <h2 className="text-[clamp(2.6rem,7vw,6.5rem)] font-semibold leading-[0.95] tracking-[-0.055em]">
          <MaskLine inView>What we&apos;ve built,</MaskLine>
          <MaskLine inView delay={0.1}>
            <span className="serif text-[var(--butter)]">in public.</span>
          </MaskLine>
        </h2>
        <Reveal delay={0.1}>
          <p className="mt-8 max-w-xl text-[1.12rem] leading-[1.65] text-white/80">
            These are the projects the community is proudest of. Each one starts pulled apart into its layers. Scroll to put it back
            together.
          </p>
        </Reveal>
      </div>

      <div className="relative mt-14 sm:mt-20">
        <ProjectBench projects={FLAGSHIP} />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 pb-32 pt-16 sm:px-8 sm:pb-44 sm:pt-24">
        <div className="flex flex-col items-center text-center">
          <p className="eyebrow text-[var(--butter)]">filed away, not forgotten</p>
          <h3 className="mt-4 max-w-3xl text-[clamp(2rem,5vw,4rem)] font-semibold leading-[0.98] tracking-[-0.05em]">
            And <span className="serif text-[var(--butter)]">{FILED.length} more</span> from the same batch.
          </h3>
          <p className="mt-4 max-w-lg text-[1.05rem] leading-relaxed text-white/75">
            The first Project Bootcamp produced {FILED.length + 3} projects in all. These are a few of the ones waiting in the archive.
          </p>
        </div>

        <ul className="mx-auto mt-14 flex max-w-5xl flex-wrap justify-center gap-x-4 gap-y-9 sm:gap-x-6">
          {CARDS.map((p, i) => (
            <li key={p.slug} className={i >= 6 ? "hidden sm:block" : undefined}>
              <Pin r={TILT[i]} delay={i * 0.05} hint="drag me" className="relative">
                <div className="paper relative w-[9.6rem] px-3.5 pb-4 pt-6 text-[var(--ink)] sm:w-[11.5rem] sm:px-4">
                  <Tape tone={TAPE[i % TAPE.length]} className="-top-3 left-1/2 -translate-x-1/2 !w-14" rotate={i % 2 ? 4 : -4} />
                  <p className="pixel text-[0.55rem] uppercase tracking-[0.16em] text-[var(--ink)]/55">{DOMAINS[p.domain].label}</p>
                  <p className="mt-1 text-[1.1rem] font-semibold leading-[1.05] tracking-[-0.03em] sm:text-[1.25rem]">
                    {p.label ?? p.title}
                  </p>
                  <div className="mt-3 border-t border-dashed border-[var(--ink)]/25 pt-1.5">
                    <p className="hand text-[1rem] leading-none text-[var(--ink)]/65">by {p.by.split(" ")[0]}</p>
                  </div>
                </div>
              </Pin>
            </li>
          ))}
        </ul>

        <div className="mt-14 flex flex-col items-center gap-3 sm:mt-20">
          <Scribble className="h-12 w-16 text-[var(--butter)]" dir="down" />
          <ArrowLink href="/archive" className="btn btn-butter" size={15}>
            Open the archive
          </ArrowLink>
        </div>
      </div>

      {/* the next chapter's paper, torn along its top edge */}
      <TornEdge color="#c7b3ff" flip className="pointer-events-none absolute inset-x-0 bottom-0 z-20 translate-y-px" />
    </section>
  );
}
