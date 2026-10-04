import { HomeShell } from "@/components/home/home-shell";
import { Hero } from "@/components/home/hero";
import { Ribbon } from "@/components/home/ribbon";
import { Freedoms } from "@/components/home/freedoms";
import { Bazaar } from "@/components/home/bazaar";
import { BigTent } from "@/components/home/big-tent";
import { GitLog } from "@/components/home/git-log";
import { Team } from "@/components/home/team";
import { Workshop } from "@/components/home/workshop";
import { Zoo } from "@/components/home/zoo";
import { Join } from "@/components/home/join";
import { Footer } from "@/components/home/footer";

export default function Page() {
  return (
    <HomeShell>
      <main>
        <Hero />
        <Ribbon />
        <Freedoms />
        <Bazaar />
        <BigTent />
        <GitLog />
        <Team />
        <Workshop />
        <Zoo />
        <Join />
      </main>
      <Footer />
    </HomeShell>
  );
}
