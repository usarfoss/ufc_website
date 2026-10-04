import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { HomeShell } from "@/components/home/home-shell";
import { Footer } from "@/components/home/footer";
import { EventDetail } from "@/components/events/event-detail";
import { EVENTS, LEGACY_IDS, getEvent, type EventItem } from "@/data/events";
import { SITE, absoluteUrl, jsonLd, pageMetadata } from "@/data/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return EVENTS.map((e) => ({ slug: e.slug }));
}

/** The poster or photo, when there is one, so a shared link shows the event itself. */
const pictureOf = (event: EventItem) => (event.image ? { url: event.image.src, alt: event.image.alt } : undefined);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = getEvent(slug);
  if (!event) return {};
  return pageMetadata({
    title: `${event.title}: ${event.subtitle}`,
    description: event.summary,
    path: `/events/${event.slug}`,
    image: pictureOf(event),
    type: "article",
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
        description: event.summary,
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
        image: [absoluteUrl(event.image?.src ?? SITE.ogImage.url)],
        isAccessibleForFree: true,
        organizer: { "@id": `${SITE.url}/#organization` },
        url,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
          { "@type": "ListItem", position: 2, name: "Events", item: absoluteUrl("/events") },
          { "@type": "ListItem", position: 3, name: event.title, item: url },
        ],
      },
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
