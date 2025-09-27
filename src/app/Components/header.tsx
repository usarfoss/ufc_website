'use client'

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-20 p-2 sm:p-4 md:p-8 pointer-events-none">
      <style jsx>{`
        @keyframes glowPulse {
          0%, 100% {
            text-shadow:
              0 0 10px #00ffb2,
              0 0 20px #00ffb2,
              0 0 40px #00ffb2,
              0 0 60px #00ffb2,
              0 0 80px #00ffb2;
          }
          50% {
            text-shadow:
              0 0 20px #00ffd5,
              0 0 40px #00ffd5,
              0 0 60px #00ffd5,
              0 0 80px #00ffd5,
              0 0 100px #00ffd5;
          }
        }

        @keyframes gradientShine {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .ufc-glow {
          animation: glowPulse 2.5s ease-in-out infinite;
          -webkit-text-stroke: 1.5px #ffffff;
          text-stroke: 1.5px #ffffff;
          background: linear-gradient(90deg, #00ffb2, #00ffd5, #0bff7f);
          background-size: 200% 200%;
          animation: glowPulse 2.5s ease-in-out infinite, gradientShine 6s linear infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>

      <div className="text-center pointer-events-auto">
        {/* Main Title */}
        <h1
          className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-1 sm:mb-2 md:mb-4 tracking-widest ufc-glow"
          style={{
            fontFamily: '"IBM Plex Mono", monospace',
            letterSpacing: '0.25em'
          }}
        >
          UFC
        </h1>
        <p
          className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl font-mono font-medium px-2 sm:px-4 leading-tight"
          style={{
            color: '#FFFFFF',
            textShadow: '0 0 15px rgba(255, 255, 255, 0.8), 0 0 35px rgba(0, 255, 179, 0.6)',
            opacity: 1
          }}
        >
          Open Source, Open Minds. Building the future together.
        </p>
      </div>
    </header>
  )
}
