"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"

interface EnhancedButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: "primary" | "secondary" | "ghost"
  size?: "sm" | "md" | "lg"
  className?: string
}

export default function EnhancedButton({
  children,
  onClick,
  variant = "primary",
  size = "md",
  className = "",
}: EnhancedButtonProps) {
  const baseClasses = "relative overflow-hidden font-medium transition-all duration-300 btn-glow magnetic"

  const variantClasses = {
    primary:
      "bg-gradient-to-r from-green-500 to-green-600 text-black hover:from-green-400 hover:to-green-500 shadow-lg hover:shadow-green-500/25",
    secondary: "bg-gray-800 text-white border border-gray-600 hover:bg-gray-700 hover:border-gray-500",
    ghost: "text-green-400 hover:text-green-300 hover:bg-green-500/10",
  }

  const sizeClasses = {
    sm: "px-4 py-2 text-sm rounded-lg",
    md: "px-6 py-3 text-base rounded-xl",
    lg: "px-8 py-4 text-lg rounded-2xl",
  }

  return (
    <motion.button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <motion.span className="relative z-10" initial={{ y: 0 }} whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
        {children}
      </motion.span>
    </motion.button>
  )
}
