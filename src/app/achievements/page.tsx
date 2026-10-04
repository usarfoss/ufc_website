import type { Metadata } from "next";
import { breadcrumbs, jsonLd, pageMetadata } from "@/data/site";
import { HomeShell } from "@/components/home/home-shell";
import { Footer } from "@/components/home/footer";
import { Wall } from "@/components/achievements/wall";
import { AchievementsCta } from "@/components/achievements/cta";

export const metadata: Metadata = pageMetadata({
  title: "Achievements of USAR FOSS Club members",
  description:
    "Where members of the USAR FOSS Club have gone: Google Summer of Code, FOSS United, Zomato, DRDO and NSUT research, OWASP and a WWDC scholarship.",
  path: "/achievements",
});

const schema = { "@context": "https://schema.org", ...breadcrumbs({ name: "Achievements", path: "/achievements" }) };

export default function AchievementsPage() {
  return (
    <HomeShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(schema)} />
      <main>
        <Wall />
        <AchievementsCta />
      </main>
      <Footer />
    </HomeShell>
  );
}
