"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Trophy, Medal, TrendingUp, Clock, Users, Target, RefreshCw } from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  user: {
    name: string;
    username: string;
    avatar: string | null;
  };
  registeredAt: string;
  baselineStats: any;
  currentStats: any;
  progressStats: any;
  points: number;
  finalRank: number | null;
}

interface Bootcamp {
  id: string;
  name: string;
  description: string;
  type: 'LEETCODE' | 'GITHUB';
  status: string;
  startDate: string;
  endDate: string;
}

export default function BootcampLeaderboardPage() {
  const router = useRouter();
  const params = useParams();
  const bootcampId = params.id as string;

  const [bootcamp, setBootcamp] = useState<Bootcamp | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [bootcampId]);

  useEffect(() => {
    if (bootcamp && bootcamp.status === 'ACTIVE') {
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const end = new Date(bootcamp.endDate).getTime();
        const distance = end - now;

        if (distance > 0) {
          const days = Math.floor(distance / (1000 * 60 * 60 * 24));
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);
          setTimeRemaining(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        } else {
          setTimeRemaining('Ended');
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [bootcamp]);

  const fetchLeaderboard = async () => {
    try {
      if (!loading) setRefreshing(true);
      
      const response = await fetch(`/api/bootcamps/${bootcampId}/leaderboard`);
      if (response.ok) {
        const data = await response.json();
        setBootcamp(data.bootcamp);
        setLeaderboard(data.leaderboard || []);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getRankIcon = (rank: number) => {
    return `#${rank}`;
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      case 2: return 'text-gray-300 bg-gray-300/10 border-gray-300/30';
      case 3: return 'text-orange-400 bg-orange-400/10 border-orange-400/30';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
    }
  };

  const formatProgress = (progressStats: any, type: string) => {
    if (!progressStats) return 'No progress yet';
    
    if (type === 'LEETCODE') {
      const { easy = 0, medium = 0, hard = 0 } = progressStats;
      return `${easy}E / ${medium}M / ${hard}H`;
    } else {
      const { commits = 0, pullRequests = 0, issues = 0 } = progressStats;
      return `${commits}C / ${pullRequests}PR / ${issues}I`;
    }
  };

  const getTypeEmoji = (type: string) => {
    return type === 'LEETCODE' ? '💻' : '🚀';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (!bootcamp) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-bold text-white mb-2">Bootcamp Not Found</h2>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 transition-colors font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-black/60 to-yellow-500/10 backdrop-blur-sm border border-yellow-500/30 rounded-xl p-8 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <span className="text-5xl">{getTypeEmoji(bootcamp.type)}</span>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">{bootcamp.name}</h1>
                <p className="text-gray-300 text-lg">{bootcamp.description}</p>
              </div>
            </div>
            <button
              onClick={fetchLeaderboard}
              disabled={refreshing}
              className="p-3 bg-yellow-500/20 text-yellow-500 rounded-lg hover:bg-yellow-500/30 transition-colors disabled:opacity-50"
              title="Refresh leaderboard"
            >
              <RefreshCw className={`w-6 h-6 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-black/40 rounded-lg p-4 border border-yellow-500/20">
              <div className="flex items-center space-x-2 mb-1">
                <Target className="w-4 h-4 text-yellow-500" />
                <span className="text-gray-400 text-sm">Status</span>
              </div>
              <p className="text-white font-bold text-lg">{bootcamp.status}</p>
            </div>

            <div className="bg-black/40 rounded-lg p-4 border border-yellow-500/20">
              <div className="flex items-center space-x-2 mb-1">
                <Users className="w-4 h-4 text-yellow-500" />
                <span className="text-gray-400 text-sm">Participants</span>
              </div>
              <p className="text-white font-bold text-lg">{leaderboard.length}</p>
            </div>

            <div className="bg-black/40 rounded-lg p-4 border border-yellow-500/20">
              <div className="flex items-center space-x-2 mb-1">
                <Clock className="w-4 h-4 text-yellow-500" />
                <span className="text-gray-400 text-sm">Time Remaining</span>
              </div>
              <p className="text-white font-bold text-lg">{timeRemaining || 'Calculating...'}</p>
            </div>

            <div className="bg-black/40 rounded-lg p-4 border border-yellow-500/20">
              <div className="flex items-center space-x-2 mb-1">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <span className="text-gray-400 text-sm">Type</span>
              </div>
              <p className="text-white font-bold text-lg">{bootcamp.type}</p>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-black/40 backdrop-blur-sm border border-yellow-500/30 rounded-xl overflow-hidden">
          <div className="bg-yellow-500/10 border-b border-yellow-500/30 p-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <Trophy className="w-6 h-6 mr-2 text-yellow-500" />
              Live Leaderboard
            </h2>
            <p className="text-gray-400 text-sm mt-1">Updates automatically every minute</p>
          </div>

          {leaderboard.length > 0 ? (
            <>
              <div className="divide-y divide-yellow-500/10">
                {leaderboard
                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                  .map((entry) => (
                <div
                  key={entry.rank}
                  className={`p-6 hover:bg-yellow-500/5 transition-colors ${
                    entry.rank <= 3 ? 'bg-yellow-500/5' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    {/* Rank & User Info */}
                    <div className="flex items-center space-x-4 flex-1">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold border-2 ${getRankColor(entry.rank)}`}>
                        {getRankIcon(entry.rank)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-1">
                          <h3 className="text-xl font-bold text-white">{entry.user.name}</h3>
                          <span className="text-gray-400 text-sm">@{entry.user.username}</span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <span>Progress: {formatProgress(entry.progressStats, bootcamp.type)}</span>
                          <span>•</span>
                          <span>Joined {new Date(entry.registeredAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Points */}
                    <div className="text-right">
                      <div className="text-3xl font-bold text-yellow-500">{entry.points}</div>
                      <div className="text-sm text-gray-400">points</div>
                    </div>
                  </div>
                </div>
                  ))}
              </div>

              {/* Pagination */}
              {leaderboard.length > itemsPerPage && (
                <div className="flex items-center justify-between p-6 border-t border-yellow-500/10">
                  <div className="text-sm text-gray-400">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, leaderboard.length)} of {leaderboard.length} participants
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-yellow-500/20 text-yellow-500 rounded-lg hover:bg-yellow-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.ceil(leaderboard.length / itemsPerPage) }, (_, i) => i + 1)
                        .filter(page => {
                          // Show first, last, current, and adjacent pages
                          const totalPages = Math.ceil(leaderboard.length / itemsPerPage);
                          return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
                        })
                        .map((page, index, array) => (
                          <React.Fragment key={page}>
                            {index > 0 && array[index - 1] !== page - 1 && (
                              <span className="px-2 text-gray-400">...</span>
                            )}
                            <button
                              onClick={() => setCurrentPage(page)}
                              className={`w-10 h-10 rounded-lg transition-colors ${
                                currentPage === page
                                  ? 'bg-yellow-500 text-black'
                                  : 'bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30'
                              }`}
                            >
                              {page}
                            </button>
                          </React.Fragment>
                        ))}
                    </div>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(Math.ceil(leaderboard.length / itemsPerPage), p + 1))}
                      disabled={currentPage === Math.ceil(leaderboard.length / itemsPerPage)}
                      className="px-4 py-2 bg-yellow-500/20 text-yellow-500 rounded-lg hover:bg-yellow-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
              <h3 className="text-xl font-bold text-gray-400 mb-2">No Participants Yet</h3>
              <p className="text-gray-500 mb-6">Be the first to join this competition!</p>
              <button
                onClick={() => router.push(`/bootcamp/${bootcampId}/register`)}
                className="px-6 py-3 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 transition-colors font-medium"
              >
                Join Now
              </button>
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-gray-500/20 text-gray-400 rounded-lg hover:bg-gray-500/30 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
