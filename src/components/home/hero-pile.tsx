"use client";

import { Badge } from "./scrap";
import { artItem, imgItem, StickerPile, type PileItem } from "./sticker-pile";

/** Order matters: phones keep only the first seven. Defined at module scope so the physics world isn't rebuilt on re-render. */
const ITEMS: PileItem[] = [
  imgItem("oggy", "/collage/oggy.webp", "Oggy and the Cockroaches meme sticker", 140, 141),
  imgItem("tux", "/collage/tux.webp", "Tux, the Linux penguin", 118, 140),
  {
    id: "welcome",
    w: 260,
    h: 52,
    node: (
      <div className="flex size-full items-center justify-center">
        <Badge tone="signal" className="!px-5 !py-2 !text-base">
          all branches welcome
        </Badge>
      </div>
    ),
  },
  artItem("heart"),
  imgItem("sidd", "/collage/sidd.webp", "Sidd, a UFC member, sitting on steps", 128, 128),
  imgItem("gnu", "/collage/gnu.webp", "The GNU head", 108, 106),
  artItem("lgtm"),
  artItem("floppy"),
  imgItem("messi-dog", "/collage/messi-dog.webp", "A dog receiving a kiss on the head", 128, 127),
  artItem("bubble"),
  imgItem("oshw", "/collage/oshw.webp", "The open-source-hardware gear", 100, 105),
  artItem("burst"),
];

export function HeroPile() {
  return (
    <StickerPile
      items={ITEMS}
      className="z-[6] !bottom-[4.5rem]"
      leftInset={0.4}
      wideBoost={0.8}
      mobileScale={0.56}
      avoidSelector="[data-pile-avoid]"
    />
  );
}
