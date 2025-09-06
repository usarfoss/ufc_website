"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

type Contributor = {
  id: number
  login: string
  avatar_url: string
  html_url: string
  contributions: number
}

type Props = {
  maxShown?: number // defaults to 36 (6x6 on lg)
}

/**
 * Matrix Contributors Wall: 6x6 on large screens with subtle row parallax and hover glow.
 * Adds data-fire-reactive so the fireball bursts when hovering contributor cards.
 */
export default function ContributorsWall({ maxShown = 36 }: Props = {}) {
  const [data, setData] = useState<Contributor[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [isDesktop, setIsDesktop] = useState<boolean>(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  useEffect(() => {
    let active = true
    setLoading(true)
    fetch(`/api/contributors`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load contributors")
        return r.json()
      })
      .then((json) => {
        if (!active) return
        setData((json?.contributors ?? []).slice(0, maxShown))
        setError(null)
      })
      .catch((e) => active && setError(e.message))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [maxShown])

  // chunk into rows of up to 6 for lg layout
  const rows = useMemo(() => {
    const arr = data ?? []
    const out: Contributor[][] = []
    for (let i = 0; i < arr.length; i += 6) out.push(arr.slice(i, i + 6))
    return out
  }, [data])

  useEffect(() => {
    const container = containerRef.current
    if (!container || !isDesktop || rows.length === 0) return

    const ctx = gsap.context(() => {
      const rowEls = gsap.utils.toArray<HTMLElement>("[data-contr-row]")
      gsap.fromTo(
        container.querySelector("[data-grid-root]"),
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: { trigger: container, start: "top 80%", once: true },
        },
      )

      rowEls.forEach((row, i) => {
        const from = i % 2 === 0 ? -40 : 40
        const to = -from
        gsap.fromTo(
          row,
          { x: from },
          {
            x: to,
            ease: "none",
            scrollTrigger: {
              trigger: container,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        )
      })
    }, container)

    return () => ctx.revert()
  }, [rows, isDesktop])

  const card = (c: Contributor, key: string | number) => (
    <a
      key={key}
      href={c.html_url}
      target="_blank"
      rel="noreferrer"
      data-contr-item
      data-magnetic
      className="group relative flex flex-col items-center gap-2 rounded-full border border-emerald-500/25 bg-white/[0.035] p-4 md:p-6 transition-transform duration-300 hover:scale-[1.02] hover:border-emerald-400/40"
      aria-label={`GitHub profile of ${c.login}`}
    >
      <span className="relative block h-16 w-16 md:h-20 md:w-20 overflow-hidden rounded-full ring-2 ring-emerald-400/40">
        <Image src={c.avatar_url || "/placeholder.svg"} alt={`${c.login} avatar`} fill className="object-cover" />
      </span>
      <span className="text-center">
        <span className="block truncate font-[var(--font-space-grotesk)] text-sm md:text-base text-white/90">
          {c.login}
        </span>
        <span className="block text-[10px] md:text-xs font-[var(--font-plex-mono)] text-emerald-200/70">
          {c.contributions} commits
        </span>
      </span>
      <span className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-emerald-400/0 transition-colors group-hover:ring-emerald-400/30" />
    </a>
  )

  const content = useMemo(() => {
    if (loading)
      return <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-400" />
    if (error) return <p className="text-red-400 font-[var(--font-plex-mono)]">{error}</p>
    if (!data || data.length === 0)
      return <p className="text-emerald-100/70 font-[var(--font-plex-mono)]">No contributors found.</p>

    return (
      <div data-grid-root>
        {/* Desktop: explicit rows with 6 columns each */}
        <div className="hidden lg:flex flex-col gap-5">
          {rows.map((row, ri) => (
            <div key={ri} data-contr-row className="grid grid-cols-6 gap-5">
              {row.map((c, ci) => card(c, `${ri}-${ci}`))}
            </div>
          ))}
        </div>

        {/* Mobile/Tablet: responsive grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 lg:hidden">
          {(data ?? []).map((c) => card(c, c.id))}
        </div>
      </div>
    )
  }, [data, error, loading, rows])

  return (
    <div ref={containerRef} className="mx-auto max-w-7xl px-6 md:px-12 lg:px-16">
      {content}
    </div>
  )
}
