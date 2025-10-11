"use client";

import React, { useEffect, useState } from "react";
import { Users, Github, MapPin, Calendar, Search } from "lucide-react";
import AdvancedPagination from '@/components/ui/advanced-pagination';

interface Member {
  id: string;
  name: string;
  email: string;
  githubUsername?: string;
  location?: string;
  bio?: string;
  avatar?: string;
  joinedAt: string;
  rank: number;
  points: number;
  githubStats?: {
    commits: number;
    pullRequests: number;
    issues: number;
    contributions: number;
  };
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalMembers, setTotalMembers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    fetchMembers();
  }, [currentPage, searchTerm]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const offset = (currentPage - 1) * ITEMS_PER_PAGE;
      const searchParam = searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : '';
      
      const response = await fetch(`/api/dashboard/members?limit=${ITEMS_PER_PAGE}&offset=${offset}${searchParam}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch members');
      }

      const data = await response.json();
      setMembers(data.members || []);
      setTotalMembers(data.total || 0);
      setTotalPages(data.totalPages || 0);
      setHasMore(data.hasMore || false);
    } catch (err) {
      console.error('Error fetching members:', err);
      setError('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-black/40 backdrop-blur-sm border border-[#0B874F]/30 rounded-lg p-6">
              <div className="animate-pulse">
                <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto mb-4"></div>
                <div className="h-4 bg-gray-700 rounded w-3/4 mx-auto mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-1/2 mx-auto"></div>
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
          <h2 className="text-xl font-bold text-red-400 mb-2">Error Loading Members</h2>
          <p className="text-gray-400">{error}</p>
          <button 
            onClick={fetchMembers}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-black/40 backdrop-blur-sm border border-[#0B874F]/30 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-[#0B874F] mb-2 flex items-center">
              <Users className="w-8 h-8 mr-3" />
              Community Members
            </h1>
            <p className="text-gray-400">
              Connect with {totalMembers} developers in our community
            </p>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-black/50 border border-[#0B874F]/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#0B874F] transition-colors"
          />
        </div>
      </div>

      {/* Members Grid */}
      {members.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((member) => (
            <div
              key={member.id}
              className="bg-black/40 backdrop-blur-sm border border-[#0B874F]/30 rounded-lg p-6 hover:border-[#0B874F]/50 transition-all duration-200"
            >
              {/* Avatar and Name */}
              <div className="text-center mb-4">
                <div className="w-16 h-16 mx-auto mb-3 bg-[#0B874F]/20 rounded-full flex items-center justify-center overflow-hidden">
                  {member.avatar ? (
                    <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[#0B874F] text-xl font-bold">
                      {member.name?.charAt(0) || member.email.charAt(0)}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-white">{member.name || 'Anonymous'}</h3>
                {member.githubUsername && (
                  <p className="text-sm text-gray-400 flex items-center justify-center">
                    <Github className="w-3 h-3 mr-1" />
                    @{member.githubUsername}
                  </p>
                )}
              </div>

              {/* Bio */}
              {member.bio && (
                <p className="text-gray-400 text-sm text-center mb-4 line-clamp-2">
                  {member.bio}
                </p>
              )}

              {/* Location and Join Date */}
              <div className="space-y-2 mb-4">
                {member.location && (
                  <div className="flex items-center text-sm text-gray-400">
                    <MapPin className="w-3 h-3 mr-2" />
                    <span>{member.location}</span>
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-400">
                  <Calendar className="w-3 h-3 mr-2" />
                  <span>Joined {new Date(member.joinedAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* GitHub Stats */}
              {member.githubStats && (
                <div className="border-t border-[#0B874F]/20 pt-4">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-lg font-bold text-[#0B874F]">{member.githubStats.commits}</div>
                      <div className="text-xs text-gray-400">Commits</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-[#F5A623]">{member.githubStats.pullRequests}</div>
                      <div className="text-xs text-gray-400">PRs</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-[#E74C3C]">{member.githubStats.issues}</div>
                      <div className="text-xs text-gray-400">Issues</div>
                    </div>
                  </div>
                </div>
              )}

              {/* View GitHub Profile */}
              <a
                href={member.githubUsername ? `https://github.com/${member.githubUsername}` : `mailto:${member.email}`}
                target={member.githubUsername ? "_blank" : undefined}
                rel={member.githubUsername ? "noopener noreferrer" : undefined}
                className="block w-full mt-4 px-4 py-2 text-center bg-[#0B874F]/10 border border-[#0B874F]/30 rounded-lg text-[#0B874F] hover:bg-[#0B874F]/20 transition-colors text-sm font-medium"
              >
                View Profile
              </a>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-black/40 backdrop-blur-sm border border-[#0B874F]/30 rounded-lg p-12 text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
          <h3 className="text-xl font-bold text-gray-400 mb-2">
            {searchTerm ? 'No Members Found' : 'No Members Yet'}
          </h3>
          <p className="text-gray-500">
            {searchTerm 
              ? `No members match "${searchTerm}". Try a different search term.`
              : 'Be the first to join our community!'
            }
          </p>
        </div>
      )}

      {/* Advanced Pagination */}
      {totalPages > 1 && (
        <div className="mt-8">
          <AdvancedPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            showQuickJump={true}
            maxVisiblePages={5}
          />
        </div>
      )}

      {/* Pagination Info */}
      {totalMembers > 0 && (
        <div className="text-center mt-4 text-gray-400 text-sm">
          {searchTerm ? (
            <>
              Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalMembers)} of {totalMembers} members
              {searchTerm && <span className="block mt-1">Search results for "{searchTerm}"</span>}
            </>
          ) : (
            `Showing ${((currentPage - 1) * ITEMS_PER_PAGE) + 1} to ${Math.min(currentPage * ITEMS_PER_PAGE, totalMembers)} of ${totalMembers} members`
          )}
        </div>
      )}
    </div>
  );
}