import type { Metadata } from "next";
import { HomeShell } from "@/components/home/home-shell";
import { Footer } from "@/components/home/footer";
import { EventsCta, EventsList } from "@/components/events/events-list";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Every workshop, talk and competition the USAR FOSS Club has run: Git Gud, FOSS Forge, the Open Community Chintans and more. Click any event for the full story.",
};

export default function EventsPage() {
  return (
    <HomeShell>
      <main>
        <EventsList />
        <EventsCta />
      </main>
      <Footer />
    </HomeShell>
  );
}
