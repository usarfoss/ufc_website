"use client"

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { Github, ExternalLink, Star, Plus, Users, GitPullRequest, Calendar, Code, Zap, Shield, Globe, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import EnhancedButton from "../Components/enhanced-button"
import PageTransition from "../Components/page-transition"

const projects = [
  {
    id: 1,
    title: "Dimsee",
    description: "A powerful, ready-to-use authentication package for MERN stack applications",
    longDescription:
      "Dimsee provides a secure, customizable backend and a beautiful, themeable React frontend component to handle user registration, login, and session management with ease. It supports local authentication, OAuth 2.0 (Google and GitHub), secure session management, and route protection.",
    category: "Web Development",
    status: "ongoing",
    difficulty: "Advanced",
    tech: ["React", "Node.js", "Express", "MongoDB", "JWT", "OAuth 2.0"],
    github: "https://github.com/sidd190/Dimsee",
    demo: "https://dimsee.netlify.app",
    image: "/project-images/dimsee.jpg",
    contributors: 3,
    stars: 6,
    forks: 2,
    lastUpdate: "2024-01-15",
    featured: true,
    hologramData: {
      components: ["React Frontend", "Express Backend", "MongoDB Database", "JWT Authentication", "OAuth Integration"],
      connections: [
        { from: "React Frontend", to: "Express Backend" },
        { from: "Express Backend", to: "MongoDB Database" },
        { from: "JWT Authentication", to: "Express Backend" },
        { from: "OAuth Integration", to: "React Frontend" },
      ],
    },
    features: [
      {
        icon: Zap,
        title: "Local Authentication",
        description: "Standard email/password signup and signin with secure password hashing"
      },
      {
        icon: Code,
        title: "OAuth 2.0 Support",
        description: "Seamless integration with Google and GitHub for social login"
      },
      {
        icon: Globe,
        title: "Session Management",
        description: "Secure, cookie-based sessions using JWT and express-session"
      },
      {
        icon: Shield,
        title: "Route Protection",
        description: "Middleware to protect your API routes and secure endpoints"
      }
    ],
    stats: [
      { label: "GitHub Stars", value: "6", color: "text-green-400" },
      { label: "Contributors", value: "3", color: "text-blue-400" },
      { label: "Forks", value: "2", color: "text-yellow-400" },
      { label: "License", value: "MIT", color: "text-purple-400" }
    ]
  },
]

const categories = [
  "All",
  "Web Development",
]

export default function ProjectsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedProject, setSelectedProject] = useState<number | null>(null)
  const [hologramActive, setHologramActive] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  })

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])

  const filteredProjects = projects.filter((project) => {
    return selectedCategory === "All" || project.category === selectedCategory
  })

  const ongoingProjects = projects.filter((project) => project.status === "ongoing")
  const completedProjects = projects.filter((project) => project.status === "completed")

  return (
    <PageTransition>
      <div className="min-h-screen bg-black text-white overflow-hidden relative" ref={containerRef}>
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

        {/* Hero Section */}
        <section className="relative h-screen flex items-center justify-center">
          <motion.div
            className="absolute inset-0 z-0"
            style={{
              background: "radial-gradient(circle at center, rgba(34, 197, 94, 0.1) 0%, transparent 70%)",
              y: backgroundY,
            }}
          />

          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-12">
            <motion.div
              className="text-center mb-8 md:mb-12"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-8xl font-black mb-4 md:mb-6 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent px-2 md:px-8 overflow-visible tracking-wider" style={{ fontFamily: "var(--font-orbitron)" }}>
                PROJECTS
              </h1>
              <p className="text-base md:text-xl text-gray-400 mb-6 md:mb-8">Build the Future with Open Source</p>
            </motion.div>

            {/* Category Filter */}
            <motion.div
              className="flex flex-wrap justify-center gap-2 md:gap-4 mb-8 md:mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              {categories.map((category) => (
                <motion.button
                  key={category}
                  className={`px-3 md:px-6 py-1.5 md:py-2 rounded-full border transition-all text-sm md:text-base ${
                    selectedCategory === category
                      ? "bg-green-500 text-black border-green-500"
                      : "bg-transparent text-green-400 border-green-500/30 hover:border-green-500/60"
                  }`}
                  onClick={() => setSelectedCategory(category)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {category}
                </motion.button>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Featured Project Showcase */}
        <section className="py-8 px-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-green-400">
                Featured Project
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Our flagship project that's revolutionizing developer workflows
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Project Card */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <HologramProjectCard
                  project={ongoingProjects[0]}
                  index={0}
                  isSelected={selectedProject === ongoingProjects[0].id}
                  onSelect={setSelectedProject}
                />
              </motion.div>

              {/* Project Details */}
              <motion.div
                className="space-y-8"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <div>
                  <h3 className="text-3xl font-bold text-white mb-4">{ongoingProjects[0].title}</h3>
                  <p className="text-gray-300 text-lg leading-relaxed mb-6">
                    {ongoingProjects[0].longDescription}
                  </p>
                  
                  {/* Tech Stack */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-green-400 mb-3">Tech Stack</h4>
                    <div className="flex flex-wrap gap-2">
                      {ongoingProjects[0].tech.map((tech, index) => (
                        <motion.span
                          key={tech}
                          className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm border border-green-500/50"
                          initial={{ opacity: 0, scale: 0 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          viewport={{ once: true }}
                        >
                          {tech}
                        </motion.span>
                      ))}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {ongoingProjects[0].stats.map((stat, index) => (
                      <motion.div
                        key={stat.label}
                        className="text-center p-4 bg-black/30 rounded-lg border border-green-500/20"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        viewport={{ once: true }}
                      >
                        <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                        <div className="text-gray-400 text-sm">{stat.label}</div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-4 relative z-20">
                    <Link href={`/projects/${ongoingProjects[0].id}`}>
                      <motion.button
                        className="flex items-center gap-2 px-6 py-3 bg-green-500 text-black font-semibold rounded-lg hover:bg-green-400 transition-colors relative z-20"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{ pointerEvents: 'auto' }}
                      >
                        View Details
                        <ArrowRight className="w-4 h-4" />
                      </motion.button>
                    </Link>
                    <motion.button
                      className="flex items-center gap-2 px-6 py-3 border border-green-500 text-green-400 rounded-lg hover:bg-green-500/10 transition-colors relative z-20"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => window.open(ongoingProjects[0].github, "_blank")}
                      style={{ pointerEvents: 'auto' }}
                    >
                      <Github className="w-4 h-4" />
                      View on GitHub
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* All Projects Grid */}
        <section className="py-8 px-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-green-400">
                All Projects
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Discover all our ongoing and completed projects
              </p>
            </motion.div>

            {/* Category Filter */}
            <motion.div
              className="flex flex-wrap justify-center gap-4 mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              {categories.map((category) => (
                <motion.button
                  key={category}
                  className={`px-6 py-3 rounded-full border transition-all duration-300 ${
                    selectedCategory === category
                      ? "bg-green-500 text-black border-green-500"
                      : "border-green-500/50 text-green-400 hover:border-green-500 hover:bg-green-500/10"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </motion.button>
              ))}
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <HologramProjectCard
                    project={project}
                    index={index}
                    isSelected={selectedProject === project.id}
                    onSelect={setSelectedProject}
                    isCompact={true}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </PageTransition>
  )
}

interface HologramProjectCardProps {
  project: (typeof projects)[0]
  index: number
  isSelected: boolean
  onSelect: (id: number | null) => void
  isCompact?: boolean
}

function HologramProjectCard({ project, index, isSelected, onSelect, isCompact = false }: HologramProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [assemblyPhase, setAssemblyPhase] = useState(0)

  useEffect(() => {
    if (isHovered) {
      const timer = setInterval(() => {
        setAssemblyPhase((prev) => (prev + 1) % 4)
      }, 800)
      return () => clearInterval(timer)
    } else {
      setAssemblyPhase(0)
    }
  }, [isHovered])

  return (
    <motion.div
      className="relative group"
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: index * 0.2 }}
      viewport={{ once: true }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/projects/${project.id}`}>
        <motion.div
          className={`relative ${isCompact ? "h-80" : "h-96"} bg-black border border-green-500/30 rounded-xl overflow-hidden`}
          whileHover={{ scale: 1.02 }}
          style={{
            boxShadow: isHovered
              ? "0 0 50px rgba(34, 197, 94, 0.3), inset 0 0 50px rgba(34, 197, 94, 0.1)"
              : "0 0 20px rgba(34, 197, 94, 0.1)",
          }}
        >
          {/* Background Image */}
          <div className="absolute inset-0 opacity-60">
            <img src={project.image || "/placeholder.svg"} alt={project.title} className="w-full h-full object-cover object-center" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
          </div>

          {/* Hologram Grid */}
          <div className="absolute inset-0 opacity-20">
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(34, 197, 94, 0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(34, 197, 94, 0.1) 1px, transparent 1px)
                `,
                backgroundSize: "20px 20px",
              }}
            />
          </div>

          {/* Hologram Components */}
          <AnimatePresence>
            {isHovered && (
              <div className="absolute inset-0 p-6">
                {project.hologramData.components.map((component, compIndex) => (
                  <motion.div
                    key={component}
                    className="absolute"
                    style={{
                      left: `${20 + (compIndex % 3) * 30}%`,
                      top: `${20 + Math.floor(compIndex / 3) * 25}%`,
                    }}
                    initial={{
                      opacity: 0,
                      scale: 0,
                      rotateX: 90,
                      z: -100,
                    }}
                    animate={{
                      opacity: assemblyPhase >= compIndex % 4 ? 1 : 0.3,
                      scale: assemblyPhase >= compIndex % 4 ? 1 : 0.5,
                      rotateX: assemblyPhase >= compIndex % 4 ? 0 : 45,
                      z: assemblyPhase >= compIndex % 4 ? 0 : -50,
                    }}
                    transition={{
                      duration: 0.6,
                      delay: compIndex * 0.1,
                      type: "spring",
                      stiffness: 100,
                    }}
                  >
                    <div className="relative">
                      {/* Component Box */}
                      <motion.div
                        className="px-3 py-2 bg-green-500/20 border border-green-400/50 rounded text-xs text-green-300 backdrop-blur-sm"
                        animate={{
                          boxShadow: [
                            "0 0 10px rgba(34, 197, 94, 0.3)",
                            "0 0 20px rgba(34, 197, 94, 0.6)",
                            "0 0 10px rgba(34, 197, 94, 0.3)",
                          ],
                        }}
                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                      >
                        {component}
                      </motion.div>

                      {/* Connection Lines */}
                      {project.hologramData.connections
                        .filter((conn) => conn.from === component)
                        .map((connection, connIndex) => {
                          const targetIndex = project.hologramData.components.indexOf(connection.to)
                          const targetLeft = 20 + (targetIndex % 3) * 30
                          const targetTop = 20 + Math.floor(targetIndex / 3) * 25
                          const currentLeft = 20 + (compIndex % 3) * 30
                          const currentTop = 20 + Math.floor(compIndex / 3) * 25

                          return (
                            <motion.div
                              key={connIndex}
                              className="absolute top-1/2 left-1/2 origin-left h-px bg-gradient-to-r from-green-400/60 to-transparent"
                              style={{
                                width: `${
                                  Math.sqrt(
                                    Math.pow(targetLeft - currentLeft, 2) + Math.pow(targetTop - currentTop, 2),
                                  ) * 3
                                }px`,
                                transform: `rotate(${
                                  Math.atan2(targetTop - currentTop, targetLeft - currentLeft) * (180 / Math.PI)
                                }deg)`,
                              }}
                              initial={{ scaleX: 0, opacity: 0 }}
                              animate={{
                                scaleX: assemblyPhase >= 2 ? 1 : 0,
                                opacity: assemblyPhase >= 2 ? 0.8 : 0,
                              }}
                              transition={{ duration: 0.8, delay: connIndex * 0.2 }}
                            />
                          )
                        })}
                    </div>
                  </motion.div>
                ))}

                {/* Central Hub */}
                <motion.div
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                  initial={{ opacity: 0, scale: 0, rotateY: 180 }}
                  animate={{
                    opacity: assemblyPhase >= 3 ? 1 : 0,
                    scale: assemblyPhase >= 3 ? 1 : 0,
                    rotateY: assemblyPhase >= 3 ? 0 : 180,
                  }}
                  transition={{ duration: 0.8, delay: 1 }}
                >
                  <div className="w-8 h-8 bg-green-500/30 border-2 border-green-400 rounded-full flex items-center justify-center">
                    <motion.div
                      className="w-3 h-3 bg-green-400 rounded-full"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                    />
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Project Info */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black to-transparent">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs border border-green-500/50">
                  {project.category}
                </span>
                <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs">{project.difficulty}</span>
                <span
                  className={`px-2 py-1 rounded text-xs border ${
                    project.status === "ongoing"
                      ? "bg-blue-500/20 text-blue-400 border-blue-500/50"
                      : "bg-green-500/20 text-green-400 border-green-500/50"
                  }`}
                >
                  {project.status}
                </span>
              </div>
              <h3
                className={`${isCompact ? "text-xl" : "text-2xl"} font-bold mb-2 text-white group-hover:text-green-400 transition-colors`}
              >
                {project.title}
              </h3>
              <p className="text-gray-300 text-sm mb-4">{project.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-green-400" />
                    {project.stars}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-green-400" />
                    {project.contributors}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Hologram Scan Lines */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{
              background: [
                "linear-gradient(0deg, transparent 0%, rgba(34, 197, 94, 0.1) 50%, transparent 100%)",
                "linear-gradient(0deg, transparent 20%, rgba(34, 197, 94, 0.1) 70%, transparent 100%)",
                "linear-gradient(0deg, transparent 40%, rgba(34, 197, 94, 0.1) 90%, transparent 100%)",
                "linear-gradient(0deg, transparent 60%, rgba(34, 197, 94, 0.1) 100%, transparent 100%)",
              ],
            }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            style={{ opacity: isHovered ? 0.3 : 0 }}
          />
        </motion.div>
      </Link>
    </motion.div>
  )
}
