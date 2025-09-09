"use client";

import GlobeComponent from "./Components/Globe";
import { Header } from "./Components/header";
import { TerminalOverlay } from "./Components/terminalOverlay";
import { BackgroundElements } from "./Components/backgroundElements";
import { CursorTrail } from "./Components/cursorTrail";

export default function Page() {
  return (
    <div
        className="relative w-full h-screen overflow-hidden font-mono"
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

        {/* UI Components */}
        <Header />
        <TerminalOverlay />

        {/* Enhanced Legend */}
        <div className="absolute top-1/4 left-4 md:left-8 transform -translate-y-1/2 z-20">
          <div
            className="rounded-lg p-3 md:p-4 font-mono backdrop-blur-md border transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.3)",
              borderColor: "#0B874F",
              boxShadow: "0 0 20px rgba(11, 135, 79, 0.2)",
            }}
          >
            <h4
              className="text-xs md:text-sm font-bold mb-2 md:mb-3"
              style={{ color: "#F5A623" }}
            >
              FOSS Activity
            </h4>
            <div className="space-y-1 md:space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 md:w-3 md:h-3 rounded-sm"
                  style={{ backgroundColor: "#2D8F5A" }}
                ></div>
                <span style={{ color: "#FFFFFF" }} className="text-xs">
                  Very High (1M+ repos)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 md:w-3 md:h-3 rounded-sm"
                  style={{ backgroundColor: "#4A6741" }}
                ></div>
                <span style={{ color: "#FFFFFF" }} className="text-xs">
                  High (500k-1M repos)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 md:w-3 md:h-3 rounded-sm"
                  style={{ backgroundColor: "#6B7A3A" }}
                ></div>
                <span style={{ color: "#FFFFFF" }} className="text-xs">
                  Medium (100k-500k repos)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 md:w-3 md:h-3 rounded-sm"
                  style={{ backgroundColor: "#8B6B2A" }}
                ></div>
                <span style={{ color: "#FFFFFF" }} className="text-xs">
                  Low-Med (10k-100k repos)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 md:w-3 md:h-3 rounded-sm"
                  style={{ backgroundColor: "#8B3A3A" }}
                ></div>
                <span style={{ color: "#FFFFFF" }} className="text-xs">
                  Low (&lt;10k repos)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Hint */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
          <div className="bg-black/50 text-green-400 text-xs px-3 py-2 rounded-full backdrop-blur-sm border border-green-400/30 animate-pulse">
            <span className="hidden md:inline">
              Hover over countries to explore FOSS activity •{" "}
            </span>
            <span className="md:hidden">Tap countries for FOSS data</span>
          </div>
        </div>
      </div>
  );
}
