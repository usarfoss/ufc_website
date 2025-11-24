"use client";

import React from "react";
import { useAuth } from "@/lib/auth-context";
import { 
  GitCommit, 
  GitPullRequest, 
  Users, 
  Calendar,
  Star,
  Activity,
  Trophy
} from "lucide-react";
import { useEffect, useState } from "react";
import AdvancedPagination from '@/components/ui/advanced-pagination';

interface DashboardStats {
  totalCommits: {
    value: string;
    change: string;
    icon: string;
    color: string;
  };
  pullRequests: {
    value: string;
    change: string;
    icon: string;
    color: string;
  };
  leaderboardRank: {
    value: string;
    change: string;
    icon: string;
    color: string;
  };
  activeProjects: {
    value: string;
    change: string;
    icon: string;
    color: string;
  };
}

interface RecentActivity {
  type: string;
  message: string;
  repo: string;
  time: string;
  user?: {
    name: string;
    githubUsername?: string;
  };
}

interface ProfileData {
  name?: string;
  avatar?: string;
  githubUsername?: string;
  githubStats?: {
    languages: Record<string, number>;
  };
}


const DashboardPage = React.memo(function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalActivities, setTotalActivities] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [currentPage]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsResponse, profileResponse] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/dashboard/profile')
      ]);

      if (!statsResponse.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const statsData = await statsResponse.json();
      
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setProfile(profileData.profile);
      }

      setStats(statsData.stats);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const offset = (currentPage - 1) * ITEMS_PER_PAGE;
      const activitiesResponse = await fetch(`/api/dashboard/activities?limit=${ITEMS_PER_PAGE}&offset=${offset}`);

      if (!activitiesResponse.ok) {
        throw new Error('Failed to fetch activities');
      }

      const activitiesData = await activitiesResponse.json();
      setRecentActivity(activitiesData.activities || []);
      setTotalActivities(activitiesData.total || 0);
      setTotalPages(Math.ceil((activitiesData.total || 0) / ITEMS_PER_PAGE));
    } catch (err) {
      console.error('Error fetching activities:', err);
    }
  };


  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'GitCommit': return GitCommit;
      case 'GitPullRequest': return GitPullRequest;
      case 'Trophy': return Trophy;
      case 'Star': return Star;
      default: return Activity;
    }
  };

  const getTopLanguages = () => {
    if (!profile?.githubStats?.languages) return [];
    
    // Filter out invalid language names and ensure they're strings
    const validLanguages = Object.entries(profile.githubStats.languages)
      .filter(([language, percentage]) => {
        // Check if language is a valid string and percentage is a number
        return typeof language === 'string' && 
               language.length > 0 && 
               language.length < 50 && // Reasonable length limit
               !language.includes('%') && // Remove entries with % in name
               typeof percentage === 'number' && 
               percentage >= 0;
      })
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
    
    return validLanguages;
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
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-black/40 backdrop-blur-sm border border-[#0B874F]/30 rounded-lg p-6">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-700 rounded w-1/2 mb-4"></div>
                <div className="h-6 bg-gray-700 rounded w-1/3"></div>
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
          <h2 className="text-xl font-bold text-red-400 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-400">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="space-y-6">
        <div className="bg-black/40 backdrop-blur-sm border border-[#0B874F]/30 rounded-lg p-6">
          <h1 className="text-3xl font-bold text-[#0B874F] mb-2">
            Welcome back, {user?.name?.split(' ')[0] || 'Developer'}!
          </h1>
          <p className="text-gray-400">
            No data available. Please check back later.
          </p>
        </div>
      </div>
    );
  }

  const statsArray = [
    stats.totalCommits,
    stats.pullRequests,
    stats.leaderboardRank
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-black/40 backdrop-blur-sm border border-[#0B874F]/30 rounded-lg p-6 text-center">
        <div className="w-24 h-24 mx-auto mb-4 bg-[#0B874F]/20 rounded-full flex items-center justify-center overflow-hidden">
          {profile?.avatar ? (
            <img src={profile.avatar} alt={profile.name || 'User'} className="w-full h-full object-cover" />
          ) : (
            <span className="text-[#0B874F] text-3xl font-bold">
              {profile?.name?.charAt(0) || user?.name?.charAt(0) || user?.email?.charAt(0) || 'D'}
            </span>
          )}
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">
          Welcome back, <span className="text-[#0B874F]">{user?.name?.split(' ')[0] || 'Developer'}</span>! 👋
        </h1>
        <p className="text-gray-300 text-lg mb-2">
          Here's what's happening with your contributions.
        </p>
        {profile?.githubUsername && (
          <p className="text-gray-400">@{profile.githubUsername}</p>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsArray.map((stat, index) => {
          const Icon = getIconComponent(stat.icon);
          return (
            <div
              key={index}
              className="group bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-sm border border-[#0B874F]/30 rounded-xl p-6 hover:border-[#0B874F]/60 hover:shadow-lg hover:shadow-[#0B874F]/20 transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-center mb-4">
                <div
                  className="p-3 rounded-xl group-hover:scale-110 transition-transform duration-300"
                  style={{ backgroundColor: `${stat.color}20` }}
                >
                  <Icon className="w-6 h-6" style={{ color: stat.color }} />
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-1 group-hover:text-[#0B874F] transition-colors duration-300">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                  {Object.keys(stats)[index].replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Top Languages */}
      {profile?.githubStats?.languages && (
        <div className="bg-black/40 backdrop-blur-sm border border-[#0B874F]/30 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-[#0B874F]" />
            Top Languages
          </h2>
          {getTopLanguages().length > 0 ? (
            <div className="space-y-2">
              {getTopLanguages().map(([language, percentage]) => {
                // Additional safety checks
                const safeLanguage = typeof language === 'string' ? language : 'Unknown';
                const safePercentage = typeof percentage === 'number' ? Math.round(percentage) : 0;
                
                return (
                  <div key={safeLanguage} className="flex items-center gap-3">
                    <span className="text-gray-400 text-sm min-w-0 flex-shrink-0" title={safeLanguage}>
                      {safeLanguage}
                    </span>
                    <div className="flex items-center gap-2 flex-1">
                      <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#0B874F] rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(safePercentage, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-400 w-8 text-right">{safePercentage}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-400">
              <p className="text-sm">No language data available</p>
              <p className="text-xs mt-1">Sync your GitHub to see language statistics</p>
            </div>
          )}
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-black/40 backdrop-blur-sm border border-[#0B874F]/30 rounded-lg p-6">
          <div className="flex items-center mb-6">
            <h2 className="text-xl font-bold text-white flex items-center">
              <Activity className="w-5 h-5 mr-2 text-[#0B874F]" />
              Recent Activity
            </h2>
          </div>
          
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-4 p-4 bg-black/30 rounded-lg border border-[#0B874F]/20"
                >
                  <div className="flex-shrink-0">
                    {activity.type === "commit" && (
                      <div className="w-8 h-8 bg-[#0B874F]/20 rounded-full flex items-center justify-center">
                        <GitCommit className="w-4 h-4 text-[#0B874F]" />
                      </div>
                    )}
                    {activity.type === "pull_request" && (
                      <div className="w-8 h-8 bg-[#F5A623]/20 rounded-full flex items-center justify-center">
                        <GitPullRequest className="w-4 h-4 text-[#F5A623]" />
                      </div>
                    )}
                    {activity.type === "event_join" && (
                      <div className="w-8 h-8 bg-[#9B59B6]/20 rounded-full flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-[#9B59B6]" />
                      </div>
                    )}
                    {activity.type === "issue" && (
                      <div className="w-8 h-8 bg-[#E74C3C]/20 rounded-full flex items-center justify-center">
                        <Activity className="w-4 h-4 text-[#E74C3C]" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm">
                      {activity.user && (
                        <span className="font-semibold text-[#0B874F]">
                          {activity.user.name}
                          {activity.user.githubUsername && (
                            <span className="text-gray-400 font-normal"> (@{activity.user.githubUsername})</span>
                          )}
                          {' '}
                        </span>
                      )}
                      {activity.message}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-[#0B874F] text-xs">{activity.repo}</span>
                      <span className="text-gray-400 text-xs">•</span>
                      <span className="text-gray-400 text-xs">{activity.time}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No recent activity</p>
                <p className="text-sm">Start contributing to see your activity here!</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6">
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
        {totalActivities > 0 && (
          <div className="text-center mt-4 text-gray-400 text-sm">
            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalActivities)} of {totalActivities} activities
          </div>
        )}
      </div>
    </div>
  );
});

export default DashboardPage;