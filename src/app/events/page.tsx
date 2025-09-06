"use client"

import { motion } from "framer-motion"
import { Home } from "lucide-react"
import Link from "next/link"
import PageTransition from "../Components/page-transition"

export default function EventsPage() {
  return (
    <PageTransition>
      <div className="bg-black text-white min-h-screen relative">
        {/* Animated Gradient Background */}
        <div className="fixed inset-0 bg-gradient-to-br from-black via-[#001F1D] to-black animate-pulse opacity-40 z-0"></div>
        
        {/* Animated Grid Scan Lines */}
        <div className="fixed inset-0 bg-[linear-gradient(0deg,transparent_0%,rgba(11,135,79,0.1)_50%,transparent_100%)] bg-[size:100%_4px] animate-pulse opacity-20 z-0"></div>

        {/* Enhanced Hacker Grid System */}
        {/* Primary Grid - Large squares */}
        <div className="fixed inset-0 bg-[linear-gradient(0deg,transparent_24%,rgba(11,135,79,0.12)_25%,rgba(11,135,79,0.12)_26%,transparent_27%,transparent_74%,rgba(11,135,79,0.12)_75%,rgba(11,135,79,0.12)_76%,transparent_77%,transparent),linear-gradient(90deg,transparent_24%,rgba(11,135,79,0.12)_25%,rgba(11,135,79,0.12)_26%,transparent_27%,transparent_74%,rgba(11,135,79,0.12)_75%,rgba(11,135,79,0.12)_76%,transparent_77%,transparent)] bg-[size:120px_120px] opacity-50 z-0"></div>
        
        {/* Secondary Grid - Medium squares */}
        <div className="fixed inset-0 bg-[linear-gradient(0deg,transparent_24%,rgba(11,135,79,0.08)_25%,rgba(11,135,79,0.08)_26%,transparent_27%,transparent_74%,rgba(11,135,79,0.08)_75%,rgba(11,135,79,0.08)_76%,transparent_77%,transparent),linear-gradient(90deg,transparent_24%,rgba(11,135,79,0.08)_25%,rgba(11,135,79,0.08)_26%,transparent_27%,transparent_74%,rgba(11,135,79,0.08)_75%,rgba(11,135,79,0.08)_76%,transparent_77%,transparent)] bg-[size:80px_80px] opacity-45 z-0"></div>
        
        {/* Tertiary Grid - Small squares */}
        <div className="fixed inset-0 bg-[linear-gradient(0deg,transparent_24%,rgba(11,135,79,0.06)_25%,rgba(11,135,79,0.06)_26%,transparent_27%,transparent_74%,rgba(11,135,79,0.06)_75%,rgba(11,135,79,0.06)_76%,transparent_77%,transparent),linear-gradient(90deg,transparent_24%,rgba(11,135,79,0.06)_25%,rgba(11,135,79,0.06)_26%,transparent_27%,transparent_74%,rgba(11,135,79,0.06)_75%,rgba(11,135,79,0.06)_76%,transparent_77%,transparent)] bg-[size:40px_40px] opacity-40 z-0"></div>
        
        {/* Diagonal Grid Pattern */}
        <div className="fixed inset-0 bg-[linear-gradient(45deg,transparent_40%,rgba(11,135,79,0.04)_41%,rgba(11,135,79,0.04)_42%,transparent_43%,transparent_57%,rgba(11,135,79,0.04)_58%,rgba(11,135,79,0.04)_59%,transparent_60%),linear-gradient(-45deg,transparent_40%,rgba(11,135,79,0.04)_41%,rgba(11,135,79,0.04)_42%,transparent_43%,transparent_57%,rgba(11,135,79,0.04)_58%,rgba(11,135,79,0.04)_59%,transparent_60%)] bg-[size:100px_100px] opacity-35 z-0"></div>
        
        {/* Radial Grid Pattern */}
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,rgba(11,135,79,0.05)_1px,transparent_1px)] bg-[size:60px_60px] opacity-30 z-0"></div>
        {/* Back to Home Button */}
        <div className="fixed top-6 left-6 z-50">
          <Link href="/">
            <motion.div
              className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 text-white hover:text-green-400 transition-colors font-bold rounded-lg"
              whileHover={{ scale: 1.05, x: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Home className="w-4 h-4" />
              HOME
            </motion.div>
          </Link>
        </div>

        {/* Coming Soon Section */}
        <section className="relative h-screen flex items-center justify-center">
          <motion.div
            className="absolute inset-0 z-0"
            style={{
              background: "radial-gradient(circle at center, rgba(34, 197, 94, 0.1) 0%, transparent 70%)",
            }}
          />

          <div className="relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              <h1 className="text-6xl md:text-8xl font-black mb-6 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent px-8 overflow-visible tracking-wider" style={{ fontFamily: "var(--font-orbitron)" }}>
                EVENTS
              </h1>
              <p className="text-4xl md:text-6xl font-bold text-white mb-8">
                Coming Soon...
              </p>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                We're working on something amazing. Stay tuned for exciting events and community gatherings.
              </p>
            </motion.div>
          </div>
        </section>
      </div>
    </PageTransition>
  )
}
