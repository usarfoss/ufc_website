"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Trophy, Calendar, Users, Target, Clock, Award } from "lucide-react";

interface Bootcamp {
  id: string;
  name: string;
  description: string;
  type: 'LEETCODE' | 'GITHUB';
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  startDate: string;
  endDate: string;
  _count: {
    participants: number;
  };
}

interface MyParticipation {
  bootcamp: Bootcamp;
  registeredAt: string;
  finalPoints: number;
  finalRank: number | null;
  progressStats: any;
}

export default function UserBootcampsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeBootcamp, setActiveBootcamp] = useState<Bootcamp | null>(null);
  const [myParticipations, setMyParticipations] = useState<MyParticipation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchBootcamps();
  }, [user]);

  const fetchBootcamps = async () => {
    try {
      setLoading(true);
      
      // Fetch active bootcamp
      const activeResponse = await fetch('/api/bootcamps/active');
      if (activeResponse.ok) {
        const activeData = await activeResponse.json();
        setActiveBootcamp(activeData.bootcamp);
      }

      // Fetch my participations
      const myResponse = await fetch('/api/bootcamps/my-participations');
      if (myResponse.ok) {
        const myData = await myResponse.json();
        setMyParticipations(myData.participations || []);
      }
    } catch (error) {
      console.error('Error fetching bootcamps:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UPCOMING': return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
      case 'ACTIVE': return 'text-green-400 bg-green-400/10 border-green-400/30';
      case 'COMPLETED': return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
    }
  };

  const formatProgress = (progressStats: any, type: string) => {
    if (!progressStats) return 'No progress yet';
    
    if (type === 'LEETCODE') {
      const { easy = 0, medium = 0, hard = 0 } = progressStats;
      return `${easy} Easy, ${medium} Medium, ${hard} Hard`;
    } else {
      const { commits = 0, pullRequests = 0, issues = 0 } = progressStats;
      return `${commits} Commits, ${pullRequests} PRs, ${issues} Issues`;
    }
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-black/60 to-[#0B874F]/10 backdrop-blur-sm border border-[#0B874F]/30 rounded-xl p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
              <Trophy className="w-10 h-10 mr-4 text-[#0B874F]" />
              My Bootcamps
            </h1>
            <p className="text-gray-300 text-lg">
              Track your competition progress and achievements
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-[#0B874F]">{myParticipations.length}</div>
            <div className="text-sm text-gray-400">Total Participations</div>
          </div>
        </div>
      </div>

      {/* Active Bootcamp */}
      {activeBootcamp && (
        <div className="bg-black/40 backdrop-blur-sm border border-[#0B874F]/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <Target className="w-6 h-6 mr-2 text-[#0B874F]" />
              Active Competition
            </h2>
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor('ACTIVE')}`}>
              ACTIVE
            </span>
          </div>
          
          <div className="mb-4">
            <h3 className="text-xl font-bold text-white mb-2">{activeBootcamp.name}</h3>
            <p className="text-gray-400">{activeBootcamp.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-black/40 rounded-lg p-3 border border-[#0B874F]/20">
              <div className="flex items-center space-x-2 mb-1">
                <Calendar className="w-4 h-4 text-[#0B874F]" />
                <span className="text-gray-400 text-sm">Ends</span>
              </div>
              <p className="text-white font-medium">{new Date(activeBootcamp.endDate).toLocaleDateString()}</p>
            </div>

            <div className="bg-black/40 rounded-lg p-3 border border-[#0B874F]/20">
              <div className="flex items-center space-x-2 mb-1">
                <Users className="w-4 h-4 text-[#0B874F]" />
                <span className="text-gray-400 text-sm">Participants</span>
              </div>
              <p className="text-white font-medium">{activeBootcamp._count.participants}</p>
            </div>

            <div className="bg-black/40 rounded-lg p-3 border border-[#0B874F]/20">
              <div className="flex items-center space-x-2 mb-1">
                <Target className="w-4 h-4 text-[#0B874F]" />
                <span className="text-gray-400 text-sm">Type</span>
              </div>
              <p className="text-white font-medium">{activeBootcamp.type}</p>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => router.push(`/bootcamp/${activeBootcamp.id}/leaderboard`)}
              className="flex-1 px-4 py-2 bg-[#0B874F] text-white rounded-lg hover:bg-[#0B874F]/80 transition-colors font-medium"
            >
              View Leaderboard
            </button>
            <button
              onClick={() => router.push(`/bootcamp/${activeBootcamp.id}/register`)}
              className="flex-1 px-4 py-2 bg-[#0B874F]/20 text-[#0B874F] border border-[#0B874F]/30 rounded-lg hover:bg-[#0B874F]/30 transition-colors font-medium"
            >
              Join Competition
            </button>
          </div>
        </div>
      )}

      {/* My Participations */}
      <div className="bg-black/40 backdrop-blur-sm border border-[#0B874F]/30 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <Award className="w-6 h-6 mr-2 text-[#0B874F]" />
          My Participations
        </h2>

        {myParticipations.length > 0 ? (
          <>
            <div className="space-y-4">
              {myParticipations
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map((participation) => (
              <div
                key={participation.bootcamp.id}
                className="bg-black/40 rounded-lg p-4 border border-[#0B874F]/20 hover:border-[#0B874F]/40 transition-all cursor-pointer"
                onClick={() => router.push(`/bootcamp/${participation.bootcamp.id}/leaderboard`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-bold text-white">{participation.bootcamp.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(participation.bootcamp.status)}`}>
                        {participation.bootcamp.status}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-2">{participation.bootcamp.description}</p>
                  </div>
                  
                  {participation.finalRank && (
                    <div className="text-right ml-4">
                      <div className="text-2xl font-bold text-[#0B874F]">#{participation.finalRank}</div>
                      <div className="text-xs text-gray-400">Final Rank</div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="text-sm">
                    <span className="text-gray-500">Type:</span>
                    <span className="text-white ml-2">{participation.bootcamp.type}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">Points:</span>
                    <span className="text-white ml-2">{participation.finalPoints}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">Joined:</span>
                    <span className="text-white ml-2">{new Date(participation.registeredAt).toLocaleDateString()}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">Progress:</span>
                    <span className="text-white ml-2">{formatProgress(participation.progressStats, participation.bootcamp.type)}</span>
                  </div>
                </div>
              </div>
                ))}
            </div>

            {/* Pagination */}
            {myParticipations.length > itemsPerPage && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-[#0B874F]/20">
                <div className="text-sm text-gray-400">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, myParticipations.length)} of {myParticipations.length} participations
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-[#0B874F]/20 text-[#0B874F] rounded-lg hover:bg-[#0B874F]/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.ceil(myParticipations.length / itemsPerPage) }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-lg transition-colors ${
                          currentPage === page
                            ? 'bg-[#0B874F] text-white'
                            : 'bg-[#0B874F]/20 text-[#0B874F] hover:bg-[#0B874F]/30'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(Math.ceil(myParticipations.length / itemsPerPage), p + 1))}
                    disabled={currentPage === Math.ceil(myParticipations.length / itemsPerPage)}
                    className="px-4 py-2 bg-[#0B874F]/20 text-[#0B874F] rounded-lg hover:bg-[#0B874F]/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
            <h3 className="text-xl font-bold text-gray-400 mb-2">No Participations Yet</h3>
            <p className="text-gray-500 mb-6">Join a bootcamp to start competing!</p>
            {activeBootcamp && (
              <button
                onClick={() => router.push(`/bootcamp/${activeBootcamp.id}/register`)}
                className="px-6 py-3 bg-[#0B874F] text-white rounded-lg hover:bg-[#0B874F]/80 transition-colors font-medium"
              >
                Join Active Bootcamp
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
