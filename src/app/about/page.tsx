import type { Metadata } from "next";
import { absoluteUrl, breadcrumbs, jsonLd, pageMetadata, SITE } from "@/data/site";
import { HomeShell } from "@/components/home/home-shell";
import { Footer } from "@/components/home/footer";
import { Story } from "@/components/about/story";
import { Philosophy } from "@/components/about/philosophy";
import { YearOne } from "@/components/about/year-one";
import { AboutCta } from "@/components/about/about-cta";

export const metadata: Metadata = pageMetadata({
  title: "About the USAR FOSS Club",
  description:
    "How the USAR FOSS Club started in 2025, what we believe about open source, and what our first year looked like: events, projects and the people behind them.",
  path: "/about",
});

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "AboutPage",
      "@id": `${absoluteUrl("/about")}#page`,
      url: absoluteUrl("/about"),
      name: "About the USAR FOSS Club",
      isPartOf: { "@id": `${SITE.url}/#website` },
      about: { "@id": `${SITE.url}/#organization` },
    },
    breadcrumbs({ name: "About", path: "/about" }),
  ],
};

export default function AboutPage() {
  return (
    <HomeShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(schema)} />
      <main>
        <Story />
        <Philosophy />
        <YearOne />
        <AboutCta />
      </main>
      <Footer />
    </HomeShell>
  );
}
