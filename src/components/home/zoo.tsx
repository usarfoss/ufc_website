"use client";

import { artItem, imgItem, StickerPile, type PileItem } from "./sticker-pile";
import { Polaroid, Scribble } from "./scrap";
import { MaskLine, Reveal } from "./motion-primitives";
import { Ransom } from "./ransom";

/** Phones keep the first seven, so the best-known mascots (and the club's own in-jokes) come first. */
const ITEMS: PileItem[] = [
  imgItem("tux", "/collage/tux.webp", "Tux, the Linux penguin", 112, 133),
  imgItem("wilber", "/collage/wilber.webp", "Wilber, the GIMP mascot", 132, 132),
  imgItem("oggy", "/collage/oggy.webp", "Oggy and the Cockroaches meme sticker", 150, 152, false),
  imgItem("ferris", "/collage/ferris.webp", "Ferris, the Rust crab", 150, 100),
  imgItem("sidd", "/collage/sidd.webp", "Sidd, a UFC member, sitting on steps", 140, 140),
  imgItem("gopher", "/collage/gopher.webp", "The Go gopher", 88, 120),
  imgItem("pandu", "/collage/pandu.webp", "Pandu Ranga, a chihuahua in a hoodie", 104, 148),
  imgItem("git", "/collage/git.webp", "The Git logo", 168, 70),
  imgItem("Aayush", "/collage/Aayush.webp", "Aayush Katoch, spotted travelling through dimensions", 150, 150),
  imgItem("gnu", "/collage/gnu.webp", "The GNU head", 106, 104),
  imgItem("messi-dog", "/collage/messi-dog.webp", "A dog receiving a kiss on the head", 140, 139),
  imgItem("inkscape", "/collage/inkscape.webp", "The Inkscape logo", 104, 104),
  imgItem("kicad", "/collage/kicad.webp", "The KiCad logo", 96, 96),
  imgItem("osm", "/collage/osm.webp", "The OpenStreetMap logo", 108, 108),
  {
    id: "kiki",
    w: 150,
    h: 192,
    node: (
      <Polaroid
        src="/collage/kiki.webp"
        alt="Kiki, the Krita mascot"
        caption="kiki (krita)"
        tone="lilac"
        sizes="160px"
        className="size-full"
      />
    ),
  },
  artItem("heart"),
  artItem("burst"),
];

export function Zoo() {
  return (
    <section id="zoo" className="pat-dots relative overflow-hidden bg-[#c7b3ff] pt-24 text-[var(--ink)] sm:pt-32">
      <div className="pointer-events-none relative z-10 mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <p className="eyebrow mb-8 inline-block bg-[var(--cream)] px-2 py-1 text-[var(--signal-deep)]">§ 07 — the zoo</p>
        </Reveal>
        <div className="pointer-events-none relative z-10 grid items-end gap-8 lg:grid-cols-12">
          <h2 className="text-[clamp(2.6rem,6.6vw,6.2rem)] font-semibold leading-[0.92] tracking-[-0.058em] lg:col-span-9">
            <MaskLine inView>The open-source</MaskLine>
            <span className="mt-[0.05em] block">
              <Ransom text="zoo." seed={5} delay={0.2} scale={0.9} />
            </span>
          </h2>
          <Reveal delay={0.1} className="lg:col-span-3">
            <p className="max-w-sm text-[1.05rem] leading-relaxed text-[var(--ink)]/75">
              Every project that lasts grows a mascot. Here are a few we love — they&apos;re all licensed for sharing, and they&apos;re all
              throwable.
            </p>
          </Reveal>
        </div>
      </div>

      {/* The pit: breathing room under the header. The stickers themselves live in the layer below, which covers the whole section. */}
      <div className="pointer-events-none relative z-10 mx-auto mt-6 h-[62vh] min-h-[480px] max-w-[110rem]">
        <div className="hand absolute left-[42%] top-4 hidden items-start gap-2 text-2xl text-[var(--ink)]/70 md:flex">
          <span className="max-w-[10rem] -rotate-3 leading-none">grab one. throw it. no rules.</span>
          <Scribble dir="down" className="mt-3 h-10 w-12" />
        </div>
      </div>

      {/* the floor: a dashed cut line along the bottom edge, behind the stickers that rest on it */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 border-t-4 border-dashed border-[var(--ink)]/70"
        aria-hidden="true"
      />
      {/* the physics world is the whole purple section, stacked just behind the text */}
      <StickerPile items={ITEMS} className="z-[1]" startWhenVisible sizeBoost={1.3} mobileScale={0.64} />
    </section>
  );
}
