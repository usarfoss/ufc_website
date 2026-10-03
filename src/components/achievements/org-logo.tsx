import Image from "next/image";
import type { Logo } from "@/data/achievements";

const ALT: Record<Logo, string> = {
  kiwix: "Kiwix logo",
  gsoc: "Google Summer of Code logo",
  fossunited: "FOSS United logo",
  zomato: "Zomato logo",
  apple: "Apple logo",
  nsut: "NSUT logo",
  owasp: "OWASP logo",
  drdo: "DRDO logo",
};

/** Files that were re-cut after first use get a new name, so the image optimiser cache never serves the old version. */
const FILE: Partial<Record<Logo, string>> = { nsut: "nsut-clear" };

/** Natural width / height of each file, so the logo keeps its shape. */
const RATIO: Record<Logo, number> = { kiwix: 1, gsoc: 1, fossunited: 600 / 472, zomato: 1, apple: 488 / 600, nsut: 1, owasp: 600 / 178, drdo: 1 };

/** A company logo, sitting directly on the page with a soft shadow. No box around it. */
export function OrgLogo({ logo, org, height = 64 }: { logo?: Logo; org: string; height?: number }) {
  if (!logo) return <span className="pixel text-[1.4rem] uppercase leading-none tracking-wide">{org}</span>;
  return (
    <Image
      src={`/logos/${FILE[logo] ?? logo}.webp`}
      alt={ALT[logo]}
      width={Math.round(height * RATIO[logo])}
      height={height}
      className="w-auto object-contain drop-shadow-[0_6px_6px_rgba(20,20,15,0.28)]"
      style={{ height }}
      draggable={false}
    />
  );
}
