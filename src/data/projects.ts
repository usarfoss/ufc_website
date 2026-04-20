export type CommunityProject = {
  id: number
  title: string
  description: string
  longDescription: string
  category: string
  status: "ongoing" | "completed"
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  tech: string[]
  github: string
  demo: string
  image: string
  contributors: number
  stars: number
  forks: number
  lastUpdate: string
  featured: boolean
  collaborators: any[]
  creator: any
  hologramData: {
    components: string[]
    connections: { from: string; to: string }[]
  }
  features: any[]
  stats: { label: string; value: string; color: string }[]
  color: "blue" | "green" | "purple" | "red" | "yellow" | "orange"
  maintainer: string
  license: string
  version: string
  requirements?: string[]
  installation?: string[]
  roadmap?: { version: string; features: string[]; status: string }[]
}

const buildProject = ({
  id,
  title,
  description,
  category,
  tech,
  github,
  creator,
  image,
  featured = false,
  color = "green",
}: {
  id: number
  title: string
  description: string
  category: CommunityProject["category"]
  tech: string[]
  github: string
  creator: string
  image?: string
  featured?: boolean
  color?: CommunityProject["color"]
}): CommunityProject => ({
  id,
  title,
  description,
  longDescription: description,
  category,
  status: "ongoing",
  difficulty: tech.length >= 4 ? "Advanced" : "Intermediate",
  tech,
  github,
  demo: "",
  image: image || "",
  contributors: 1,
  stars: 0,
  forks: 0,
  lastUpdate: "2026-04-20",
  featured,
  collaborators: [],
  creator: undefined,
  hologramData: {
    components: tech.slice(0, 5),
    connections: [],
  },
  features: [],
  stats: [
    { label: "Creator", value: creator, color: "text-blue-400" },
    { label: "Tech", value: String(tech.length), color: "text-green-400" },
    { label: "Status", value: "ongoing", color: "text-purple-400" },
  ],
  color,
  maintainer: creator,
  license: "Open Source",
  version: "v1.0.0",
})

