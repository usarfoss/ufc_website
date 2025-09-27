export const FossForgeSVG = () => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 400 300"
    className="absolute inset-0"
    preserveAspectRatio="xMidYMid slice"
  >
    {/* Enhanced gradients and patterns */}
    <defs>
      <linearGradient id="forgeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0f172a" />
        <stop offset="30%" stopColor="#1e40af" />
        <stop offset="70%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#60a5fa" />
      </linearGradient>
      <linearGradient id="fireGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fbbf24" />
        <stop offset="50%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#d97706" />
      </linearGradient>
      <linearGradient id="metalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6b7280" />
        <stop offset="50%" stopColor="#4b5563" />
        <stop offset="100%" stopColor="#374151" />
      </linearGradient>
      <radialGradient id="glowGradient" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
      </radialGradient>
      <pattern id="circuitPattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 0 20 L 20 20 L 20 0 M 20 20 L 40 20" fill="none" stroke="#3b82f6" strokeWidth="1" opacity="0.3"/>
      </pattern>
    </defs>
    
    {/* Background with circuit pattern */}
    <rect width="100%" height="100%" fill="url(#forgeGradient)" />
    <rect width="100%" height="100%" fill="url(#circuitPattern)" />
    
    {/* Central forge with enhanced details */}
    <g transform="translate(200, 150)">
      {/* Forge base with multiple layers */}
      <rect x="-50" y="30" width="100" height="25" fill="url(#metalGradient)" rx="8" />
      <rect x="-45" y="25" width="90" height="30" fill="url(#metalGradient)" rx="6" />
      <rect x="-40" y="20" width="80" height="35" fill="url(#metalGradient)" rx="4" />
      
      {/* Anvil with detailed structure */}
      <rect x="-35" y="0" width="70" height="25" fill="url(#metalGradient)" rx="3" />
      <rect x="-30" y="-5" width="60" height="30" fill="url(#metalGradient)" rx="2" />
      
      {/* Forge flames */}
      <g fill="url(#fireGradient)" opacity="0.9">
        <ellipse cx="-20" cy="10" rx="8" ry="15" />
        <ellipse cx="0" cy="5" rx="10" ry="18" />
        <ellipse cx="20" cy="10" rx="8" ry="15" />
      </g>
      
      {/* Enhanced hammer */}
      <g transform="rotate(-25)">
        <rect x="25" y="-8" width="50" height="12" fill="url(#metalGradient)" rx="3" />
        <rect x="70" y="-12" width="20" height="20" fill="url(#metalGradient)" rx="4" />
        <rect x="75" y="-15" width="10" height="26" fill="#1f2937" rx="2" />
      </g>
      
      {/* Enhanced sparks with trails */}
      <g fill="url(#fireGradient)" opacity="0.9">
        <circle cx="-25" cy="-5" r="3" />
        <circle cx="5" cy="-10" r="2.5" />
        <circle cx="-10" cy="-15" r="2" />
        <circle cx="30" cy="-5" r="2.5" />
        <circle cx="15" cy="-20" r="1.5" />
        <circle cx="-30" cy="-8" r="2" />
      </g>
      
      {/* Spark trails */}
      <g stroke="url(#fireGradient)" strokeWidth="1" fill="none" opacity="0.6">
        <path d="M-25 -5 L-35 -15" />
        <path d="M5 -10 L-5 -25" />
        <path d="M30 -5 L40 -15" />
      </g>
    </g>
    
    {/* Competition arena with multiple elements */}
    <g transform="translate(80, 80)">
      {/* Trophy with enhanced details */}
      <rect x="-10" y="0" width="20" height="25" fill="url(#fireGradient)" rx="3" />
      <rect x="-15" y="25" width="30" height="10" fill="url(#fireGradient)" rx="2" />
      <circle cx="0" y="-8" r="8" fill="url(#fireGradient)" />
      <circle cx="0" y="-8" r="4" fill="#ffffff" opacity="0.8" />
      <text x="0" y="-5" fontSize="6" fill="#1f2937" textAnchor="middle" fontWeight="bold">1</text>
    </g>
    
    {/* Enhanced leaderboard */}
    <g transform="translate(320, 100)">
      <rect x="0" y="0" width="70" height="100" fill="url(#metalGradient)" rx="8" stroke="#3b82f6" strokeWidth="2" />
      <rect x="0" y="0" width="70" height="20" fill="#1e40af" rx="8" />
      <text x="35" y="15" fontSize="8" fill="#ffffff" textAnchor="middle" fontWeight="bold">LEADERBOARD</text>
      
      {/* Team rankings */}
      <g fill="#ffffff" fontSize="7">
        <text x="10" y="35" textAnchor="start">#1 Team Alpha</text>
        <text x="10" y="50" textAnchor="start">#2 Team Beta</text>
        <text x="10" y="65" textAnchor="start">#3 Team Gamma</text>
        <text x="10" y="80" textAnchor="start">#4 Team Delta</text>
      </g>
      
      {/* Score indicators */}
      <g fill="url(#fireGradient)">
        <rect x="50" y="25" width="15" height="8" rx="2" />
        <rect x="50" y="40" width="12" height="8" rx="2" />
        <rect x="50" y="55" width="10" height="8" rx="2" />
        <rect x="50" y="70" width="8" height="8" rx="2" />
      </g>
    </g>
    
    {/* Competition stages visualization */}
    <g transform="translate(50, 200)">
      <rect x="0" y="0" width="80" height="60" fill="url(#metalGradient)" rx="6" stroke="#3b82f6" strokeWidth="1" />
      <text x="40" y="15" fontSize="8" fill="#ffffff" textAnchor="middle" fontWeight="bold">STAGES</text>
      
      {/* Stage indicators */}
      <g fill="url(#fireGradient)" opacity="0.8">
        <rect x="5" y="25" width="70" height="6" rx="3" />
        <rect x="5" y="35" width="50" height="6" rx="3" />
        <rect x="5" y="45" width="30" height="6" rx="3" />
      </g>
      
      <text x="5" y="25" fontSize="6" fill="#1f2937">Repo Sprint</text>
      <text x="5" y="35" fontSize="6" fill="#1f2937">YAML Battle</text>
      <text x="5" y="45" fontSize="6" fill="#1f2937">Git Clash</text>
    </g>
    
    {/* GitHub integration panel */}
    <g transform="translate(300, 200)">
      <rect x="0" y="0" width="80" height="60" fill="#24292e" rx="6" stroke="#3b82f6" strokeWidth="1" />
      <text x="40" y="15" fontSize="8" fill="#ffffff" textAnchor="middle" fontWeight="bold">GITHUB</text>
      
      {/* GitHub stats */}
      <g fill="#ffffff" fontSize="6">
        <text x="5" y="30">Commits: 1,247</text>
        <text x="5" y="40">PRs: 89</text>
        <text x="5" y="50">Issues: 23</text>
      </g>
    </g>
    
    {/* Enhanced floating code symbols */}
    <g fill="url(#fireGradient)" opacity="0.8">
      <g transform="translate(50, 200)">
        <rect x="-12" y="-6" width="24" height="12" fill="url(#metalGradient)" rx="3" stroke="#3b82f6" strokeWidth="1" />
        <text x="0" y="2" fontSize="8" fontFamily="monospace" textAnchor="middle" fill="#ffffff">FOSS</text>
      </g>
      <g transform="translate(300, 180)">
        <rect x="-15" y="-6" width="30" height="12" fill="url(#metalGradient)" rx="3" stroke="#3b82f6" strokeWidth="1" />
        <text x="0" y="2" fontSize="8" fontFamily="monospace" textAnchor="middle" fill="#ffffff">FORGE</text>
      </g>
      <g transform="translate(150, 50)">
        <rect x="-10" y="-5" width="20" height="10" fill="url(#metalGradient)" rx="2" stroke="#3b82f6" strokeWidth="1" />
        <text x="0" y="2" fontSize="6" fontFamily="monospace" textAnchor="middle" fill="#ffffff">2025</text>
      </g>
    </g>
    
    {/* Competition elements floating around */}
    <g fill="#ffffff" opacity="0.6">
      <circle cx="120" cy="60" r="3" />
      <circle cx="280" cy="40" r="2.5" />
      <circle cx="60" cy="180" r="2" />
      <circle cx="340" cy="200" r="3.5" />
      <circle cx="150" cy="100" r="2" />
      <circle cx="250" cy="120" r="1.5" />
      <circle cx="80" cy="200" r="2.5" />
      <circle cx="320" cy="150" r="3" />
      <circle cx="200" cy="80" r="2" />
      <circle cx="50" cy="120" r="1.5" />
      <circle cx="350" cy="120" r="2" />
    </g>
    
    {/* Additional competition symbols */}
    <g fill="url(#fireGradient)" opacity="0.6">
      <text x="180" y="40" fontSize="8" fontFamily="monospace">HACK</text>
      <text x="40" y="120" fontSize="6" fontFamily="monospace">CODE</text>
      <text x="360" y="160" fontSize="7" fontFamily="monospace">BUILD</text>
      <text x="140" y="280" fontSize="6" fontFamily="monospace">WIN</text>
    </g>
    
    {/* Enhanced energy lines with animation effect */}
    <g stroke="url(#fireGradient)" strokeWidth="2" fill="none" opacity="0.7">
      <path d="M0 150 Q100 120 200 150 Q300 180 400 150" />
      <path d="M0 200 Q100 170 200 200 Q300 230 400 200" />
      <path d="M0 100 Q100 80 200 100 Q300 120 400 100" />
    </g>
    
    {/* Competition arrows and flow indicators */}
    <g stroke="#3b82f6" strokeWidth="2" fill="none" opacity="0.6">
      <path d="M50 100 Q100 80 150 100" markerEnd="url(#arrowhead)" />
      <path d="M250 100 Q300 80 350 100" markerEnd="url(#arrowhead)" />
      <path d="M100 250 Q200 220 300 250" markerEnd="url(#arrowhead)" />
    </g>
    
    {/* Arrow marker definition */}
    <defs>
      <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
      </marker>
    </defs>
    
    {/* Competition timer/clock */}
    <g transform="translate(200, 50)">
      <circle cx="0" cy="0" r="25" fill="url(#metalGradient)" stroke="#3b82f6" strokeWidth="2" />
      <circle cx="0" cy="0" r="20" fill="url(#fireGradient)" opacity="0.3" />
      <text x="0" y="5" fontSize="10" fill="#ffffff" textAnchor="middle" fontWeight="bold">24H</text>
      <text x="0" y="15" fontSize="6" fill="#ffffff" textAnchor="middle">COMPETITION</text>
    </g>
  </svg>
);
