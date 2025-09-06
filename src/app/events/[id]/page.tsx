"use client"

import { motion } from "framer-motion"
import { Calendar, Clock, MapPin, Users, ArrowLeft, Share2, Heart } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { use } from "react"

const events = [
  {
    id: 1,
    title: "Open Source Hackathon 2024",
    date: "2024-03-15",
    time: "09:00 AM",
    location: "USAR Campus, Tech Hub",
    attendees: 150,
    category: "Hackathon",
    status: "upcoming",
    description: "48-hour intensive hackathon focusing on solving real-world problems with open source solutions.",
    fullDescription: `Join us for the most exciting hackathon of the year! This 48-hour intensive event brings together developers, designers, and innovators to tackle real-world challenges using open source technologies.

    What to expect:
    • Collaborative problem-solving sessions
    • Mentorship from industry experts  
    • Access to cutting-edge tools and APIs
    • Networking opportunities with like-minded developers
    • Amazing prizes and recognition

    Whether you're a seasoned developer or just starting your coding journey, this hackathon offers something for everyone. Form teams, build innovative solutions, and contribute to the open source community while competing for exciting prizes.

    Registration includes meals, swag, and access to all workshops and mentoring sessions. Don't miss this opportunity to showcase your skills and make lasting connections in the tech community!`,
    image: "/hackathon-coding-event.png",
    tags: ["React", "Python", "AI/ML", "Blockchain"],
    featured: true,
    organizer: "UFC Tech Team",
    requirements: ["Laptop", "Basic programming knowledge", "Enthusiasm to learn"],
    schedule: [
      { time: "09:00 AM", activity: "Registration & Welcome" },
      { time: "10:00 AM", activity: "Opening Ceremony" },
      { time: "11:00 AM", activity: "Team Formation" },
      { time: "12:00 PM", activity: "Hacking Begins!" },
      { time: "01:00 PM", activity: "Lunch Break" },
      { time: "06:00 PM", activity: "Dinner & Networking" },
      { time: "12:00 AM", activity: "Midnight Snacks" },
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
                  {event.fullDescription?.split("\n\n").map((paragraph, index) => (
                    <p key={index} className="text-gray-300 mb-4 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
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
