"use client"

import { useEffect, useMemo, useRef, useState, useCallback } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

type FlowLinesProps = {
  count?: number
}

/**
 * Optimized FlowLines component with performance improvements:
 * - Throttled scroll updates
 * - Reduced calculation complexity
 * - Optimized DOM manipulations
 * - Better memory management
 */
export default function FlowLines({ count = 4 }: FlowLinesProps = { count: 4 }) {
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [docHeight, setDocHeight] = useState<number>(1000)
  const [width, setWidth] = useState<number>(1200)
  const [vh, setVh] = useState<number>(800)
  const morphST = useRef<any>(null)
  const lastUpdateTime = useRef<number>(0)
  const animationFrameId = useRef<number>(0)

  // Throttled update function to prevent excessive recalculations
  const throttledUpdate = useCallback(() => {
    const now = Date.now()
    if (now - lastUpdateTime.current < 100) return // Throttle to 10fps max
    
    lastUpdateTime.current = now
    const h = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight,
      document.documentElement.clientHeight,
    )
    setDocHeight(h)
    setWidth(window.innerWidth || 1200)
    setVh(window.innerHeight || 800)
    ScrollTrigger.refresh()
  }, [])

  // Track total document height and viewport width/height with throttling
  useEffect(() => {
    throttledUpdate()
    
    const debouncedUpdate = () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
      animationFrameId.current = requestAnimationFrame(throttledUpdate)
    }
    
    const ro = new ResizeObserver(debouncedUpdate)
    ro.observe(document.documentElement)
    window.addEventListener("resize", debouncedUpdate, { passive: true })
    window.addEventListener("load", debouncedUpdate, { passive: true })
    
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
      ro.disconnect()
      window.removeEventListener("resize", debouncedUpdate)
      window.removeEventListener("load", debouncedUpdate)
    }
  }, [throttledUpdate])

  // Optimized path computation with reduced complexity and caching
  const computePaths = useCallback((phase: number) => {
    const H = Math.max(docHeight, vh, 1000)
    const W = Math.max(width, 1200)

    // Right strip geometry (10vw)
    const stripLeft = W * 0.9
    const stripWidth = Math.max(80, W * 0.1)
    const cx = stripLeft + stripWidth / 2

    // amplitude limited to the strip
    const maxAmp = stripWidth / 2 - 6
    const baseAmp = Math.max(10, Math.min(maxAmp, stripWidth * 0.45))

    // Reduced sampling resolution for better performance
    const steps = Math.min(120, Math.max(60, Math.floor(H / 20)))
    const dy = H / steps

    const makePath = (idx: number) => {
      // Pre-calculate constants to avoid repeated calculations
      const phaseShift = (idx * Math.PI) / 3.2
      const amp = Math.min(maxAmp, baseAmp * (0.88 + 0.1 * idx))
      const freq = 0.98 + idx * 0.08
      const twist = 1.55 + idx * 0.12
      
      // Pre-calculate phase components
      const phaseComponent1 = phase + phaseShift
      const phaseComponent2 = -0.6 * phase + phaseShift * 0.7

      const points: string[] = []
      
      // Initial point
      const x0 = cx + amp * 0.68 * Math.sin(phaseComponent1) + amp * 0.34 * Math.sin(phaseComponent2)
      points.push(`M ${x0.toFixed(1)},0`)

      // Generate path points with optimized calculations
      for (let i = 1; i <= steps; i++) {
        const y = i * dy
        const t = y / H
        const tFreq = 2 * Math.PI * freq * t
        const tTwist = 2 * Math.PI * twist * t
        
        const x = cx + 
          amp * 0.68 * Math.sin(tFreq + phaseComponent1) + 
          amp * 0.34 * Math.sin(tTwist + phaseComponent2)
        
        points.push(` L ${x.toFixed(1)},${y.toFixed(1)}`)
      }
      
      return points.join('')
    }

    return Array.from({ length: count }, (_, i) => makePath(i))
  }, [docHeight, width, vh, count])

  // Initial paths (phase = 0)
  const initialPaths = useMemo(() => computePaths(0), [docHeight, width, vh, count])

  useEffect(() => {
    if (!svgRef.current) return
    
    const pathEls = svgRef.current.querySelectorAll<SVGPathElement>(".dna-line")
    if (pathEls.length === 0) return

    // Initialize path reveal animation
    pathEls.forEach((p, i) => {
      const len = p.getTotalLength()
      p.style.strokeDasharray = `${len}`
      p.style.strokeDashoffset = `${len}`
    })

    let lastScrollY = 0
    let ticking = false
    
    const updateAnimation = () => {
      const scrollY = window.scrollY
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      const scrollProgress = Math.min(1, scrollY / maxScroll)
      
      // 1) Path reveal based on scroll (first 60% of scroll)
      const revealProgress = Math.min(1, scrollProgress / 0.6)
      pathEls.forEach((p, i) => {
        const len = p.getTotalLength()
        const delay = i * 0.1 // Stagger the reveal
        const adjustedProgress = Math.max(0, Math.min(1, (revealProgress - delay) / (1 - delay)))
        p.style.strokeDashoffset = `${len * (1 - adjustedProgress)}`
      })
      
      // 2) Continuous flowing motion based on total scroll
      const phase = scrollProgress * Math.PI * 4 // 2 full rotations over entire page
      const newPaths = computePaths(phase)
      
      pathEls.forEach((p, i) => {
        if (newPaths[i]) {
          p.setAttribute("d", newPaths[i])
        }
      })
      
      lastScrollY = scrollY
      ticking = false
    }

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateAnimation)
        ticking = true
      }
    }

    // Initial update
    updateAnimation()
    
    // Listen to scroll events
    window.addEventListener("scroll", onScroll, { passive: true })
    
    return () => {
      window.removeEventListener("scroll", onScroll)
    }
  }, [computePaths])

  // Optimized pointer parallax with throttling and reduced frequency
  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return
    
    let targetX = 0, targetY = 0, curX = 0, curY = 0
    let isAnimating = false
    let lastMoveTime = 0
    
    const onMove = (e: PointerEvent) => {
      const now = Date.now()
      if (now - lastMoveTime < 32) return // Throttle to ~30fps
      lastMoveTime = now
      
      const vw = window.innerWidth
      const vhLocal = window.innerHeight
      // Reduced parallax range for better performance
      targetX = (e.clientX / vw - 0.5) * 1
      targetY = (e.clientY / vhLocal - 0.5) * 1
    }
    
    const tick = () => {
      const deltaX = targetX - curX
      const deltaY = targetY - curY
      
      // Only update if there's meaningful movement
      if (Math.abs(deltaX) > 0.01 || Math.abs(deltaY) > 0.01) {
        curX += deltaX * 0.04 // Reduced easing for smoother performance
        curY += deltaY * 0.04
        wrapper.style.transform = `translate3d(${curX.toFixed(2)}px, ${curY.toFixed(2)}px, 0)`
        isAnimating = true
        requestAnimationFrame(tick)
      } else {
        isAnimating = false
      }
    }
    
    const startAnimation = () => {
      if (!isAnimating) {
        isAnimating = true
        tick()
      }
    }
    
    window.addEventListener("pointermove", onMove, { passive: true })
    window.addEventListener("pointermove", startAnimation, { passive: true })
    
    return () => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointermove", startAnimation)
    }
  }, [])

  const H = Math.max(docHeight, vh, 1000)
  const W = Math.max(width, 1200)
  const clipX = W * 0.9
  const clipW = Math.max(80, W * 0.1)

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[2] select-none"
      style={{ height: docHeight }}
    >
      <div ref={wrapperRef} className="h-full w-full will-change-transform">
        <svg ref={svgRef} className="h-full w-full" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
          <defs>
            <clipPath id="right-10vw-clip">
              <rect x={clipX} y={0} width={clipW} height={H} />
            </clipPath>
            <filter id="glow-dna" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="5" result="blur1" />
              <feMerge>
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="neon-dna" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="35%" stopColor="#2dd4bf" />
              <stop offset="70%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>
          </defs>

          <g clipPath="url(#right-10vw-clip)">
            {initialPaths.map((d, i) => (
              <g key={i} filter="url(#glow-dna)">
                <path
                  className="dna-line"
                  d={d}
                  fill="none"
                  stroke="url(#neon-dna)"
                  strokeWidth={i === 0 ? 8 : 6}
                  opacity={i === 0 ? 0.9 : 0.75} // keep existing opacity
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            ))}
          </g>
        </svg>
      </div>
    </div>
  )
}
