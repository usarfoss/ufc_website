import type { Metadata } from "next";
import { HomeShell } from "@/components/home/home-shell";
import { Footer } from "@/components/home/footer";
import { Wall } from "@/components/achievements/wall";
import { AchievementsCta } from "@/components/achievements/cta";

export const metadata: Metadata = {
  title: "Achievements",
  description: "What members of the USAR FOSS Club have gone on to do: Google Summer of Code, internships at FOSS United and Zomato, research at DRDO and NSUT, and a WWDC scholarship.",
};

export default function AchievementsPage() {
  return (
    <HomeShell>
      <main>
        <Wall />
        <AchievementsCta />
      </main>
      <Footer />
    </HomeShell>
  );
}
