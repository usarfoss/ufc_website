import { Check } from "lucide-react";
import { MaskLine, Reveal } from "@/components/home/motion-primitives";
import { KEY_DATES, TIMELINE, WHO } from "./forge-data";

/** Stages and timelines: the three stages with their exact windows, the dates nobody should miss, and what to walk in with. */
export function ForgeSchedule() {
  return (
    <div className="mx-auto max-w-7xl px-5 pb-16 pt-20 sm:px-8 lg:pb-20 lg:pt-24">
      <Reveal>
        <p className="eyebrow mb-5">§ 03 · stages and timelines</p>
      </Reveal>
      <h2 className="max-w-4xl text-[clamp(2rem,3.8vw,3.4rem)] leading-[1.02]">
        <MaskLine inView>
          Mark your <span className="serif">calendar.</span>
        </MaskLine>
      </h2>

      <div className="mt-10 grid gap-6 lg:grid-cols-12">
        {/* The three stages, as a timeline down the page */}
        <Reveal className="lg:col-span-7">
          <ol className="rounded-2xl border-[2.5px] border-[var(--ink)]! bg-[var(--cream)] p-6 shadow-[6px_6px_0_var(--ink)] sm:p-8">
            {TIMELINE.map((t) => (
              <li
                key={t.n}
                className="flex items-baseline gap-4 border-t-2 border-[var(--ink)]/12! py-4 first:border-t-0 first:pt-0 last:pb-0 sm:gap-5"
              >
                <span className="serif shrink-0 text-[2rem] leading-none text-[var(--signal-deep)] sm:text-[2.4rem]">{t.n}</span>
                <div>
                  <p className="text-[1.2rem] font-extrabold leading-tight tracking-[-0.02em] sm:text-[1.4rem]">{t.name}</p>
                  <p className="code mt-1 text-[0.8rem] font-bold uppercase tracking-widest text-[var(--ink)]/55">{t.window}</p>
                </div>
              </li>
            ))}
          </ol>
        </Reveal>

        {/* Key dates and deadlines */}
        <Reveal delay={0.08} className="lg:col-span-5">
          <div className="h-full rounded-2xl border-[2.5px] border-[var(--ink)]! bg-[var(--ink)] p-6 text-[var(--text)] shadow-[6px_6px_0_var(--ink)] sm:p-8">
            <p className="code mb-5 text-[0.72rem] font-bold uppercase tracking-widest text-[var(--text-dim)]">key dates</p>
            <ul className="space-y-4">
              {KEY_DATES.map((d) => (
                <li key={d.label} className="flex items-center gap-4">
                  <span
                    className={`grid size-12 shrink-0 place-items-center rounded-xl border-2 text-center leading-none ${d.urgent ? "border-[var(--signal)]! bg-[var(--signal)] text-[var(--ink)]" : "border-[var(--line)]! bg-[var(--ink-3)]"}`}
                  >
                    <span className="pixel text-[0.95rem]">{d.date.split(" ")[0]}</span>
                    <span className="code text-[0.5rem] font-bold uppercase tracking-widest opacity-70">{d.date.split(" ")[1]}</span>
                  </span>
                  <div>
                    <p className="font-extrabold leading-tight">{d.label}</p>
                    <p className="code text-[0.78rem] font-bold text-[var(--text-dim)]">{d.when}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>

      <Reveal delay={0.1}>
        <div className="mt-6 grid gap-6 rounded-2xl border-[2.5px] border-[var(--ink)]! bg-[var(--cream)] p-6 shadow-[6px_6px_0_var(--ink)] sm:p-8 lg:grid-cols-2">
          <div>
            <p className="code mb-3 text-[0.72rem] font-bold uppercase tracking-widest text-[var(--ink)]/55">who it is for</p>
            <p className="text-[1.3rem] font-extrabold leading-tight tracking-[-0.02em]">{WHO.lead}</p>
            <p className="mt-3 text-[1.05rem] leading-[1.65] text-[var(--ink)]/80">{WHO.level}</p>
          </div>
          <div>
            <p className="code mb-3 text-[0.72rem] font-bold uppercase tracking-widest text-[var(--ink)]/55">come with</p>
            <ul className="space-y-2.5">
              {WHO.bring.map((b) => (
                <li key={b} className="flex items-center gap-3 font-bold">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full border-2 border-[var(--ink)]! bg-[var(--signal)]">
                    <Check size={13} strokeWidth={3.4} aria-hidden="true" />
                  </span>
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
