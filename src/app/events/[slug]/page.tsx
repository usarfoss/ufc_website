import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { HomeShell } from "@/components/home/home-shell";
import { Footer } from "@/components/home/footer";
import { EventDetail } from "@/components/events/event-detail";
import { EVENTS, LEGACY_IDS, getEvent } from "@/data/events";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return EVENTS.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = getEvent(slug);
  if (!event) return {};
  const title = `${event.title} | UFC Events`;
  return {
    title: event.title,
    description: event.summary,
    openGraph: { title, description: event.summary, type: "article" },
    twitter: { card: "summary_large_image", title, description: event.summary },
  };
}

export default async function EventPage({ params }: Props) {
  const { slug } = await params;
  if (LEGACY_IDS[slug]) redirect(`/events/${LEGACY_IDS[slug]}`);
  const event = getEvent(slug);
  if (!event) notFound();
  return (
    <HomeShell>
      <main>
        <EventDetail event={event} />
      </main>
      <Footer />
    </HomeShell>
  );
}
