"use client";

import Image from "next/image";
import { Badge, Polaroid } from "./scrap";
import { StickerArt, ART_SIZE, type ArtId } from "./sticker-art";
import { StickerPile, type PileItem } from "./sticker-pile";

const art = (id: ArtId, round = false): PileItem => ({
  id,
  w: ART_SIZE[id][0],
  h: ART_SIZE[id][1],
  round,
  node: <StickerArt id={id} className="die-cut size-full" />,
});

const img = (id: string, src: string, alt: string, w: number, h: number): PileItem => ({
  id,
  w,
  h,
  node: (
    <div className="die-cut relative size-full">
      <Image src={src} alt={alt} fill sizes={`${w}px`} className="object-contain" draggable={false} />
    </div>
  ),
});

/** Order matters: phones keep only the first seven. Defined at module scope so the physics world isn't rebuilt on re-render. */
const ITEMS: PileItem[] = [
  art("seal", true),
  img("tux", "/collage/tux.webp", "Tux, the Linux penguin", 118, 140),
  {
    id: "polaroid",
    w: 168,
    h: 214,
    node: (
      <Polaroid
        src="/about-images/team.jpg"
        alt="UFC members on stage at the orientation"
        caption="orientation day ✿"
        aspect="aspect-square"
        position="50% 35%"
        tone="pink"
        sizes="170px"
        className="size-full"
      />
    ),
  },
  {
    id: "welcome",
    w: 260,
    h: 52,
    node: (
      <div className="flex size-full items-center justify-center">
        <Badge tone="signal" className="!px-5 !py-2 !text-base">all branches welcome</Badge>
      </div>
    ),
  },
  art("heart"),
  art("bug"),
  img("gnu", "/collage/gnu.webp", "The GNU head", 108, 106),
  art("lgtm"),
  art("floppy"),
  art("coffee"),
  art("bubble"),
  img("oshw", "/collage/oshw.webp", "The open-source-hardware gear", 100, 105),
  art("burst"),
];

export function HeroPile() {
  return <StickerPile items={ITEMS} className="z-[6] !bottom-[4.5rem]" leftInset={0.4} wideBoost={0.8} avoidSelector="[data-pile-avoid]" />;
}
