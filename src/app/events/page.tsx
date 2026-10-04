import type { Metadata } from "next";
import { EVENTS_NEWEST_FIRST } from "@/data/events";
import { SITE, absoluteUrl, jsonLd, pageMetadata } from "@/data/site";
import { HomeShell } from "@/components/home/home-shell";
import { Footer } from "@/components/home/footer";
import { EventsCta, EventsList } from "@/components/events/events-list";

export const metadata: Metadata = pageMetadata({
  title: "Events",
  description:
    "Every workshop, talk and competition the USAR FOSS Club has run: Git Gud, FOSS Forge, the Open Community Chintans and more. Click any event for the full story.",
  path: "/events",
});

/** The list of events, so search engines can see every one of them from this page. */
const eventList = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Events run by the USAR FOSS Club",
  itemListElement: EVENTS_NEWEST_FIRST.map((e, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: `${e.title}: ${e.subtitle}`,
    url: absoluteUrl(`/events/${e.slug}`),
  })),
  isPartOf: { "@id": `${SITE.url}/#website` },
};

export default function EventsPage() {
  return (
    <HomeShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(eventList)} />
      <main>
        <EventsList />
        <EventsCta />
      </main>
      <Footer />
    </HomeShell>
  );
}
