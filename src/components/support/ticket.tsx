import { MapPin, PartyPopper } from "lucide-react";
import { Barcode } from "@/components/home/scrap";
import { Countdown } from "./countdown";
import { ELYSIAN, FORGE } from "./support-data";

function Label({ children }: { children: React.ReactNode }) {
  return <span className="code block text-[0.68rem] font-bold uppercase tracking-widest text-[var(--ink)]/55">{children}</span>;
}

/**
 * Everything you need to know, as the ticket you would hold: the dates, the place, and a stub with the clock on it. Shared by the Support us
 * page and the FOSS Forge 2.0 event page. `notch` is the colour of the punched holes, which should be the page's own background so the ticket
 * looks cut out of it (both pages sit on sky).
 */
export function Ticket({ notchBg = "var(--sky)" }: { notchBg?: string }) {
  const notch = "absolute z-10 size-6 rounded-full border-[2.5px] border-[var(--ink)]!";
  return (
    <div
      data-ticket
      className="relative grid rounded-2xl border-[2.5px] border-[var(--ink)]! bg-[var(--cream)] shadow-[7px_7px_0_var(--ink)] lg:grid-cols-[1.1fr_1fr_1.15fr]"
    >
      <div className="flex items-center gap-5 px-6 py-6 sm:px-8">
        <div>
          <Label>admit all · when</Label>
          <p className="mt-1 flex items-baseline gap-2">
            <span className="serif text-[clamp(3.6rem,6vw,5rem)] leading-[0.85] tracking-[-0.04em]">21–22</span>
            <span className="pixel text-[1.5rem] uppercase leading-none">Oct</span>
          </p>
          <p className="mt-2 font-bold text-[var(--ink)]/70">2026 · Wednesday and Thursday</p>
        </div>
      </div>

      <div className="grid content-center gap-5 border-t-2 border-[var(--ink)]/15! px-6 py-6 sm:px-8 lg:border-l-2 lg:border-t-0">
        <div>
          <Label>where</Label>
          <p className="mt-0.5 flex items-center gap-2 text-[1.12rem] font-extrabold leading-snug">
            <MapPin size={17} className="shrink-0" aria-hidden="true" />
            {FORGE.venue}
          </p>
        </div>
        <div>
          <Label>part of</Label>
          <p className="mt-0.5 flex items-center gap-2 text-[1.12rem] font-extrabold leading-snug">
            <PartyPopper size={17} className="shrink-0" aria-hidden="true" />
            {FORGE.fest}, {ELYSIAN.footfall} people in total
          </p>
        </div>
      </div>

      <div
        data-brochure
        className="relative border-t-2 border-dashed border-[var(--ink)]/60! px-6 py-6 sm:px-8 lg:border-l-2 lg:border-t-0"
      >
        <span className={`${notch} -left-3 -top-3`} style={{ background: notchBg }} aria-hidden="true" />
        <span
          className={`${notch} -right-3 -top-3 lg:-bottom-3 lg:left-[-0.75rem] lg:right-auto lg:top-auto`}
          style={{ background: notchBg }}
          aria-hidden="true"
        />
        <Label>doors open in</Label>
        <div className="mt-2">
          <Countdown big />
        </div>
        <Barcode bars={34} seed={3} className="mt-4 !h-7 opacity-70" />
      </div>
    </div>
  );
}
