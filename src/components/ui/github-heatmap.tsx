'use client';

import React, { useState, useEffect } from 'react';

interface Contribution {
  date: string;
  count: number;
  color: string;
}

interface GitHubHeatmapProps {
  username?: string;
}

const GitHubHeatmap: React.FC<GitHubHeatmapProps> = ({ username }) => {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredDay, setHoveredDay] = useState<{ date: string; count: number } | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    fetchContributions();
  }, [username]);

  const fetchContributions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/contributions');
      if (response.ok) {
        const data = await response.json();
        setContributions(data.contributions || []);
      }
    } catch (error) {
      console.error('Error fetching contributions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMouseEnter = (e: React.MouseEvent, contribution: Contribution) => {
    setHoveredDay({ date: contribution.date, count: contribution.count });
    setTooltipPosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (hoveredDay) {
      setTooltipPosition({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseLeave = () => {
    setHoveredDay(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Get the last 365 days of contributions
  const recentContributions = contributions.slice(-365);
  
  // Group by weeks (7 days per week, ~52 weeks)
  const weeks: Contribution[][] = [];
  for (let i = 0; i < recentContributions.length; i += 7) {
    weeks.push(recentContributions.slice(i, i + 7));
  }

  // Get intensity level for color
  const getIntensity = (count: number) => {
    if (count === 0) return 0;
    if (count <= 2) return 1;
    if (count <= 5) return 2;
    if (count <= 10) return 3;
    return 4;
  };

  // Color scale similar to GitHub (green theme)
  const getColor = (count: number, originalColor: string) => {
    const intensity = getIntensity(count);
    const colors = [
      '#161b22', // No contributions
      'rgba(0, 255, 65, 0.2)', // 1-2 contributions
      'rgba(0, 255, 65, 0.4)', // 3-5 contributions
      'rgba(0, 255, 65, 0.6)', // 6-10 contributions
      'rgba(0, 255, 65, 0.8)', // 11+ contributions
    ];
    return colors[intensity];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-[#00ff41] text-sm">Loading heatmap...</div>
      </div>
    );
  }

  if (contributions.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-400 text-sm">No contribution data available</div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="overflow-x-auto">
        <div className="inline-flex gap-1 p-2">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((contribution, dayIndex) => {
                const count = contribution.count;
                const color = getColor(count, contribution.color);
                const date = contribution.date;
                
                return (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className="w-3 h-3 rounded-sm cursor-pointer transition-all duration-150 hover:scale-125 hover:z-10 hover:ring-2 hover:ring-[#00ff41]/50"
                    style={{
                      backgroundColor: color,
                      border: count > 0 ? `1px solid rgba(0, 255, 65, 0.3)` : '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                    onMouseEnter={(e) => handleMouseEnter(e, contribution)}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    title={`${count} contributions on ${formatDate(date)}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Tooltip */}
      {hoveredDay && (
        <div
          className="fixed z-50 px-3 py-2 bg-black/90 border border-[#00ff41]/50 rounded-lg pointer-events-none matrix-font text-sm"
          style={{
            left: `${tooltipPosition.x + 10}px`,
            top: `${tooltipPosition.y - 10}px`,
            transform: 'translateY(-100%)',
            boxShadow: '0 0 10px rgba(0, 255, 65, 0.3)',
          }}
        >
          <div className="text-[#00ff41] font-bold">
            {hoveredDay.count} {hoveredDay.count === 1 ? 'contribution' : 'contributions'}
          </div>
          <div className="text-gray-400 text-xs mt-1">
            {formatDate(hoveredDay.date)}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-between mt-4 text-xs text-gray-400">
        <span>Less</span>
        <div className="flex gap-1 mx-2">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'rgba(0, 255, 65, 0.2)' }}></div>
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'rgba(0, 255, 65, 0.4)' }}></div>
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'rgba(0, 255, 65, 0.6)' }}></div>
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'rgba(0, 255, 65, 0.8)' }}></div>
        </div>
        <span>More</span>
      </div>
    </div>
  );
};

export default GitHubHeatmap;

