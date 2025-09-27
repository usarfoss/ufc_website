"use client"

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { Calendar, Clock, MapPin, Users, Star, Plus, ArrowRight, ExternalLink, Heart } from "lucide-react"
import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import PageTransition from "../Components/page-transition"

const events = [
  {
    id: 1,
    title: "Git Gud – Introduction to Open Source",
    description: "Learn Git, GitHub, and open source contribution in this hands-on workshop for beginners.",
    longDescription: `Git Gud is a focused meetup designed to introduce students to the world of open source. This engaging, interactive session features live demos and discussions covering essential topics that every developer should know.

    What you'll learn:
    • Version Control Fundamentals - Understanding Git and GitHub
    • Collaborative Coding - Working with teams on shared projects
    • Open Source Contribution - How to find and contribute to projects
    • Best Practices - Code review, documentation, and community etiquette
    • Career Pathways - How open source experience benefits your career

    This session is perfect for students who are new to open source or want to deepen their understanding of collaborative development. Whether you're a beginner or have some coding experience, you'll leave with practical knowledge and confidence to start contributing to open source projects.

    The event includes hands-on activities, live coding demonstrations, and plenty of time for Q&A. Bring your laptop and get ready to dive into the world of open source development!`,
    date: "2025-10-10",
    time: "02:00 PM",
    location: "USAR Campus, GGSIPU EDC",
    attendees: "TBD",
    category: "Workshop",
    status: "upcoming",
    difficulty: "Beginner",
    image: "/git-gud-event.jpg",
    featured: true,
    organizer: "UFC Tech Team",
    tags: ["Git", "GitHub", "Open Source", "Version Control"],
    requirements: ["Laptop", "Basic programming knowledge", "GitHub account (we'll help you create one)"],
    registrationUrl: "https://docs.google.com/forms/d/e/1FAIpQLSf01qxq5oOiLDGlk4RE2Z_5piLapMK_bbp8R7Ut71Elx_UfWQ/viewform?usp=sharing&ouid=113101111311849957004",
    schedule: [
      { time: "02:00 PM", activity: "Welcome & Introduction" },
      { time: "02:15 PM", activity: "Git Fundamentals Demo" },
      { time: "02:45 PM", activity: "Hands-on Git Practice" },
      { time: "03:15 PM", activity: "Break & Networking" },
      { time: "03:30 PM", activity: "Open Source Contribution Guide" },
      { time: "04:00 PM", activity: "Live Project Contribution" },
      { time: "04:30 PM", activity: "Q&A and Discussion" },
      { time: "05:00 PM", activity: "Wrap-up & Next Steps" },
    ],
    hologramData: {
      components: ["Git Basics", "Version Control", "Collaboration", "Open Source", "Contribution"],
      connections: [
        { from: "Git Basics", to: "Version Control" },
        { from: "Version Control", to: "Collaboration" },
        { from: "Collaboration", to: "Open Source" },
        { from: "Open Source", to: "Contribution" },
      ],
    },
    features: [
      {
        icon: Users,
        title: "Interactive Learning",
        description: "Hands-on activities and live coding demonstrations"
      },
      {
        icon: Star,
        title: "Expert Guidance",
        description: "Learn from experienced open source contributors"
      },
      {
        icon: Calendar,
        title: "3-Hour Session",
        description: "Focused learning with breaks and networking"
      },
      {
        icon: ExternalLink,
        title: "Real Contributions",
        description: "Make your first open source contribution during the event"
      }
    ],
    stats: [
      { label: "Duration", value: "3h", color: "text-green-400" },
      { label: "Level", value: "Beginner", color: "text-blue-400" },
      { label: "Format", value: "Interactive", color: "text-yellow-400" },
      { label: "Hands-on", value: "Yes", color: "text-purple-400" }
    ]
  },
  {
    id: 2,
    title: "FOSS FORGE 2025",
    description: "Flagship open-source competition and festival during ELYSIAN 2025. 2-day multi-stage competition with development sprints, creative coding games, and Git battles.",
    longDescription: `FOSS FORGE is the flagship open-source competition and festival hosted by UFC during ELYSIAN 2025. It blends serious coding challenges with fun, game-style competitions, creating an engaging festival of open-source culture.

**Key Highlights:**
• 2-day, multi-stage competition (between 15–17 Oct)
• Mix of development sprints, creative coding games, and large-scale Git battles
• Designed for maximum student participation and audience engagement
• Live leaderboards, interactive battles, and projection displays

**Competition Format:**
• Team Size: 3 members per team
• Structure: 3 Sub-Competitions + Live Leaderboard
• Scoring: Points-based system across all events (individual + team totals)

**Day 1 – Kickoff:**

**1. Repo Sprint – Fork, Build, Win**
Teams contribute to curated UFC GitHub repositories by solving issues, improving UI/UX, and submitting PRs.

Scoring (100 pts total):
• High-impact feature/creative solution – 30 pts
• Code Quality & Documentation – 25 pts
• UI/UX improvement – 20 pts
• Valid PR merged & verified – 25 pts

**2. Pokémon YAML Showdown – Battle of Configs**
A live, Pokémon-style game where YAML configuration files decide battles. Teams push configs to GitHub, and battles are simulated and projected live.

Scoring:
• Match Victory – 30 pts
• Close Match – 15 pts
• Creative Strategy – 10 pts
• Valid Participation – 5 pts

**Day 2 – The Finals:**

**3. Git Clash – Commit Storm (MVP Event)**
The ultimate showdown: teams tackle curated repos with issues ranging from simple to complex. PRs are judged live with a running leaderboard.

Scoring:
• Valid PR – 10 pts
• Medium issue – +5 bonus
• Hard issue – +10 bonus
• Earliest Accepted PRs – +5 bonus each
• Clean Git Workflow – up to 30 pts/team

**Final Rankings:** Aggregated scores from Day 1 + Day 2.

**Suggested Bonus Rounds:**
• Code Hunt: Hidden vulnerabilities to uncover
• PR Review Round: Spot and fix faulty PRs
• Docs or Disaster: Write quick-fire documentation under 20 minutes
• Open-Source Pitch: Present your contributions like a mini hackathon demo`,
    date: "2025-10-15",
    time: "09:00 AM",
    location: "USAR Campus, GGSIPU EDC",
    attendees: "TBD",
    category: "Competition",
    status: "upcoming",
    difficulty: "Advanced",
    image: "/foss-forge-2025.jpg",
    featured: false,
    organizer: "UFC Tech Team",
    tags: ["Open Source", "Competition", "Git", "Team Event"],
    requirements: ["Laptop", "GitHub account", "Team of 3 members", "Basic programming knowledge"],
    registrationUrl: "https://docs.google.com/forms/d/e/1FAIpQLSeU4yxc8kZQ-60l4lMjTb688nSLtDydmlIzfHYNFdE8o589Lw/viewform?usp=dialog",
    schedule: [
      { time: "09:00 AM", activity: "Registration & Team Formation" },
      { time: "10:00 AM", activity: "Opening Ceremony" },
      { time: "10:30 AM", activity: "Repo Sprint - Fork, Build, Win" },
      { time: "12:00 PM", activity: "Lunch Break" },
      { time: "01:00 PM", activity: "Pokémon YAML Showdown" },
      { time: "03:00 PM", activity: "Day 1 Results & Leaderboard" },
      { time: "09:00 AM", activity: "Day 2 - Git Clash Begins" },
      { time: "12:00 PM", activity: "Lunch Break" },
      { time: "01:00 PM", activity: "Final Rounds & Judging" },
      { time: "04:00 PM", activity: "Awards Ceremony" },
    ],
    hologramData: {
      components: ["Repo Sprint", "YAML Battle", "Git Clash", "Leaderboard", "Awards"],
      connections: [
        { from: "Repo Sprint", to: "YAML Battle" },
        { from: "YAML Battle", to: "Git Clash" },
        { from: "Git Clash", to: "Leaderboard" },
        { from: "Leaderboard", to: "Awards" },
      ],
    },
    features: [
      {
        icon: Users,
        title: "Team Competition",
        description: "3-member teams competing in multiple challenges"
      },
      {
        icon: Star,
        title: "Live Leaderboards",
        description: "Real-time scoring and interactive battles"
      },
      {
        icon: Calendar,
        title: "2-Day Festival",
        description: "Multi-stage competition with various formats"
      },
      {
        icon: ExternalLink,
        title: "Open Source Focus",
        description: "Contribute to real projects and build portfolio"
      }
    ],
    stats: [
      { label: "Duration", value: "2 Days", color: "text-green-400" },
      { label: "Team Size", value: "3 Members", color: "text-blue-400" },
      { label: "Format", value: "Competition", color: "text-yellow-400" },
      { label: "Level", value: "Advanced", color: "text-purple-400" }
     ]
   }
 ]

