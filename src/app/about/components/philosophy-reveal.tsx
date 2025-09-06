"use client"

import Image from "next/image"
import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export default function PhilosophyReveal() {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!ref.current) return
    const el = ref.current
    // clip-path reveal animation
    const ctx = gsap.context(() => {
      gsap.set(el, {
        clipPath: "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)",
      })
      gsap.to(el, {
        clipPath: "polygon(0% 0%, 100% 6%, 100% 94%, 0% 100%)",
        duration: 1.6,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
          once: true,
        },
      })
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={ref} className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl ring-1 ring-emerald-500/30">
      <Image
        src="/placeholder.svg?height=900&width=1200"
        alt="Creative depiction of FOSS collaboration in neon green and teal"
        fill
        className="object-cover"
        priority
      />
      {/* subtle overlay grid */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.08)_1px,transparent_1px)] bg-[length:24px_24px] mix-blend-screen" />
    </div>
  )
}
