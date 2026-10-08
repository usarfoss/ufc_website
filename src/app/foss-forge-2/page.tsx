import { Fragment, type ReactNode } from "react";
import type { Metadata } from "next";
import { breadcrumbs, jsonLd, pageMetadata } from "@/data/site";
import { HomeShell } from "@/components/home/home-shell";
import { Footer } from "@/components/home/footer";
import { TornEdge } from "@/components/home/torn-edge";
import { ForgeHero } from "@/components/foss-forge-2/hero";
import { ForgeAbout } from "@/components/foss-forge-2/about";
import { ForgeRounds } from "@/components/foss-forge-2/rounds";
import { ForgeSchedule } from "@/components/foss-forge-2/schedule";
import { ForgeSponsors } from "@/components/foss-forge-2/sponsors";
import { ForgeEnter } from "@/components/foss-forge-2/enter";

export const metadata: Metadata = pageMetadata({
  title: "FOSS Forge 2.0, our open source festival at USAR",
  description:
    "FOSS Forge 2.0, the USAR FOSS Club's open source festival at Elysian, USAR, Delhi. Not a traditional hackathon: pick from a pool of real-world issues across three stages, from 18 to 22 October 2026. Registration closes 18 Oct.",
  path: "/foss-forge-2",
});

const schema = { "@context": "https://schema.org", ...breadcrumbs({ name: "FOSS Forge 2.0", path: "/foss-forge-2" }) };

/**
 * The page, top to bottom, with each block's colour written here and nowhere else. Where one block meets the next, the torn edge is drawn in
 * the colour of the block above, taken from this list, so the two can never disagree. The sibling of the Support us page, from the
 * participant's side: same assets, same essence, different door.
 */
const BLOCKS: { id?: string; bg: string; content: ReactNode }[] = [
  { bg: "var(--sky)", content: <ForgeHero /> },
  { id: "about", bg: "var(--paper)", content: <ForgeAbout /> },
  { id: "format", bg: "var(--signal)", content: <ForgeRounds /> },
  { bg: "var(--lilac)", content: <ForgeSchedule /> },
  { bg: "var(--butter)", content: <ForgeSponsors /> },
  { id: "enter", bg: "var(--signal)", content: <ForgeEnter /> },
];

export default function FossForge2Page() {
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