export const communityProjects: CommunityProject[] = [
  buildProject({
    id: 1,
    title: "NESt - A NES Emulator",
    description: "Nintendo Entertainment System emulator written in modern C++, focused on accurate hardware recreation.",
    category: "Systems Programming",
    tech: ["C++"],
    github: "https://github.com/manandeepsingh1196",
    creator: "Manandeep Singh",
    image: "/project-images/nest-a-nes-emulator--manandeepsingh1196.jpg",
    featured: true,
    color: "green",
  }),
  buildProject({
    id: 2,
    title: "Snake Game",
    description: "Classic Snake game built in C with improved visuals using OpenGL and FreeGLUT.",
    category: "Game Development",
    tech: ["C", "OpenGL", "FreeGLUT"],
    github: "https://github.com/aayushkat",
    creator: "Aayush Kat",
    image: "/project-images/snake-game--aayushkat.png",
    color: "yellow",
  }),
  buildProject({
    id: 3,
    title: "Quik Type",
    description: "Multiplayer speed typing website where users can compete or practice typing speed.",
    category: "Web Development",
    tech: ["Next.js", "WebSockets", "TailwindCSS"],
    github: "https://github.com/mystic-06",
    creator: "Mystic",
    color: "blue",
  }),
  buildProject({
    id: 4,
    title: "Connect-Four Online Multiplayer",
    description: "Real-time online multiplayer Connect Four game with live gameplay.",
    category: "Web Development",
    tech: ["React", "TailwindCSS", "Node.js"],
    github: "https://github.com/shashank-bingading",
    creator: "Shashank",
    image: "/project-images/connect-four-online-multiplayer--shashank-bingading.png",
    color: "blue",
  }),
  buildProject({
    id: 5,
    title: "Collaborative Whiteboard",
    description: "Real-time collaborative drawing whiteboard for multiple users.",
    category: "Web Development",
    tech: ["React", "Node.js", "Express.js"],
    github: "https://github.com/bhavyab19",
    creator: "Bhavya",
    color: "blue",
  }),
  buildProject({
    id: 6,
    title: "Cutesy Room integrated with THREE.js",
    description: "3D room scene built in Blender and rendered with THREE.js using procedural textures and lighting.",
    category: "3D Graphics",
    tech: ["Three.js", "Blender", "HTML5", "SCSS"],
    github: "https://github.com/ananya-jainn",
    creator: "Ananya Jain",
    image: "/project-images/cutesy-room-integrated-with-three-js--ananya-jainn.png",
    color: "purple",
  }),
  buildProject({
    id: 7,
    title: "Whizper",
    description: "Anonymous confession platform focused on privacy.",
    category: "Web Development",
    tech: ["React", "Node.js", "TailwindCSS"],
    github: "https://github.com/mridulxjain",
    creator: "Mridul Jain",
    image: "/project-images/whizper--mridulxjain.png",
    color: "blue",
  }),
  buildProject({
    id: 8,
    title: "Market-ov",
    description: "Marketing attribution modeling using Markov chains and optimization algorithms.",
    category: "Data Science",
    tech: ["Python", "Pandas", "NumPy"],
    github: "https://github.com/moksh-m9u",
    creator: "Moksh",
    image: "/project-images/market-ov--moksh-m9u.png",
    color: "orange",
  }),
  buildProject({
    id: 9,
    title: "Campus Agent",
    description: "Chatbot answering queries about classes, teachers, rooms, and schedules.",
    category: "AI/ML",
    tech: ["FastAPI", "MySQL", "Pandas"],
    github: "https://github.com/arunnegi112",
    creator: "Arun Negi",
    image: "/project-images/campus-agent--arunnegi112.png",
    color: "purple",
  }),
  buildProject({
    id: 10,
    title: "Black Scholes Option Pricing",
    description: "Finance tool implementing Black-Scholes model for European options pricing.",
    category: "FinTech",
    tech: ["C++"],
    github: "https://github.com/manandeepsingh1196",
    creator: "Manandeep Singh",
    color: "green",
  }),
  buildProject({
    id: 11,
    title: "GitHub Integrated Personalized Dashboard",
    description: "Full-stack dashboard offering personalized GitHub insights and analytics.",
    category: "Web Development",
    tech: ["Next.js", "React", "TailwindCSS"],
    github: "https://github.com/yashcodes07",
    creator: "Yash",
    image: "/project-images/github-integrated-personalized-dashboard--yashcodes07.jpg",
    color: "blue",
  }),
  buildProject({
    id: 12,
    title: "Network Sniffer",
    description: "Packet analyzer that captures and visualizes incoming laptop network traffic.",
    category: "Cybersecurity",
    tech: ["Python"],
    github: "https://github.com/codebyjatin",
    creator: "Jatin",
    image: "/project-images/network-sniffer--codebyjatin.png",
    color: "red",
  }),
  buildProject({
    id: 13,
    title: "PollStream",
    description: "Polling app where users create polls and collect public opinions.",
    category: "Web Development",
    tech: ["React", "Flask", "MongoDB"],
    github: "https://github.com/abhi-rajput-krp",
    creator: "Abhi Rajput",
    image: "/project-images/pollstream--abhi-rajput-krp.png",
    color: "blue",
  }),
  buildProject({
    id: 14,
    title: "Customisable Browser Startpage",
    description: "Beautiful and secure customizable browser homepage replacement.",
    category: "Web Development",
    tech: ["HTML5", "CSS3", "JavaScript"],
    github: "https://github.com/harshitthek",
    creator: "Harshit",
    color: "blue",
  }),
  buildProject({
    id: 15,
    title: "Hand Gesture Recognition",
    description: "ML project using MediaPipe and Random Forest for hand gesture detection.",
    category: "AI/ML",
    tech: ["Python", "MediaPipe", "ML"],
    github: "https://github.com/ananya0-0",
    creator: "Ananya",
    image: "/project-images/hand-gesture-recognition--ananya0-0.jpg",
    color: "purple",
  }),
  buildProject({
    id: 16,
    title: "Steganography Tool",
    description: "Image steganography tool to hide and extract messages inside images.",
    category: "Cybersecurity",
    tech: ["Python", "Pillow", "NumPy"],
    github: "https://github.com/vaibhavi-nope-source",
    creator: "Vaibhavi",
    image: "/project-images/stegangraphy-tool--vaibhavi-nope-source.png",
    color: "red",
  }),
  buildProject({
    id: 17,
    title: "Fake News Detector",
    description: "Detects fake news using SVM machine learning models.",
    category: "AI/ML",
    tech: ["Python", "NLP", "ML"],
    github: "https://github.com/ojaswini-fauzdar",
    creator: "Ojaswini",
    image: "/project-images/fake-news-detector--ojaswini-fauzdar.jpg",
    color: "purple",
  }),
  buildProject({
    id: 18,
    title: "Code Meme Generator",
    description: "Meme maker app allowing users to upload images and add captions.",
    category: "Web Development",
    tech: ["HTML5", "CSS3", "JavaScript"],
    github: "https://github.com/manu-2717",
    creator: "Manu",
    image: "/project-images/code-meme-generator--manu-2717.png",
    color: "blue",
  }),
  buildProject({
    id: 19,
    title: "AI Workout Tracker",
    description: "AI-powered bicep curl counter using webcam posture detection.",
    category: "AI/ML",
    tech: ["Python", "Streamlit", "OpenCV", "MediaPipe"],
    github: "https://github.com/darshitabhagat",
    creator: "Darshit",
    color: "purple",
  }),
  buildProject({
    id: 20,
    title: "Park Conscious",
    description: "Event management platform for organizers and attendees.",
    category: "Web Development",
    tech: ["React", "TailwindCSS", "Vercel"],
    github: "https://github.com/et3ryx",
    creator: "Et3ryx",
    image: "/project-images/park-conscious--et3ryx.png",
    color: "blue",
  }),
  buildProject({
    id: 21,
    title: "Visora",
    description: "Intelligent learning system built on RAG pipeline.",
    category: "AI/ML",
    tech: ["JavaScript", "TailwindCSS", "HTML5"],
    github: "https://github.com/saikiaman",
    creator: "Saiki Aman",
    image: "/project-images/visora--saikiaman.png",
    color: "purple",
  }),
  buildProject({
    id: 22,
    title: "Capacity",
    description: "Creator token launchpad for livestream communities.",
    category: "Web3",
    tech: ["Solidity", "JavaScript", "CSS3"],
    github: "https://github.com/saikiaman",
    creator: "Saiki Aman",
    image: "/project-images/capacity--saikiaman.jpg",
    color: "orange",
  }),
  buildProject({
    id: 23,
    title: "A Pokemon Journey (Pokedex)",
    description: "Pokemon-themed project with working Pokedex and CI pipeline.",
    category: "Web Development",
    tech: ["JavaScript", "Express.js", "Node.js"],
    github: "https://github.com/bhuwan-007",
    creator: "Bhuwan",
    image: "/project-images/a-pokemon-journey-pokedex--bhuwan-007.png",
    color: "blue",
  }),
  buildProject({
    id: 24,
    title: "My Metro Mates",
    description: "Connects metro commuters traveling through the same stations.",
    category: "Web Development",
    tech: ["Next.js", "MongoDB"],
    github: "https://github.com/bhuwan-007",
    creator: "Bhuwan",
    image: "/project-images/my-metro-mates--bhuwan-007.png",
    color: "blue",
  }),
  buildProject({
    id: 25,
    title: "RAG-ChatBot",
    description: "Upload docs and ask AI questions using Retrieval-Augmented Generation.",
    category: "AI/ML",
    tech: ["Python", "LangChain", "Hugging Face"],
    github: "https://github.com/shifali0156-wq",
    creator: "Shifali",
    image: "/project-images/rag-chatbot--shifali0156-wq.jpg",
    color: "purple",
  }),
  buildProject({
    id: 26,
    title: "Stride",
    description: "Web3 fitness league like Strava storing workouts as NFTs.",
    category: "Web3",
    tech: ["React Native", "Expo"],
    github: "https://github.com/sidd190",
    creator: "Sidd",
    image: "/project-images/stride--sidd190.png",
    color: "orange",
  }),
  buildProject({
    id: 27,
    title: "UFC Project Tracker",
    description: "Project management platform built with scalable backend using Convex.",
    category: "Web Development",
    tech: ["React", "Next.js", "TailwindCSS"],
    github: "https://github.com/pranshu640",
    creator: "Pranshu",
    image: "/project-images/ufc-project-tracker--pranshu640.png",
    color: "blue",
  }),
]
