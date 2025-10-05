"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Calendar, Clock, MapPin, Users, ArrowLeft, Share2, Heart, Copy, Check } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { use, useState, useRef, useEffect } from "react"
import { GitGudSVG } from "../../../components/event-svgs/GitGudSVG"
import Image from "next/image"

const events = [
  {
    id: 1,
    title: "Git Gud – Introduction to Open Source",
    date: "2025-10-10",
    time: "03:00 PM",
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
    registrationUrl: "https://docs.google.com/forms/d/e/1FAIpQLSf01qxq5oOiLDGlk4RE2Z_5piLapMK_bbp8R7Ut71Elx_UfWQ/viewform?usp=sharing&ouid=113101111311849957004",
    schedule: [
      { time: "03:00 PM", activity: "Welcome & Introduction" },
      { time: "03:15 PM", activity: "Git Fundamentals Demo" },
      { time: "03:45 PM", activity: "Hands-on Git Practice" },
      { time: "04:15 PM", activity: "Speaker Session" },
      { time: "04:30 PM", activity: "Open Source Contribution Guide" },
      { time: "04:45 PM", activity: "Live Project Contribution" },
      { time: "05:00 PM", activity: "Q&A and Discussion" },
      { time: "05:15 PM", activity: "Wrap-up & Next Steps" },
    ],
  },
  {
    id: 2,
    title: "FOSS FORGE 2025",
    date: "2025-10-15",
    time: "11:00 AM - 05:00 PM",
    location: "USAR Campus, GGSIPU EDC",
    attendees: "TBD",
    category: "Competition",
    status: "upcoming",
    description: "Flagship open-source competition and festival during ELYSIAN 2025. 2-day competition (Oct 15–16) with development sprints, creative coding games, and Git battles.",
    fullDescription: `FOSS FORGE is the flagship open-source competition and festival hosted by UFC during ELYSIAN 2025. It blends serious coding challenges with fun, game-style competitions, creating an engaging festival of open-source culture.

**Key Highlights:**
• 2-day, multi-stage competition (Oct 15–16)
• Day 1: Git Clash (code battle) + Pokémon YAML Showdown (config battle)
• Day 2: Repo Sprint (build from base repos; creativity + execution)
• Live leaderboards, interactive battles, and projection displays

**Competition Format:**
• Team Size: 3 members per team
• Structure: 3 Sub-Competitions + Live Leaderboard
• Scoring: Points-based system across all events (individual + team totals)

**Day 1 – Kickoff (11 AM – 5 PM):**

**1. Git Clash – Commit Storm**
Teams tackle curated issues ranging from simple to complex under time pressure. PRs are judged live with a running leaderboard.

Scoring:
• Valid PR – 10 pts
• Medium issue – +5 bonus
• Hard issue – +10 bonus
• Earliest accepted PRs – +5 bonus each
• Clean Git workflow – up to 30 pts/team

**2. Pokémon YAML Showdown – Battle of Configs**
A live, Pokémon-style game where YAML configuration files decide battles. Teams push configs to GitHub; matches are simulated and projected live.

Scoring:
• Match victory – 30 pts
• Close match – 15 pts
• Creative strategy – 10 pts
• Valid participation – 5 pts

**Day 2 – The Finals (11 AM – 5 PM):**

**3. Repo Sprint – Build from Base Repos**
Teams receive base repositories and showcase creativity: features, UX, documentation, and polish.

Scoring (sample breakdown):
• High-impact feature/creative solution – 30 pts
• Code quality & documentation – 25 pts
• UI/UX improvement – 20 pts
• Valid PRs merged & verified – 25 pts

**Final Rankings:** Aggregated scores from Day 1 + Day 2.

**Suggested Bonus Rounds:**
• Code Hunt – hidden vulnerabilities to uncover
• PR Review Round – spot and fix faulty PRs
• Docs or Disaster – quick-fire documentation (20 mins)
• Open-Source Pitch – present contributions like a mini hackathon demo`,
    image: "/foss-forge-2025.jpg",
    tags: ["Open Source", "Competition", "Git", "Team Event"],
    featured: false,
    organizer: "UFC Tech Team",
    requirements: ["Laptop", "GitHub account", "Team of 3 members", "Basic programming knowledge"],
    registrationUrl: "https://tinyurl.com/FOSS-FORGE-REGISTRATION",
    schedule: [
      // Day 1 (Oct 15): 11 AM – 5 PM
      { time: "11:00 AM", activity: "Registration & Team Formation" },
      { time: "11:30 AM", activity: "Opening Ceremony" },
      { time: "12:00 PM", activity: "Git Clash – Commit Storm (Round 1)" },
      { time: "02:00 PM", activity: "Lunch Break" },
      { time: "02:30 PM", activity: "Pokémon YAML Showdown" },
      { time: "05:00 PM", activity: "Day 1 Wrap & Leaderboard" },
      // Day 2 (Oct 16): 11 AM – 5 PM
      { time: "11:00 AM", activity: "Repo Sprint – Build from Base Repos (Creativity Round)" },
      { time: "01:30 PM", activity: "Lunch Break" },
      { time: "02:00 PM", activity: "Showcase & Judging" },
      { time: "05:00 PM", activity: "Awards Ceremony" },
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
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const shareMenuRef = useRef<HTMLDivElement>(null)

  if (!event) {
    notFound()
  }

  const handleShare = async (platform: string) => {
    const eventUrl = `${window.location.origin}/events/${event.id}`
    const shareText = `${event.title} — ${event.description}\n\nDates: Oct 15–16\nTime: 11:00 AM – 5:00 PM\nLocation: ${event.location}\nRegister: ${event.registrationUrl}\n\nJoin UFC at ELYSIAN for Git Clash, Pokémon YAML Showdown, and Repo Sprint!`
    
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(eventUrl)}`, '_blank')
        break
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(eventUrl)}`, '_blank')
        break
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText}\n${eventUrl}`)}`, '_blank')
        break
      case 'copy':
        try {
          await navigator.clipboard.writeText(eventUrl)
          setLinkCopied(true)
          setTimeout(() => setLinkCopied(false), 2000)
        } catch (err) {
          console.error('Failed to copy link:', err)
        }
        break
    }
    setShowShareMenu(false)
  }

  // Close share menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setShowShareMenu(false)
      }
    }

    if (showShareMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showShareMenu])

  // Check if event is saved on component mount
  useEffect(() => {
    const savedEvents = JSON.parse(localStorage.getItem('savedEvents') || '[]')
    setIsSaved(savedEvents.includes(event.id))
  }, [event.id])

  const handleSave = () => {
    const savedEvents = JSON.parse(localStorage.getItem('savedEvents') || '[]')
    
    if (isSaved) {
      // Remove from saved events
      const updatedEvents = savedEvents.filter((id: number) => id !== event.id)
      localStorage.setItem('savedEvents', JSON.stringify(updatedEvents))
      setIsSaved(false)
    } else {
      // Add to saved events
      const updatedEvents = [...savedEvents, event.id]
      localStorage.setItem('savedEvents', JSON.stringify(updatedEvents))
      setIsSaved(true)
    }
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
          {event.id === 1 ? (
            <GitGudSVG />
          ) : (
            <Image
              src={event.image}
              alt={event.title}
              fill
              priority
              className="object-cover"
            />
          )}
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
                {event.registrationUrl && event.status === "upcoming" && (
                  <div className="p-6 bg-gradient-to-br from-green-900/20 to-green-800/20 rounded-2xl border border-green-500/30 backdrop-blur-sm">
                    <h3 className="text-xl font-bold mb-4 text-green-400">Register Now</h3>
                    <p className="text-gray-300 mb-6">Secure your spot at this amazing event. Limited seats available!</p>
                    <motion.a
                      href={event.registrationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full py-3 bg-gradient-to-r from-green-600 to-green-500 text-black font-semibold rounded-lg hover:from-green-500 hover:to-green-400 transition-all duration-300 text-center"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Register for Event
                    </motion.a>
                  </div>
                )}

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
                  <div className="relative">
                    <div className="flex gap-3">
                      <motion.button
                        onClick={() => setShowShareMenu(!showShareMenu)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30 hover:bg-blue-600/30 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Share2 className="w-4 h-4" />
                        Share
                      </motion.button>
                      <motion.button
                        onClick={handleSave}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border transition-colors ${
                          isSaved 
                            ? 'bg-red-600/30 text-red-400 border-red-500/50 hover:bg-red-600/40' 
                            : 'bg-red-600/20 text-red-400 border-red-500/30 hover:bg-red-600/30'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                        {isSaved ? 'Saved' : 'Save'}
                      </motion.button>
                    </div>

                    {/* Share Menu Dropdown */}
                    <AnimatePresence>
                      {showShareMenu && (
                        <motion.div
                          ref={shareMenuRef}
                          className="absolute bottom-full left-0 right-0 mb-2 bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg p-3 shadow-xl z-50"
                          initial={{ opacity: 0, scale: 0.8, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.8, y: 10 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="flex flex-col gap-2">
                            <motion.button
                              onClick={() => handleShare('twitter')}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                </svg>
                              </div>
                              Share on Twitter
                            </motion.button>
                            
                            <motion.button
                              onClick={() => handleShare('linkedin')}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className="w-4 h-4 bg-blue-600 rounded flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                </svg>
                              </div>
                              Share on LinkedIn
                            </motion.button>
                            
                            <motion.button
                              onClick={() => handleShare('whatsapp')}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                                </svg>
                              </div>
                              Share on WhatsApp
                            </motion.button>
                            
                            <motion.button
                              onClick={() => handleShare('copy')}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              {linkCopied ? (
                                <Check className="w-4 h-4 text-green-400" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                              {linkCopied ? 'Link Copied!' : 'Copy Link'}
                            </motion.button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
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

// generateMetadata must be exported from a server component (e.g., layout.tsx)
