"use client"

import { useEffect, useRef } from "react"

/**
 * ShortTrailCursor
 * Very short, glowy multicolor trail that vanishes quickly after movement stops.
 * - Minimal memory: tiny trail and fast idle fade.
 * - Additive blend for vivid color.
 */
export default function ShortTrailCursor() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1))
    let width = 0
    let height = 0

    const resize = () => {
      width = canvas.clientWidth
      height = canvas.clientHeight
      canvas.width = Math.floor(width * DPR)
      canvas.height = Math.floor(height * DPR)
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0)
    }

    type Point = { x: number; y: number; t: number }
    const trail: Point[] = []
    const maxPoints = 15 // slightly longer trail for better responsiveness

    let lastT = performance.now()
    let lastMoveAt = performance.now()
    let raf = 0
    let isAnimating = false
    
    const render = () => {
      const now = performance.now()
      const dt = now - lastT
      lastT = now

      const idleMs = now - lastMoveAt
      // Smooth trail: start fading after 300ms idle, gone by ~800ms
      const decay = idleMs <= 300 ? 1 : Math.max(0, 1 - (idleMs - 300) / 500)

      // Stop animation when completely faded and no trail
      if (decay === 0 && trail.length === 0) {
        isAnimating = false
        ctx.clearRect(0, 0, width, height)
        return
      }

      // Clear canvas without overlay
      ctx.globalCompositeOperation = "source-over"
      ctx.clearRect(0, 0, width, height)

      if (trail.length > 1 && decay > 0) {
        ctx.globalCompositeOperation = "source-over"
        ctx.lineCap = "round"
        ctx.lineJoin = "round"

        // White trail with improved responsiveness
        const layers = [
          { width: 6, alpha: 0.4 },
          { width: 4, alpha: 0.6 },
          { width: 2, alpha: 0.8 },
        ]

        layers.forEach((layer, li) => {
          ctx.lineWidth = layer.width
          for (let i = 1; i < trail.length; i++) {
            const p0 = trail[i - 1]
            const p1 = trail[i]
            const t = i / (trail.length - 1)
            const a = layer.alpha * (0.4 + 0.6 * t) * decay
            ctx.strokeStyle = `rgba(255, 255, 255, ${a})`
            ctx.beginPath()
            ctx.moveTo(p0.x, p0.y)
            ctx.lineTo(p1.x, p1.y)
            ctx.stroke()
          }
        })

        // Bright white head
        const head = trail[trail.length - 1]
        ctx.beginPath()
        ctx.fillStyle = `rgba(255, 255, 255, ${0.9 * decay})`
        ctx.arc(head.x, head.y, 3, 0, Math.PI * 2)
        ctx.fill()
      }

      if (decay === 0) {
        ctx.clearRect(0, 0, width, height)
        trail.length = 0
      }

      if (isAnimating) {
        raf = requestAnimationFrame(render)
      }
    }
    
    const startAnimation = () => {
      if (!isAnimating) {
        isAnimating = true
        render()
      }
    }

    const onMove = (e: PointerEvent) => {
      lastMoveAt = performance.now()
      trail.push({ x: e.clientX, y: e.clientY, t: lastMoveAt })
      while (trail.length > maxPoints) trail.shift()
      startAnimation() // Start animation when mouse moves
    }

    resize()
    window.addEventListener("resize", resize)
    window.addEventListener("pointermove", onMove, { passive: true })
    render()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", resize)
      window.removeEventListener("pointermove", onMove)
    }
  }, [])

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-[100] h-full w-full" aria-hidden="true" />
}
