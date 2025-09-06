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
    const maxPoints = 10 // very short trail

    let lastT = performance.now()
    let lastMoveAt = performance.now()
    let raf = 0
    let isAnimating = false
    
    const render = () => {
      const now = performance.now()
      const dt = now - lastT
      lastT = now

      const idleMs = now - lastMoveAt
      // Quick vanish: start fading after 200ms idle, gone by ~450ms
      const decay = idleMs <= 200 ? 1 : Math.max(0, 1 - (idleMs - 200) / 250)

      // Stop animation when completely faded and no trail
      if (decay === 0 && trail.length === 0) {
        isAnimating = false
        ctx.clearRect(0, 0, width, height)
        return
      }

      // Faster clear when idle, otherwise keep a slight persistence
      ctx.globalCompositeOperation = "source-over"
      ctx.fillStyle = `rgba(0,0,0,${idleMs > 200 ? 0.35 : 0.12})`
      ctx.fillRect(0, 0, width, height)

      if (trail.length > 1 && decay > 0) {
        ctx.globalCompositeOperation = "lighter"
        ctx.lineCap = "round"
        ctx.lineJoin = "round"

        const layers = [
          { width: 4.5, hueShift: 0, alpha: 0.35 },
          { width: 3, hueShift: 80, alpha: 0.55 },
          { width: 1.6, hueShift: 210, alpha: 0.9 },
        ]

        layers.forEach((layer, li) => {
          ctx.lineWidth = layer.width
          for (let i = 1; i < trail.length; i++) {
            const p0 = trail[i - 1]
            const p1 = trail[i]
            const t = i / (trail.length - 1)
            const hue = (230 * t + layer.hueShift + now * 0.05) % 360
            const a = layer.alpha * (0.3 + 0.7 * t) * decay
            ctx.strokeStyle = `hsla(${hue}, 95%, ${li === 2 ? 68 : 58}%, ${a})`
            ctx.beginPath()
            ctx.moveTo(p0.x, p0.y)
            ctx.lineTo(p1.x, p1.y)
            ctx.stroke()
          }
        })

        // Bright head
        const head = trail[trail.length - 1]
        const coreHue = (now * 0.2) % 360
        ctx.beginPath()
        ctx.fillStyle = `hsla(${coreHue}, 95%, 70%, ${0.9 * decay})`
        ctx.arc(head.x, head.y, 2, 0, Math.PI * 2)
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

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-[3] h-full w-full" aria-hidden="true" />
}
