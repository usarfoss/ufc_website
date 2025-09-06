"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import Lenis from "@studio-freight/lenis"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

type Props = {
  children?: React.ReactNode
}

/**
 * Provides smooth scrolling using Lenis and syncs it with GSAP ScrollTrigger.
 * Respects prefers-reduced-motion and provides fallback for better performance.
 */
export default function SmoothScrollProvider({ children }: Props) {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches

    // Check for performance preference or low-end device
    const isLowPerformance = 
      prefersReduced || 
      (typeof navigator !== "undefined" && navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2)

    // If low performance, use native scroll with CSS smooth behavior
    if (isLowPerformance) {
      document.documentElement.style.scrollBehavior = "smooth"
      
      // Still need to update ScrollTrigger on scroll for animations
      const onScroll = () => ScrollTrigger.update()
      window.addEventListener("scroll", onScroll, { passive: true })
      
      return () => {
        window.removeEventListener("scroll", onScroll)
        document.documentElement.style.scrollBehavior = ""
      }
    }

    // Use Lenis for high-performance devices with optimized settings
    const lenis = new Lenis({
      duration: 0.6, // Faster response
      smoothWheel: true,
      easing: (t: number) => 1 - Math.pow(1 - t, 2), // Simpler, faster easing
      syncTouch: false,
      gestureOrientation: "vertical",
      wheelMultiplier: 1.4, // More responsive
      touchMultiplier: 2,
      infinite: false,
    })
    lenisRef.current = lenis

    // Optimized GSAP integration
    let ticking = false
    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(() => {
          ScrollTrigger.update()
          ticking = false
        })
        ticking = true
      }
    }
    lenis.on("scroll", onScroll)

    // Use GSAP ticker with throttling
    let lastTime = 0
    gsap.ticker.add((time) => {
      if (time - lastTime > 8) { // ~120fps max
        lenis.raf(time * 1000)
        lastTime = time
      }
    })
    gsap.ticker.lagSmoothing(0)

    // Throttled resize handler
    let resizeTimeout: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => ScrollTrigger.refresh(), 100)
    }
    window.addEventListener("resize", handleResize, { passive: true })

    return () => {
      clearTimeout(resizeTimeout)
      window.removeEventListener("resize", handleResize)
      lenis.off("scroll", onScroll)
      lenis.destroy()
      gsap.ticker.lagSmoothing(1000, 16)
    }
  }, [])

  return <>{children}</>
}
