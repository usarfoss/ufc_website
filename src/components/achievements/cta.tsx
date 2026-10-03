"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { MaskLine, Reveal } from "@/components/home/motion-primitives";
import { Badge, Pin, Sticker } from "@/components/home/scrap";
import { LINKS } from "@/components/home/data";
import { OrgLogo } from "./org-logo";
import type { Logo } from "@/data/achievements";

/** The seam between the wall and the footer: a ribbon of where everyone ended up, then the call to join. */
const ORGS: { name: string; logo?: Logo }[] = [
  { name: "Kiwix / OpenZIM", logo: "kiwix" },
  { name: "Google Summer of Code", logo: "gsoc" },
  { name: "FOSS United", logo: "fossunited" },
  { name: "OWASP", logo: "owasp" },
  { name: "DRDO", logo: "drdo" },
  { name: "Zomato", logo: "zomato" },
  { name: "Apple WWDC", logo: "apple" },
  { name: "NSUT", logo: "nsut" },
];

export function AchievementsCta() {
  // One loop is only ~1300px wide, narrower than a big monitor. The track scrolls by half its width, so each half must be wider than
  // the screen or a gap opens up after one cycle. Four copies per half covers anything up to ~5000px.
  const row = (key: string) => (
    <ul key={key} className="flex shrink-0 items-center" aria-hidden="true">
      {ORGS.map((o) => (
        <li key={o.name} className="flex items-center">
          <span className="mx-8 block">
            <OrgLogo logo={o.logo} org={o.name} height={40} />
          </span>
          <span className="pixel text-xl">✦</span>
        </li>
      ))}
    </ul>
  );
  const half = (id: string) => (
    <div key={id} className="flex shrink-0">
      {[0, 1, 2, 3].map((n) => row(`${id}${n}`))}
    </div>
  );
  return (
    <>
      <div
        className="marquee relative z-10 overflow-hidden bg-[var(--butter)] py-5 text-[var(--ink)]"
        style={{ ["--marquee-duration" as string]: "45s" }}
        role="presentation"
      >
        <p className="sr-only">Where our members have gone: {ORGS.map((o) => o.name).join(", ")}.</p>
        <div className="marquee-track">
          {half("a")}
          {half("b")}
        </div>
      </div>

      <section className="relative overflow-hidden bg-[var(--signal)] text-[var(--ink)]">
        <div className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-36">
          <Reveal>
            <p className="eyebrow mb-8">§ 01 — what&apos;s next</p>
          </Reveal>
          <h2 className="max-w-5xl text-[clamp(2.8rem,8vw,7.4rem)] leading-[0.92]">
            <MaskLine inView>The next badge</MaskLine>
            <MaskLine inView delay={0.1}>
              <span className="serif">could be yours.</span>
            </MaskLine>
          </h2>
          <Reveal delay={0.1}>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-[var(--ink)]/75">
              Every name on this wall started as a curious student at one of our sessions. Come to the next one, contribute to something and
              see where it goes. Landed something yourself? Tell us in the community chat and we&apos;ll put you up here.
            </p>
          </Reveal>
          <div className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-5">
            <Link href="/#join" className="btn btn-ink">
              Join the network
              <span className="disc">
                <ArrowUpRight size={15} strokeWidth={2.6} />
              </span>
            </Link>
            <Link href="/events" className="btn btn-paper">
              See events
              <span className="disc">
                <ArrowUpRight size={15} strokeWidth={2.6} />
              </span>
            </Link>
            <a href={LINKS.whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-butter">
              Tell us your win
              <span className="disc">
                <ArrowUpRight size={15} strokeWidth={2.6} />
              </span>
            </a>
          </div>

          <Pin r={-8} className="absolute right-[6%] top-16 hidden md:block" hint="drag me">
            <Badge tone="butter" className="!text-base">
              your turn next
            </Badge>
          </Pin>
          <Pin r={9} className="absolute bottom-10 right-[12%] hidden w-28 lg:block" hint="drag me">
            <Sticker src="/collage/tux.webp" alt="Tux, the Linux penguin" className="aspect-[607/720] w-full" sizes="120px" />
          </Pin>
        </div>
      </section>
    </>
  );
}
