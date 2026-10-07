import { Mail, Phone } from "lucide-react";
import { MaskLine, Reveal } from "@/components/home/motion-primitives";
import { Badge, Pin, Tape } from "@/components/home/scrap";
import { CONTACTS, WELCOME } from "./support-data";

/** § 04: every kind of support is welcome, and who to talk to. */
export function Contact() {
  return (
    <>
      <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-20 sm:px-8 sm:pb-20 lg:pt-24">
        <Reveal>
          <p className="eyebrow mb-6">§ 05 · get in touch</p>
        </Reveal>
        <h2 className="max-w-5xl text-[clamp(2.4rem,5vw,4.6rem)] leading-[0.98]">
          <MaskLine inView>All kinds of</MaskLine>
          <MaskLine inView delay={0.1}>
            <span className="serif">support welcome.</span>
          </MaskLine>
        </h2>

        <div className="mt-10 grid gap-12">
          <Reveal>
            <p className="max-w-xl text-[1.12rem] leading-[1.7] text-[var(--ink)]/80">{WELCOME.intro}</p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {WELCOME.ways.map((w) => (
                <li
                  key={w}
                  className="code rounded-full border-2 border-[var(--ink)]! bg-[var(--cream)] px-3 py-1 text-[0.78rem] font-bold"
                >
                  {w}
                </li>
              ))}
            </ul>
            <p className="mt-6 max-w-xl text-[1.05rem] leading-[1.65] text-[var(--ink)]/80">{WELCOME.close}</p>
          </Reveal>

          <ul className="grid gap-8 md:grid-cols-3">
            {CONTACTS.map((c, i) => (
              <li key={c.email}>
                <Reveal delay={0.1 + i * 0.08} className="h-full">
                  <Pin r={[-1.6, 1.3, -1][i % 3]} drag={false} className="h-full">
                    <article className="paper relative h-full rounded-sm p-6">
                      <Tape tone={(["butter", "pink", "sky"] as const)[i % 3]} className="-top-3 left-8" rotate={[-5, 4, -3][i % 3]} />
                      <p className="code text-[0.68rem] font-bold uppercase tracking-widest text-[var(--signal-deep)]">point of contact</p>
                      <p className="mt-2 text-[1.45rem] font-extrabold leading-tight tracking-[-0.02em]">{c.name}</p>
                      <ul className="mt-5 space-y-3">
                        <li>
                          <a href={`tel:${c.phone.replace(/[^+\d]/g, "")}`} className="lnk flex items-center gap-3 font-bold">
                            <span className="grid size-8 place-items-center rounded-full border-2 border-[var(--ink)]! bg-[var(--butter)]">
                              <Phone size={14} />
                            </span>
                            {c.phone}
                          </a>
                        </li>
                        <li>
                          <a
                            href={`mailto:${c.email}`}
                            className="lnk flex items-center gap-3 text-[0.8rem] font-bold sm:text-[0.9rem] [overflow-wrap:anywhere]"
                          >
                            <span className="grid size-8 shrink-0 place-items-center rounded-full border-2 border-[var(--ink)]! bg-[var(--pink)]">
                              <Mail size={14} />
                            </span>
                            {c.email}
                          </a>
                        </li>
                      </ul>
                    </article>
                  </Pin>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>

        <Pin r={-8} className="absolute right-[5%] top-20 hidden md:block" hint="drag me">
          <Badge tone="butter" className="!text-base">
            let&apos;s talk
          </Badge>
        </Pin>
      </div>
    </>
  );
}
