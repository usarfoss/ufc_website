import { useId } from 'react';

export const GitGudSVG = () => {
  const idPrefix = useId();
  const gitGradientId = `${idPrefix}-gitGradient`;
  const codeGradientId = `${idPrefix}-codeGradient`;
  const terminalGradientId = `${idPrefix}-terminalGradient`;
  const glowGradientId = `${idPrefix}-glowGradient`;
  const gridPatternId = `${idPrefix}-gridPattern`;
  const arrowheadId = `${idPrefix}-arrowhead`;

  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 400 300"
      className="absolute inset-0"
      preserveAspectRatio="xMidYMid slice"
    >
      {/* Enhanced gradients and patterns */}
      <defs>
        <linearGradient id={gitGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="30%" stopColor="#ea580c" />
          <stop offset="70%" stopColor="#dc2626" />
          <stop offset="100%" stopColor="#991b1b" />
        </linearGradient>
        <linearGradient id={codeGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="50%" stopColor="#16a34a" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>
        <linearGradient id={terminalGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1f2937" />
          <stop offset="100%" stopColor="#111827" />
        </linearGradient>
        <radialGradient id={glowGradientId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <pattern id={gridPatternId} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#ffffff" strokeWidth="0.5" opacity="0.1"/>
        </pattern>
      </defs>
    
      {/* Background with grid pattern */}
      <rect width="100%" height="100%" fill={`url(#${gitGradientId})`} />
      <rect width="100%" height="100%" fill={`url(#${gridPatternId})`} />
    
      {/* Terminal windows */}
      <g transform="translate(50, 30)">
        <rect x="0" y="0" width="120" height="80" fill={`url(#${terminalGradientId})`} rx="8" stroke="#22c55e" strokeWidth="2" />
      <g fill="#22c55e">
        <circle cx="15" cy="15" r="3" />
        <circle cx="35" cy="15" r="3" />
        <circle cx="55" cy="15" r="3" />
      </g>
      <text x="10" y="35" fontSize="8" fill="#22c55e" fontFamily="monospace">$ git init</text>
      <text x="10" y="50" fontSize="8" fill="#22c55e" fontFamily="monospace">$ git add .</text>
      <text x="10" y="65" fontSize="8" fill="#22c55e" fontFamily="monospace">$ git commit</text>
    </g>
    
      <g transform="translate(230, 200)">
        <rect x="0" y="0" width="120" height="80" fill={`url(#${terminalGradientId})`} rx="8" stroke="#22c55e" strokeWidth="2" />
      <g fill="#22c55e">
        <circle cx="15" cy="15" r="3" />
        <circle cx="35" cy="15" r="3" />
        <circle cx="55" cy="15" r="3" />
      </g>
      <text x="10" y="35" fontSize="8" fill="#22c55e" fontFamily="monospace">$ git push</text>
      <text x="10" y="50" fontSize="8" fill="#22c55e" fontFamily="monospace">$ git pull</text>
      <text x="10" y="65" fontSize="8" fill="#22c55e" fontFamily="monospace">$ git merge</text>
    </g>
    
    {/* Enhanced Git branch visualization */}
    <g transform="translate(200, 150)">
      {/* Main branch line */}
      <path d="M-80 0 Q-40 -20 0 0 Q40 20 80 0" stroke="#ffffff" strokeWidth="4" fill="none" opacity="0.8" />
      
        {/* Branch nodes with glow */}
        <circle cx="-60" cy="-15" r="10" fill={`url(#${glowGradientId})`} />
        <circle cx="-20" cy="-5" r="12" fill={`url(#${glowGradientId})`} />
        <circle cx="20" cy="5" r="10" fill={`url(#${glowGradientId})`} />
        <circle cx="60" cy="-10" r="8" fill={`url(#${glowGradientId})`} />
      
      {/* Branch labels */}
      <text x="-60" y="-25" fontSize="7" fill="#ffffff" textAnchor="middle" fontWeight="bold">main</text>
      <text x="-20" y="-15" fontSize="7" fill="#ffffff" textAnchor="middle" fontWeight="bold">feature</text>
      <text x="20" y="15" fontSize="7" fill="#ffffff" textAnchor="middle" fontWeight="bold">dev</text>
      <text x="60" y="-20" fontSize="7" fill="#ffffff" textAnchor="middle" fontWeight="bold">hotfix</text>
      
      {/* Commit hashes */}
      <text x="-60" y="5" fontSize="6" fill="#ffffff" textAnchor="middle" opacity="0.7">a1b2c3d</text>
      <text x="-20" y="15" fontSize="6" fill="#ffffff" textAnchor="middle" opacity="0.7">e4f5g6h</text>
      <text x="20" y="25" fontSize="6" fill="#ffffff" textAnchor="middle" opacity="0.7">i7j8k9l</text>
      <text x="60" y="5" fontSize="6" fill="#ffffff" textAnchor="middle" opacity="0.7">m0n1o2p</text>
    </g>
    
    {/* GitHub logo and elements */}
    <g transform="translate(320, 50)">
      <rect x="0" y="0" width="60" height="60" fill="#24292e" rx="8" />
      <path d="M30 15c-8.3 0-15 6.7-15 15 0 6.6 4.3 12.2 10.3 14.2.8.1 1.1-.3 1.1-.7v-2.6c-4.2.9-5.1-2-5.1-2-.7-1.7-1.7-2.2-1.7-2.2-1.4-.9.1-.9.1-.9 1.5.1 2.3 1.5 2.3 1.5 1.3 2.3 3.5 1.6 4.4 1.2.1-.9.5-1.6.9-2-3.1-.4-6.4-1.6-6.4-7.1 0-1.6.6-2.9 1.5-3.9-.1-.4-.7-1.9.1-4 0 0 1.2-.4 4.1 1.5 1.2-.3 2.5-.5 3.8-.5 1.3 0 2.6.2 3.8.5 2.9-1.9 4.1-1.5 4.1-1.5.8 2.1.3 3.6.1 4 1 1 1.5 2.3 1.5 3.9 0 5.5-3.3 6.7-6.4 7.1.5.4.9 1.2.9 2.4v3.6c0 .4.3.8 1.1.7 6-2 10.3-7.6 10.3-14.2 0-8.3-6.7-15-15-15z" fill="#ffffff" />
    </g>
    
      {/* Code editor mockup */}
      <g transform="translate(20, 150)">
        <rect x="0" y="0" width="100" height="120" fill={`url(#${terminalGradientId})`} rx="6" stroke="#22c55e" strokeWidth="1" />
      <rect x="0" y="0" width="100" height="20" fill="#374151" rx="6" />
      <g fill="#22c55e">
        <circle cx="8" cy="10" r="2" />
        <circle cx="18" cy="10" r="2" />
        <circle cx="28" cy="10" r="2" />
      </g>
      <text x="5" y="35" fontSize="6" fill="#22c55e" fontFamily="monospace">function gitGud() &#123;</text>
      <text x="10" y="45" fontSize="6" fill="#ffffff" fontFamily="monospace">  console.log(&apos;Hello Git!&apos;);</text>
      <text x="10" y="55" fontSize="6" fill="#ffffff" fontFamily="monospace">  return &apos;Git Gud!&apos;;</text>
      <text x="5" y="65" fontSize="6" fill="#22c55e" fontFamily="monospace">&#125;</text>
      <text x="5" y="80" fontSize="6" fill="#22c55e" fontFamily="monospace">gitGud();</text>
    </g>
    
      {/* Floating code symbols with enhanced styling */}
      <g fill={`url(#${codeGradientId})`} opacity="0.8">
        <g transform="translate(80, 60)">
          <rect x="-8" y="-8" width="16" height="16" fill={`url(#${terminalGradientId})`} rx="3" />
        <text x="0" y="2" fontSize="10" fontFamily="monospace" textAnchor="middle" fill="#22c55e">&lt;/&gt;</text>
      </g>
        <g transform="translate(320, 80)">
          <rect x="-12" y="-6" width="24" height="12" fill={`url(#${terminalGradientId})`} rx="2" />
          <text x="0" y="2" fontSize="8" fontFamily="monospace" textAnchor="middle" fill="#22c55e">git</text>
        </g>
        <g transform="translate(60, 240)">
          <rect x="-15" y="-5" width="30" height="10" fill={`url(#${terminalGradientId})`} rx="2" />
          <text x="0" y="2" fontSize="7" fontFamily="monospace" textAnchor="middle" fill="#22c55e">commit</text>
        </g>
        <g transform="translate(320, 220)">
          <rect x="-10" y="-4" width="20" height="8" fill={`url(#${terminalGradientId})`} rx="2" />
          <text x="0" y="2" fontSize="6" fontFamily="monospace" textAnchor="middle" fill="#22c55e">push</text>
        </g>
    </g>
    
    {/* Enhanced floating particles with different sizes and glow effects */}
    <g fill="#ffffff" opacity="0.6">
      <circle cx="100" cy="50" r="3" />
      <circle cx="300" cy="70" r="2" />
      <circle cx="120" cy="250" r="1.5" />
      <circle cx="280" cy="180" r="4" />
      <circle cx="150" cy="100" r="2.5" />
      <circle cx="250" cy="120" r="1" />
      <circle cx="80" cy="200" r="3.5" />
      <circle cx="320" cy="150" r="2" />
      <circle cx="200" cy="80" r="1.5" />
      <circle cx="50" cy="120" r="2" />
      <circle cx="350" cy="120" r="2.5" />
    </g>
    
      {/* Additional code symbols floating around */}
      <g fill={`url(#${codeGradientId})`} opacity="0.5">
      <text x="180" y="40" fontSize="8" fontFamily="monospace">&lt;div&gt;</text>
      <text x="40" y="120" fontSize="6" fontFamily="monospace">npm</text>
      <text x="360" y="160" fontSize="7" fontFamily="monospace">yarn</text>
      <text x="140" y="280" fontSize="6" fontFamily="monospace">merge</text>
    </g>
    
    {/* Connection lines between elements */}
    <g stroke="#22c55e" strokeWidth="1" fill="none" opacity="0.4">
      <path d="M170 80 Q200 100 230 80" />
      <path d="M170 200 Q200 180 230 200" />
      <path d="M100 150 Q150 120 200 150" />
    </g>
    
      {/* Git workflow arrows */}
      <g stroke="#ffffff" strokeWidth="2" fill="none" opacity="0.5">
        <path d="M50 100 Q100 80 150 100" markerEnd={`url(#${arrowheadId})`} />
        <path d="M250 100 Q300 80 350 100" markerEnd={`url(#${arrowheadId})`} />
      </g>
      
      {/* Arrow marker definition */}
      <defs>
        <marker id={arrowheadId} markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#ffffff" />
        </marker>
      </defs>
    </svg>
  );
};
