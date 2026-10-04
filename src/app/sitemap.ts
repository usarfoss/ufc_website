import type { MetadataRoute } from "next";
import { EVENTS, EVENTS_NEWEST_FIRST } from "@/data/events";
import { SITE, absoluteUrl } from "@/data/site";

/**
 * Only pages that should show up in search. Sign in, the dashboard and the archive placeholder are left out on purpose.
 * `lastModified` is the date of the newest thing on the page, not "now", so crawlers are not told that everything changed today.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const newest = new Date(EVENTS_NEWEST_FIRST[0].sort);
  return [
    { url: SITE.url, lastModified: newest, changeFrequency: "monthly", priority: 1 },
    { url: absoluteUrl("/about"), changeFrequency: "yearly", priority: 0.8 },
    { url: absoluteUrl("/events"), lastModified: newest, changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/achievements"), changeFrequency: "yearly", priority: 0.6 },
    ...EVENTS.map((e) => ({
      url: absoluteUrl(`/events/${e.slug}`),
      lastModified: new Date(e.sort),
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ];
}
