"use client"

import { motion } from "framer-motion"
import { Calendar, Clock, MapPin, Users, ArrowLeft, Share2, Heart } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { use } from "react"

const events = [
  {
    id: 1,
    title: "Git Gud – Introduction to Open Source",
    date: "2025-10-10",
    time: "02:00 PM",
    location: "USAR Campus, GGSIPU EDC",
    attendees: "TBD",
    category: "Meetup",
    status: "upcoming",
    description: "Learn Git, GitHub, and open source contribution in this hands-on workshop for beginners.",
    fullDescription: `Git Gud is a focused meetup designed to introduce students to the world of open source. This engaging, interactive session features live demos and discussions covering essential topics that every developer should know.

    What you'll learn:
    • Version Control Fundamentals - Understanding Git and GitHub
    • Collaborative Coding - Working with teams on shared projects
    • Open Source Contribution - How to find and contribute to projects
    • Best Practices - Code review, documentation, and community etiquette
    • Career Pathways - How open source experience benefits your career

    This session is perfect for students who are new to open source or want to deepen their understanding of collaborative development. Whether you're a beginner or have some coding experience, you'll leave with practical knowledge and confidence to start contributing to open source projects.

    The event includes hands-on activities, live coding demonstrations, and plenty of time for Q&A. Bring your laptop and get ready to dive into the world of open source development!`,
    image: "/git-gud-event.jpg",
    tags: ["Git", "GitHub", "Open Source", "Version Control"],
    featured: true,
    organizer: "UFC Tech Team",
    requirements: ["Laptop", "Basic programming knowledge", "GitHub account (we'll help you create one)"],
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
  },
  {
    id: 2,
    title: "FOSS FORGE 2025",
    date: "2025-10-15",
    time: "09:00 AM",
    location: "USAR Campus, GGSIPU EDC",
    attendees: "TBD",
    category: "Competition",
    status: "upcoming",
    description: "Flagship open-source competition and festival during ELYSIAN 2025. 2-day multi-stage competition with development sprints, creative coding games, and Git battles.",
    fullDescription: `FOSS FORGE is the flagship open-source competition and festival hosted by UFC during ELYSIAN 2025. It blends serious coding challenges with fun, game-style competitions, creating an engaging festival of open-source culture.

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
    image: "/foss-forge-2025.jpg",
    tags: ["Open Source", "Competition", "Git", "Team Event"],
    featured: false,
    organizer: "UFC Tech Team",
    requirements: ["Laptop", "GitHub account", "Team of 3 members", "Basic programming knowledge"],
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
  },
  // Add other events here...
]

interface EventDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default function EventDetailPage({ params }: EventDetailPageProps) {
  const { id } = use(params)
  const event = events.find((e) => e.id === Number.parseInt(id))

  if (!event) {
    notFound()
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
          <img src={event.image || "/placeholder.svg"} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        </motion.div>

        <div className="relative z-10 h-full flex items-end">
          <div className="max-w-7xl mx-auto px-6 pb-20">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
            >
              <Link href="/events">
                <motion.div
                  className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors mb-6"
                  whileHover={{ x: -5 }}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Events
                </motion.div>
              </Link>

              <div className="flex flex-wrap items-center gap-4 mb-6">
                <span className="px-4 py-2 bg-green-500/20 text-green-400 rounded-full font-medium border border-green-500/30">
                  {event.category}
                </span>
                <span className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-full font-medium border border-blue-500/30">
                  {event.status}
                </span>
                {event.featured && (
                  <span className="px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-full font-medium border border-yellow-500/30">
                    Featured
                  </span>
                )}
              </div>

              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-green-400 bg-clip-text text-transparent">
                {event.title}
              </h1>

              <p className="text-xl text-gray-300 mb-8 max-w-3xl">{event.description}</p>

              <div className="flex flex-wrap gap-6 text-gray-300">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-400" />
                  <span>{new Date(event.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-400" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-red-400" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-yellow-400" />
                  <span>{event.attendees} attendees</span>
                </div>
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
                <h2 className="text-3xl font-bold mb-6 text-green-400">About This Event</h2>
                <div className="prose prose-invert max-w-none">
                  <div 
                    className="text-gray-300 leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: event.fullDescription
                        ?.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>')
                        ?.replace(/• (.*?)(?=\n|$)/g, '<li class="ml-4 mb-2">$1</li>')
                        ?.replace(/\n\n/g, '</p><p class="mb-4">')
                        ?.replace(/^/, '<p class="mb-4">')
                        ?.replace(/$/, '</p>') || ''
                    }}
                  />
                </div>

                <div className="flex flex-wrap gap-2 mt-8">
                  {event.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-800/50 text-gray-300 rounded-lg text-sm border border-gray-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>

              {/* Schedule */}
              {event.schedule && (
                <motion.div
                  className="mt-12"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <h3 className="text-2xl font-bold mb-6 text-blue-400">Event Schedule</h3>
                  <div className="space-y-4">
                    {event.schedule.map((item, index) => (
                      <motion.div
                        key={index}
                        className="flex items-center gap-4 p-4 bg-gray-900/50 rounded-lg border border-gray-800"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        viewport={{ once: true }}
                      >
                        <div className="text-green-400 font-mono font-semibold min-w-[80px]">{item.time}</div>
                        <div className="text-gray-300">{item.activity}</div>
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
                {/* Registration Card */}
                <div className="p-6 bg-gradient-to-br from-green-900/20 to-green-800/20 rounded-2xl border border-green-500/30 backdrop-blur-sm">
                  <h3 className="text-xl font-bold mb-4 text-green-400">Register Now</h3>
                  <p className="text-gray-300 mb-6">Secure your spot at this amazing event. Limited seats available!</p>
                  <motion.button
                    className="w-full py-3 bg-gradient-to-r from-green-600 to-green-500 text-black font-semibold rounded-lg hover:from-green-500 hover:to-green-400 transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Register for Event
                  </motion.button>
                </div>

                {/* Event Details */}
                <div className="p-6 bg-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-sm">
                  <h3 className="text-xl font-bold mb-4 text-white">Event Details</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-gray-400">Organizer:</span>
                      <span className="text-white ml-2">{event.organizer}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Category:</span>
                      <span className="text-white ml-2">{event.category}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Status:</span>
                      <span className="text-white ml-2 capitalize">{event.status}</span>
                    </div>
                  </div>
                </div>

                {/* Requirements */}
                {event.requirements && (
                  <div className="p-6 bg-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-sm">
                    <h3 className="text-xl font-bold mb-4 text-white">What to Bring</h3>
                    <ul className="space-y-2">
                      {event.requirements.map((req, index) => (
                        <li key={index} className="flex items-center gap-2 text-gray-300">
                          <div className="w-2 h-2 bg-green-400 rounded-full" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Social Actions */}
                <div className="p-6 bg-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-sm">
                  <h3 className="text-xl font-bold mb-4 text-white">Share Event</h3>
                  <div className="flex gap-3">
                    <motion.button
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30 hover:bg-blue-600/30 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Share2 className="w-4 h-4" />
                      Share
                    </motion.button>
                    <motion.button
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-600/20 text-red-400 rounded-lg border border-red-500/30 hover:bg-red-600/30 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Heart className="w-4 h-4" />
                      Save
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
