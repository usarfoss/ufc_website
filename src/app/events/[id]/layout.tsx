import type { Metadata } from 'next'

const events = [
  // Keep minimal mirror of event meta fields to derive OG tags
  {
    id: 1,
    title: 'Git Gud – Introduction to Open Source',
    description: 'Learn Git, GitHub, and open source contribution in this hands-on workshop for beginners.',
    image: '/git-gud-event.jpg',
  },
  {
    id: 2,
    title: 'FOSS FORGE 2025',
    description: 'Flagship open-source competition and festival during ELYSIAN 2025. 2-day competition (Oct 15–16) with development sprints, creative coding games, and Git battles.',
    image: '/foss-forge-2025.jpg',
  },
]

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const event = events.find(e => e.id === Number.parseInt(id))
  if (!event) return {}

  const title = `${event.title} | UFC Events`
  const description = event.description
  const rawBase = process.env.NEXT_PUBLIC_SITE_URL || 'https://ufc-ipu.tech'
  const base = rawBase.startsWith('http') ? rawBase : `https://${rawBase}`
  const url = `${base}/events/${event.id}`
  const absoluteImage = event.image.startsWith('http') ? event.image : `${base}${event.image}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      images: [
        { url: absoluteImage },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [absoluteImage],
    },
  }
}

export default function EventLayout({ children }: { children: React.ReactNode }) {
  return children
}


