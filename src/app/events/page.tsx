"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Calendar, ExternalLink, ArrowRight, ChevronDown, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import PageTransition from "../Components/page-transition"
import { GitGudSVG } from "../../components/event-svgs/GitGudSVG"
import Image from "next/image"

const events = [
  {
    id: 0,
    number: "00",
    title: "Genesis",
    subtitle: "Orientation & Founding",
    displayDate: "9 Aug 2024",
    category: "Orientation",
    accent: "from-emerald-500/20 to-green-500/5",
    dotColor: "bg-emerald-400 border-emerald-400/60 shadow-emerald-400/40",
    labelColor: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    description:
      "Where it all started. The founding orientation of UFC — introducing the club, its vision, and the community we set out to build.",
    tags: ["Founding", "Orientation", "Community"],
    bg: "genesis",
    registrationUrl: null,
    detail: "The first gathering of UFC — a room full of curious builders, a whiteboard full of ideas, and the beginning of something real. Genesis set the tone: this club is for people who want to build, not just learn about building.",
  },
  {
    id: 1,
    number: "01",
    title: "Git Gud",
    subtitle: "Introduction to Open Source",
    displayDate: "10 Sept 2024",
    category: "Workshop",
    accent: "from-green-500/20 to-green-500/5",
    dotColor: "bg-green-400 border-green-400/60 shadow-green-400/40",
    labelColor: "text-green-300 border-green-500/30 bg-green-500/10",
    description:
      "Hands-on workshop covering Git, GitHub, and open source contribution. Live demos, first PRs, and a deep dive into collaborative development culture.",
    tags: ["Git", "GitHub", "Open Source", "Version Control"],
    bg: "gitgud",
    registrationUrl: "https://docs.google.com/forms/d/e/1FAIpQLSf01qxq5oOiLDGlk4RE2Z_5piLapMK_bbp8R7Ut71Elx_UfWQ/viewform",
    detail: "Git Gud walked attendees through version control from scratch — commits, branches, PRs, and the open source contribution workflow. By the end, most attendees had made their first real PR to a public repo.",
  },
  {
    id: 2,
    number: "02",
    title: "FOSS Forge 2025",
    subtitle: "Open Source Competition & Festival",
    displayDate: "15–16 Oct 2025",
    category: "Competition",
    accent: "from-cyan-500/20 to-cyan-500/5",
    dotColor: "bg-cyan-400 border-cyan-400/60 shadow-cyan-400/40",
    labelColor: "text-cyan-300 border-cyan-500/30 bg-cyan-500/10",
    description:
      "2-day flagship open-source festival during ELYSIAN 2025. Git Clash, Pokémon YAML Showdown, and Repo Sprint — live leaderboards, team battles, and real contributions.",
    tags: ["Open Source", "Competition", "Git", "Team Event"],
    bg: "fossforge",
    registrationUrl: "https://tinyurl.com/FOSS-FORGE-REGISTRATION",
    detail: "FOSS Forge ran across two full days during ELYSIAN 2025. Day 1 featured Git Clash (live PR battles on curated issues) and the Pokémon YAML Showdown (config-driven battle simulation projected live). Day 2 was the Repo Sprint — teams received base repos and had hours to ship features, polish UX, and merge clean PRs.",
  },
  {
    id: 3,
    number: "03",
    title: "Trae AI",
    subtitle: "MiniMax-Sponsored · AI Agentic Coding + Mini Hackathon",
    displayDate: "Apr 2025",
    category: "Hackathon",
    accent: "from-purple-500/20 to-purple-500/5",
    dotColor: "bg-purple-400 border-purple-400/60 shadow-purple-400/40",
    labelColor: "text-purple-300 border-purple-500/30 bg-purple-500/10",
    description:
      "Sponsored by MiniMax — an agentic AI coding session paired with a mini hackathon. Builders explored AI-assisted development workflows and shipped projects in a single session.",
    tags: ["AI", "Agentic Coding", "Hackathon", "MiniMax", "Trae"],
    bg: "trae",
    registrationUrl: null,
    detail: "Trae AI brought in MiniMax as a sponsor for a session on agentic coding — using AI not just as a copilot but as an autonomous agent in your dev workflow. The session ended with a mini hackathon where teams built and demoed AI-assisted projects in a few hours.",
  },
]

