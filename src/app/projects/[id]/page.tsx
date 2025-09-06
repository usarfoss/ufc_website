"use client"

import { motion } from "framer-motion"
import { Github, ExternalLink, Star, GitFork, Users, Calendar, ArrowLeft, Download } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { use } from "react"

const projects = [
  {
    id: 1,
    title: "Dimsee",
    description: "A powerful, ready-to-use authentication package for MERN stack applications",
    longDescription: `Dimsee is a comprehensive authentication solution designed specifically for MERN stack developers. It provides a secure, customizable backend and a beautiful, themeable React frontend component to handle user registration, login, and session management with ease.

    Key Features:
    • Local Authentication - Standard email/password signup and signin with secure password hashing
    • OAuth 2.0 Integration - Seamless support for Google and GitHub social login
    • Session Management - Secure, cookie-based sessions using JWT and express-session
    • Route Protection - Middleware to protect your API routes and secure endpoints
    • Themeable Frontend - Beautiful, customizable React components with multiple design themes
    • Easy Configuration - Simple setup with minimal configuration required

    Dimsee has been designed to eliminate the complexity of implementing authentication in MERN applications. It provides everything you need out of the box while maintaining flexibility for customization. The package includes both backend Express.js setup and frontend React components, making it perfect for developers who want to focus on building their core application features.

    Whether you're building a SaaS product, internal tool, or learning project, Dimsee provides a solid foundation for user management with minimal setup time. Join the growing community of developers who are using Dimsee to secure their applications.`,
    category: "Web Development",
    status: "active",
    difficulty: "Advanced",
    tech: ["React", "Node.js", "Express", "MongoDB", "JWT", "OAuth 2.0", "bcrypt.js", "express-session"],
    github: "https://github.com/sidd190/Dimsee",
    demo: "https://dimsee.netlify.app",
    image: "/project-images/dimsee.jpg",
    contributors: 3,
    stars: 6,
    forks: 2,
    lastUpdate: "2024-01-15",
    featured: true,
    color: "green",
    maintainer: "Siddharth",
    license: "MIT",
    version: "v0.6.2",
    requirements: ["Node.js 16+", "MongoDB", "npm or yarn"],
    installation: [
      "Install the package: npm install dimsee",
      "Set up the backend: const { createAuthBackend } = require('dimsee/backend')",
      "Configure your database: mongoUri: 'mongodb://localhost:27017/your-db'",
      "Add to your React app: import { AuthProvider } from 'dimsee/frontend'",
    ],
    roadmap: [
      { version: "v0.7.0", features: ["Additional OAuth Providers", "Enhanced Security Features"], status: "In Progress" },
      { version: "v0.8.0", features: ["Advanced Customization", "Plugin System"], status: "Planned" },
      { version: "v1.0.0", features: ["Enterprise Features", "Multi-Tenant Support"], status: "Future" },
    ],
  },
  // Add other projects here...
]

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

      {/* Content Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h2 className="text-4xl font-black mb-6 text-white transform -skew-x-3">ABOUT THIS PROJECT</h2>
                <div className="prose prose-invert max-w-none">
                  {project.longDescription?.split("\n\n").map((paragraph, index) => (
                    <p key={index} className="text-gray-300 mb-4 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>

                <div className="mt-8">
                  <h3 className="text-2xl font-black mb-4 text-white">TECH STACK</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.tech.map((tech, index) => (
                      <motion.span
                        key={tech}
                        className="px-4 py-2 bg-gray-800 text-white font-bold transform skew-x-3 hover:-skew-x-3 transition-transform duration-200"
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        viewport={{ once: true }}
                        whileHover={{ scale: 1.1 }}
                      >
                        {tech}
                      </motion.span>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Installation Guide */}
              {project.installation && (
                <motion.div
                  className="mt-12"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <h3 className="text-3xl font-black mb-6 text-white transform skew-x-3">INSTALLATION</h3>
                  <div className="bg-gray-900 border-4 border-gray-700 p-6 transform -skew-x-1">
                    <ol className="space-y-3">
                      {project.installation.map((step, index) => (
                        <motion.li
                          key={index}
                          className="flex items-start gap-3 text-gray-300"
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                          viewport={{ once: true }}
                        >
                          <span className="bg-green-500 text-black font-black px-2 py-1 text-sm transform skew-x-3 min-w-[24px] text-center">
                            {index + 1}
                          </span>
                          <code className="font-mono text-sm">{step}</code>
                        </motion.li>
                      ))}
                    </ol>
                  </div>
                </motion.div>
              )}

              {/* Roadmap */}
              {project.roadmap && (
                <motion.div
                  className="mt-12"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  viewport={{ once: true }}
                >
                  <h3 className="text-3xl font-black mb-6 text-white transform -skew-x-3">ROADMAP</h3>
                  <div className="space-y-4">
                    {project.roadmap.map((item, index) => (
                      <motion.div
                        key={index}
                        className="p-4 bg-gray-900 border-l-4 border-blue-500 transform skew-x-1"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        viewport={{ once: true }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-xl font-bold text-white">{item.version}</h4>
                          <span
                            className={`px-3 py-1 text-xs font-bold transform -skew-x-3 ${
                              item.status === "In Progress"
                                ? "bg-yellow-500 text-black"
                                : item.status === "Planned"
                                  ? "bg-blue-500 text-white"
                                  : "bg-gray-500 text-white"
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                        <ul className="text-gray-300 text-sm">
                          {item.features.map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-400 rounded-full" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                className="sticky top-24 space-y-6"
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                {/* Contribute Card */}
                <div className="p-6 bg-gradient-to-br from-green-900/20 to-green-800/20 border-4 border-green-500 transform -skew-x-3">
                  <h3 className="text-xl font-black mb-4 text-green-400 transform skew-x-3">CONTRIBUTE</h3>
                  <p className="text-gray-300 mb-6 transform skew-x-3">
                    Join our community of developers and help make this project even better!
                  </p>
                  <motion.button
                    className="w-full py-3 bg-green-500 text-black font-black transform skew-x-3 hover:-skew-x-3 transition-transform duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    START CONTRIBUTING
                  </motion.button>
                </div>

                {/* Project Info */}
                <div className="p-6 bg-gray-900 border-4 border-gray-700 transform skew-x-3">
                  <h3 className="text-xl font-black mb-4 text-white transform -skew-x-3">PROJECT INFO</h3>
                  <div className="space-y-3 text-sm transform -skew-x-3">
                    <div>
                      <span className="text-gray-400 font-bold">MAINTAINER:</span>
                      <span className="text-white ml-2">{project.maintainer}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 font-bold">LICENSE:</span>
                      <span className="text-white ml-2">{project.license}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 font-bold">VERSION:</span>
                      <span className="text-white ml-2">{project.version}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 font-bold">STATUS:</span>
                      <span className="text-white ml-2 capitalize">{project.status}</span>
                    </div>
                  </div>
                </div>

                {/* Requirements */}
                {project.requirements && (
                  <div className="p-6 bg-gray-900 border-4 border-gray-700 transform -skew-x-3">
                    <h3 className="text-xl font-black mb-4 text-white transform skew-x-3">REQUIREMENTS</h3>
                    <ul className="space-y-2 transform skew-x-3">
                      {project.requirements.map((req, index) => (
                        <li key={index} className="flex items-center gap-2 text-gray-300 text-sm">
                          <div className="w-2 h-2 bg-blue-400 rounded-full" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="p-6 bg-gray-900 border-4 border-gray-700 transform skew-x-3">
                  <h3 className="text-xl font-black mb-4 text-white transform -skew-x-3">QUICK ACTIONS</h3>
                  <div className="space-y-3 transform -skew-x-3">
                    <motion.button
                      className="w-full flex items-center justify-center gap-2 py-2 bg-blue-600 text-white font-bold hover:bg-blue-500 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Download className="w-4 h-4" />
                      DOWNLOAD
                    </motion.button>
                    <motion.button
                      className="w-full flex items-center justify-center gap-2 py-2 bg-gray-700 text-white font-bold hover:bg-gray-600 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Star className="w-4 h-4" />
                      STAR PROJECT
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
