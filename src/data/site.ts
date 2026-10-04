import type { Metadata } from "next";

/** Facts about the site that search engines and link previews need. One place, so the domain only ever changes here. */
export const SITE = {
  url: "https://fossclub.tech",
  name: "UFC - USAR FOSS Club",
  shortName: "UFC",
  description:
    "UFC is the USAR FOSS Club: a student open source community at the University School of Automation and Robotics, GGSIPU, Delhi. We read code, break it, fix it and give it back.",
  locale: "en_IN",
  ogImage: { url: "/og-image.jpg", width: 1200, height: 630, alt: "UFC, the USAR FOSS Club: Open Source, Open Minds" },
  sameAs: [
    "https://github.com/usarfoss",
    "https://www.instagram.com/foss_usar/",
    "https://discord.com/invite/7HrTYAUpdd",
    "https://fossunited.org/c/university-school-of-automation-and-robotics",
  ],
} as const;

/** The full address of a path on this site. */
export const absoluteUrl = (path = "/") => new URL(path, SITE.url).toString();

type PageMeta = {
  title: string;
  description: string;
  /** Where this page lives, such as "/about". Sets the canonical link and the address in link previews. */
  path: string;
  /** A picture for link previews. Falls back to the site's own. */
  image?: { url: string; alt: string; width?: number; height?: number };
  type?: "website" | "article";
  /** Keep it out of search results. */
  noindex?: boolean;
};

/**
 * Metadata for one page. The root layout's `openGraph` is replaced, not merged, when a page sets its own, so each page has to say
 * everything: its own canonical address, title, description and picture.
 */
export function pageMetadata({ title, description, path, image, type = "website", noindex }: PageMeta): Metadata {
  const picture = image ?? SITE.ogImage;
  return {
    title,
    description,
    alternates: { canonical: path },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      type,
      locale: SITE.locale,
      siteName: SITE.name,
      url: path,
      title: `${title} | ${SITE.shortName}`,
      description,
      images: [picture],
    },
    twitter: { card: "summary_large_image", title: `${title} | ${SITE.shortName}`, description, images: [picture.url] },
  };
}

/** A JSON-LD block, ready to drop into a page. */
export const jsonLd = (data: object) => ({ __html: JSON.stringify(data).replace(/</g, "\\u003c") });
