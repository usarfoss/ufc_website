"use client";

import { useState } from "react";
import { Check, Minus } from "lucide-react";
import { MaskLine, Reveal } from "@/components/home/motion-primitives";
import { BENEFITS, EVERYONE, FORGE, SHORT_VALUE, TIERS, type Cell } from "./support-data";

/** How big your logo is on a surface, 0 (not there) to 3 (the biggest). Read from the benefits table, so the pictures cannot disagree with it. */
const sizeOf = (cell: Cell): 0 | 1 | 2 | 3 => (cell === false ? 0 : cell === "Small" ? 1 : cell === "Medium" ? 2 : 3);
const POSTER = BENEFITS.findIndex((b) => b.label.startsWith("Logo on posters"));
const BANNER = BENEFITS.findIndex((b) => b.label.startsWith("Logo on the stage banner"));

function Slot({ widths, size, label = "your logo" }: { widths: [number, number, number]; size: 0 | 1 | 2 | 3; label?: string }) {
  if (size === 0)
    return <span className="code text-[0.62rem] font-bold uppercase tracking-widest text-[var(--text-dim)]">not on this one</span>;
  return (
    <span
      className="code grid aspect-[3/1] min-w-0 place-items-center overflow-hidden whitespace-nowrap rounded-md border-2 border-dashed border-[var(--signal)]! bg-[rgba(46,229,143,0.1)] text-[0.45rem] font-bold uppercase tracking-wider text-[var(--signal)] transition-[width] duration-300 sm:text-[0.58rem] sm:tracking-widest"
      style={{ width: `${widths[size - 1]}%` }}
    >
      {label}
    </span>
  );
}

function Surface({ title, children, included }: { title: string; children: React.ReactNode; included: boolean }) {
  return (
    <figure>
      <div className="overflow-hidden rounded-lg border-2 border-[var(--ink)]! bg-[var(--ink)] text-[var(--text)] shadow-[4px_4px_0_var(--ink)]">
        {children}
      </div>
      <figcaption className="code mt-2 flex flex-wrap items-center gap-x-2 text-[0.6rem] font-bold uppercase tracking-wider sm:text-[0.72rem] sm:tracking-widest">
        {title}
        <span className={included ? "text-[var(--signal-deep)]" : "text-[var(--ink)]/45"}>
          {included ? "· included" : "· not included"}
        </span>
      </figcaption>
    </figure>
  );
}

function Value({ value }: { value: Cell }) {
  if (value === true) {
    return (
      <>
        <Check strokeWidth={3.2} className="mx-auto size-3.5 text-[var(--signal-deep)] sm:size-[18px]" aria-hidden="true" />
        <span className="sr-only">Included</span>
      </>
    );
  }
  if (value === false) {
    return (
      <>
        <Minus strokeWidth={2.6} className="mx-auto size-3 text-[var(--ink)]/30 sm:size-4" aria-hidden="true" />
        <span className="sr-only">Not included</span>
      </>
    );
  }
  return (
    <span className="text-[0.62rem] font-bold leading-tight sm:text-[0.88rem]">
      <span className="sm:hidden">{SHORT_VALUE[value] ?? value}</span>
      <span className="hidden sm:inline">{value}</span>
    </span>
  );
}

