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
  Trophy,
  Github
} from "lucide-react";
import { useEffect, useState } from "react";
import AdvancedPagination from '@/components/ui/advanced-pagination';
import GitCommandsLoader from '@/components/ui/git-commands-loader';
import ActiveBootcampBanner from '@/components/bootcamp/ActiveBootcampBanner';
import GitHubHeatmap from '@/components/ui/github-heatmap';
import LeetCodeHeatmap from '@/components/ui/leetcode-heatmap';

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
  leetcodeUsername?: string;
}


const DashboardPage = React.memo(function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
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
      
      // Fetch profile data (name, avatar, etc.)
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
      setActivitiesLoading(true);
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
    } finally {
      setActivitiesLoading(false);
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


  if (loading) {
    return <GitCommandsLoader />;
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
      {/* Active Bootcamp Banner */}
      <ActiveBootcampBanner />
      
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

      {/* Heatmaps Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GitHub Heatmap */}
        {profile?.githubUsername && (
          <div className="bg-black/40 backdrop-blur-sm border border-[#0B874F]/30 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <Github className="w-5 h-5 mr-2 text-[#0B874F]" />
              GitHub Contributions
            </h2>
            <GitHubHeatmap username={profile.githubUsername} />
          </div>
        )}

        {/* LeetCode Heatmap */}
        {profile?.leetcodeUsername && (
          <div className="bg-black/40 backdrop-blur-sm border border-[#0B874F]/30 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-[#ffa116]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z"/>
              </svg>
              LeetCode Submissions
            </h2>
            <LeetCodeHeatmap username={profile.leetcodeUsername} />
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-black/40 backdrop-blur-sm border border-[#0B874F]/30 rounded-lg p-6">
          <div className="flex items-center mb-6">
            <h2 className="text-xl font-bold text-white flex items-center">
              <Activity className="w-5 h-5 mr-2 text-[#0B874F]" />
              Recent Activity
            </h2>
          </div>
          
          {activitiesLoading ? (
            <div className="py-12">
              <GitCommandsLoader />
            </div>
          ) : (
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
          )}

        {/* Pagination */}
        {!activitiesLoading && totalPages > 1 && (
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
        {!activitiesLoading && totalActivities > 0 && (
          <div className="text-center mt-4 text-gray-400 text-sm">
            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalActivities)} of {totalActivities} activities
          </div>
        )}
      </div>
    </div>
  );
});

export default DashboardPage;