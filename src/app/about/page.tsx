import type { Metadata } from "next";
import { HomeShell } from "@/components/home/home-shell";
import { Footer } from "@/components/home/footer";
import { Story } from "@/components/about/story";
import { Philosophy } from "@/components/about/philosophy";
import { YearOne } from "@/components/about/year-one";
import { AboutCta } from "@/components/about/about-cta";

export const metadata: Metadata = {
  title: "About",
  description: "How the USAR FOSS Club started, what we believe about open source, and what our first year looked like.",
};

export default function AboutPage() {
  return (
    <HomeShell>
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
