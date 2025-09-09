"use client"

import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import PageTransition from "../../Components/page-transition"

export default function ExploreProjectsPage() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-black text-white">
        {/* Global navbar is present; removed page-specific home button */}

        {/* Back to Projects Button */}
        <div className="fixed top-6 right-6 z-50">
          <Link href="/projects">
            <motion.div
              className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 text-white hover:text-green-400 transition-colors font-bold rounded-lg"
              whileHover={{ scale: 1.05, x: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-4 h-4" />
              BACK TO PROJECTS
            </motion.div>
          </Link>
        </div>

        {/* Main Content */}
        <section className="relative h-screen flex items-center justify-center">
          <motion.div
            className="absolute inset-0 z-0"
            style={{
              background: "radial-gradient(circle at center, rgba(34, 197, 94, 0.1) 0%, transparent 70%)",
            }}
          />

          <div className="relative z-10 text-center px-6">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent px-4">
                Explore Projects
              </h1>
              
              <motion.div
                className="max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.3 }}
              >
                <div className="p-8 bg-black/40 backdrop-blur-sm border border-green-500/30 rounded-xl mb-8">
                  <h2 className="text-3xl font-bold text-green-400 mb-4">
                    More Projects Coming Soon!
                  </h2>
                  <p className="text-xl text-gray-300 mb-6">
                    We're working on bringing you more amazing open source projects to contribute to. 
                    Our team is constantly developing new tools and solutions for the developer community.
                  </p>
                  <p className="text-lg text-gray-400">
                    Stay tuned for updates on new projects, or check out our current featured project - Dimsee!
                  </p>
                </div>

                <div className="flex flex-wrap justify-center gap-4">
                  <Link href="/projects">
                    <motion.button
                      className="flex items-center gap-2 px-6 py-3 bg-green-500 text-black font-semibold rounded-lg hover:bg-green-400 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to Featured Project
                    </motion.button>
                  </Link>
                  
                  <motion.button
                    className="flex items-center gap-2 px-6 py-3 border border-green-500 text-green-400 rounded-lg hover:bg-green-500/10 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.open("https://github.com/sidd190/Dimsee", "_blank")}
                  >
                    View Dimsee on GitHub
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </div>
    </PageTransition>
  )
}
