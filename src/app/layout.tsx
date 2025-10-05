import type { Metadata } from "next";
import { Geist, Geist_Mono, Orbitron } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { LoadingProvider } from "@/lib/loading-context";
import { Menu } from "./Components/menu";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "UFC - USAR FOSS Club",
    template: "%s | UFC - USAR FOSS Club"
  },
  description: "UFC - USAR FOSS Club (University School of Automation & Robotics). Open Source, Open Minds. We build, collaborate, and ship real projects in the USAR/GGSIPU community.",
  keywords: [
    // Core club and brand
    "UFC", "USAR FOSS Club", "UFC USAR", "UFC IPU", "USAR", "IPU", "GGSIPU",
    "University School of Automation and Robotics", "University School of Automation & Robotics",
    // FOSS / OSS
    "FOSS", "Free and Open Source Software", "Open Source", "Open-Source", "OSS",
    "Git", "GitHub", "Pull Requests", "Issues", "Commits", "Contributions",
    // Activities and features
    "Hackathon", "Events", "Workshops", "Meetups", "Leaderboard", "Projects",
    "Repo Sprint", "Git Clash", "Pokemon YAML Showdown", "FOSS FORGE", "Git Gud",
    // Tech keywords
    "Programming", "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Tailwind",
    "Web Development", "Software Development", "DevOps", "CI/CD",
    // Location/context
    "Delhi", "Delhi NCR", "GGSIPU USAR",
    // SEO helpers
    "USAR FOSS", "IPU FOSS", "USAR Open Source", "IPU Open Source", "University Open Source",
    "Student Developers", "Developer Community", "College Tech Club", "Coding Club"
  ],
  authors: [{ name: "UFC Tech Team" }],
  creator: "UFC - USAR FOSS Club",
  publisher: "UFC - USAR FOSS Club",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://ufc-ipu.tech',
    title: 'UFC - USAR FOSS Club',
    description: 'UFC - USAR FOSS Club (University School of Automation & Robotics). Open Source, Open Minds. Build, collaborate, and grow with the USAR/GGSIPU community.',
    siteName: 'UFC - USAR FOSS Club',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'UFC - USAR FOSS Club',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UFC - USAR FOSS Club',
    description: 'UFC - USAR FOSS Club (University School of Automation & Robotics). Open Source, Open Minds. Build, collaborate, and grow with the USAR/GGSIPU community.',
    images: ['/og-image.jpg'],
    creator: '@ufc_tech',
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
    ],
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  metadataBase: new URL('https://ufc-ipu.tech'),
  alternates: {
    canonical: '/',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "UFC - University FOSS Club",
    "alternateName": ["USAR FOSS Club", "IPU FOSS Club", "University FOSS Club"],
    "description": "UFC - University FOSS Club, USAR FOSS Club, IPU FOSS Club. Open Source, Open Minds. Building the future together through collaborative development and community-driven innovation.",
    "url": "https://ufc-ipu.tech",
    "logo": "https://ufc-ipu.tech/favicon.ico",
    "sameAs": [
      "https://github.com/usarfoss"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "General Inquiry",
      "email": "contact@ufc-tech.com"
    }
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${orbitron.variable} antialiased`}
      >
        <AuthProvider>
          <LoadingProvider>
            <Menu />
            {children}
          </LoadingProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
