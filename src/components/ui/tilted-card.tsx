"use client"

import { useRef, useState, useCallback, useEffect } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { cn } from "@/lib/utils"

interface TiltedCardProps {
  children: React.ReactNode
  className?: string
  tiltIntensity?: number
  scaleIntensity?: number
  onClick?: () => void
  style?: React.CSSProperties
  overlayContent?: React.ReactNode
  displayOverlay?: boolean
}

export function TiltedCard({
  children,
  className,
  tiltIntensity = 8,
  scaleIntensity = 1.05,
  onClick,
  style,
  overlayContent,
  displayOverlay = false,
}: TiltedCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [lastY, setLastY] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

 
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rotateX = useMotionValue(0)
  const rotateY = useMotionValue(0)
  const scale = useMotionValue(1)

  
  const springConfig = { damping: 30, stiffness: 100, mass: 2 }
  const springRotateX = useSpring(rotateX, springConfig)
  const springRotateY = useSpring(rotateY, springConfig)
  const springScale = useSpring(scale, springConfig)

 
  const transformRotateX = useTransform(mouseY, [-1, 1], [tiltIntensity, -tiltIntensity])
  const transformRotateY = useTransform(mouseX, [-1, 1], [-tiltIntensity, tiltIntensity])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || isMobile) return

    const rect = cardRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

  
    const normalizedX = (e.clientX - centerX) / (rect.width / 2)
    const normalizedY = (e.clientY - centerY) / (rect.height / 2)

    mouseX.set(normalizedX)
    mouseY.set(normalizedY)
    rotateX.set(transformRotateX.get())
    rotateY.set(transformRotateY.get())
  }, [mouseX, mouseY, rotateX, rotateY, transformRotateX, transformRotateY, isMobile])

  const handleMouseEnter = useCallback(() => {
    if (isMobile) return
    setIsHovered(true)
    scale.set(scaleIntensity)
  }, [scale, scaleIntensity, isMobile])

  const handleMouseLeave = useCallback(() => {
    if (isMobile) return
    setIsHovered(false)
    scale.set(1)
    rotateX.set(0)
    rotateY.set(0)
  }, [scale, rotateX, rotateY, isMobile])

  return (
    <motion.div
      ref={cardRef}
      className={cn(
        "relative transform-gpu perspective-1000",
        className
      )}
      style={{
        ...style,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
            <motion.div
        className="w-full h-full"
        style={{
          rotateX: springRotateX,
          rotateY: springRotateY,
          scale: springScale,
          transformStyle: "preserve-3d",
        }}
      >
        {children}
        
        {/* Overlay content */}
        {displayOverlay && overlayContent && (
          <motion.div 
            className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {overlayContent}
          </motion.div>
        )}
      </motion.div>
      
      {/* Enhanced glow effect */}
      <motion.div
        className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-400/30 via-emerald-400/10 to-transparent opacity-0 pointer-events-none"
        animate={{
          opacity: isHovered ? 1 : 0,
        }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />


    </motion.div>
  )
}
