import Image from "next/image";
import type { Backer } from "./support-data";

/**
 * A sponsor's logo at a given height, linking to their website (it opens in a new tab). Square badges (an app icon, a community's avatar)
 * are shown with the name beside them. Pass `link={false}` when something around the logo is already the link.
 */
export function SponsorLogo({ b, height = 40, link = true }: { b: Backer; height?: number; link?: boolean }) {
  const img = (
    <Image
      src={b.src}
      alt={b.mark ? "" : `${b.name} logo`}
      width={Math.round((height * b.w) / b.h)}
      height={height}
      unoptimized={b.src.endsWith(".svg")}
      className={`w-auto shrink-0 object-contain ${b.src.endsWith(".jpg") ? "rounded-[22%]" : ""}`}
      style={{ height, width: "auto" }}
      draggable={false}
    />
  );
  const logo = b.mark ? (
    <span className="flex items-center gap-3">
      {img}
      <span
        className={`leading-none ${b.serif ? "font-serif font-semibold tracking-[-0.01em]" : "font-extrabold tracking-[-0.02em]"}`}
        style={{ fontSize: Math.round(height * 0.5), color: b.ink }}
      >
        {b.name}
      </span>
    </span>
  ) : (
    img
  );
  if (!link) return logo;
  return (
    <a
      href={b.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${b.name}, opens their website`}
      className="block rounded-md transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[var(--ink)]"
    >
      {logo}
    </a>
  );
}