const categories = [
  "All",
  "Hackathon",
  "Workshop",
  "Competition"
]

const completedCategories = [
  "All",
  "Hackathon",
  "Workshop",
  "Competition"
]

export default function EventsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedCompletedCategory, setSelectedCompletedCategory] = useState("All")
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null)
  const [hologramActive, setHologramActive] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Function to get event status based on date
  const getEventStatus = (eventDate: string, originalStatus: string) => {
    const today = new Date()
    const eventDateObj = new Date(eventDate)
    
    // Add 1 day to event date to mark as completed the day after
    const completionDate = new Date(eventDateObj)
    completionDate.setDate(completionDate.getDate() + 1)
    
    // If today is on or after the completion date (event date + 1), mark as completed
    if (today >= completionDate) {
      return "completed"
    }
    
    // Otherwise, return the original status
    return originalStatus
  }

  // Process events with automatic status updates
  const processedEvents = events.map(event => ({
    ...event,
    status: getEventStatus(event.date, event.status)
  }))

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  })

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])

  const filteredEvents = processedEvents.filter((event) => {
    // Only show upcoming events in the main events section
    return event.status === "upcoming" && (selectedCategory === "All" || event.category === selectedCategory)
  })

  const completedEvents = processedEvents.filter(event => event.status === "completed")
  const filteredCompletedEvents = completedEvents.filter((event) => {
    return selectedCompletedCategory === "All" || event.category === selectedCompletedCategory
  })

  const upcomingEvents = processedEvents.filter((event) => event.status === "upcoming")
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

          <div className="relative z-10 w-full max-w-7xl mx-auto px-12">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              <h1 className="text-6xl md:text-8xl font-black mb-6 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent px-8 overflow-visible tracking-wider" style={{ fontFamily: "var(--font-orbitron)" }}>
                EVENTS
              </h1>
              <p className="text-xl text-gray-400 mb-8">Join Our Community Events</p>
            </motion.div>

            {/* Category Filter */}
            <motion.div
              className="flex flex-wrap justify-center gap-4 mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              {categories.map((category) => (
                <motion.button
                  key={category}
                  className={`px-6 py-2 rounded-full border transition-all ${
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


        {/* All Events Grid */}
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
                 Upcoming Events
               </h2>
               <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                 Discover upcoming events and workshops in our community
               </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <HologramEventCard
                    event={event}
                    index={index}
                    isSelected={selectedEvent === event.id}
                    onSelect={setSelectedEvent}
                    isCompact={true}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Completed Events Section */}
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
                Completed Events
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Past events and workshops from our community
              </p>
            </motion.div>

            {/* Completed Events Filter */}
            <motion.div
              className="flex flex-wrap justify-center gap-4 mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              {completedCategories.map((category) => (
                <motion.button
                  key={category}
                  className={`px-6 py-3 rounded-full border transition-all duration-300 ${
                    selectedCompletedCategory === category
                      ? "bg-green-500 text-black border-green-500"
                      : "border-green-500/50 text-green-400 hover:border-green-500 hover:bg-green-500/10"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCompletedCategory(category)}
                >
                  {category}
                </motion.button>
              ))}
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCompletedEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <HologramEventCard
                    event={event}
                    index={index}
                    isSelected={selectedEvent === event.id}
                    onSelect={setSelectedEvent}
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

