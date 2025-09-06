"use client";

import React from "react";
import { useAuth } from "@/lib/auth-context";
import { 
  GitCommit, 
  GitPullRequest, 
  Users, 
  Calendar,
  TrendingUp,
  Star,
  Activity,
  Trophy
} from "lucide-react";
import { useEffect, useState } from "react";

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
}

interface GitHubWeeklyStats {
  commits: number;
  prsMerged: number;
  issuesClosed: number;
}

const DashboardPage = React.memo(function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [githubWeeklyStats, setGitHubWeeklyStats] = useState<GitHubWeeklyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first
      const cachedData = sessionStorage.getItem('dashboard-data');
      const cacheTime = sessionStorage.getItem('dashboard-data-time');
      const now = Date.now();
      
      // Use cache if it's less than 5 minutes old
      if (cachedData && cacheTime && (now - parseInt(cacheTime)) < 5 * 60 * 1000) {
        const parsedData = JSON.parse(cachedData);
        setStats(parsedData.stats);
        setRecentActivity(parsedData.recentActivity);
        setGitHubWeeklyStats(parsedData.githubWeeklyStats);
        setLoading(false);
        return;
      }

      const [statsResponse, activitiesResponse] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/dashboard/activities?limit=5')
      ]);

      if (!statsResponse.ok || !activitiesResponse.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const statsData = await statsResponse.json();
      const activitiesData = await activitiesResponse.json();

      const dataToCache = {
        stats: statsData.stats,
        recentActivity: statsData.recentActivity || activitiesData.activities || [],
        githubWeeklyStats: statsData.githubWeeklyStats
      };

      // Cache the data
      sessionStorage.setItem('dashboard-data', JSON.stringify(dataToCache));
      sessionStorage.setItem('dashboard-data-time', now.toString());

      setStats(dataToCache.stats);
      setRecentActivity(dataToCache.recentActivity);
      setGitHubWeeklyStats(dataToCache.githubWeeklyStats);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const syncGitHubData = async () => {
    if (!user?.githubUsername) {
      alert('No GitHub username configured. Please update your profile.');
      return;
    }

    try {
      setSyncing(true);
      const response = await fetch('/api/dashboard/sync-github', {
        method: 'POST'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to sync GitHub data');
      }

      // Clear cache and refetch data
      sessionStorage.removeItem('dashboard-data');
      sessionStorage.removeItem('dashboard-data-time');
      await fetchDashboardData();
      
      alert('GitHub data synced successfully!');
    } catch (err) {
      console.error('Error syncing GitHub data:', err);
      alert(err instanceof Error ? err.message : 'Failed to sync GitHub data');
    } finally {
      setSyncing(false);
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
    return (
      <div className="space-y-6">
        <div className="bg-black/40 backdrop-blur-sm border border-[#0B874F]/30 rounded-lg p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
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
    stats.leaderboardRank,
    stats.activeProjects
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-black/60 to-[#0B874F]/10 backdrop-blur-sm border border-[#0B874F]/30 rounded-xl p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Welcome back, <span className="text-[#0B874F]">{user?.name?.split(' ')[0] || 'Developer'}</span>! 👋
            </h1>
            <p className="text-gray-300 text-lg">
              Here's what's happening with your projects and contributions.
            </p>
          </div>
          {user?.githubUsername && (
            <div className="text-right">
              <p className="text-sm text-gray-400">Connected as</p>
              <p className="text-[#0B874F] font-medium">@{user.githubUsername}</p>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsArray.map((stat, index) => {
          const Icon = getIconComponent(stat.icon);
          return (
            <div
              key={index}
              className="group bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-sm border border-[#0B874F]/30 rounded-xl p-6 hover:border-[#0B874F]/60 hover:shadow-lg hover:shadow-[#0B874F]/20 transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className="p-3 rounded-xl group-hover:scale-110 transition-transform duration-300"
                  style={{ backgroundColor: `${stat.color}20` }}
                >
                  <Icon className="w-6 h-6" style={{ color: stat.color }} />
                </div>
                <span
                  className="text-sm font-medium px-3 py-1 rounded-full border"
                  style={{ 
                    backgroundColor: `${stat.color}15`,
                    color: stat.color,
                    borderColor: `${stat.color}40`
                  }}
                >
                  {stat.change}
                </span>
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-black/40 backdrop-blur-sm border border-[#0B874F]/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center">
              <Activity className="w-5 h-5 mr-2 text-[#0B874F]" />
              Recent Activity
            </h2>
            <button className="text-[#0B874F] hover:text-[#0B874F]/80 text-sm">
              View All
            </button>
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
                    <p className="text-white text-sm">{activity.message}</p>
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
        </div>

        {/* Quick Actions */}
        <div className="bg-black/40 backdrop-blur-sm border border-[#0B874F]/30 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-[#0B874F]" />
            Quick Actions
          </h2>
          
          <div className="space-y-3">
            <button 
              onClick={() => window.location.href = '/dashboard/leaderboard'}
              className="w-full p-4 bg-[#0B874F]/10 border border-[#0B874F]/30 rounded-lg text-left hover:bg-[#0B874F]/20 transition-colors"
            >
              <div className="text-[#0B874F] font-medium">View Leaderboard</div>
              <div className="text-gray-400 text-sm">Check your ranking</div>
            </button>
            
            <button 
              onClick={() => window.location.href = '/dashboard/events'}
              className="w-full p-4 bg-[#F5A623]/10 border border-[#F5A623]/30 rounded-lg text-left hover:bg-[#F5A623]/20 transition-colors"
            >
              <div className="text-[#F5A623] font-medium">Join Event</div>
              <div className="text-gray-400 text-sm">Upcoming workshops</div>
            </button>
            
            <button 
              onClick={() => window.location.href = '/dashboard/projects'}
              className="w-full p-4 bg-[#9B59B6]/10 border border-[#9B59B6]/30 rounded-lg text-left hover:bg-[#9B59B6]/20 transition-colors"
            >
              <div className="text-[#9B59B6] font-medium">New Project</div>
              <div className="text-gray-400 text-sm">Start contributing</div>
            </button>
            
            {user?.githubUsername && (
              <button 
                onClick={syncGitHubData}
                disabled={syncing}
                className="w-full p-4 bg-[#E74C3C]/10 border border-[#E74C3C]/30 rounded-lg text-left hover:bg-[#E74C3C]/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="text-[#E74C3C] font-medium">
                  {syncing ? 'Syncing...' : 'Sync GitHub'}
                </div>
                <div className="text-gray-400 text-sm">Update your stats</div>
              </button>
            )}
          </div>

          {/* GitHub Stats Preview */}
          {githubWeeklyStats && (
            <div className="mt-6 p-4 bg-black/30 rounded-lg border border-[#0B874F]/20">
              <h3 className="text-white font-medium mb-3">GitHub This Week</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Commits</span>
                  <span className="text-[#0B874F]">{githubWeeklyStats.commits}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">PRs Merged</span>
                  <span className="text-[#0B874F]">{githubWeeklyStats.prsMerged}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Issues Closed</span>
                  <span className="text-[#0B874F]">{githubWeeklyStats.issuesClosed}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default DashboardPage;