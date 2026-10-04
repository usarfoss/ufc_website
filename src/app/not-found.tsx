import type { Metadata } from "next";
import { HomeShell } from "@/components/home/home-shell";
import { Footer } from "@/components/home/footer";
import { ArrowLink } from "@/components/home/arrow-link";
import { Pin, Tape } from "@/components/home/scrap";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

/** A 404 that helps: it says what happened and points to the pages people were most likely looking for. */
export default function NotFound() {
  return (
    <HomeShell>
      <main>
        <section className="dotgrid relative flex min-h-[80svh] items-center overflow-hidden bg-[var(--ink)] pb-20 pt-36">
          <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
            <p className="eyebrow mb-6 text-[var(--butter)]">404 — nothing here</p>
            <h1 className="max-w-4xl text-[clamp(2.6rem,7vw,6rem)] font-semibold leading-[0.95] tracking-[-0.055em]">
              This page <span className="serif text-[var(--butter)]">isn&apos;t in the repo.</span>
            </h1>
            <Pin r={-2} drag={false} className="relative mt-10 inline-block">
              <div className="paper relative px-6 pb-5 pt-8 text-[var(--ink)]">
                <Tape tone="pink" className="-top-3 left-1/2 -translate-x-1/2" rotate={-3} />
                <p className="max-w-sm text-[1.1rem] font-semibold leading-snug">
                  The link may be old, or mistyped. These are the places most people are looking for.
                </p>
              </div>
            </Pin>
            <div className="mt-10 flex flex-wrap gap-3">
              <ArrowLink href="/" className="btn btn-signal" size={15}>
                Back to the home page
              </ArrowLink>
              <ArrowLink href="/events" className="btn btn-butter" size={15}>
                See our events
              </ArrowLink>
              <ArrowLink href="/about" className="btn btn-ghost" size={15}>
                About the club
              </ArrowLink>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </HomeShell>
  );
}
