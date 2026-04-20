"use client"

import { motion } from "framer-motion"
import { Github, ExternalLink, Star, GitFork, Users, Calendar, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { use } from "react"
import { communityProjects } from "@/data/projects"

const projects = communityProjects

interface ProjectDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = use(params)
  const project = projects.find((p) => p.id === Number.parseInt(id))

  if (!project) {
    notFound()
  }

  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    red: "from-red-500 to-red-600",
    yellow: "from-yellow-500 to-yellow-600",
    orange: "from-orange-500 to-orange-600",
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden">
        <motion.div
          className="absolute inset-0 z-0"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
        >
          <img src={project.image || "/placeholder.svg"} alt={project.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
        </motion.div>

        {/* Geometric Elements */}
        <div className="absolute inset-0 z-1">
          <motion.div
            className={`absolute top-20 right-20 w-24 h-24 bg-gradient-to-br ${
              colorClasses[project.color as keyof typeof colorClasses]
            } transform rotate-45 opacity-30`}
            animate={{
              rotate: [45, 55, 45],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 6,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-32 left-20 w-16 h-32 bg-white/20 backdrop-blur-sm transform -rotate-12"
            animate={{
              rotate: [-12, -8, -12],
              scaleY: [1, 1.1, 1],
            }}
            transition={{
              duration: 5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: 1,
            }}
          />
        </div>

        <div className="relative z-20 h-full flex items-end">
          <div className="max-w-7xl mx-auto px-6 pb-20 w-full">
            <motion.div
              className="relative z-30"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
            >
              <Link href="/projects">
                <motion.div
                  className="inline-flex items-center gap-2 text-white hover:text-green-400 transition-colors mb-6 font-bold"
                  whileHover={{ x: -5 }}
                >
                  <ArrowLeft className="w-5 h-5" />
                  BACK TO PROJECTS
                </motion.div>
              </Link>

              <div className="flex flex-wrap items-center gap-4 mb-6">
                <span
                  className={`px-4 py-2 bg-gradient-to-r ${
                    colorClasses[project.color as keyof typeof colorClasses]
                  } text-black font-black transform -skew-x-3`}
                >
                  {project.category}
                </span>
                <span className="px-4 py-2 bg-white text-black font-black transform skew-x-3">
                  {project.status.toUpperCase()}
                </span>
                <span className="px-4 py-2 border-2 border-white text-white font-black">{project.difficulty}</span>
              </div>

              <h1 className="text-6xl md:text-8xl font-black mb-6 text-white transform -skew-x-6 shadow-2xl">
                {project.title}
              </h1>

              <p className="text-xl text-gray-300 mb-8 max-w-3xl backdrop-blur-sm bg-black/20 p-4 rounded-lg border border-white/10">{project.description}</p>

              <div className="flex flex-wrap gap-6 text-gray-300 mb-8 backdrop-blur-sm bg-black/20 p-4 rounded-lg border border-white/10">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <span className="font-bold">{project.stars} stars</span>
                </div>
                <div className="flex items-center gap-2">
                  <GitFork className="w-5 h-5 text-blue-400" />
                  <span className="font-bold">{project.forks} forks</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-400" />
                  <span className="font-bold">{project.contributors} contributors</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-red-400" />
                  <span className="font-bold">Updated {new Date(project.lastUpdate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <motion.a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-6 py-3 bg-white text-black font-black transform -skew-x-3 hover:skew-x-0 transition-transform duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Github className="w-5 h-5" />
                  VIEW ON GITHUB
                </motion.a>
                {project.demo && (
                  <motion.a
                    href={project.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-6 py-3 border-2 border-white text-white font-black transform skew-x-3 hover:-skew-x-0 transition-transform duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ExternalLink className="w-5 h-5" />
                    LIVE DEMO
                  </motion.a>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

    </div>
  )
}
