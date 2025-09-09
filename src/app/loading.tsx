'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLoading } from '@/lib/loading-context';
import { Code, Users, Globe, Heart, Share2 } from 'lucide-react';

interface StoryStep {
  id: number;
  text: string;
  icon: React.ReactNode;
  position: { x: number; y: number };
}

interface PathPoint {
  x: number;
  y: number;
  angle: number;
}

const LoadingPage = () => {
  const { setIsLoading } = useLoading();
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [arrowPosition, setArrowPosition] = useState({ x: 0, y: 0, angle: 0 });
  const [currentTip, setCurrentTip] = useState('');
  
  // Performance optimization: Use refs to avoid unnecessary re-renders
  const animationFrameRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number | undefined>(undefined);
  const pathPointsRef = useRef<PathPoint[]>([]);
  const isSkippedRef = useRef(false);


  const githubTips = [
    "git stash - Temporarily save changes without committing",
    "git cherry-pick <commit> - Apply specific commit to current branch",
    "git bisect - Binary search to find the commit that introduced a bug",
    "git reflog - View history of HEAD changes, recover lost commits",
    "git rebase -i - Interactive rebase to squash, edit, or reorder commits",
    "git blame <file> - See who last modified each line of a file",
    "git clean -fd - Remove untracked files and directories",
    "git log --oneline --graph - Visual commit history in one line",
    "git diff --staged - See changes that are staged for commit",
    "git reset --soft HEAD~1 - Undo last commit but keep changes staged"
  ];

  // Story content positioned at zig-zag path edges
  const storySteps: StoryStep[] = [
    {
      id: 1,
      text: "Open Source is not just a term...",
      icon: <Code className="w-4 h-4" />,
      position: { x: 15, y: 20 }
    },
    {
      id: 2,
      text: "It's a philosophy of collaboration",
      icon: <Users className="w-4 h-4" />,
      position: { x: 85, y: 35 }
    },
    {
      id: 3,
      text: "Where innovation knows no boundaries",
      icon: <Globe className="w-4 h-4" />,
      position: { x: 15, y: 50 }
    },
    {
      id: 4,
      text: "Communities build the impossible",
      icon: <Globe className="w-4 h-4" />,
      position: { x: 85, y: 65 }
    },
    {
      id: 5,
      text: "Sharing knowledge creates abundance",
      icon: <Share2 className="w-4 h-4" />,
      position: { x: 15, y: 80 }
    },
    {
      id: 6,
      text: "FOSS: Freedom, Unity, Progress",
      icon: <Heart className="w-4 h-4" />,
      position: { x: 85, y: 95 }
    }
  ];

  // Calculate path points with angles for smooth arrow rotation
  const calculatePathPoints = useCallback(() => {
    const points: PathPoint[] = [];
    
    for (let i = 0; i < storySteps.length; i++) {
      const current = storySteps[i].position;
      const next = i < storySteps.length - 1 ? storySteps[i + 1].position : null;
      
      // Calculate angle to next point for arrow rotation
      let angle = 0;
      if (next) {
        const dx = next.x - current.x;
        const dy = next.y - current.y;
        angle = Math.atan2(dy, dx) * (180 / Math.PI);
      }
      
      points.push({
        x: current.x,
        y: current.y,
        angle: angle
      });
    }
    
    return points;
  }, [storySteps]);

  // Initialize path points
  useEffect(() => {
    pathPointsRef.current = calculatePathPoints();
  }, [calculatePathPoints]);

  // Ultra-optimized animation loop with minimal re-renders
  const animate = useCallback((timestamp: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
    }
    
    const elapsed = timestamp - startTimeRef.current;
    const duration = 10000; // 10 seconds
    const newProgress = Math.min((elapsed / duration) * 100, 100);
    
    // Update progress with smoother transitions
    setProgress(prev => {
      const diff = Math.abs(newProgress - prev);
      if (diff > 0.2) return newProgress; // Lower threshold for smoother progress
      return prev;
    });
    
    // Calculate current step based on progress
    const stepIndex = Math.floor((newProgress / 100) * storySteps.length);
    if (stepIndex !== currentStep && stepIndex < storySteps.length) {
      setCurrentStep(stepIndex);
    }
    
    // Calculate arrow position along path
    const pathProgress = newProgress / 100;
    const totalSegments = pathPointsRef.current.length - 1;
    
    if (totalSegments > 0) {
      const currentSegment = Math.min(Math.floor(pathProgress * totalSegments), totalSegments - 1);
      const segmentProgress = (pathProgress * totalSegments) % 1;
      
      const currentPoint = pathPointsRef.current[currentSegment];
      const nextPoint = pathPointsRef.current[currentSegment + 1] || currentPoint;
      
      // Interpolate position
      const x = currentPoint.x + (nextPoint.x - currentPoint.x) * segmentProgress;
      const y = currentPoint.y + (nextPoint.y - currentPoint.y) * segmentProgress;
      
      // Update arrow position with higher threshold
      setArrowPosition(prev => {
        const diff = Math.abs(x - prev.x) + Math.abs(y - prev.y);
        if (diff > 0.5) return { x, y, angle: currentPoint.angle };
        return prev;
      });
    }
    
    // Continue animation if not complete
    if (newProgress < 100 && !isSkippedRef.current) {
      animationFrameRef.current = requestAnimationFrame(animate);
    }
  }, [currentStep, storySteps.length]);

  // Start animation on mount
  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(animate);
    
    // Cleanup on unmount
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [animate]);

  // Random tip selection (only once on mount)
  useEffect(() => {
    const randomTip = githubTips[Math.floor(Math.random() * githubTips.length)];
    setCurrentTip(randomTip);
  }, []);

  const handleSkip = () => {
    isSkippedRef.current = true;
    setProgress(100);
    setCurrentStep(storySteps.length - 1);
  
    // Cancel any ongoing animation
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  
    // Move arrow to last point
    const last = pathPointsRef.current[pathPointsRef.current.length - 1];
    if (last) {
      setArrowPosition({ x: last.x, y: last.y, angle: last.angle });
    }

    // Immediately hide the global overlay
    setIsLoading(false);
  };
  

  // Generate SVG path for zig-zag line
  const generateZigZagPath = () => {
    if (storySteps.length === 0) return '';
    
    let pathData = `M ${storySteps[0].position.x} ${storySteps[0].position.y}`;
    
    for (let i = 1; i < storySteps.length; i++) {
      pathData += ` L ${storySteps[i].position.x} ${storySteps[i].position.y}`;
    }
    
    return pathData;
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col justify-between overflow-hidden z-50">
      {/* Main Content Area with 10vw margins */}
        {/* Skip Button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 z-50 px-4 py-2 bg-gray-800 text-green-400 border border-green-400 rounded hover:bg-green-700 transition-colors text-sm font-mono">
          Skip
        </button>

      <div className="relative flex-1 flex items-center justify-center px-8 py-16">
        <div className="absolute inset-0 mx-[10vw] my-8">
          {/* SVG Container for Path and Arrow */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {/* Gradient Definitions */}
            <defs>
              {/* Blue to Green Gradient for Path */}
              <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0066CC" />
                <stop offset="100%" stopColor="#00CC66" />
              </linearGradient>
              
              {/* Glow Filter */}
              <filter id="pathGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="0.3" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            {/* Dotted Zig-Zag Path */}
            <path
              d={generateZigZagPath()}
              stroke="url(#pathGradient)"
              strokeWidth="0.15"
              fill="none"
              strokeDasharray="0.8 0.4"
              filter="url(#pathGlow)"
              className="opacity-90"
            />
            
            {/* Optimized Animated Arrow Following Path */}
            <g
              transform={`translate(${arrowPosition.x}, ${arrowPosition.y}) rotate(${arrowPosition.angle})`}
              className="will-change-transform"
              style={{
                transform: `translate(${arrowPosition.x}px, ${arrowPosition.y}px) rotate(${arrowPosition.angle}deg)`,
                transition: 'none' // Remove CSS transitions for better performance
              }}
            >
              {/* Simplified SVG Arrowhead */}
              <path
                d="M -1.5 0 L 0 -1.5 L 1.5 0 L 0 1.5 Z"
                fill="url(#pathGradient)"
                filter="url(#pathGlow)"
                className="opacity-95"
              />
            </g>
          </svg>

          {/* Story Content Positioned at Path Points */}
          {storySteps.map((step, index) => (
            <div
              key={step.id}
              className={`absolute transition-all duration-500 ease-out will-change-transform ${
                index <= currentStep ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
              style={{
                left: `${step.position.x}%`,
                top: `${step.position.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div className="flex items-center space-x-2 px-3 py-2 bg-gray-900/80 rounded-lg backdrop-blur-sm border border-green-400/30">
                <div className="text-green-400 flex-shrink-0">
                  {step.icon}
                </div>
                <p className="text-green-300 text-xs md:text-sm font-medium whitespace-nowrap max-w-[180px] md:max-w-xs">
                  {step.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Optimized Matrix-Style Loader */}
      <div className="p-8 space-y-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <span className="text-green-400 text-sm font-mono">INITIALIZING SYSTEM</span>
            <span className="text-green-400 text-sm font-mono">{Math.round(progress)}%</span>
          </div>
          
          {/* Matrix-Style Loader */}
          <div className="relative h-16 bg-gray-900 rounded-lg overflow-hidden border border-green-500/30">
            {/* Background Grid */}
            <div className="absolute inset-0 opacity-20">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute top-0 w-px h-full bg-green-500"
                  style={{ left: `${(i / 20) * 100}%` }}
                />
              ))}
            </div>
            
            {/* Optimized Digital Rain Effect - Reduced for better performance */}
            <div className="absolute inset-0 overflow-hidden">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="matrix-line"
                  style={{
                    left: `${(i / 8) * 100}%`,
                    animationDelay: `${(i % 4) * 0.4}s`,
                  }}
                />
              ))}
            </div>

            
            {/* Smooth Progress Fill with Circuit Pattern */}
            <div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-600/80 via-green-500/80 to-green-400/80 will-change-transform"
              style={{ 
                width: `${progress}%`,
                transition: 'width 0.1s ease-out' // Smooth width transitions
              }}
            >
              {/* Optimized Circuit Pattern Overlay */}
              <div className="absolute inset-0 opacity-30">
                <svg className="w-full h-full" viewBox="0 0 100 16" style={{ pointerEvents: 'none' }}>
                  <defs>
                    <pattern id="circuit" x="0" y="0" width="8" height="6" patternUnits="userSpaceOnUse">
                      <path 
                        d="M0,3 L1.5,3 L1.5,1.5 L3,1.5 L3,4.5 L4.5,4.5 L4.5,3 L6,3 L6,1.5 L8,1.5" 
                        stroke="#00ff41" 
                        strokeWidth="0.3" 
                        fill="none"
                        opacity="0.6"
                      />
                    </pattern>
                  </defs>
                  <rect width="100" height="16" fill="url(#circuit)"/>
                </svg>
              </div>
              
              {/* Smooth Scanning Line */}
              <div className="absolute right-0 top-0 w-0.5 h-full bg-white opacity-90 progress-scan-line" />
            </div>
            
            {/* Simplified Hexagonal Progress Indicators */}
            <div className="absolute inset-0 flex items-center justify-between px-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 border border-green-400 transform rotate-45 transition-all duration-300 will-change-transform ${
                    progress > (i / 5) * 100 ? 'bg-green-400 shadow-green-glow' : 'bg-transparent'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Dynamic Status */}
          <div className="mt-4 text-center">
            <p className="text-green-500 text-xs font-mono">
              {progress < 30 ? 'LOADING CORE MODULES...' :
               progress < 60 ? 'ESTABLISHING CONNECTIONS...' :
               progress < 90 ? 'FINALIZING PROTOCOLS...' :
               'SYSTEM READY'}
            </p>
          </div>
        </div>

        {/* GitHub Pro Tip */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-900/50 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <span className="text-yellow-400 text-xs font-mono">PRO TIP</span>
            </div>
            <p className="text-gray-300 text-sm font-mono">
              {currentTip}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingPage;