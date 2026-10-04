"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence } from "framer-motion";
import { DOMAINS, MENTORS, STAGES, TIERS, type Domain, type Project, type Stage } from "@/data/projects";
import { DimensionLine } from "./blueprint-doodles";
import { ProjectArt, ProjectDialog } from "./project-dialog";
import { Tape } from "./scrap";

/** How many empty drawers wait at the bottom for the next batch. */
const EMPTY = ["Yours, maybe?", "Batch 02", "Your idea here"];

const BOLTS = ["left-3 top-3", "right-3 top-3", "bottom-3 left-3", "bottom-3 right-3"];

/**
 * A parts cabinet where every drawer is a project from the first bootcamp. The colour is the kind of project, the light is how far
 * it got, the wide drawers are the featured ones. Pull one open for the screenshot, the builder and the links.
 */
export function ProjectCabinet({ projects }: { projects: Project[] }) {
  const [domain, setDomain] = useState<Domain | null>(null);
  const [stage, setStage] = useState<Stage | null>(null);
  const [open, setOpen] = useState<number | "next" | null>(null);
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null);

  const domains = (Object.keys(DOMAINS) as Domain[]).filter((d) => projects.some((p) => p.domain === d));
  const stages = Object.keys(STAGES) as Stage[];
  const filtering = domain !== null || stage !== null;
  const matches = (p: Project) => (!domain || p.domain === domain) && (!stage || p.stage === stage);
  const shown = projects.filter(matches).length;

  const pull = (value: number | "next", el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    setOrigin({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
    setOpen(value);
  };

  return (
    <div>
      <DimensionLine label={`${projects.length} drawers, one per project`} className="mb-7" />

      <div className="mb-6 space-y-3">
        <div
          role="group"
          aria-label="Filter by kind of project"
          className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-2 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0"
        >
          <button type="button" className="chip" aria-pressed={domain === null} onClick={() => setDomain(null)}>
            Every kind <span className="count">{projects.length}</span>
          </button>
          {domains.map((d) => (
            <button key={d} type="button" className="chip" aria-pressed={domain === d} onClick={() => setDomain(domain === d ? null : d)}>
              <span className="dot" style={{ background: DOMAINS[d].color }} />
              {DOMAINS[d].label} <span className="count">{projects.filter((p) => p.domain === d).length}</span>
            </button>
          ))}
        </div>
        <div
          role="group"
          aria-label="Filter by how far it got"
          className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-2 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0"
        >
          {stages.map((s) => (
            <button key={s} type="button" className="chip" aria-pressed={stage === s} onClick={() => setStage(stage === s ? null : s)}>
              <span className={`led led-${s}`} />
              {STAGES[s].label} <span className="count">{projects.filter((p) => p.stage === s).length}</span>
            </button>
          ))}
        </div>
        <p aria-live="polite" className="code text-[0.7rem] uppercase tracking-[0.2em] text-white/60">
          {!filtering
            ? "tap a label to light up some drawers"
            : shown === 0
              ? "no drawer is both of those, try clearing a label"
              : `${shown} of ${projects.length} drawers lit up`}
        </p>
      </div>

      <div className="cabinet">
        {BOLTS.map((pos, i) => (
          <span key={pos} className={`cab-bolt ${pos}`} style={{ ["--bolt-r" as string]: `${25 + i * 50}deg` }} aria-hidden="true" />
        ))}
        <div className="pointer-events-none absolute -top-5 left-1/2 z-10 -translate-x-1/2 -rotate-1" aria-hidden="true">
          <div className="pixel relative whitespace-nowrap border-[3px] border-[var(--ink)] bg-[var(--ink)] px-5 py-1.5 text-[0.7rem] uppercase tracking-[0.18em] text-[var(--butter)] sm:text-xs">
            <Tape tone="pink" className="-left-6 top-0" rotate={-30} />
            <Tape tone="signal" className="-right-6 top-0" rotate={30} />
            project bootcamp · batch 01
          </div>
        </div>

        <ul className="cabinet-grid mt-3">
          {projects.map((p, i) => {
            const wide = p.tier === 1;
            return (
              <li
                key={p.slug}
                className={wide ? "drawer-wide" : undefined}
                data-reveal="r"
                suppressHydrationWarning
                style={{ ["--rd" as string]: `${(i % 6) * 0.05}s`, ["--ry" as string]: "22px" }}
              >
                <button
                  type="button"
                  className="drawer"
                  style={{ ["--c" as string]: DOMAINS[p.domain].color }}
                  data-dim={filtering && !matches(p)}
                  onClick={(e) => pull(i, e.currentTarget)}
                  aria-label={`${p.title}. ${DOMAINS[p.domain].label}, ${STAGES[p.stage].label.toLowerCase()}. Open details.`}
                >
                  <span className="plate">
                    <span className="min-w-0 flex-1">
                      <span className="plate-title">{p.label ?? p.title}</span>
                      <span className="plate-tag">{DOMAINS[p.domain].label}</span>
                    </span>
                    {wide && (
                      <span className="peek">
                        {p.image ? (
                          <Image src={p.image.src} alt="" fill sizes="96px" className="object-cover object-top" draggable={false} />
                        ) : (
                          <ProjectArt domain={p.domain} mini />
                        )}
                      </span>
                    )}
                  </span>
                  <span className="foot">
                    <span className="tier" aria-hidden="true">
                      {p.tier ? TIERS[p.tier].mark : ""}
                    </span>
                    <span className="knob" aria-hidden="true" />
                    <span className={`led led-${p.stage}`} aria-hidden="true" />
                  </span>
                </button>
              </li>
            );
          })}
          {EMPTY.map((label) => (
            <li key={label} className="empty-cell">
              <button
                type="button"
                className="drawer drawer-empty"
                data-dim={filtering}
                onClick={(e) => pull("next", e.currentTarget)}
                aria-label="An empty drawer for batch 02. Open to hear about the next bootcamp."
              >
                <span className="plate">
                  <span className="min-w-0 flex-1">
                    <span className="plate-title">{label}</span>
                    <span className="plate-tag">empty drawer</span>
                  </span>
                </span>
                <span className="foot">
                  <span />
                  <span className="knob" aria-hidden="true" />
                  <span />
                </span>
              </button>
            </li>
          ))}
        </ul>

        {/* the title block every engineering drawing has in its corner */}
        <dl className="code mt-6 grid grid-cols-2 border-2 border-[var(--ink)] text-[0.62rem] uppercase leading-snug tracking-wider sm:grid-cols-12">
          {[
            ["Project", "UFC Project Bootcamp, batch 01", "col-span-2 sm:col-span-4"],
            ["Drawn by", `${new Set(projects.map((p) => p.github)).size} students`, "sm:col-span-2"],
            ["Checked by", MENTORS.map((m) => m.split(" ")[0]).join(", "), "sm:col-span-4"],
            ["Sheet", "01 of 01", "sm:col-span-2"],
          ].map(([k, v, span]) => (
            <div key={k} className={`border-[var(--ink)] px-3 py-2 sm:border-l-2 sm:first:border-l-0 ${span}`}>
              <dt className="text-[0.55rem] opacity-55">{k}</dt>
              <dd className="mt-0.5 font-bold">{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      <AnimatePresence>
        {open !== null && (
          <ProjectDialog projects={projects} index={open} origin={origin} onIndex={setOpen} onClose={() => setOpen(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