function EventVisual({ bg }: { bg: string }) {
  if (bg === "gitgud") return <GitGudSVG />
  if (bg === "fossforge") return <Image src="/foss-forge-2025.jpg" alt="FOSS Forge" fill className="object-cover" />
  return null
}

const chintans = [
  {
    episode: "01",
    title: "Threat Modeling & Precogly",
    speaker: "Vikramaditya Narayan",
    speakerBio: "Creator of Precogly — an open-source, enterprise-grade threat modeling platform built for compliance-aware security teams. Previously designed the prototype for a YC-funded AI governance platform. Leads the Bangalore chapter of Threat Modeling Connect, has spoken at ThreatModCon DC on emergent risks in multi-agentic systems. Holds an MS from Carnegie Mellon and is a Certified Threat Modeling Professional.",
    topic: "An intro to open threat modeling, followed by a deep dive into Precogly — what it is, why it was built, how it works, and how to contribute. Beginner-friendly with room to go deep.",
    date: "29 Apr 2025 · 6 PM",
    links: [{ label: "Precogly on GitHub", url: "https://github.com/precogly/precogly" }],
    flyer: "/event-images/OCC1.png",
  },
  {
    episode: "02",
    title: "Open Source, GSoC & Remote Work from a Tier 3 College",
    speaker: "Jigyasu Rajput",
    speakerBio: "3rd year engineering student from a Tier 3 college in Ghaziabad. Works remotely at a Japanese AI company, did GSoC at Python Software Foundation, and is an open source mentor at Newton School. Also part of Super 30 by Harkirat Singh. Documenting the entire journey so others don't have to figure it out alone.",
    topic: "For every college student in India who wants a remote tech job, open source, GSoC, or just wants to escape the placement rat race — this one's for you.",
    date: "6 May 2025 · 6 PM",
    links: [
      { label: "Twitter / X", url: "https://x.com/rajputwt" },
      { label: "LinkedIn", url: "https://www.linkedin.com/in/jigyasu-rajput-218657284/" },
      { label: "GitHub", url: "https://github.com/JigyasuRajput" },
    ],
    flyer: "/event-images/OCC2.png",
  },
]

