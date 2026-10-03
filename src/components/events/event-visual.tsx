import Image from "next/image";
import type { EventItem } from "@/data/events";

/** The poster or photo for an event, filling a frame of the right shape. */
export function EventVisual({ event, sizes = "(min-width: 1024px) 30vw, 90vw", priority = false }: { event: EventItem; sizes?: string; priority?: boolean }) {
  const aspect = event.image?.aspect ?? "aspect-[4/3]";
  return (
    <div className={`relative w-full overflow-hidden bg-[#d9d6cb] ${aspect}`}>
      {event.image && (
        <Image
          src={event.image.src}
          alt={event.image.alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
          style={{ objectPosition: event.image.position }}
          draggable={false}
        />
      )}
    </div>
  );
}
