import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { HomeShell } from "@/components/home/home-shell";
import { Footer } from "@/components/home/footer";
import { EventDetail } from "@/components/events/event-detail";
import { EVENTS, LEGACY_IDS, getEvent, type EventItem } from "@/data/events";
import { SITE, absoluteUrl, breadcrumbs, jsonLd, pageMetadata } from "@/data/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return EVENTS.map((e) => ({ slug: e.slug }));
}

/** Short titles get their subtitle, so "Genesis" becomes "Genesis: Orientation and founding". Long ones stand alone. */
const seoTitle = (event: EventItem) => (event.title.length < 30 ? `${event.title}: ${event.subtitle}` : event.title);

/** The summary, plus when and where, so a short summary still fills a search result. */
const seoDescription = (event: EventItem) => {
  const where = /online/i.test(event.location) ? "online" : `at ${event.location}`;
  const full = `${event.summary} ${event.dateLabel}, ${where}.`;
  return full.length <= 165 ? full : event.summary;
};

/** A 1200x630 card made from the event's poster or photo (public/og/events). The posters themselves are too heavy for link previews. */
const cardOf = (event: EventItem) => ({
  url: `/og/events/${event.slug}.jpg`,
  width: 1200,
  height: 630,
  alt: event.image?.alt ?? `${event.title}, an event by UFC`,
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = getEvent(slug);
  if (!event) return {};
  return pageMetadata({
    title: seoTitle(event),
    description: seoDescription(event),
    path: `/events/${event.slug}`,
    image: cardOf(event),
    type: "article",
    publishedTime: event.sort,
  });
}

/** What Google needs to show this as an event, plus the breadcrumb trail. */
function eventSchema(event: EventItem) {
  const online = /online/i.test(event.location);
  const url = absoluteUrl(`/events/${event.slug}`);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Event",
        "@id": `${url}#event`,
        name: `${event.title}: ${event.subtitle}`,
        description: seoDescription(event),
        startDate: event.sort,
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: online ? "https://schema.org/OnlineEventAttendanceMode" : "https://schema.org/OfflineEventAttendanceMode",
        location: online
          ? { "@type": "VirtualLocation", url }
          : {
              "@type": "Place",
              name: event.location,
              address: { "@type": "PostalAddress", addressLocality: "Delhi", addressCountry: "IN" },
            },
        image: [absoluteUrl(cardOf(event).url)],
        isAccessibleForFree: true,
        organizer: { "@id": `${SITE.url}/#organization` },
        url,
      },
      breadcrumbs({ name: "Events", path: "/events" }, { name: event.title, path: `/events/${event.slug}` }),
    ],
  };
}

export default async function EventPage({ params }: Props) {
  const { slug } = await params;
  if (LEGACY_IDS[slug]) redirect(`/events/${LEGACY_IDS[slug]}`);
  const event = getEvent(slug);
  if (!event) notFound();
  return (
    <HomeShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(eventSchema(event))} />
      <main>
        <EventDetail event={event} />
      </main>
      <Footer />
    </HomeShell>
  );
}