export default function EventsPage() {
  const [selectedChintan, setSelectedChintan] = useState<number | null>(null)
  const active = selectedChintan !== null ? chintans[selectedChintan] : null

  return (
    <PageTransition>
      <div className="min-h-screen bg-black text-white overflow-x-hidden relative">
        <div className="fixed inset-0 bg-gradient-to-br from-black via-[#001F1D] to-black opacity-50 z-0" />
        <div className="fixed inset-0 bg-[linear-gradient(0deg,transparent_24%,rgba(11,135,79,0.08)_25%,rgba(11,135,79,0.08)_26%,transparent_27%,transparent_74%,rgba(11,135,79,0.08)_75%,rgba(11,135,79,0.08)_76%,transparent_77%,transparent),linear-gradient(90deg,transparent_24%,rgba(11,135,79,0.08)_25%,rgba(11,135,79,0.08)_26%,transparent_27%,transparent_74%,rgba(11,135,79,0.08)_75%,rgba(11,135,79,0.08)_76%,transparent_77%,transparent)] bg-[size:80px_80px] opacity-40 z-0" />

        {/* STAY IN THE LOOP — fixed left sidebar, only on xl+ */}
        <div className="hidden xl:flex fixed left-0 top-1/2 -translate-y-1/2 z-20 flex-col items-center gap-4 w-56 px-5 py-6 mx-4 rounded-2xl border border-white/10 bg-black/60 backdrop-blur-md">
          <p className="text-white text-sm font-bold uppercase tracking-widest text-center">Stay in the loop</p>
          <p className="text-gray-400 text-sm leading-relaxed text-center">
            Event details and meet links drop on WhatsApp. Updates on Instagram.
          </p>
          <div className="flex flex-col gap-2.5 w-full pt-1">
            <a
              href="https://chat.whatsapp.com/CyN8KlKDUfh8zmzp5VYGSh"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 text-sm font-medium text-emerald-300 border border-emerald-500/40 bg-emerald-500/15 px-4 py-2.5 rounded-xl hover:bg-emerald-500/25 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              WhatsApp Community
            </a>
            <a
              href="https://www.instagram.com/foss_usar/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 text-sm font-medium text-pink-300 border border-pink-500/40 bg-pink-500/15 px-4 py-2.5 rounded-xl hover:bg-pink-500/25 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              Instagram
            </a>
          </div>
        </div>

        {/* CHINTAN DETAIL — fixed right panel on xl+, bottom sheet on mobile */}
        <AnimatePresence>
          {active && (
            <>
              {/* Mobile bottom sheet */}
              <motion.div
                key={`mobile-${active.episode}`}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="xl:hidden fixed bottom-0 left-0 right-0 z-40 flex flex-col max-h-[85vh] rounded-t-2xl border-t border-violet-400/20 bg-black/98 backdrop-blur-xl overflow-hidden shadow-[0_-20px_60px_rgba(139,92,246,0.2)]"
              >
                {/* drag handle */}
                <div className="flex justify-center pt-3 pb-1 shrink-0">
                  <div className="w-10 h-1 rounded-full bg-white/20" />
                </div>
                <button
                  onClick={() => setSelectedChintan(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 border border-white/10 flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-white/70" />
                </button>
                <div className="overflow-y-auto flex-1" style={{ scrollbarWidth: "none" }}>
                  <div className="relative w-full aspect-[16/9]">
                    <Image src={active.flyer} alt={active.title} fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40" />
                  </div>
                  <div className="px-5 py-4 space-y-3">
                    <div>
                      <p className="text-white font-bold text-base leading-snug">{active.title}</p>
                      <p className="text-violet-300 text-sm mt-1">{active.speaker}</p>
                      <p className="text-violet-400/70 text-xs mt-0.5">{active.date}</p>
                    </div>
                    <p className="text-gray-200 text-sm leading-relaxed">{active.speakerBio}</p>
                    <p className="text-gray-400 text-sm leading-relaxed">{active.topic}</p>
                    <div className="flex flex-wrap gap-2 pt-1 pb-6">
                      {active.links?.map((l) => (
                        <a
                          key={l.url}
                          href={l.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-violet-300 border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 rounded-full hover:bg-violet-500/20 transition-all"
                        >
                          <ExternalLink className="w-3 h-3" />
                          {l.label}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
              {/* Mobile backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="xl:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
                onClick={() => setSelectedChintan(null)}
              />

              {/* Desktop right panel */}
              <motion.div
                key={`desktop-${active.episode}`}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="hidden xl:flex fixed right-0 top-0 bottom-0 z-30 flex-col w-[26rem] border-l border-violet-400/20 bg-black/95 backdrop-blur-xl overflow-hidden shadow-[-20px_0_60px_rgba(139,92,246,0.15)]"
              >
                <div className="relative w-full aspect-[2/3] shrink-0">
                  <Image src={active.flyer} alt={active.title} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20" />
                  <button
                    onClick={() => setSelectedChintan(null)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 border border-white/10 flex items-center justify-center hover:bg-black/80 transition-all"
                  >
                    <X className="w-4 h-4 text-white/70" />
                  </button>
                </div>
                <div className="overflow-y-auto px-5 py-4 space-y-3 flex-1" style={{ scrollbarWidth: "none" }}>
                  <div>
                    <p className="text-white font-bold text-lg leading-snug">{active.title}</p>
                    <p className="text-violet-300 text-sm mt-1">{active.speaker}</p>
                    <p className="text-violet-400/70 text-xs mt-0.5">{active.date}</p>
                  </div>
                  <p className="text-gray-200 text-sm leading-relaxed">{active.speakerBio}</p>
                  <p className="text-gray-400 text-sm leading-relaxed">{active.topic}</p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {active.links?.map((l) => (
                      <a
                        key={l.url}
                        href={l.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-violet-300 border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 rounded-full hover:bg-violet-500/20 transition-all"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {l.label}
                      </a>
                    ))}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <section className="pt-28 pb-24 px-6 relative z-10">
          <div className="max-w-3xl mx-auto">

            {/* HEADER */}
            <motion.div
              className="text-center mb-20"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1
                className="text-5xl sm:text-6xl md:text-7xl font-black mb-4 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent tracking-wider"
                style={{ fontFamily: "var(--font-orbitron)" }}
              >
                EVENTS
              </h1>
              <p className="text-green-400/50 text-xs tracking-[0.3em] uppercase mb-8">
                A few good ones beat many forgettable ones.
              </p>

              <div className="rounded-2xl border border-green-500/20 bg-black/50 backdrop-blur-md p-6 text-left space-y-3 shadow-[0_0_40px_rgba(34,197,94,0.06)]">
                <p className="text-gray-300 text-sm leading-relaxed">
                  Offline events teach less and occupy more time. We know that. So we don't run many — just enough to keep the community alive and the bonds real. A few events a semester, done well, matter more than a packed calendar done for optics.
                </p>
                <p className="text-gray-500 text-sm leading-relaxed">
                  We don't chase sponsors to fund a tech club either. Skilled people can self-sustain — and that's what we're building toward. This club runs for those who are genuinely interested. If you're not, that's fine, but this space is built for the ones who are.
                </p>
              </div>
            </motion.div>

            {/* OPEN COMMUNITY CHINTANS — UPCOMING */}
            <ChintansSection selected={selectedChintan} onSelect={setSelectedChintan} />

            {/* TIMELINE */}
            <div className="relative mt-20">
              <div className="absolute left-[11px] top-2 bottom-0 w-px bg-gradient-to-b from-green-400/80 via-green-500/30 to-transparent" />
              <div className="space-y-12">
                {events.map((event, index) => (
                  <TimelineEvent key={event.id} event={event} index={index} />
                ))}
              </div>
              <div className="relative pl-10 pt-8">
                <div className="absolute left-[7px] top-8 w-[9px] h-[9px] rounded-full border border-green-500/30 bg-black" />
                <p className="text-green-500/30 text-xs tracking-widest uppercase">More coming</p>
              </div>
            </div>

          </div>
        </section>
      </div>
    </PageTransition>
  )
}

function TimelineEvent({ event, index }: { event: (typeof events)[0]; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const hasVisual = event.bg === "gitgud" || event.bg === "fossforge"

  return (
    <motion.div
      className="relative pl-10"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.07 }}
      viewport={{ once: true, margin: "-60px" }}
    >
      {/* Dot */}
      <div className={`absolute left-0 top-5 w-[23px] h-[23px] rounded-full border-2 ${event.dotColor} bg-black flex items-center justify-center shadow-lg`}>
        <div className={`w-[7px] h-[7px] rounded-full ${event.dotColor.split(" ")[0]}`} />
      </div>

      {/* Card */}
      <motion.div
        className="rounded-2xl border border-white/8 bg-black/70 backdrop-blur-md overflow-hidden cursor-pointer group"
        style={{ boxShadow: expanded ? "0 0 50px rgba(34,197,94,0.1), 0 0 0 1px rgba(34,197,94,0.15)" : "0 4px 24px rgba(0,0,0,0.4)" }}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Gradient top accent */}
        <div className={`h-px w-full bg-gradient-to-r ${event.accent.replace("/20", "/60").replace("/5", "/0")}`} />

        {/* Visual strip */}
        {hasVisual && (
          <div className="relative h-40 w-full overflow-hidden">
            <EventVisual bg={event.bg} />
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-black/90" />
            <div className={`absolute inset-0 bg-gradient-to-r ${event.accent} opacity-40`} />
            <span
              className="absolute bottom-4 right-5 text-[72px] leading-none font-black select-none pointer-events-none"
              style={{
                fontFamily: "var(--font-orbitron)",
                color: "transparent",
                WebkitTextStroke: "1px rgba(255,255,255,0.06)",
              }}
            >
              {event.number}
            </span>
          </div>
        )}

        <div className="p-5 md:p-6">
          {/* Meta row */}
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-white/20 text-[10px] font-mono tracking-[0.2em] uppercase">
                {event.number}
              </span>
              <span className={`px-2 py-0.5 rounded-full border text-[11px] font-medium ${event.labelColor}`}>
                {event.category}
              </span>
              <span className="px-2 py-0.5 rounded-full border border-white/8 bg-white/4 text-white/30 text-[11px]">
                completed
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-white/30 text-[11px] shrink-0">
              <Calendar className="w-3 h-3" />
              {event.displayDate}
            </div>
          </div>

          {/* Title */}
          <h2
            className="text-2xl md:text-3xl font-black text-white mb-1 group-hover:text-green-300 transition-colors duration-200"
            style={{ fontFamily: "var(--font-orbitron)" }}
          >
            {event.title}
          </h2>
          <p className="text-white/40 text-sm mb-4">{event.subtitle}</p>

          <p className="text-gray-400 text-sm leading-relaxed mb-5">{event.description}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {event.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-md text-[11px] border border-white/8 bg-white/4 text-white/40"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-white/6">
            <button
              className="flex items-center gap-1.5 text-xs text-white/30 hover:text-green-400 transition-colors"
              onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v) }}
            >
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`} />
              {expanded ? "Less" : "More"}
            </button>
            <div className="flex items-center gap-3">
              {event.registrationUrl && (
                <a
                  href={event.registrationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 text-[11px] text-green-400/70 border border-green-500/25 px-3 py-1 rounded-full hover:bg-green-500/10 hover:text-green-300 transition-all"
                >
                  <ExternalLink className="w-3 h-3" />
                  Register
                </a>
              )}
              <Link
                href={`/events/${event.id}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 text-[11px] text-white/30 hover:text-white transition-colors"
              >
                Full details <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Expanded */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className={`mx-5 md:mx-6 mb-5 rounded-xl border border-white/6 bg-gradient-to-br ${event.accent} p-4`}>
                <p className="text-gray-300 text-sm leading-relaxed">{event.detail}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}

function ChintansSection({ selected, onSelect }: { selected: number | null; onSelect: (i: number | null) => void }) {
  const [open, setOpen] = useState(true)

  return (
    <motion.div
      className="mt-20"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true, margin: "-60px" }}
    >
      <button onClick={() => setOpen((v) => !v)} className="w-full group text-left">
        <div className="rounded-2xl border border-violet-500/30 bg-black/70 backdrop-blur-md px-6 py-5 hover:border-violet-400/50 hover:bg-violet-500/5 transition-all duration-300 shadow-[0_0_30px_rgba(139,92,246,0.06)]">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded-full border border-violet-400/30 bg-violet-500/10 text-violet-300 text-[11px] tracking-widest uppercase">Series</span>
                <span className="px-2 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-[11px] tracking-widest uppercase">Upcoming</span>
                <span className="px-2 py-0.5 rounded-full border border-violet-500/20 bg-violet-500/5 text-violet-400/60 text-[11px]">Online</span>
              </div>
              <h2
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white group-hover:text-violet-300 transition-colors duration-200"
                style={{ fontFamily: "var(--font-orbitron)" }}
              >
                Open Community Chintans
              </h2>
              <p className="text-white/40 text-sm mt-1">Online talks · Real ideas · Different speakers · No gatekeeping</p>
            </div>
            <div className="ml-4 shrink-0 w-9 h-9 rounded-full border border-violet-500/30 bg-violet-500/10 flex items-center justify-center group-hover:bg-violet-500/20 transition-all duration-300">
              <ChevronDown className={`w-4 h-4 text-violet-400 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
            </div>
          </div>
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="mt-3 rounded-2xl border border-violet-500/20 bg-black/60 backdrop-blur-md p-6 space-y-4">
              <p className="text-gray-300 text-sm leading-relaxed">
                A series of online community talks — different topics, different speakers, real conversations. No polished corporate panels, just people with ideas worth sharing.
              </p>

              <div className="flex flex-col gap-3">
                {chintans.map((c, i) => (
                  <button
                    key={c.episode}
                    onClick={() => onSelect(selected === i ? null : i)}
                    className={`group/card text-left rounded-xl border overflow-hidden transition-all duration-300 cursor-pointer ${
                      selected === i
                        ? "border-violet-400/60 shadow-[0_0_32px_rgba(139,92,246,0.3)] scale-[1.01]"
                        : "border-violet-500/15 hover:border-violet-400/40 hover:shadow-[0_0_24px_rgba(139,92,246,0.15)] hover:scale-[1.01]"
                    } bg-violet-500/5`}
                  >
                    {c.flyer && (
                      <div className="relative w-full aspect-[16/9] overflow-hidden">
                        <Image
                          src={c.flyer}
                          alt={`${c.title} flyer`}
                          fill
                          className="object-cover transition-transform duration-500 group-hover/card:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70" />
                        {/* Click me hint */}
                        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${selected === i ? "opacity-0" : "opacity-0 group-hover/card:opacity-100"}`}>
                          <span className="px-3 py-1.5 rounded-full bg-violet-500/80 backdrop-blur-sm text-white text-xs font-semibold tracking-wide shadow-lg">
                            {selected === i ? "Close" : "View details →"}
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start gap-3 p-4">
                      <span
                        className="text-2xl font-black text-violet-400/50 shrink-0 leading-none group-hover/card:text-violet-400/80 transition-colors duration-200"
                        style={{ fontFamily: "var(--font-orbitron)" }}
                      >
                        {c.episode}
                      </span>
                      <div>
                        <p className="text-white font-bold text-sm group-hover/card:text-violet-200 transition-colors duration-200">{c.title}</p>
                        <p className="text-violet-300 text-xs mt-0.5">{c.speaker} · {c.date}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <p className="text-violet-400/40 text-xs tracking-widest uppercase pt-2">More episodes coming</p>

              {/* Stay in the loop — inline for mobile, hidden on xl where sidebar shows */}
              <div className="xl:hidden pt-2 border-t border-violet-500/15 space-y-2">
                <p className="text-white/50 text-xs font-semibold uppercase tracking-widest">Stay in the loop</p>
                <p className="text-gray-500 text-xs leading-relaxed">Event details and meet links drop on WhatsApp. Updates on Instagram.</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <a
                    href="https://chat.whatsapp.com/CyN8KlKDUfh8zmzp5VYGSh"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-300 border border-emerald-500/40 bg-emerald-500/15 px-3 py-1.5 rounded-full hover:bg-emerald-500/25 transition-all"
                  >
                    <ExternalLink className="w-3 h-3" />
                    WhatsApp Community
                  </a>
                  <a
                    href="https://www.instagram.com/foss_usar/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-pink-300 border border-pink-500/40 bg-pink-500/15 px-3 py-1.5 rounded-full hover:bg-pink-500/25 transition-all"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Instagram
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
