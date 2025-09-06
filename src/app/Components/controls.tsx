'use client'

export function Controls() {
  return (
    <div className="absolute right-8 top-1/2 transform -translate-y-1/2 z-20">
      <div className="flex flex-col gap-3">
        <button 
          className="w-12 h-12 border-2 rounded flex items-center justify-center font-mono text-lg font-bold transition-colors"
          style={{ 
            backgroundColor: '#1A1A1A', 
            borderColor: '#0B874F',
            color: '#0B874F'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#0B874F'
            e.currentTarget.style.color = '#1A1A1A'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#1A1A1A'
            e.currentTarget.style.color = '#0B874F'
          }}
        >
          +
        </button>
        <button 
          className="w-12 h-12 border-2 rounded flex items-center justify-center font-mono text-lg font-bold transition-colors"
          style={{ 
            backgroundColor: '#1A1A1A', 
            borderColor: '#0B874F',
            color: '#0B874F'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#0B874F'
            e.currentTarget.style.color = '#1A1A1A'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#1A1A1A'
            e.currentTarget.style.color = '#0B874F'
          }}
        >
          −
        </button>
        <button 
          className="w-12 h-12 border-2 rounded flex items-center justify-center font-mono transition-colors"
          style={{ 
            backgroundColor: '#1A1A1A', 
            borderColor: '#0B874F',
            color: '#0B874F'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#0B874F'
            e.currentTarget.style.color = '#1A1A1A'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#1A1A1A'
            e.currentTarget.style.color = '#0B874F'
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
        </button>
      </div>
    </div>
  )
}
