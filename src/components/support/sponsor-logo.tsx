import Image from "next/image";
import type { CSSProperties } from "react";
import type { Backer } from "./support-data";

/**
 * A sponsor's logo at a given height, linking to their website (it opens in a new tab). Square badges (an app icon, a community's avatar)
 * are shown with the name beside them. Pass `link={false}` when something around the logo is already the link. `phoneHeight` is the height on
 * narrow screens, where two cards sit side by side, and defaults to the same as `height`.
 */
export function SponsorLogo({
  b,
  height = 40,
  phoneHeight = height,
  link = true,
}: {
  b: Backer;
  height?: number;
  phoneHeight?: number;
  link?: boolean;
}) {
  const vars = {
    "--h": `${height}px`,
    "--hp": `${phoneHeight}px`,
    "--f": `${Math.round(height * 0.5)}px`,
    "--fp": `${Math.round(phoneHeight * 0.5)}px`,
  } as CSSProperties;
  const img = (
    <Image
      src={b.src}
      alt={b.mark ? "" : `${b.name} logo`}
      width={Math.round((height * b.w) / b.h)}
      height={height}
      unoptimized={b.src.endsWith(".svg")}
      className={`h-[var(--hp)] w-auto shrink-0 object-contain sm:h-[var(--h)] ${b.src.endsWith(".jpg") ? "rounded-[22%]" : ""}`}
      draggable={false}
    />
  );
  const logo = b.mark ? (
    <span className="flex items-center gap-2 sm:gap-3" style={vars}>
      {img}
      <span
        className={`text-[length:var(--fp)] leading-none sm:text-[length:var(--f)] ${b.serif ? "font-serif font-semibold tracking-[-0.01em]" : "font-extrabold tracking-[-0.02em]"}`}
        style={{ color: b.ink }}
      >
        {b.name}
      </span>
    </span>
  ) : (
    <span className="block" style={vars}>
      {img}
    </span>
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
