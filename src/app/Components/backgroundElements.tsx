export function BackgroundElements() {
  return (
    <div className="fixed inset-0 pointer-events-none z-5">
      {/* Pixelated grid background */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(11, 135, 79, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(11, 135, 79, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Faint green text elements - More distributed */}
      <div className="absolute top-20 right-20 opacity-15 text-xs font-mono" style={{ color: '#0B874F' }}>
        {'> system.status: online'}
      </div>
      <div className="absolute bottom-40 left-20 opacity-15 text-xs font-mono" style={{ color: '#0B874F' }}>
        {'> data.stream: active'}
      </div>
      <div className="absolute top-1/3 right-1/4 opacity-15 text-xs font-mono" style={{ color: '#0B874F' }}>
        {'> network.nodes: 1,247'}
      </div>
      <div className="absolute top-1/4 left-1/5 opacity-12 text-xs font-mono" style={{ color: '#0B874F' }}>
        {'> contributors.global: 892,341'}
      </div>
      <div className="absolute bottom-1/3 right-1/5 opacity-12 text-xs font-mono" style={{ color: '#0B874F' }}>
        {'> commits.today: 45,892'}
      </div>
      <div className="absolute top-2/3 left-1/3 opacity-12 text-xs font-mono" style={{ color: '#0B874F' }}>
        {'> repositories.active: 234,567'}
      </div>
      <div className="absolute bottom-1/4 right-2/3 opacity-12 text-xs font-mono" style={{ color: '#0B874F' }}>
        {'> pull_requests.merged: 12,834'}
      </div>

      {/* Faint green lines - More comprehensive */}
      <div 
        className="absolute top-0 left-1/4 w-px h-full opacity-8"
        style={{ backgroundColor: '#0B874F' }}
      />
      <div 
        className="absolute top-0 right-1/3 w-px h-full opacity-8"
        style={{ backgroundColor: '#0B874F' }}
      />
      <div 
        className="absolute top-0 left-2/3 w-px h-full opacity-6"
        style={{ backgroundColor: '#0B874F' }}
      />
      <div 
        className="absolute top-1/4 left-0 w-full h-px opacity-8"
        style={{ backgroundColor: '#0B874F' }}
      />
      <div 
        className="absolute top-2/3 left-0 w-full h-px opacity-6"
        style={{ backgroundColor: '#0B874F' }}
      />

      {/* Circular lines */}
      <div className="absolute top-1/5 left-1/6 opacity-10">
        <svg width="80" height="80" fill="none" stroke="#0B874F" strokeWidth="1">
          <circle cx="40" cy="40" r="35"/>
        </svg>
      </div>
      <div className="absolute bottom-1/4 right-1/4 opacity-8">
        <svg width="60" height="60" fill="none" stroke="#0B874F" strokeWidth="1">
          <circle cx="30" cy="30" r="25"/>
        </svg>
      </div>
      <div className="absolute top-1/2 right-1/6 opacity-12">
        <svg width="100" height="100" fill="none" stroke="#0B874F" strokeWidth="1">
          <circle cx="50" cy="50" r="45"/>
          <circle cx="50" cy="50" r="25"/>
        </svg>
      </div>

      {/* Faint green icons - More variety */}
      <div className="absolute top-32 left-1/3 opacity-12">
        <svg width="20" height="20" fill="#0B874F" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 1v6m0 10v6m11-7h-6m-10 0H1"/>
        </svg>
      </div>
      <div className="absolute bottom-32 right-1/3 opacity-12">
        <svg width="20" height="20" fill="#0B874F" viewBox="0 0 24 24">
          <polygon points="12 2 15.09 8.26 22 9 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9 8.91 8.26 12 2"/>
        </svg>
      </div>
      <div className="absolute top-1/2 left-1/5 opacity-10">
        <svg width="18" height="18" fill="#0B874F" viewBox="0 0 24 24">
          <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
        </svg>
      </div>
      <div className="absolute bottom-1/5 left-2/3 opacity-10">
        <svg width="22" height="22" fill="#0B874F" viewBox="0 0 24 24">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      </div>
      <div className="absolute top-3/4 right-1/5 opacity-10">
        <svg width="16" height="16" fill="#0B874F" viewBox="0 0 24 24">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
        </svg>
      </div>
      <div className="absolute top-1/6 right-2/5 opacity-12">
        <svg width="24" height="24" fill="#0B874F" viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      </div>
    </div>
  )
}
