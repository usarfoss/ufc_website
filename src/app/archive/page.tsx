import type { Metadata } from "next";
import { pageMetadata } from "@/data/site";
import { HomeShell } from "@/components/home/home-shell";
import { Footer } from "@/components/home/footer";
import { ArrowLink } from "@/components/home/arrow-link";
import { MaskLine, Reveal } from "@/components/home/motion-primitives";
import { Pin, Tape } from "@/components/home/scrap";

export const metadata: Metadata = pageMetadata({
  title: "Archive",
  description: "Everything the USAR FOSS Club has run, built and shipped, kept in one place. Coming soon.",
  path: "/archive",
  noindex: true,
});

/** A holding page for now: the nav points here, and the real archive is designed next. */
export default function ArchivePage() {
  return (
    <HomeShell>
      <main>
        <section className="dotgrid relative flex min-h-[80svh] items-center overflow-hidden bg-[var(--ink)] pb-20 pt-36">
          <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
            <Reveal>
              <p className="eyebrow mb-8 text-[var(--signal)]">§ archive</p>
            </Reveal>
            <h1 className="text-[clamp(3rem,10vw,8rem)] font-semibold leading-[0.92] tracking-[-0.05em]">
              <MaskLine>The archive,</MaskLine>
              <MaskLine delay={0.1}>
                <span className="serif text-[var(--butter)]">coming soon.</span>
              </MaskLine>
            </h1>
            <Reveal delay={0.2}>
              <p className="mt-8 max-w-xl text-lg leading-relaxed text-[var(--text-dim)]">
                Every event, talk, project and photo we have kept, all in one place. We are still putting the boxes in order.
              </p>
            </Reveal>
            <Pin r={-2} drag={false} className="mt-12 inline-block">
              <div className="paper relative px-6 py-5">
                <Tape tone="pink" className="-top-3 left-1/2 -translate-x-1/2" rotate={-3} />
                <p className="hand text-[1.7rem] leading-none">in the meantime, the events page has the good stuff.</p>
              </div>
            </Pin>
            <div className="mt-10 flex flex-wrap gap-4">
              <ArrowLink href="/events" className="btn btn-signal">
                See our events
              </ArrowLink>
              <ArrowLink href="/" className="btn btn-ghost">
                Back to the start
              </ArrowLink>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </HomeShell>
  );
}
