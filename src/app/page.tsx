"use client";

import GlobeComponent from "./Components/Globe";
import { Header } from "./Components/header";
import { TerminalOverlay } from "./Components/terminalOverlay";
import { BackgroundElements } from "./Components/backgroundElements";
import { CursorTrail } from "./Components/cursorTrail";

export default function Page() {
  return (
    <div
        className="relative w-full min-h-screen overflow-x-hidden font-mono"
        style={{ backgroundColor: "#000000" }}
      >
        {/* Cursor Trail */}
        <CursorTrail />

        {/* Background Elements */}
        <BackgroundElements />

        {/* Globe Container */}
        <div className="fixed inset-0 flex items-center justify-center z-10 globe-container hardware-accelerated">
          <div className="relative w-full h-full flex items-center justify-center render-optimized">
            {/* Vibrant Background Glow */}
            <div
              className="absolute w-[90vw] h-[90vw] max-w-[900px] max-h-[900px] rounded-full blur-3xl opacity-25 transition-all duration-1000"
              style={{
                backgroundColor: "#0B874F",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
              }}
            ></div>

            {/* Optimized Globe Container */}
            <div className="relative w-[85vw] h-[85vw] max-w-[750px] max-h-[750px] flex items-center justify-center transition-all duration-500">
              <GlobeComponent />
            </div>
          </div>
        </div>

        {/* Mobile Content Spacer */}
        <div className="block md:hidden h-screen"></div>

        {/* Mobile Scrollable Content */}
        <div className="block md:hidden relative z-20">
          <div className="px-4 py-8 space-y-6">
            {/* Mobile Welcome Section */}
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-green-400">Welcome to UFC</h2>
              <p className="text-gray-300 text-sm leading-relaxed">
                Open Source, Open Minds. Building the future together through collaborative development and community-driven innovation.
              </p>
            </div>

            {/* Mobile Quick Links */}
            <div className="grid grid-cols-2 gap-4">
              <a href="/about" className="bg-gray-900/50 border border-green-500/30 rounded-lg p-4 text-center hover:bg-gray-800/50 transition-colors">
                <div className="text-green-400 text-sm font-semibold mb-1">About</div>
                <div className="text-gray-400 text-xs">Learn about our mission</div>
              </a>
              <a href="/projects" className="bg-gray-900/50 border border-green-500/30 rounded-lg p-4 text-center hover:bg-gray-800/50 transition-colors">
                <div className="text-green-400 text-sm font-semibold mb-1">Projects</div>
                <div className="text-gray-400 text-xs">Explore our work</div>
              </a>
              <a href="/events" className="bg-gray-900/50 border border-green-500/30 rounded-lg p-4 text-center hover:bg-gray-800/50 transition-colors">
                <div className="text-green-400 text-sm font-semibold mb-1">Events</div>
                <div className="text-gray-400 text-xs">Join our community</div>
              </a>
              <a href="/login" className="bg-gray-900/50 border border-green-500/30 rounded-lg p-4 text-center hover:bg-gray-800/50 transition-colors">
                <div className="text-green-400 text-sm font-semibold mb-1">Login</div>
                <div className="text-gray-400 text-xs">Access your account</div>
              </a>
            </div>

            {/* Mobile FOSS Stats */}
            <div className="bg-gray-900/30 border border-green-500/20 rounded-lg p-4">
              <h3 className="text-green-400 text-sm font-semibold mb-3">FOSS Activity Legend</h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-sm bg-green-600"></div>
                  <span className="text-gray-300">Very High (1M+ repos)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-sm bg-green-500"></div>
                  <span className="text-gray-300">High (500k-1M repos)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-sm bg-yellow-500"></div>
                  <span className="text-gray-300">Medium (100k-500k repos)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-sm bg-orange-500"></div>
                  <span className="text-gray-300">Low-Med (10k-100k repos)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-sm bg-red-500"></div>
                  <span className="text-gray-300">Low (&lt;10k repos)</span>
                </div>
              </div>
            </div>

            {/* Mobile Instructions */}
            <div className="text-center text-gray-400 text-xs">
              <p>Tap the globe above to explore FOSS activity around the world</p>
            </div>
          </div>
        </div>

        {/* UI Components */}
        <Header />
        <TerminalOverlay />

        {/* Enhanced Legend - Desktop Only */}
        <div className="hidden md:block absolute top-1/4 left-1 sm:left-2 md:left-4 lg:left-8 transform -translate-y-1/2 z-20 max-w-[180px] sm:max-w-[200px] md:max-w-none">
          <div
            className="rounded-lg p-1.5 sm:p-2 md:p-3 lg:p-4 font-mono backdrop-blur-md border transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.3)",
              borderColor: "#0B874F",
              boxShadow: "0 0 20px rgba(11, 135, 79, 0.2)",
            }}
          >
            <h4
              className="text-xs sm:text-xs md:text-sm font-bold mb-1 sm:mb-1 md:mb-2 lg:mb-3"
              style={{ color: "#F5A623" }}
            >
              FOSS Activity
            </h4>
            <div className="space-y-0.5 sm:space-y-1 md:space-y-2 text-xs">
              <div className="flex items-center gap-1 sm:gap-1 md:gap-2">
                <div
                  className="w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-3 md:h-3 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: "#2D8F5A" }}
                ></div>
                <span style={{ color: "#FFFFFF" }} className="text-xs truncate">
                  Very High (1M+)
                </span>
              </div>
              <div className="flex items-center gap-1 sm:gap-1 md:gap-2">
                <div
                  className="w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-3 md:h-3 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: "#4A6741" }}
                ></div>
                <span style={{ color: "#FFFFFF" }} className="text-xs truncate">
                  High (500k-1M)
                </span>
              </div>
              <div className="flex items-center gap-1 sm:gap-1 md:gap-2">
                <div
                  className="w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-3 md:h-3 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: "#6B7A3A" }}
                ></div>
                <span style={{ color: "#FFFFFF" }} className="text-xs truncate">
                  Medium (100k-500k)
                </span>
              </div>
              <div className="flex items-center gap-1 sm:gap-1 md:gap-2">
                <div
                  className="w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-3 md:h-3 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: "#8B6B2A" }}
                ></div>
                <span style={{ color: "#FFFFFF" }} className="text-xs truncate">
                  Low-Med (10k-100k)
                </span>
              </div>
              <div className="flex items-center gap-1 sm:gap-1 md:gap-2">
                <div
                  className="w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-3 md:h-3 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: "#8B3A3A" }}
                ></div>
                <span style={{ color: "#FFFFFF" }} className="text-xs truncate">
                  Low (&lt;10k)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Hint - Desktop Only */}
        <div className="hidden md:block absolute bottom-16 sm:bottom-20 md:bottom-8 left-1/2 transform -translate-x-1/2 z-20">
          <div className="bg-black/50 text-green-400 text-xs px-2 sm:px-2 md:px-3 py-1 sm:py-1 md:py-2 rounded-full backdrop-blur-sm border border-green-400/30 animate-pulse mx-2 sm:mx-4">
            <span className="hidden md:inline">
              Hover over countries to explore FOSS activity •{" "}
            </span>
            <span className="md:hidden">Tap countries for FOSS data</span>
          </div>
        </div>
      </div>
  );
}
