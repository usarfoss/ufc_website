import Image from "next/image";
import type { Backer } from "./support-data";

/** A sponsor's logo at a given height. Square badges (an app icon, a community's avatar) are shown with the name beside them. */
export function SponsorLogo({ b, height = 40 }: { b: Backer; height?: number }) {
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
  if (!b.mark) return img;
  return (
    <span className="flex items-center gap-3">
      {img}
      <span className="font-extrabold leading-none tracking-[-0.02em]" style={{ fontSize: Math.round(height * 0.5) }}>
        {b.name}
      </span>
    </span>
  );
}
