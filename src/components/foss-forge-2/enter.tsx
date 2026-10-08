import { Mail, Phone } from "lucide-react";
import { ArrowLink } from "@/components/home/arrow-link";
import { MaskLine, Reveal } from "@/components/home/motion-primitives";
import { Badge, Pin, Tape } from "@/components/home/scrap";
import { CONTACTS, FAQ, FORGE, JOIN, REGISTER } from "./forge-data";

/** § 05: how to enter, the questions everyone asks, and who to talk to. The counterpart to the sponsor page's "get in touch". */
export function ForgeEnter() {
  return (
    <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-20 sm:px-8 sm:pb-20 lg:pt-24">
      <Reveal>
        <p className="eyebrow mb-6">§ 05 · enter</p>
      </Reveal>
      <h2 className="max-w-5xl text-[clamp(2.4rem,5vw,4.6rem)] leading-[0.98]">
        <MaskLine inView>Bring three.</MaskLine>
        <MaskLine inView delay={0.1}>
          <span className="serif">Enter free.</span>
        </MaskLine>
      </h2>

      <Reveal delay={0.08}>
        <div className="mt-10 flex flex-col items-start justify-between gap-6 rounded-2xl border-[2.5px] border-[var(--ink)]! bg-[var(--cream)] p-6 shadow-[7px_7px_0_var(--ink)] sm:flex-row sm:items-center sm:p-8">
          <div className="max-w-xl">
            <p className="text-[1.5rem] font-extrabold leading-tight tracking-[-0.02em]">Register your team.</p>
            <p className="mt-2 text-[1.05rem] leading-[1.65] text-[var(--ink)]/80">
              Sign-ups are on Unstop. New to all this, or short a teammate? Join the community group too — we help people team up before the
              day, so nobody misses out.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <ArrowLink href={REGISTER} className="btn btn-ink">
              Register on Unstop
            </ArrowLink>
            <ArrowLink href={JOIN} className="btn btn-paper">
              Join the community
            </ArrowLink>
          </div>
        </div>
      </Reveal>

      <div className="mt-14 grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Reveal>
            <p className="code mb-5 text-[0.74rem] font-bold uppercase tracking-widest text-[var(--ink)]/55">questions</p>
          </Reveal>
          <ul className="space-y-4">
            {FAQ.map((f, i) => (
              <li key={f.q}>
                <Reveal delay={i * 0.05}>
                  <div className="rounded-2xl border-[2.5px] border-[var(--ink)]! bg-[var(--cream)] p-5 shadow-[4px_4px_0_var(--ink)] sm:p-6">
                    <p className="text-[1.15rem] font-extrabold leading-snug tracking-[-0.01em]">{f.q}</p>
                    <p className="mt-2 leading-[1.65] text-[var(--ink)]/80">{f.a}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-5">
          <Reveal>
            <p className="code mb-5 text-[0.74rem] font-bold uppercase tracking-widest text-[var(--ink)]/55">or just ask a person</p>
          </Reveal>
          <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-1">
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
      </div>

      <Pin r={-8} className="absolute right-[5%] top-20 hidden md:block" hint="be there">
        <Badge tone="butter" className="!text-base">
          {FORGE.short}
        </Badge>
      </Pin>
    </div>
  );
}
