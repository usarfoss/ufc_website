"use client"

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface TrueFocusProps {
  sentence?: string
  manualMode?: boolean
  blurAmount?: number
  borderColor?: string
  glowColor?: string
  animationDuration?: number
  pauseBetweenAnimations?: number
  className?: string
}

interface FocusRect {
  x: number
  y: number
  width: number
  height: number
}

export function TrueFocus({
  sentence = 'Open Source, Open Minds',
  manualMode = false,
  blurAmount = 5,
  borderColor = '#10b981',
  glowColor = 'rgba(16, 185, 129, 0.6)',
  animationDuration = 0.5,
  pauseBetweenAnimations = 1,
  className = '',
}: TrueFocusProps) {
  const words = sentence.split(' ')
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const [lastActiveIndex, setLastActiveIndex] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const wordRefs: React.MutableRefObject<(HTMLSpanElement | null)[]> = useRef([])
  const [focusRect, setFocusRect] = useState<FocusRect>({
    x: 0,
    y: 0,
    width: 0,
    height: 0
  })

  useEffect(() => {
    if (!manualMode) {
      const interval = setInterval(
        () => {
          setCurrentIndex(prev => (prev + 1) % words.length)
        },
        (animationDuration + pauseBetweenAnimations) * 1000
      )

      return () => clearInterval(interval)
    }
  }, [manualMode, animationDuration, pauseBetweenAnimations, words.length])

  useEffect(() => {
    if (currentIndex === null || currentIndex === -1) return

    if (!wordRefs.current[currentIndex] || !containerRef.current) return

    const parentRect = containerRef.current.getBoundingClientRect()
    const activeRect = wordRefs.current[currentIndex]!.getBoundingClientRect()

    setFocusRect({
      x: activeRect.left - parentRect.left,
      y: activeRect.top - parentRect.top,
      width: activeRect.width,
      height: activeRect.height
    })
  }, [currentIndex, words.length])

  const handleMouseEnter = (index: number) => {
    if (manualMode) {
      setLastActiveIndex(index)
      setCurrentIndex(index)
    }
  }

  const handleMouseLeave = () => {
    if (manualMode) {
      setCurrentIndex(lastActiveIndex ?? 0)
    }
  }

  return (
    <div 
      className={`relative flex gap-4 justify-center items-center flex-wrap ${className}`} 
      ref={containerRef}
    >
      {words.map((word, index) => {
        const isActive = index === currentIndex
        return (
          <span
            key={index}
            ref={el => {
              if (el) {
                wordRefs.current[index] = el
              }
            }}
            className={`relative text-4xl md:text-5xl lg:text-6xl font-black cursor-pointer transition-all duration-300 ${
              manualMode ? 'manual' : ''
            } ${isActive && !manualMode ? 'text-emerald-400' : 'text-white/70'}`}
            style={{
              filter: manualMode
                ? isActive
                  ? 'blur(0px)'
                  : `blur(${blurAmount}px)`
                : isActive
                  ? 'blur(0px)'
                  : `blur(${blurAmount}px)`,
              transition: `filter ${animationDuration}s ease, color 0.3s ease`,
            }}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
          >
            {word}
          </span>
        )
      })}

             <motion.div
         className="absolute top-0 left-0 pointer-events-none"
         animate={{
           x: focusRect.x,
           y: focusRect.y,
           width: focusRect.width,
           height: focusRect.height,
           opacity: currentIndex >= 0 ? 1 : 0
         }}
         transition={{
           duration: animationDuration,
           ease: "easeInOut"
         }}
         style={{
           '--border-color': borderColor,
           '--glow-color': glowColor
         } as React.CSSProperties}
       >
         {/* Background glow effect */}
         <motion.div
           className="absolute inset-0 rounded-lg"
           style={{
             background: 'radial-gradient(ellipse at center, rgba(16, 185, 129, 0.1) 0%, transparent 70%)',
             boxShadow: 'inset 0 0 20px rgba(16, 185, 129, 0.1)'
           }}
           animate={{
             opacity: [0.3, 0.6, 0.3]
           }}
           transition={{
             duration: 3,
             repeat: Infinity,
             ease: "easeInOut"
           }}
         />
                                   {/* Refined corner lines */}
          <motion.div 
            className="absolute top-0 left-0 w-6 h-6"
            style={{
              top: '-12px',
              left: '-12px'
            }}
            animate={{
              opacity: [0.6, 1, 0.6]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {/* Top-left corner - horizontal line */}
            <div 
              className="absolute top-0 left-0 w-4 h-0.5 bg-emerald-400"
              style={{
                boxShadow: '0 0 8px rgba(16, 185, 129, 0.8)'
              }}
            />
            {/* Top-left corner - vertical line */}
            <div 
              className="absolute top-0 left-0 w-0.5 h-4 bg-emerald-400"
              style={{
                boxShadow: '0 0 8px rgba(16, 185, 129, 0.8)'
              }}
            />
          </motion.div>

          <motion.div 
            className="absolute top-0 right-0 w-6 h-6"
            style={{
              top: '-12px',
              right: '-12px'
            }}
            animate={{
              opacity: [0.6, 1, 0.6]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
          >
            {/* Top-right corner - horizontal line */}
            <div 
              className="absolute top-0 right-0 w-4 h-0.5 bg-emerald-400"
              style={{
                boxShadow: '0 0 8px rgba(16, 185, 129, 0.8)'
              }}
            />
            {/* Top-right corner - vertical line */}
            <div 
              className="absolute top-0 right-0 w-0.5 h-4 bg-emerald-400"
              style={{
                boxShadow: '0 0 8px rgba(16, 185, 129, 0.8)'
              }}
            />
          </motion.div>

          <motion.div 
            className="absolute bottom-0 left-0 w-6 h-6"
            style={{
              bottom: '-12px',
              left: '-12px'
            }}
            animate={{
              opacity: [0.6, 1, 0.6]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          >
            {/* Bottom-left corner - horizontal line */}
            <div 
              className="absolute bottom-0 left-0 w-4 h-0.5 bg-emerald-400"
              style={{
                boxShadow: '0 0 8px rgba(16, 185, 129, 0.8)'
              }}
            />
            {/* Bottom-left corner - vertical line */}
            <div 
              className="absolute bottom-0 left-0 w-0.5 h-4 bg-emerald-400"
              style={{
                boxShadow: '0 0 8px rgba(16, 185, 129, 0.8)'
              }}
            />
          </motion.div>

          <motion.div 
            className="absolute bottom-0 right-0 w-6 h-6"
            style={{
              bottom: '-12px',
              right: '-12px'
            }}
            animate={{
              opacity: [0.6, 1, 0.6]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1.5
            }}
          >
            {/* Bottom-right corner - horizontal line */}
            <div 
              className="absolute bottom-0 right-0 w-4 h-0.5 bg-emerald-400"
              style={{
                boxShadow: '0 0 8px rgba(16, 185, 129, 0.8)'
              }}
            />
            {/* Bottom-right corner - vertical line */}
            <div 
              className="absolute bottom-0 right-0 w-0.5 h-4 bg-emerald-400"
              style={{
                boxShadow: '0 0 8px rgba(16, 185, 129, 0.8)'
              }}
            />
          </motion.div>
      </motion.div>
    </div>
  )
}