interface HologramEventCardProps {
  event: (typeof events)[0]
  index: number
  isSelected: boolean
  onSelect: (id: number | null) => void
  isCompact?: boolean
}

function HologramEventCard({ event, index, isSelected, onSelect, isCompact = false }: HologramEventCardProps) {
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
      <Link href={`/events/${event.id}`}>
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
            <img src={event.image || "/placeholder.svg"} alt={event.title} className="w-full h-full object-cover object-center" />
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
                {event.hologramData.components.map((component, compIndex) => (
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
                      {event.hologramData.connections
                        .filter((conn) => conn.from === component)
                        .map((connection, connIndex) => {
                          const targetIndex = event.hologramData.components.indexOf(connection.to)
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

          {/* Event Info */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black to-transparent">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs border border-green-500/50">
                  {event.category}
                </span>
                <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs">{event.difficulty}</span>
                <span
                  className={`px-2 py-1 rounded text-xs border ${
                    event.status === "upcoming"
                      ? "bg-blue-500/20 text-blue-400 border-blue-500/50"
                      : "bg-green-500/20 text-green-400 border-green-500/50"
                  }`}
                >
                  {event.status}
                </span>
              </div>
              <h3
                className={`${isCompact ? "text-xl" : "text-2xl"} font-bold mb-2 text-white group-hover:text-green-400 transition-colors`}
              >
                {event.title}
              </h3>
              <p className="text-gray-300 text-sm mb-4">{event.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-green-400" />
                    {new Date(event.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: '2-digit', 
                      day: '2-digit' 
                    })}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-green-400" />
                    {event.attendees}
                  </div>
                </div>
                {event.registrationUrl && event.status === "upcoming" && (
                  <motion.button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.open(event.registrationUrl, '_blank', 'noopener,noreferrer');
                    }}
                    className="px-4 py-2 bg-green-500 text-black text-xs font-bold rounded-lg hover:bg-green-400 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Register Now
                  </motion.button>
                )}
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
