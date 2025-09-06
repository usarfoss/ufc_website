import type { Metadata } from "next"
import AboutPageClient from "./AboutPageClient"

export const metadata: Metadata = {
  title: "About Us — Open Source College Community",
  description: "Open Source, Open Minds. A community that believes in growth and free will.",
}

export default function AboutPage() {
  return <AboutPageClient />
}