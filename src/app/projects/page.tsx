"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Github, ChevronDown, ChevronUp, Users, Lightbulb, Rocket, Code2, Trophy } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import PageTransition from "../Components/page-transition"
import { communityProjects } from "@/data/projects"

const projects = communityProjects

export default function ProjectsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedProject, setSelectedProject] = useState<number | null>(null)
  const [apiProjects, setApiProjects] = useState<any[]>([])
  const [bootcampOpen, setBootcampOpen] = useState(true)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects')
        if (response.ok) {
          const data = await response.json()
          const transformed = data.projects.map((p: any, index: number) => ({
            id: index + 100,
            title: p.name,
            description: p.description,
            longDescription: p.description,
            category: "Web Development",
            status: p.status,
            difficulty: "Intermediate",
            tech: [p.language],
            github: p.repoUrl || "",
            demo: "",
            image: "/project-images/default.jpg",
            contributors: p.collaborators?.length || 1,
            stars: 0,
            forks: 0,
            lastUpdate: new Date(p.createdAt).toISOString().split('T')[0],
            featured: false,
            collaborators: p.collaborators || [],
            creator: p.creator,
            hologramData: { components: ["Frontend", "Backend", "Database"], connections: [] },
            features: [],
            stats: [
              { label: "Contributors", value: String(p.collaborators?.length || 1), color: "text-blue-400" },
              { label: "Language", value: p.language, color: "text-green-400" },
              { label: "Status", value: p.status, color: "text-purple-400" },
            ],
          }))
          setApiProjects(transformed)
        }
      } catch (error) {
        console.error('Error fetching projects:', error)
      }
    }
    fetchProjects()
  }, [])

  const allProjects = [...projects, ...apiProjects]
  const categories = ["All", ...Array.from(new Set(allProjects.map((p) => p.category)))]
  const filteredProjects = allProjects.filter((p) =>
    selectedCategory === "All" || p.category === selectedCategory
  )

  return (
    <PageTransition>
      <div className="min-h-screen bg-black text-white overflow-hidden relative">
        {/* Background layers */}
        <div className="fixed inset-0 bg-gradient-to-br from-black via-[#001F1D] to-black animate-pulse opacity-40 z-0" />
        <div className="fixed inset-0 bg-[linear-gradient(0deg,transparent_24%,rgba(11,135,79,0.12)_25%,rgba(11,135,79,0.12)_26%,transparent_27%,transparent_74%,rgba(11,135,79,0.12)_75%,rgba(11,135,79,0.12)_76%,transparent_77%,transparent),linear-gradient(90deg,transparent_24%,rgba(11,135,79,0.12)_25%,rgba(11,135,79,0.12)_26%,transparent_27%,transparent_74%,rgba(11,135,79,0.12)_75%,rgba(11,135,79,0.12)_76%,transparent_77%,transparent)] bg-[size:120px_120px] opacity-50 z-0" />
        <div className="fixed inset-0 bg-[linear-gradient(0deg,transparent_24%,rgba(11,135,79,0.06)_25%,rgba(11,135,79,0.06)_26%,transparent_27%,transparent_74%,rgba(11,135,79,0.06)_75%,rgba(11,135,79,0.06)_76%,transparent_77%,transparent),linear-gradient(90deg,transparent_24%,rgba(11,135,79,0.06)_25%,rgba(11,135,79,0.06)_26%,transparent_27%,transparent_74%,rgba(11,135,79,0.06)_75%,rgba(11,135,79,0.06)_76%,transparent_77%,transparent)] bg-[size:40px_40px] opacity-40 z-0" />

        <section className="pt-28 pb-10 px-6 relative z-10">
          <div className="max-w-7xl mx-auto">

            {/* ── PAGE HEADER ── */}
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1
                className="text-5xl sm:text-6xl md:text-7xl font-black mb-3 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent tracking-wider"
                style={{ fontFamily: "var(--font-orbitron)" }}
              >
                PROJECTS
              </h1>
              <p className="text-green-400/60 text-sm tracking-widest uppercase mb-6">
                Build. Ship. Learn. Repeat.
              </p>

              {/* ── PHILOSOPHY SECTION ── */}
              <div className="max-w-5xl mx-auto rounded-2xl border border-green-500/30 bg-black/60 backdrop-blur-md shadow-[0_0_60px_rgba(34,197,94,0.1)] p-6 md:p-8 text-left">
                <span className="px-3 py-1 rounded-full border border-green-400/40 bg-green-500/15 text-green-300 text-xs tracking-widest uppercase mb-5 inline-block">
                  Our Philosophy
                </span>

                <p className="text-xl md:text-2xl text-white font-semibold leading-relaxed mb-3">
                  Independence given to a developer brings out the best in them.
                </p>
                <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-6">
                  Projects are the core of learning — for any developer, and for our club. We give people space to pick something they care about, build it end-to-end, and own it. Some made one project, some made two. But learning was done.
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-green-500/25 bg-green-500/5 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Code2 className="w-4 h-4 text-green-400 shrink-0" />
                      <p className="text-green-300 font-semibold text-sm">Individual Bootcamp</p>
                    </div>
                    <p className="text-gray-400 text-xs leading-relaxed">
                      Every 2–3 months, everyone picks a project of their own choice and ships it. No teams, no hand-holding — just you, your idea, and the community around you.
                    </p>
                  </div>

                  <div className="rounded-xl border border-cyan-500/25 bg-cyan-500/5 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-cyan-400 shrink-0" />
                      <p className="text-cyan-300 font-semibold text-sm">Community Project Track</p>
                    </div>
                    <p className="text-gray-400 text-xs leading-relaxed">
                      Collaborative projects with real stakes — open-source tools, startup ideas, hackathon entries, community-beneficiary builds, and grant-worthy innovations that exist beyond just being a project.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ── BOOTCAMP #1 COLLAPSIBLE HEADER ── */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <button
                onClick={() => setBootcampOpen((v) => !v)}
                className="w-full group"
              >
                <div className="flex items-center justify-between rounded-2xl border border-green-500/40 bg-black/60 backdrop-blur-md px-6 md:px-10 py-6 hover:border-green-400/60 hover:bg-green-500/5 transition-all duration-300 shadow-[0_0_30px_rgba(34,197,94,0.08)]">
                  <div className="text-left">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 rounded-full border border-green-400/40 bg-green-500/15 text-green-300 text-xs tracking-widest uppercase">
                        Individual Bootcamp
                      </span>
                      <span className="px-3 py-1 rounded-full border border-emerald-400/30 bg-emerald-500/10 text-emerald-300 text-xs tracking-widest uppercase">
                        Completed
                      </span>
                    </div>
                    <h2
                      className="text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-green-300 to-emerald-400 bg-clip-text text-transparent tracking-wide"
                      style={{ fontFamily: "var(--font-orbitron)" }}
                    >
                      Project Bootcamp #1
                    </h2>
                    <p className="text-green-400/70 text-base md:text-lg mt-2 font-medium tracking-wide">
                      January – March 2025 &nbsp;·&nbsp; {allProjects.length} projects shipped
                    </p>
                  </div>
                  <div className="ml-4 shrink-0 w-10 h-10 rounded-full border border-green-500/40 bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-all duration-300">
                    {bootcampOpen
                      ? <ChevronUp className="w-5 h-5 text-green-400" />
                      : <ChevronDown className="w-5 h-5 text-green-400" />
                    }
                  </div>
                </div>
              </button>
            </motion.div>

            {/* ── COLLAPSIBLE CONTENT ── */}
            <AnimatePresence>
              {bootcampOpen && (
                <motion.div
                  key="bootcamp-content"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  {/* Category Filter */}
                  <motion.div
                    className="flex flex-wrap justify-center gap-2 md:gap-3 mb-8"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                  >
                    {categories.map((category) => (
                      <motion.button
                        key={category}
                        className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full border text-xs md:text-sm transition-all duration-300 ${
                          selectedCategory === category
                            ? "bg-green-500/30 text-green-100 border-green-400/50"
                            : "border-green-500/20 text-green-300/70 hover:border-green-500/40 hover:bg-green-500/10"
                        }`}
                        whileHover={{ scale: 1.02 }}
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
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.03 }}
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
                </motion.div>
              )}
            </AnimatePresence>

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
  const githubHandle = project.github ? project.github.replace(/\/+$/, "").split("/").pop() : ""
  const creatorName = project.creator?.name || project.maintainer || "Unknown"

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
      transition={{ duration: 0.2 }}
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
          {project.image ? (
            <div className="absolute inset-0 opacity-60">
              <img src={project.image} alt={project.title} className="w-full h-full object-cover object-center" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20" />
          )}

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
                    initial={{ opacity: 0, scale: 0, rotateX: 90, z: -100 }}
                    animate={{
                      opacity: assemblyPhase >= compIndex % 4 ? 1 : 0.3,
                      scale: assemblyPhase >= compIndex % 4 ? 1 : 0.5,
                      rotateX: assemblyPhase >= compIndex % 4 ? 0 : 45,
                      z: assemblyPhase >= compIndex % 4 ? 0 : -50,
                    }}
                    transition={{ duration: 0.6, delay: compIndex * 0.1, type: "spring", stiffness: 100 }}
                  >
                    <div className="relative">
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
                    </div>
                  </motion.div>
                ))}

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
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                    />
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Project Info */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black to-transparent">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs border border-green-500/50">
                  {project.category}
                </span>
              </div>
              <h3 className={`${isCompact ? "text-xl" : "text-2xl"} font-bold mb-2 text-white group-hover:text-green-400 transition-colors`}>
                {project.title}
              </h3>
              <p className="text-gray-300 text-sm mb-4">{project.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1 text-xs text-gray-400">
                  <div className="text-gray-300">
                    Made by <span className="text-white">{creatorName}</span>
                  </div>
                  {githubHandle && (
                    <div className="flex items-center gap-1 text-gray-400">
                      <Github className="w-3 h-3 text-green-400" />
                      <span>@{githubHandle}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Scan Lines */}
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
