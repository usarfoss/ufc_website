"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trophy, Clock, Users, Target } from 'lucide-react';

interface ActiveBootcamp {
  id: string;
  name: string;
  description: string;
  type: 'LEETCODE' | 'GITHUB';
  startDate: string;
  endDate: string;
  _count: {
    participants: number;
  };
}

export default function ActiveBootcampBanner() {
  const [bootcamp, setBootcamp] = useState<ActiveBootcamp | null>(null);
  const [timeRemaining, setTimeRemaining] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchActiveBootcamp();
  }, []);

  useEffect(() => {
    if (bootcamp) {
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const end = new Date(bootcamp.endDate).getTime();
        const distance = end - now;

        if (distance > 0) {
          const days = Math.floor(distance / (1000 * 60 * 60 * 24));
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          setTimeRemaining(`${days}d ${hours}h ${minutes}m`);
        } else {
          setTimeRemaining('Ended');
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [bootcamp]);

  const fetchActiveBootcamp = async () => {
    try {
      const response = await fetch('/api/bootcamps/active');
      if (response.ok) {
        const data = await response.json();
        setBootcamp(data.bootcamp);
      }
    } catch (error) {
      console.error('Error fetching active bootcamp:', error);
    }
  };

  if (!bootcamp) return null;

  return (
    <div className="bg-[#0B874F]/10 border border-[#0B874F]/30 p-6 rounded-lg mb-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <h2 className="text-xl font-bold text-white">
              {bootcamp.name} - Active Competition
            </h2>
          </div>
          <p className="text-gray-400 mb-3">{bootcamp.description}</p>
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2 text-gray-300">
              <Clock className="w-4 h-4" />
              <span>{timeRemaining}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-300">
              <Users className="w-4 h-4" />
              <span>{bootcamp._count.participants} participants</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-300">
              <Target className="w-4 h-4" />
              <span>{bootcamp.type}</span>
            </div>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => router.push(`/bootcamp/${bootcamp.id}/leaderboard`)}
            className="bg-[#0B874F] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#0B874F]/80 transition-colors flex items-center space-x-2"
          >
            <Trophy className="w-4 h-4" />
            <span>Leaderboard</span>
          </button>
          <button
            onClick={() => router.push(`/bootcamp/${bootcamp.id}/register`)}
            className="bg-[#0B874F]/20 text-[#0B874F] border border-[#0B874F]/30 px-6 py-2 rounded-lg font-medium hover:bg-[#0B874F]/30 transition-colors"
          >
            Join Now
          </button>
        </div>
      </div>
    </div>
  );
}
