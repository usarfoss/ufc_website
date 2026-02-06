'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, GitCommit, GitPullRequest, Trophy } from 'lucide-react';
import FaultyTerminal from './faulty-terminal';
import GitHubHeatmap from './github-heatmap';

interface GitHubWrappedProps {
  isOpen: boolean;
  onClose: () => void;
  userData: {
    name?: string;
    githubUsername?: string;
    avatar?: string;
    commits: number;
    pullRequests: number;
    leaderboardRank: string;
  };
}

interface LanguageData {
  [key: string]: number;
}

const GitHubWrapped: React.FC<GitHubWrappedProps> = ({ isOpen, onClose, userData }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [languages, setLanguages] = useState<LanguageData>({});
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const totalSlides = 5;
  
  const devQuotes = [
    "Code is like humor. When you have to explain it, it's bad.",
    "First, solve the problem. Then, write the code.",
    "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
    "Programming isn't about what you know; it's about what you can figure out.",
    "The best way to get a project done faster is to start sooner.",
    "The only way to learn a new programming language is by writing programs in it.",
    "Sometimes it pays to stay in bed on Monday, rather than spending the rest of the week debugging Monday's code.",
    "Debugging is twice as hard as writing the code in the first place.",
    "It's not a bug – it's an undocumented feature.",
    "There are only two kinds of programming languages: those people always bitch about and those nobody uses.",
    "The most disastrous thing that you can ever learn is your first programming language.",
    "Good code is its own best documentation.",
    "Experience is the name everyone gives to their mistakes.",
    "Simplicity is the ultimate sophistication.",
    "Make it work, make it right, make it fast.",
  ];
  
  const [randomQuote, setRandomQuote] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchLanguages();
      setCurrentSlide(0);
      // Set a random quote when modal opens
      setRandomQuote(devQuotes[Math.floor(Math.random() * devQuotes.length)]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && containerRef.current) {
      const container = containerRef.current;
      const slide = slideRefs.current[currentSlide];
      if (slide) {
        container.scrollTo({
          left: slide.offsetLeft,
          behavior: 'smooth'
        });
      }
    }
  }, [currentSlide, isOpen]);

  const fetchLanguages = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/top-languages');
      if (response.ok) {
        const data = await response.json();
        setLanguages(data.languages || {});
      }
    } catch (error) {
      console.error('Error fetching languages:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') prevSlide();
    if (e.key === 'ArrowRight') nextSlide();
    if (e.key === 'Escape') onClose();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (!isOpen) return null;

  // Language abbreviation mapping
  const getLanguageAbbr = (lang: string): string => {
    const langLower = lang.toLowerCase();
    const mapping: Record<string, string> = {
      'typescript': 'TS',
      'javascript': 'JS',
      'java': 'JA',
      'python': 'PY',
      'html': 'HTML',
      'css': 'CSS',
      'c++': 'C++',
      'c#': 'C#',
      'c': 'C',
      'go': 'GO',
      'rust': 'RS',
      'php': 'PHP',
      'ruby': 'RB',
      'swift': 'SW',
      'kotlin': 'KT',
      'scala': 'SC',
      'r': 'R',
      'dart': 'DT',
      'vue': 'VUE',
      'react': 'REACT',
      'angular': 'ANG',
      'svelte': 'SV',
      'shell': 'SH',
      'bash': 'BASH',
      'powershell': 'PS',
      'sql': 'SQL',
      'markdown': 'MD',
      'json': 'JSON',
      'yaml': 'YAML',
      'xml': 'XML',
    };
    
    return mapping[langLower] || (lang.length > 4 ? lang.substring(0, 4).toUpperCase() : lang.toUpperCase());
  };

  // Get top 5 languages sorted by percentage
  const topLanguages = Object.entries(languages)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([lang, value]) => ({ lang, value, abbr: getLanguageAbbr(lang) }));

  const totalLanguageValue = Object.values(languages).reduce((sum, val) => sum + val, 0);

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div
        className="bg-black border-2 border-[#00ff41] rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden relative matrix-crt matrix-rain"
        onClick={(e) => e.stopPropagation()}
        style={{ boxShadow: '0 0 15px rgba(0, 255, 65, 0.3), inset 0 0 20px rgba(0, 255, 65, 0.05)' }}
      >
        {/* Faulty Terminal Background */}
        <div className="absolute inset-0 opacity-60 pointer-events-none z-0">
          <FaultyTerminal
            scale={1.5}
            gridMul={[2, 1]}
            digitSize={1.5}
            timeScale={0.3}
            scanlineIntensity={0}
            glitchAmount={1}
            flickerAmount={0.5}
            noiseAmp={0.8}
            chromaticAberration={0}
            dither={false}
            curvature={0.1}
            tint="#00ff41"
            mouseReact={true}
            mouseStrength={0.15}
            pageLoadAnimation={false}
            brightness={0.6}
            className="w-full h-full"
          />
        </div>
        
        {/* Close Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-4 right-4 z-50 p-2 bg-black/60 border border-[#00ff41]/30 rounded-lg text-[#00ff41] hover:bg-[#00ff41]/20 transition-all hover:shadow-[0_0_6px_rgba(0,255,65,0.4)] cursor-pointer"
          style={{ boxShadow: '0 0 5px rgba(0, 255, 65, 0.2)' }}
          type="button"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Slide Container */}
        <div
          ref={containerRef}
          className="flex overflow-x-hidden scroll-smooth snap-x snap-mandatory flex-1 relative z-10"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Slide 1: Welcome */}
          <div
            ref={(el) => { slideRefs.current[0] = el; }}
            className="min-w-full snap-center flex items-center justify-center p-8 sm:p-12 relative z-10"
          >
            <div className="text-center space-y-6">
              <h1 className="matrix-font matrix-green-glow text-4xl sm:text-6xl">
                WELCOME TO UFC
              </h1>
              <h2 className="matrix-font matrix-green-glow text-3xl sm:text-5xl">
                GITHUB WRAPPED
              </h2>
              <p className="matrix-font text-[#00ff41] text-lg sm:text-xl mt-8" style={{ textShadow: '0 0 5px rgba(0, 255, 65, 0.6)' }}>
                YOUR CODING JOURNEY IN 2025
              </p>
              <div className="mt-12">
                <button
                  onClick={nextSlide}
                  className="matrix-font px-6 py-3 bg-[#00ff41] text-black font-bold rounded-lg hover:bg-[#00ff41]/80 transition-all hover:shadow-[0_0_10px_rgba(0,255,65,0.5)]"
                  style={{ boxShadow: '0 0 8px rgba(0, 255, 65, 0.4)' }}
                >
                  START →
                </button>
              </div>
            </div>
          </div>

          {/* Slide 2: Top Languages */}
          <div
            ref={(el) => { slideRefs.current[1] = el; }}
            className="min-w-full snap-center flex items-center justify-center p-8 sm:p-12 relative z-10"
          >
            <div className="w-full space-y-8">
              <div className="text-center">
                <h2 className="matrix-font matrix-green-glow text-3xl sm:text-4xl mb-2">
                  YOUR TOP LANGUAGES
                </h2>
                <p className="matrix-font text-[#00ff41] text-sm sm:text-base" style={{ textShadow: '0 0 4px rgba(0, 255, 65, 0.5)' }}>
                  {'>'} MOST USED IN 2025
                </p>
              </div>

              {loading ? (
                <div className="text-center text-gray-400">Loading languages...</div>
              ) : topLanguages.length > 0 ? (
                <div className="space-y-6">
                  {topLanguages.map(({ lang, value, abbr }, index) => {
                    const percentage = totalLanguageValue > 0 ? (value / totalLanguageValue) * 100 : 0;
                    const colors = [
                      '#EF4444', // Red
                      '#F97316', // Orange
                      '#EAB308', // Yellow
                      '#22C55E', // Green
                      '#3B82F6', // Blue
                    ];
                    const color = colors[index % colors.length];

                    return (
                      <div key={lang} className="flex items-center gap-3 sm:gap-4 mb-3">
                        {/* Language Label */}
                        <div className="w-12 sm:w-16 flex-shrink-0">
                          <span className="matrix-font text-lg sm:text-xl text-[#00ff41]" style={{ textShadow: '0 0 4px rgba(0, 255, 65, 0.5)' }}>
                            {abbr}
                          </span>
                        </div>
                        
                        {/* Histogram Bar Container */}
                        <div className="flex-1 relative">
                          {/* Container with green border and horizontal texture */}
                          <div 
                            className="relative w-full h-8 sm:h-10 rounded-sm overflow-hidden border-2 border-[#00ff41]"
                            style={{
                              backgroundColor: '#1a1a1a',
                              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0, 255, 65, 0.05) 1px, rgba(0, 255, 65, 0.05) 2px)',
                              boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.5)'
                            }}
                          >
                            {/* Filled portion with 3D bevel effect and diagonal edge */}
                            <div
                              className="h-full transition-all duration-1000 ease-out relative"
                              style={{
                                width: `${percentage}%`,
                                backgroundColor: color,
                                clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 100%, 0 100%)',
                                boxShadow: `
                                  inset 0 2px 4px rgba(255, 255, 255, 0.3),
                                  inset 0 -2px 4px rgba(0, 0, 0, 0.3),
                                  0 0 8px ${color}40
                                `
                              }}
                            >
                              {/* Top highlight for 3D effect */}
                              <div 
                                className="absolute top-0 left-0 right-0 h-1/3"
                                style={{
                                  background: `linear-gradient(to bottom, rgba(255, 255, 255, 0.3), transparent)`
                                }}
                              />
                              {/* Right diagonal edge highlight */}
                              <div 
                                className="absolute top-0 right-0 w-4 h-full"
                                style={{
                                  background: `linear-gradient(to left, ${color}, ${color}dd)`,
                                  clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)'
                                }}
                              />
                              {/* Bottom shadow for depth */}
                              <div 
                                className="absolute bottom-0 left-0 right-0 h-1/3"
                                style={{
                                  background: `linear-gradient(to top, rgba(0, 0, 0, 0.4), transparent)`
                                }}
                              />
                            </div>
                            
                            {/* Unfilled portion remains as dark gray container */}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center text-gray-400">
                  No language data available
                </div>
              )}

              <div className="flex justify-center space-x-4 mt-8">
                <button
                  onClick={prevSlide}
                  className="matrix-font px-4 py-2 bg-black/60 border border-[#00ff41]/30 rounded-lg text-[#00ff41] hover:bg-[#00ff41]/20 transition-all hover:shadow-[0_0_15px_rgba(0,255,65,0.5)]"
                  style={{ textShadow: '0 0 5px #00ff41' }}
                >
                  ← BACK
                </button>
                <button
                  onClick={nextSlide}
                  className="matrix-font px-4 py-2 bg-[#00ff41] text-black font-bold rounded-lg hover:bg-[#00ff41]/80 transition-all hover:shadow-[0_0_10px_rgba(0,255,65,0.5)]"
                  style={{ boxShadow: '0 0 8px rgba(0, 255, 65, 0.4)' }}
                >
                  NEXT →
                </button>
              </div>
            </div>
          </div>

          {/* Slide 3: Commits and PRs */}
          <div
            ref={(el) => { slideRefs.current[2] = el; }}
            className="min-w-full snap-center flex items-start justify-center p-8 sm:p-12 relative z-10 overflow-y-auto github-wrapped-scroll"
            style={{ 
              maxHeight: '100%',
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(0, 255, 65, 0.4) rgba(0, 0, 0, 0.3)'
            }}
          >
            <div className="w-full space-y-8 max-w-4xl pb-6">
              <div className="text-center mb-8">
                <p className="matrix-font text-xl sm:text-2xl text-[#00ff41] mb-2" style={{ textShadow: '0 0 5px rgba(0, 255, 65, 0.6)' }}>
                  @{userData.githubUsername?.toUpperCase() || 'USER'}
                </p>
                <h2 className="matrix-font matrix-green-glow text-2xl sm:text-3xl mb-2">
                  IN 2025, YOU MADE...
                </h2>
              </div>

              <div className="text-center mb-8">
                <div className="matrix-font text-6xl sm:text-8xl mb-4 matrix-green-glow">
                  {userData.commits.toLocaleString()}
                </div>
                <div className="matrix-font matrix-cyan-glow text-xl sm:text-2xl font-bold">
                  CONTRIBUTIONS
                </div>
              </div>

              {/* Random Dev Quote */}
              <div className="bg-black/40 border-2 border-[#00ff41]/30 rounded-lg p-6 sm:p-8 text-center">
                <div className="matrix-font text-[#00ff41] text-lg sm:text-xl leading-relaxed" style={{ textShadow: '0 0 5px rgba(0, 255, 65, 0.6)' }}>
                  "{randomQuote}"
                </div>
              </div>

              <div className="flex justify-center space-x-4 mt-8">
                <button
                  onClick={prevSlide}
                  className="matrix-font px-4 py-2 bg-black/60 border border-[#00ff41]/30 rounded-lg text-[#00ff41] hover:bg-[#00ff41]/20 transition-all hover:shadow-[0_0_15px_rgba(0,255,65,0.5)]"
                  style={{ textShadow: '0 0 5px #00ff41' }}
                >
                  ← BACK
                </button>
                <button
                  onClick={nextSlide}
                  className="matrix-font px-4 py-2 bg-[#00ff41] text-black font-bold rounded-lg hover:bg-[#00ff41]/80 transition-all hover:shadow-[0_0_10px_rgba(0,255,65,0.5)]"
                  style={{ boxShadow: '0 0 8px rgba(0, 255, 65, 0.4)' }}
                >
                  NEXT →
                </button>
              </div>
            </div>
          </div>

          {/* Slide 4: GitHub Heatmap */}
          <div
            ref={(el) => { slideRefs.current[3] = el; }}
            className="min-w-full snap-center flex items-start justify-center p-8 sm:p-12 relative z-10 overflow-y-auto github-wrapped-scroll"
            style={{
              maxHeight: '100%',
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(0, 255, 65, 0.4) rgba(0, 0, 0, 0.3)'
            }}
          >
            <div className="w-full space-y-8 max-w-4xl pb-6">
              <div className="text-center mb-8">
                <h2 className="matrix-font matrix-green-glow text-3xl sm:text-4xl mb-2">
                  YOUR CONTRIBUTION HEATMAP
                </h2>
                <p className="matrix-font text-[#00ff41] text-sm sm:text-base" style={{ textShadow: '0 0 4px rgba(0, 255, 65, 0.5)' }}>
                  {'>'} YOUR CODING ACTIVITY IN 2025
                </p>
              </div>

              {/* GitHub Contribution Heatmap */}
              <div className="bg-black/40 border-2 border-[#00ff41]/30 rounded-lg p-4 sm:p-6">
                <GitHubHeatmap username={userData.githubUsername} />
              </div>

              <div className="flex justify-center space-x-4 mt-8">
                <button
                  onClick={prevSlide}
                  className="matrix-font px-4 py-2 bg-black/60 border border-[#00ff41]/30 rounded-lg text-[#00ff41] hover:bg-[#00ff41]/20 transition-all hover:shadow-[0_0_15px_rgba(0,255,65,0.5)]"
                  style={{ textShadow: '0 0 5px #00ff41' }}
                >
                  ← BACK
                </button>
                <button
                  onClick={nextSlide}
                  className="matrix-font px-4 py-2 bg-[#00ff41] text-black font-bold rounded-lg hover:bg-[#00ff41]/80 transition-all hover:shadow-[0_0_10px_rgba(0,255,65,0.5)]"
                  style={{ boxShadow: '0 0 8px rgba(0, 255, 65, 0.4)' }}
                >
                  NEXT →
                </button>
              </div>
            </div>
          </div>

          {/* Slide 5: Profile Card */}
          <div
            ref={(el) => { slideRefs.current[4] = el; }}
            className="min-w-full snap-center flex items-center justify-center p-8 sm:p-12 relative z-10"
          >
            <div className="w-full max-w-lg space-y-6">
              {/* Profile Picture with RARE badge */}
              <div className="flex justify-center relative">
                <div className="relative w-40 h-40 sm:w-48 sm:h-48">
                  {/* Outer glow ring */}
                  <div className="absolute inset-0 rounded-2xl" style={{
                    background: 'linear-gradient(135deg, rgba(0, 255, 65, 0.4), rgba(0, 255, 65, 0.1), rgba(0, 255, 65, 0.4))',
                    filter: 'blur(8px)',
                    transform: 'scale(1.1)',
                    zIndex: 0
                  }}></div>
                  
                  {/* Border gradient */}
                  <div className="absolute inset-0 rounded-2xl p-1" style={{
                    background: 'linear-gradient(135deg, #00ff41, #00cc33, #00ff41, #00cc33)',
                    backgroundSize: '200% 200%',
                    animation: 'gradient-border 3s ease infinite',
                    zIndex: 1
                  }}>
                    {/* Inner container */}
                    <div className="w-full h-full rounded-xl overflow-hidden bg-black/80 relative" style={{
                      boxShadow: 'inset 0 0 20px rgba(0, 255, 65, 0.2), 0 0 30px rgba(0, 255, 65, 0.3)'
                    }}>
                      {userData.avatar ? (
                        <img
                          src={userData.avatar}
                          alt={userData.name || 'User'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#00ff41]/20 to-black">
                          <span className="matrix-font text-[#00ff41] text-5xl sm:text-6xl font-bold" style={{ textShadow: '0 0 10px rgba(0, 255, 65, 0.8)' }}>
                            {userData.name?.charAt(0) || 'U'}
                          </span>
                        </div>
                      )}
                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30 pointer-events-none" />
                      {/* Corner accent */}
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#00ff41] rounded-tl-xl opacity-60" style={{ boxShadow: '0 0 10px rgba(0, 255, 65, 0.5)' }}></div>
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#00ff41] rounded-tr-xl opacity-60" style={{ boxShadow: '0 0 10px rgba(0, 255, 65, 0.5)' }}></div>
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#00ff41] rounded-bl-xl opacity-60" style={{ boxShadow: '0 0 10px rgba(0, 255, 65, 0.5)' }}></div>
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#00ff41] rounded-br-xl opacity-60" style={{ boxShadow: '0 0 10px rgba(0, 255, 65, 0.5)' }}></div>
                    </div>
                  </div>
                  
                  {/* Rank Badge */}
                  {(() => {
                    const rank = parseInt(userData.leaderboardRank.replace('#', ''));
                    if (rank <= 5) {
                      // LEGENDARY - Top 5
                      return (
                        <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500 border-2 border-yellow-400 px-4 py-1.5 rounded-lg" style={{ 
                          boxShadow: '0 0 20px rgba(255, 215, 0, 0.8), 0 4px 10px rgba(0, 0, 0, 0.3)',
                          zIndex: 10,
                          animation: 'pulse-glow 2s ease-in-out infinite'
                        }}>
                          <span className="matrix-font text-xs text-black font-bold" style={{ textShadow: '0 0 3px rgba(255, 255, 255, 0.8)' }}>LEGENDARY</span>
                        </div>
                      );
                    } else if (rank <= 10) {
                      // RARE - Rank 6-10
                      return (
                        <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-500 to-cyan-500 border-2 border-blue-400 px-4 py-1.5 rounded-lg" style={{ 
                          boxShadow: '0 0 15px rgba(59, 130, 246, 0.6), 0 4px 10px rgba(0, 0, 0, 0.3)',
                          zIndex: 10
                        }}>
                          <span className="matrix-font text-xs text-white font-bold" style={{ textShadow: '0 0 5px rgba(255, 255, 255, 0.8)' }}>RARE</span>
                        </div>
                      );
                    } else if (rank <= 20) {
                      // EPIC - Rank 11-20
                      return (
                        <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 border-2 border-purple-400 px-4 py-1.5 rounded-lg" style={{ 
                          boxShadow: '0 0 15px rgba(147, 51, 234, 0.6), 0 4px 10px rgba(0, 0, 0, 0.3)',
                          zIndex: 10
                        }}>
                          <span className="matrix-font text-xs text-white font-bold" style={{ textShadow: '0 0 5px rgba(255, 255, 255, 0.8)' }}>EPIC</span>
                        </div>
                      );
                    } else if (rank <= 50) {
                      // RARE - Rank 21-50
                      return (
                        <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-500 to-emerald-500 border-2 border-green-400 px-4 py-1.5 rounded-lg" style={{ 
                          boxShadow: '0 0 12px rgba(34, 197, 94, 0.6), 0 4px 10px rgba(0, 0, 0, 0.3)',
                          zIndex: 10
                        }}>
                          <span className="matrix-font text-xs text-white font-bold" style={{ textShadow: '0 0 5px rgba(255, 255, 255, 0.8)' }}>ELITE</span>
                        </div>
                      );
                    } else {
                      // COMMON - Rank 51+
                      return (
                        <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-gray-500 to-gray-600 border-2 border-gray-400 px-4 py-1.5 rounded-lg" style={{ 
                          boxShadow: '0 0 10px rgba(107, 114, 128, 0.5), 0 4px 10px rgba(0, 0, 0, 0.3)',
                          zIndex: 10
                        }}>
                          <span className="matrix-font text-xs text-white font-bold" style={{ textShadow: '0 0 3px rgba(255, 255, 255, 0.6)' }}>RISING</span>
                        </div>
                      );
                    }
                  })()}
                </div>
              </div>

              {/* Username */}
              <div className="text-center">
                <p className="matrix-font matrix-green-glow text-2xl sm:text-3xl">
                  @{userData.githubUsername?.toUpperCase() || 'USER'}
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 mt-8">
                {/* PRs */}
                <div className="bg-black/60 border-2 border-pink-500 rounded-lg p-4 sm:p-6 text-center" style={{ boxShadow: '0 0 8px rgba(236, 72, 153, 0.3)' }}>
                  <div className="matrix-font text-3xl sm:text-4xl text-pink-500 mb-2" style={{ textShadow: '0 0 5px rgba(236, 72, 153, 0.6)' }}>
                    {userData.pullRequests}
                  </div>
                  <div className="matrix-font text-xs sm:text-sm text-gray-300">PRs</div>
                </div>

                {/* Commits */}
                <div className="bg-black/60 border-2 border-cyan-500 rounded-lg p-4 sm:p-6 text-center" style={{ boxShadow: '0 0 8px rgba(6, 182, 212, 0.3)' }}>
                  <div className="matrix-font matrix-cyan-glow text-3xl sm:text-4xl mb-2">
                    {userData.commits}
                  </div>
                  <div className="matrix-font text-xs sm:text-sm text-gray-300">COMMITS</div>
                </div>

                {/* Rank */}
                <div className="bg-black/60 border-2 border-orange-500 rounded-lg p-4 sm:p-6 text-center" style={{ boxShadow: '0 0 8px rgba(249, 115, 22, 0.3)' }}>
                  <div className="matrix-font text-3xl sm:text-4xl text-orange-500 mb-2" style={{ textShadow: '0 0 5px rgba(249, 115, 22, 0.6)' }}>
                    {userData.leaderboardRank.replace('#', '')}
                  </div>
                  <div className="matrix-font text-xs sm:text-sm text-gray-300">RANK</div>
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={prevSlide}
                  className="matrix-font px-4 py-2 bg-black/60 border border-[#00ff41]/30 rounded-lg text-[#00ff41] hover:bg-[#00ff41]/20 transition-all hover:shadow-[0_0_15px_rgba(0,255,65,0.5)]"
                  style={{ textShadow: '0 0 5px #00ff41' }}
                >
                  ← BACK
                </button>
                <button
                  onClick={onClose}
                  className="matrix-font px-4 py-2 bg-[#00ff41] text-black font-bold rounded-lg hover:bg-[#00ff41]/80 transition-all hover:shadow-[0_0_10px_rgba(0,255,65,0.5)]"
                  style={{ boxShadow: '0 0 8px rgba(0, 255, 65, 0.4)' }}
                >
                  CLOSE
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Dots */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                currentSlide === index
                  ? 'bg-[#0B874F] w-8'
                  : 'bg-[#0B874F]/30 hover:bg-[#0B874F]/50'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default GitHubWrapped;

