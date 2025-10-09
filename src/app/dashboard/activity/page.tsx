"use client";

import React, { useEffect, useState } from "react";
import { Activity, GitCommit, GitPullRequest, Calendar, Users } from "lucide-react";

interface ActivityItem {
  id: string;
  type: string;
  message: string;
  repo?: string;
  target?: string;
  time: string;
  timestamp: string;
  user?: {
    name: string;
    githubUsername?: string;
    avatar?: string;
  };
}

export default function ActivityPage() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      // Try cached activities first, fallback to global activities if it fails
      let response;
      try {
        response = await fetch(`/api/dashboard/cached-activities?limit=30`, {
          signal: controller.signal
        });
      } catch (cachedError) {
        console.log('Cached activities failed, trying global activities...');
        response = await fetch(`/api/dashboard/global-activities?limit=30`, {
          signal: controller.signal
        });
      }
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error('Failed to fetch activities');
      }

      const data = await response.json();
      setActivities(data.activities || []);
    } catch (err) {
      console.error('Error fetching activities:', err);
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Request timed out. Please try again.');
      } else {
        setError('Failed to load activities');
      }
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'commit':
        return <GitCommit className="w-4 h-4 text-[#0B874F]" />;
      case 'pull_request':
        return <GitPullRequest className="w-4 h-4 text-[#F5A623]" />;
      case 'issue':
        return <Activity className="w-4 h-4 text-[#E74C3C]" />;
      case 'event_join':
        return <Calendar className="w-4 h-4 text-[#9B59B6]" />;
      case 'project_join':
        return <Users className="w-4 h-4 text-[#0B874F]" />;
      default:
        return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'commit':
        return 'bg-[#0B874F]/20 border-[#0B874F]/30';
      case 'pull_request':
        return 'bg-[#F5A623]/20 border-[#F5A623]/30';
      case 'issue':
        return 'bg-[#E74C3C]/20 border-[#E74C3C]/30';
      case 'event_join':
        return 'bg-[#9B59B6]/20 border-[#9B59B6]/30';
      case 'project_join':
        return 'bg-[#0B874F]/20 border-[#0B874F]/30';
      default:
        return 'bg-gray-500/20 border-gray-500/30';
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
        <div className="space-y-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-black/40 backdrop-blur-sm border border-[#0B874F]/30 rounded-lg p-4">
              <div className="animate-pulse flex items-center space-x-4">
                <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/2"></div>
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
          <h2 className="text-xl font-bold text-red-400 mb-2">Error Loading Activity</h2>
          <p className="text-gray-400">{error}</p>
          <button 
            onClick={fetchActivities}
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
              <Activity className="w-10 h-10 mr-4 text-[#0B874F]" />
              Community Activity
            </h1>
            <p className="text-gray-300 text-lg">
              See what everyone in the community is working on - commits, PRs, and issues from all members
            </p>
          </div>
          
        </div>
      </div>

      {/* Activity Feed */}
      {activities.length > 0 ? (
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div
              key={activity.id}
              className={`group bg-gradient-to-r from-black/60 to-black/40 backdrop-blur-sm border rounded-xl p-6 hover:border-[#0B874F]/60 hover:shadow-lg hover:shadow-[#0B874F]/10 transition-all duration-300 hover:scale-[1.02] ${getActivityColor(activity.type)}`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start space-x-4">
                {/* User Avatar or Activity Icon */}
                <div className="flex-shrink-0 mt-1">
                  {activity.user?.avatar ? (
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#0B874F]/30 group-hover:border-[#0B874F] transition-colors duration-300">
                      <img 
                        src={activity.user.avatar} 
                        alt={activity.user.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-black/40 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      {getActivityIcon(activity.type)}
                    </div>
                  )}
                </div>
                
                {/* Activity Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-white text-base group-hover:text-gray-100 transition-colors duration-300">
                        {activity.user && (
                          <span className="font-semibold text-[#0B874F] group-hover:text-[#0ea55c] transition-colors duration-300">
                            {activity.user.name}
                            {activity.user.githubUsername && (
                              <span className="text-gray-400 font-normal"> (@{activity.user.githubUsername})</span>
                            )}
                          </span>
                        )}
                        {activity.user && ' '}
                        {activity.message}
                      </p>
                      
                      <div className="flex items-center space-x-3 mt-2">
                        {activity.repo && (
                          <>
                            <span className="text-[#0B874F] text-sm font-medium bg-[#0B874F]/10 px-2 py-1 rounded-md">
                              {activity.repo}
                            </span>
                          </>
                        )}
                        {activity.target && activity.target !== activity.repo && (
                          <>
                            <span className="text-[#0B874F] text-sm font-medium bg-[#0B874F]/10 px-2 py-1 rounded-md">
                              {activity.target}
                            </span>
                          </>
                        )}
                        <span className="text-gray-400 text-sm">{activity.time}</span>
                      </div>
                    </div>
                    
                    {/* Activity Type Badge */}
                    <span className="flex-shrink-0 ml-4 px-3 py-1 bg-black/40 border border-white/10 rounded-full text-sm font-medium text-gray-300 capitalize group-hover:bg-[#0B874F]/20 group-hover:text-[#0B874F] transition-all duration-300">
                      {activity.type.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-black/40 backdrop-blur-sm border border-[#0B874F]/30 rounded-lg p-12 text-center">
          <Activity className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
          <h3 className="text-xl font-bold text-gray-400 mb-2">No Activity Yet</h3>
          <p className="text-gray-500">
            Start contributing to see activity here!
          </p>
        </div>
      )}
    </div>
  );
}