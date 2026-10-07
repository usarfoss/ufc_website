import { Fragment, type ReactNode } from "react";
import type { Metadata } from "next";
import { breadcrumbs, jsonLd, pageMetadata } from "@/data/site";
import { HomeShell } from "@/components/home/home-shell";
import { Footer } from "@/components/home/footer";
import { TornEdge } from "@/components/home/torn-edge";
import { About } from "@/components/support/about";
import { Contact } from "@/components/support/contact";
import { SupportHero } from "@/components/support/hero";
import { Past } from "@/components/support/past";
import { TierPicker } from "@/components/support/tier-picker";
import { Upcoming } from "@/components/support/upcoming";

export const metadata: Metadata = pageMetadata({
  title: "Support FOSS Forge 2.0, a USAR FOSS Club event",
  description:
    "Sponsor FOSS Forge 2.0, our open source festival at Elysian, USAR, Delhi on 21 and 22 October 2026. Tiers from $150, and every kind of support is welcome.",
  path: "/support-us",
});

const schema = { "@context": "https://schema.org", ...breadcrumbs({ name: "Support us", path: "/support-us" }) };

/**
 * The page, top to bottom, with each block's colour written here and nowhere else. Where one block meets the next, the torn edge is drawn in
 * the colour of the block above, taken from this list, so the two can never disagree.
 */
const BLOCKS: { id?: string; bg: string; content: ReactNode }[] = [
  { bg: "var(--sky)", content: <SupportHero /> },
  { bg: "var(--signal)", content: <Upcoming /> },
  { bg: "var(--paper)", content: <About /> },
  { bg: "var(--lilac)", content: <Past /> },
  { bg: "var(--butter)", content: <TierPicker /> },
  { id: "contact", bg: "var(--signal)", content: <Contact /> },
];

export default function SupportPage() {
  return (
    <HomeShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(schema)} />
      <main>
        {BLOCKS.map((b, i) => (
          <Fragment key={b.id ?? i}>
            <section id={b.id} className="relative text-[var(--ink)]" style={{ background: b.bg }}>
              {i > 0 && <TornEdge color={BLOCKS[i - 1].bg} className="absolute inset-x-0 top-0 z-10 -translate-y-px" />}
              {b.content}
            </section>
          </Fragment>
        ))}
      </main>
      <Footer />
    </HomeShell>
  );
}
