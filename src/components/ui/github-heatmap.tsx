"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface GitHubHeatmapProps {
  username: string;
  className?: string;
}

interface ContributionDay {
  date: string;
  count: number;
  level: number;
}

export default function GitHubHeatmap({ username, className = '' }: GitHubHeatmapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ContributionDay[]>([]);

  useEffect(() => {
    if (!username) {
      setError('No GitHub username provided');
      setLoading(false);
      return;
    }

    fetchContributions();
  }, [username]);

  const fetchContributions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/github/contributions?username=${username}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch GitHub contributions');
      }

      const result = await response.json();
      setData(result.contributions || []);
    } catch (err) {
      console.error('Error fetching GitHub contributions:', err);
      setError('Unable to load contribution data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!data.length || !svgRef.current) return;

    renderHeatmap();
  }, [data]);

  const renderHeatmap = () => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const cellSize = 12;
    const cellGap = 3;
    const weeks = 53;
    const days = 7;
    
    const width = weeks * (cellSize + cellGap);
    const height = days * (cellSize + cellGap) + 20;

    svg.attr('width', '100%')
       .attr('height', height)
       .attr('viewBox', `0 0 ${width} ${height}`)
       .attr('preserveAspectRatio', 'xMinYMin meet');

    const g = svg.append('g').attr('transform', 'translate(0, 20)');

    // Color scale
    const colorScale = d3.scaleQuantize<string>()
      .domain([0, d3.max(data, d => d.count) || 10])
      .range(['#0e4429', '#006d32', '#26a641', '#39d353']);

    // Group data by week
    const dataByDate = new Map(data.map(d => [d.date, d]));
    
    // Generate last 365 days
    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(today.getFullYear() - 1);

    const cells: { date: Date; count: number; week: number; day: number }[] = [];
    
    for (let i = 0; i < 365; i++) {
      const date = new Date(oneYearAgo);
      date.setDate(oneYearAgo.getDate() + i);
      
      const dateStr = date.toISOString().split('T')[0];
      const dayData = dataByDate.get(dateStr);
      
      const dayOfWeek = date.getDay();
      const weekNumber = Math.floor(i / 7);
      
      cells.push({
        date,
        count: dayData?.count || 0,
        week: weekNumber,
        day: dayOfWeek
      });
    }

    // Create tooltip
    const tooltip = d3.select('body')
      .append('div')
      .attr('class', 'github-heatmap-tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background-color', 'rgba(0, 0, 0, 0.9)')
      .style('color', 'white')
      .style('padding', '8px 12px')
      .style('border-radius', '6px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('z-index', '1000')
      .style('border', '1px solid rgba(11, 135, 79, 0.5)');

    // Draw cells
    g.selectAll('rect')
      .data(cells)
      .enter()
      .append('rect')
      .attr('x', d => d.week * (cellSize + cellGap))
      .attr('y', d => d.day * (cellSize + cellGap))
      .attr('width', cellSize)
      .attr('height', cellSize)
      .attr('rx', 2)
      .attr('fill', d => d.count === 0 ? '#161b22' : colorScale(d.count))
      .attr('stroke', 'rgba(11, 135, 79, 0.2)')
      .attr('stroke-width', 1)
      .on('mouseover', function(event, d) {
        d3.select(this)
          .attr('stroke', '#0B874F')
          .attr('stroke-width', 2);
        
        tooltip
          .style('visibility', 'visible')
          .html(`
            <div>
              <strong>${d.count} contribution${d.count !== 1 ? 's' : ''}</strong><br/>
              ${d.date.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
            </div>
          `);
      })
      .on('mousemove', function(event) {
        tooltip
          .style('top', (event.pageY - 10) + 'px')
          .style('left', (event.pageX + 10) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('stroke', 'rgba(11, 135, 79, 0.2)')
          .attr('stroke-width', 1);
        
        tooltip.style('visibility', 'hidden');
      });

    // Add month labels
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthLabels = svg.append('g').attr('transform', 'translate(0, 10)');
    
    let currentMonth = oneYearAgo.getMonth();
    let monthX = 0;
    
    for (let week = 0; week < weeks; week++) {
      const date = new Date(oneYearAgo);
      date.setDate(oneYearAgo.getDate() + week * 7);
      const month = date.getMonth();
      
      if (month !== currentMonth) {
        monthLabels.append('text')
          .attr('x', monthX)
          .attr('y', 0)
          .attr('fill', '#8b949e')
          .attr('font-size', '10px')
          .text(months[currentMonth]);
        
        currentMonth = month;
        monthX = week * (cellSize + cellGap);
      }
    }

    // Cleanup tooltip on unmount
    return () => {
      tooltip.remove();
    };
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0B874F]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center p-8 ${className}`}>
        <p className="text-gray-400 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="w-full overflow-hidden">
        <svg ref={svgRef} className="max-w-full h-auto"></svg>
      </div>
      <div className="flex items-center justify-end mt-4 space-x-2 text-xs text-gray-400">
        <span>Less</span>
        <div className="flex space-x-1">
          <div className="w-3 h-3 rounded-sm bg-[#161b22] border border-gray-700"></div>
          <div className="w-3 h-3 rounded-sm bg-[#0e4429]"></div>
          <div className="w-3 h-3 rounded-sm bg-[#006d32]"></div>
          <div className="w-3 h-3 rounded-sm bg-[#26a641]"></div>
          <div className="w-3 h-3 rounded-sm bg-[#39d353]"></div>
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