/** § 04: pick a tier and see it: where your logo goes, what you get, and (below) every tier side by side. */
export function TierPicker() {
  const [picked, setPicked] = useState(1);
  const tier = TIERS[picked];
  const poster = sizeOf(BENEFITS[POSTER].values[picked]);
  const banner = sizeOf(BENEFITS[BANNER].values[picked]);
  const title = tier.id === "title";

  return (
    <>
      <div className="mx-auto max-w-7xl px-5 pb-16 pt-20 sm:px-8 lg:pb-20 lg:pt-24">
        <Reveal>
          <p className="eyebrow mb-6">§ 04 · ways to back {FORGE.name}</p>
        </Reveal>
        <h2 className="max-w-4xl text-[clamp(2rem,3.8vw,3.4rem)] leading-[1.02]">
          <MaskLine inView>
            Pick a tier, <span className="serif">see what you get.</span>
          </MaskLine>
        </h2>

        <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2" data-everyone>
          <span className="code text-[0.74rem] font-bold uppercase tracking-widest">in every tier:</span>
          {EVERYONE.map((e) => (
            <span
              key={e}
              className="flex items-center gap-1.5 rounded-full border-2 border-[var(--ink)]! bg-[var(--cream)] px-2.5 py-0.5 text-[0.8rem] font-bold sm:gap-2 sm:px-3 sm:py-1 sm:text-[0.9rem]"
            >
              <Check size={14} strokeWidth={3.4} className="text-[var(--signal-deep)]" aria-hidden="true" />
              {e}
            </span>
          ))}
          <span className="font-bold">The talk grows with the tier: 5, 10, 15 and 30 minutes.</span>
        </div>

        <fieldset className="mt-8">
          <legend className="sr-only">Sponsorship tier</legend>
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {TIERS.map((t, i) => (
              <label
                key={t.id}
                className="group relative block cursor-pointer rounded-2xl border-[2.5px] border-[var(--ink)]! p-3.5 transition-all sm:p-5 duration-200 has-[:checked]:-translate-y-1 has-[:checked]:shadow-[7px_7px_0_var(--ink)] has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-4 has-[:focus-visible]:outline-[var(--ink)] [&:not(:has(:checked))]:shadow-[3px_3px_0_var(--ink)] [&:not(:has(:checked))]:hover:-translate-y-0.5"
                style={{ background: t.bg }}
              >
                <input type="radio" name="tier" value={t.id} checked={picked === i} onChange={() => setPicked(i)} className="sr-only" />
                <span className="pixel block text-[0.85rem] uppercase tracking-wide sm:text-[1rem]">{t.name}</span>
                <span className="serif mt-1.5 block text-[clamp(2rem,4vw,3.2rem)] leading-[0.9] sm:mt-2">{t.price}</span>
                <span className="mt-3 hidden text-[0.95rem] font-semibold leading-snug text-[var(--ink)]/80 sm:block">{t.line}</span>
                <span
                  className="absolute right-2.5 top-2.5 grid size-6 place-items-center sm:right-4 sm:top-4 sm:size-7 rounded-full border-2 border-[var(--ink)]! bg-[var(--cream)] opacity-0 transition-opacity group-has-[:checked]:opacity-100"
                  aria-hidden="true"
                >
                  <Check size={15} strokeWidth={3.4} />
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div
          className="mt-8 grid gap-8 rounded-2xl border-[2.5px] border-[var(--ink)]! bg-[var(--cream)] p-4 shadow-[6px_6px_0_var(--ink)] sm:mt-10 sm:gap-10 sm:p-8 sm:shadow-[8px_8px_0_var(--ink)] lg:grid-cols-12"
          aria-live="polite"
        >
          <div className="lg:col-span-7">
            <p className="code mb-5 text-[0.74rem] font-bold uppercase tracking-widest text-[var(--ink)]/55">
              where your logo goes, as {tier.name}
            </p>
            <div className="grid grid-cols-2 gap-3 sm:gap-6">
              <Surface title="our website" included>
                <div className="flex items-center gap-1.5 border-b border-[var(--line)]! bg-[var(--ink-3)] px-3 py-2">
                  <span className="size-2 rounded-full bg-[var(--text-dim)]/50" />
                  <span className="size-2 rounded-full bg-[var(--text-dim)]/50" />
                  <span className="code ml-2 truncate text-[0.6rem] text-[var(--text-dim)]">fossclub.tech/events/foss-forge-2-0</span>
                </div>
                <div className="space-y-1.5 p-2.5 sm:space-y-2 sm:p-4">
                  <span className="block h-2.5 w-2/3 rounded bg-[var(--text)]/80" />
                  <span className="block h-1.5 w-full rounded bg-[var(--text)]/15" />
                  <span className="block h-1.5 w-5/6 rounded bg-[var(--text)]/15" />
                  <div className="flex items-center gap-1.5 pt-2 sm:gap-2 sm:pt-3">
                    <span className="hidden h-5 w-12 rounded bg-[var(--text)]/15 sm:block" />
                    <span className="h-4 w-8 rounded bg-[var(--text)]/15 sm:h-5 sm:w-12" />
                    <Slot widths={[24, 24, 24]} size={1} />
                  </div>
                </div>
              </Surface>

              <Surface title="the poster" included={poster > 0}>
                <div className="mx-auto flex aspect-[4/5] max-w-[11rem] flex-col justify-between p-2.5 sm:p-4">
                  <span className="pixel text-[0.95rem] uppercase leading-tight text-[var(--signal)]">
                    FOSS
                    <br />
                    Forge 2.0
                  </span>
                  <div className="space-y-1.5">
                    {title && (
                      <span className="code block text-[0.55rem] font-bold uppercase tracking-widest text-[var(--text-dim)]">
                        presented by
                      </span>
                    )}
                    <Slot widths={[36, 56, 86]} size={poster} />
                  </div>
                </div>
              </Surface>

              <Surface title="the stage banner" included={banner > 0}>
                <div className="flex aspect-[16/9] items-center justify-between gap-2 bg-[var(--ink-3)] px-2.5 sm:aspect-[16/6] sm:gap-3 sm:px-4">
                  <span className="pixel shrink-0 text-[0.55rem] uppercase leading-tight text-[var(--signal)] sm:text-[0.8rem]">
                    FOSS Forge 2.0
                    {title && (
                      <span className="code mt-1 block text-[0.5rem] font-bold tracking-widest text-[var(--text-dim)]">presented by</span>
                    )}
                  </span>
                  <span className="flex min-w-0 flex-1 justify-end">
                    <Slot widths={[40, 58, 80]} size={banner} />
                  </span>
                </div>
              </Surface>

              <Surface
                title="a stand at the venue"
                included={BENEFITS.some((b) => b.label.startsWith("A stand") && b.values[picked] !== false)}
              >
                <div className="grid aspect-[16/9] place-items-center bg-[var(--ink-3)] p-2.5 sm:p-4">
                  {BENEFITS.some((b) => b.label.startsWith("A stand") && b.values[picked] !== false) ? (
                    <span className="code grid h-full w-4/5 place-items-center rounded-md border-2 border-dashed border-[var(--signal)]! bg-[rgba(46,229,143,0.1)] text-[0.6rem] font-bold uppercase tracking-widest text-[var(--signal)]">
                      your stand
                    </span>
                  ) : (
                    <span className="code text-[0.62rem] font-bold uppercase tracking-widest text-[var(--text-dim)]">not on this one</span>
                  )}
                </div>
              </Surface>
            </div>
          </div>

          <div className="lg:col-span-5">
            <p className="code mb-5 text-[0.74rem] font-bold uppercase tracking-widest text-[var(--ink)]/55">what {tier.name} includes</p>
            <ul className="space-y-2.5">
              {BENEFITS.map((b) => {
                const v = b.values[picked];
                return (
                  <li key={b.label} className={`flex gap-3 leading-snug ${v === false ? "text-[var(--ink)]/40" : "font-bold"}`}>
                    <span
                      className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border-2 ${v === false ? "border-[var(--ink)]/25!" : "border-[var(--ink)]! bg-[var(--signal)]"}`}
                      aria-hidden="true"
                    >
                      {v === false ? <Minus size={11} strokeWidth={3} /> : <Check size={11} strokeWidth={3.4} />}
                    </span>
                    <span>
                      {b.label}
                      {typeof v === "string" && <span className="serif ml-2 text-[var(--signal-deep)]">{v}</span>}
                      <span className="sr-only">{v === false ? ", not included" : ", included"}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <Reveal className="mt-16">
          <p className="eyebrow mb-4 text-[var(--ink)]/60">or all four side by side</p>
          <div className="overflow-hidden rounded-sm border-[2.5px] border-[var(--ink)]! bg-[var(--cream)] shadow-[5px_5px_0_var(--ink)] sm:shadow-[7px_7px_0_var(--ink)]">
            <table className="w-full table-fixed border-collapse text-left">
              <caption className="sr-only">What each sponsorship tier includes</caption>
              <colgroup>
                <col className="w-[34%] sm:w-[34%]" />
                <col />
                <col />
                <col />
                <col />
              </colgroup>
              <thead>
                <tr>
                  <th scope="col" className="border-b-[2.5px] border-[var(--ink)]! bg-[var(--cream)] p-1.5 sm:p-4">
                    <span className="code text-[0.55rem] uppercase tracking-widest sm:text-[0.8rem]">benefit</span>
                  </th>
                  {TIERS.map((t, c) => (
                    <th
                      key={t.id}
                      scope="col"
                      className={`border-b-[2.5px] border-l-2 border-[var(--ink)]! p-1.5 text-center sm:p-4 ${c === picked ? "shadow-[inset_0_-6px_0_var(--ink)]" : ""}`}
                      style={{ background: t.bg }}
                    >
                      <span className="pixel block text-[0.55rem] uppercase leading-none sm:text-[0.95rem]">
                        <span className="sm:hidden">{t.short}</span>
                        <span className="hidden sm:inline">{t.name}</span>
                      </span>
                      <span className="serif mt-1 block text-[0.78rem] leading-none sm:text-[1.5rem]">{t.price}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {BENEFITS.map((b, r) => (
                  <tr key={b.label} className={r % 2 ? "bg-[var(--ink)]/[0.035]" : ""}>
                    <th
                      scope="row"
                      className="border-t-2 border-[var(--ink)]/15! p-1.5 text-[0.66rem] font-bold leading-tight sm:p-4 sm:text-[0.95rem] sm:leading-snug"
                    >
                      <span className="sm:hidden">{b.short}</span>
                      <span className="hidden sm:inline">{b.label}</span>
                    </th>
                    {b.values.map((v, c) => (
                      <td
                        key={TIERS[c].id}
                        className={`border-l-2 border-t-2 border-[var(--ink)]/15! p-1 text-center align-middle sm:p-3 ${c === picked ? "bg-[var(--butter)]/45" : ""}`}
                      >
                        <Value value={v} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-[0.92rem] text-[var(--ink)]/60">Amounts are in US dollars.</p>
        </Reveal>
      </div>
    </>
  );
}
