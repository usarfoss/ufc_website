"use client";

import React, { useEffect, useState } from "react";
import { Trophy, Medal, Award, TrendingUp, GitCommit, GitPullRequest, Star, BarChart3, Crown, Github } from "lucide-react";

interface LeaderboardUser {
  id: string;
  name: string;
  githubUsername?: string;
  leetcodeUsername?: string;
  avatar?: string;
  stats: {
    commits: number;
    pullRequests: number;
    issues: number;
    contributions: number;
  };
  leetcodeStats?: {
    totalSolved: number;
    easySolved: number;
    mediumSolved: number;
    hardSolved: number;
  } | null;
  githubPoints: number;
  leetcodePoints: number;
  rank: number;
  points: number;
}

export default function LeaderboardPage() {
  const [allUsers, setAllUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'totalPoints' | 'commits' | 'pullRequests' | 'leetcode' | 'github'>('totalPoints');

  useEffect(() => {
    fetchLeaderboard();
  }, []); // Only fetch once on mount

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/dashboard/leaderboard?sortBy=totalPoints`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }

      const data = await response.json();
      setAllUsers(data.users || []);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  // Sort users based on selected filter (client-side)
  const users = React.useMemo(() => {
    const sorted = [...allUsers].sort((a, b) => {
      switch (sortBy) {
        case 'github':
          return b.githubPoints - a.githubPoints;
        case 'leetcode':
          return b.leetcodePoints - a.leetcodePoints;
        case 'commits':
          return b.stats.commits - a.stats.commits;
        case 'pullRequests':
          return b.stats.pullRequests - a.stats.pullRequests;
        case 'totalPoints':
        default:
          return b.points - a.points;
      }
    });

    // Re-assign ranks based on current sort
    return sorted.map((user, index) => ({
      ...user,
      rank: index + 1
    }));
  }, [allUsers, sortBy]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-gray-400 font-bold">#{rank}</span>;
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank <= 3) {
      const colors = {
        1: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
        2: 'bg-gray-400/20 text-gray-400 border-gray-400/30',
        3: 'bg-amber-600/20 text-amber-600 border-amber-600/30'
      };
      return colors[rank as keyof typeof colors];
    }
    return 'bg-[#0B874F]/20 text-[#0B874F] border-[#0B874F]/30';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-black/40 backdrop-blur-sm border border-[#0B874F]/30 rounded-lg p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-black/40 backdrop-blur-sm border border-[#0B874F]/30 rounded-lg p-6">
              <div className="animate-pulse flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-700 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-900/20 backdrop-blur-sm border border-red-500/30 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-400 mb-2">Error Loading Leaderboard</h2>
          <p className="text-gray-400">{error}</p>
          <button 
            onClick={fetchLeaderboard}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-black/60 to-[#0B874F]/10 backdrop-blur-sm border border-[#0B874F]/30 rounded-xl p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
              <Trophy className="w-10 h-10 mr-4 text-yellow-500" />
              Community Leaderboard
            </h1>
            <p className="text-gray-300 text-lg">
              Celebrating our top contributors and their amazing work
            </p>
          </div>
          
          {/* Sort Options */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSortBy('totalPoints')}
              className={`px-6 py-3 rounded-xl transition-all duration-300 font-medium ${
                sortBy === 'totalPoints'
                  ? 'bg-[#0B874F] text-black shadow-lg shadow-[#0B874F]/30'
                  : 'bg-black/30 text-gray-400 hover:text-[#0B874F] hover:bg-[#0B874F]/10'
              }`}
            >
              <TrendingUp className="w-4 h-4 inline mr-2" />
              Combined
            </button>
            <button
              onClick={() => setSortBy('github')}
              className={`px-6 py-3 rounded-xl transition-all duration-300 font-medium ${
                sortBy === 'github'
                  ? 'bg-[#0B874F] text-black shadow-lg shadow-[#0B874F]/30'
                  : 'bg-black/30 text-gray-400 hover:text-[#0B874F] hover:bg-[#0B874F]/10'
              }`}
            >
              <Github className="w-4 h-4 inline mr-2" />
              GitHub
            </button>
            <button
              onClick={() => setSortBy('leetcode')}
              className={`px-6 py-3 rounded-xl transition-all duration-300 font-medium ${
                sortBy === 'leetcode'
                  ? 'bg-[#0B874F] text-black shadow-lg shadow-[#0B874F]/30'
                  : 'bg-black/30 text-gray-400 hover:text-[#0B874F] hover:bg-[#0B874F]/10'
              }`}
            >
              <svg className="w-4 h-4 inline mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z"/>
              </svg>
              LeetCode
            </button>
          </div>
        </div>
      </div>

      {/* Top 3 Podium */}
      {users.length >= 3 && (
        <div className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-sm border border-[#0B874F]/30 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Crown className="w-6 h-6 mr-3 text-yellow-500" />
            Top Performers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {users.slice(0, 3).map((user, index) => {
              const podiumColors = ['text-yellow-500', 'text-gray-400', 'text-amber-600'];
              const bgColors = ['bg-yellow-500/20', 'bg-gray-400/20', 'bg-amber-600/20'];
              const borderColors = ['border-yellow-500/30', 'border-gray-400/30', 'border-amber-600/30'];
              
              return (
                <div
                  key={user.id}
                  className={`${bgColors[index]} ${borderColors[index]} border-2 rounded-xl p-6 text-center hover:scale-105 transition-all duration-300`}
                >
                  <div className="relative mb-4">
                    <div className="w-20 h-20 mx-auto bg-black/30 rounded-full flex items-center justify-center overflow-hidden">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[#0B874F] text-2xl font-bold">
                          {user.name?.charAt(0) || '?'}
                        </span>
                      )}
                    </div>
                    <div className={`absolute -top-2 -right-2 w-8 h-8 ${bgColors[index]} ${borderColors[index]} border rounded-full flex items-center justify-center`}>
                      {getRankIcon(user.rank)}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">{user.name}</h3>
                  {user.githubUsername && (
                    <p className="text-sm text-gray-400 mb-3">@{user.githubUsername}</p>
                  )}
                  <div className={`text-3xl font-bold ${podiumColors[index]} mb-2`}>
                    {user.points}
                  </div>
                  <p className="text-sm text-gray-400">Total Points</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div className="space-y-4">
        {users.length > 0 ? (
          users.map((user, index) => (
            <div
              key={user.id}
              className={`bg-black/40 backdrop-blur-sm border rounded-lg p-6 hover:border-[#0B874F]/50 transition-all duration-200 ${getRankBadge(user.rank)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Rank */}
                  <div className="flex-shrink-0">
                    {getRankIcon(user.rank)}
                  </div>
                  
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-[#0B874F]/20 rounded-full flex items-center justify-center overflow-hidden">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[#0B874F] font-bold text-lg">
                        {user.name?.charAt(0) || '?'}
                      </span>
                    )}
                  </div>
                  
                  {/* User Info */}
                  <div>
                    <h3 className="text-lg font-bold text-white">{user.name}</h3>
                    {user.githubUsername && (
                      <p className="text-sm text-gray-400">@{user.githubUsername}</p>
                    )}
                  </div>
                </div>
                
                {/* Stats */}
                <div className="flex items-center space-x-4 flex-wrap gap-y-2">
                  {/* Show GitHub Stats when Combined or GitHub is selected */}
                  {(sortBy === 'totalPoints' || sortBy === 'github') && (
                    <>
                      <div className="text-center">
                        <div className="text-xl font-bold text-[#0B874F]">{user.stats.commits}</div>
                        <div className="text-xs text-gray-400">Commits</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-[#F5A623]">{user.stats.pullRequests}</div>
                        <div className="text-xs text-gray-400">PRs</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-[#E74C3C]">{user.stats.issues}</div>
                        <div className="text-xs text-gray-400">Issues</div>
                      </div>
                      
                      {/* Show GitHub Points when GitHub is selected */}
                      {sortBy === 'github' && (
                        <>
                          <div className="h-8 w-px bg-gray-600"></div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-white">{user.githubPoints}</div>
                            <div className="text-xs text-gray-400">GitHub Points</div>
                          </div>
                        </>
                      )}
                    </>
                  )}
                  
                  {/* Divider between GitHub and LeetCode when both shown */}
                  {sortBy === 'totalPoints' && user.leetcodeStats && (
                    <div className="h-8 w-px bg-gray-600"></div>
                  )}
                  
                  {/* Show LeetCode Stats when Combined or LeetCode is selected */}
                  {(sortBy === 'totalPoints' || sortBy === 'leetcode') && user.leetcodeStats && (
                    <>
                      <div className="text-center">
                        <div className="text-xl font-bold text-green-500">{user.leetcodeStats.easySolved}</div>
                        <div className="text-xs text-gray-400">Easy</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-yellow-500">{user.leetcodeStats.mediumSolved}</div>
                        <div className="text-xs text-gray-400">Medium</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-red-500">{user.leetcodeStats.hardSolved}</div>
                        <div className="text-xs text-gray-400">Hard</div>
                      </div>
                      
                      {/* Show LeetCode Points when LeetCode is selected */}
                      {sortBy === 'leetcode' && (
                        <>
                          <div className="h-8 w-px bg-gray-600"></div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-white">{user.leetcodePoints}</div>
                            <div className="text-xs text-gray-400">LeetCode Points</div>
                          </div>
                        </>
                      )}
                    </>
                  )}
                  
                  {/* Show Total Points only when Combined is selected */}
                  {sortBy === 'totalPoints' && (
                    <>
                      <div className="h-8 w-px bg-gray-600"></div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">{user.points}</div>
                        <div className="text-xs text-gray-400">Total</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-black/40 backdrop-blur-sm border border-[#0B874F]/30 rounded-lg p-12 text-center">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
            <h3 className="text-xl font-bold text-gray-400 mb-2">No Data Available</h3>
            <p className="text-gray-500">Start contributing to see the leaderboard!</p>
          </div>
        )}
      </div>
    </div>
  );
}