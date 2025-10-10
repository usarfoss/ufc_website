"use client";

import React, { useEffect, useState } from "react";
import { Activity, GitCommit, GitPullRequest, Calendar, Users, RefreshCw } from "lucide-react";

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
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<number>(0);
  const [cooldownTime, setCooldownTime] = useState<number>(0);
  const [showSuccess, setShowSuccess] = useState(false);
  useEffect(() => {
    fetchActivities();
    
    // Load last refresh time from localStorage
    const savedLastRefresh = localStorage.getItem('activity-last-refresh');
    if (savedLastRefresh) {
      const lastRefreshTime = parseInt(savedLastRefresh);
      const now = Date.now();
      const timeSinceLastRefresh = now - lastRefreshTime;
      const COOLDOWN_DURATION = 600000; // 10 minutes
      
      if (timeSinceLastRefresh < COOLDOWN_DURATION) {
        const remainingTime = Math.ceil((COOLDOWN_DURATION - timeSinceLastRefresh) / 1000);
        setLastRefresh(lastRefreshTime);
        setCooldownTime(remainingTime);
      }
    }
  }, []);

  // Cooldown timer effect
  useEffect(() => {
    if (cooldownTime > 0) {
      const timer = setTimeout(() => {
        const newCooldownTime = Math.max(0, cooldownTime - 1);
        setCooldownTime(newCooldownTime);
        
        // Update localStorage with remaining time
        if (newCooldownTime > 0) {
          const remainingTime = newCooldownTime * 1000;
          const newLastRefresh = Date.now() - (600000 - remainingTime);
          localStorage.setItem('activity-last-refresh', newLastRefresh.toString());
        } else {
          // Cooldown finished, remove from localStorage
          localStorage.removeItem('activity-last-refresh');
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownTime]);

  const handleRefresh = async () => {
    const now = Date.now();
    
    // Server-side rate limiting will handle cooldown
    setRefreshing(true);
    setError(null);
    
    try {
      // Force refresh from GitHub API
      const response = await fetch(`/api/dashboard/global-activities?limit=50&offset=0&refresh=true`);
      const data = await response.json();
      
      if (response.ok) {
        setActivities(data.activities || []);
        setLastRefresh(now);
        setCooldownTime(0);
        setShowSuccess(true);
        
        // Save last refresh time to localStorage for UI consistency
        localStorage.setItem('activity-last-refresh', now.toString());
        
        setTimeout(() => setShowSuccess(false), 3000); // Hide success message after 3 seconds
      } else if (response.status === 429 && data.rateLimited) {
        // Server-side rate limiting
        const remainingTime = data.remainingTime || 0;
        setCooldownTime(remainingTime);
        setLastRefresh(now - (600 - remainingTime) * 1000); // Calculate last refresh time
        setError(`Rate limited: ${data.message}`);
        
        // Update localStorage to match server state
        localStorage.setItem('activity-last-refresh', (now - (600 - remainingTime) * 1000).toString());
      } else {
        setError(data.message || 'Failed to refresh activities');
      }
    } catch (err) {
      setError('Failed to refresh activities');
    } finally {
      setRefreshing(false);
    }
  };

         const fetchActivities = async () => {
           try {
             setLoading(true);
             setError(null);
             
             // Progressive loading: start with cached data if available
             try {
               const cachedResponse = await fetch(`/api/dashboard/global-activities?limit=20&offset=0`, {
                 signal: AbortSignal.timeout(5000) // 5 second timeout for cached data
               });
               
               if (cachedResponse.ok) {
                 const cachedData = await cachedResponse.json();
                 if (cachedData.activities && cachedData.activities.length > 0) {
                   setActivities(cachedData.activities);
                   setLoading(false); // Show cached data immediately
                   
                   // Continue loading more data in background
                   fetchMoreActivities(20);
                   return;
                 }
               }
             } catch (cachedError) {
               console.log('No cached data available, proceeding with fresh fetch');
             }
             
             // Fresh data fetch with timeout
             const controller = new AbortController();
             const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout
             
             const response = await fetch(`/api/dashboard/global-activities?limit=30`, {
               signal: controller.signal
             });
             
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

         const fetchMoreActivities = async (offset: number) => {
           try {
             const response = await fetch(`/api/dashboard/global-activities?limit=20&offset=${offset}`, {
               signal: AbortSignal.timeout(15000) // 15 second timeout
             });
             
             if (response.ok) {
               const data = await response.json();
               if (data.activities && data.activities.length > 0) {
                 setActivities(prev => [...prev, ...data.activities]);
               }
             }
           } catch (error) {
             console.warn('Failed to fetch more activities:', error);
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
                 {[...Array(6)].map((_, i) => (
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
               <div className="text-center py-4">
                 <div className="inline-flex items-center space-x-2 text-[#0B874F]">
                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#0B874F]"></div>
                   <span className="text-sm">Loading activities from last 36 hours...</span>
                 </div>
               </div>
             </div>
           );
         }

         if (error) {
           return (
             <div className="space-y-6">
               <div className="bg-red-900/20 backdrop-blur-sm border border-red-500/30 rounded-lg p-6">
                 <h2 className="text-xl font-bold text-red-400 mb-2">Error Loading Activity</h2>
                 <p className="text-gray-400 mb-4">{error}</p>
                 <div className="flex space-x-3">
                   <button 
                     onClick={fetchActivities}
                     className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                   >
                     Retry
                   </button>
                   <button 
                     onClick={() => {
                       setError(null);
                       setActivities([]);
                       fetchActivities();
                     }}
                     className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                   >
                     Clear & Retry
                   </button>
                 </div>
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
                     See what everyone in the community is working on - commits, PRs, and issues
                   </p>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing || cooldownTime > 0}
              className={`
                flex items-center space-x-2 px-6 py-3 font-bold rounded-xl transition-all duration-300 
                transform hover:scale-105 active:scale-95 shadow-lg
                ${refreshing || cooldownTime > 0 
                  ? 'bg-gray-600 text-gray-300 cursor-not-allowed opacity-60' 
                  : 'bg-gradient-to-r from-[#0B874F] to-[#0a6b3f] text-white hover:from-[#0a6b3f] hover:to-[#0B874F] hover:shadow-[0_0_20px_rgba(11,135,79,0.4)]'
                }
              `}
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="text-sm">
                {refreshing 
                  ? 'Refreshing...' 
                  : cooldownTime > 0 
                    ? cooldownTime >= 60 
                      ? `Wait ${Math.floor(cooldownTime / 60)}m ${cooldownTime % 60}s`
                      : `Wait ${cooldownTime}s`
                    : 'Refresh'
                }
              </span>
            </button>
            {cooldownTime > 0 && (
              <div className="text-xs text-gray-400 text-center">
                <div className="w-16 h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#0B874F] transition-all duration-1000"
                    style={{ width: `${((600 - cooldownTime) / 600) * 100}%` }}
                  />
                </div>
                <span>10min cooldown</span>
              </div>
            )}
            {showSuccess && (
              <div className="text-xs text-green-400 text-center animate-pulse">
                ✓ Refreshed successfully
              </div>
            )}
          </div>
          
        </div>
      </div>

      {/* Activity Feed */}
      {activities.length > 0 ? (
        <div className="space-y-4">
                {activities.map((activity, index) => (
                  <div
                    key={`${activity.id || 'act'}-${activity.timestamp || 't'}-${index}`}
              className={`group bg-gradient-to-r from-black/60 to-black/40 backdrop-blur-sm border rounded-xl p-6 hover:border-[#0B874F]/60 hover:shadow-lg hover:shadow-[#0B874F]/10 transition-all duration-300 hover:scale-[1.02] ${getActivityColor(activity.type)}`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start space-x-4">
                {/* User Avatar or Activity Icon */}
                <div className="flex-shrink-0 mt-1">
                  {activity.user?.avatar ? (
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#0B874F]/30 group-hover:border-[#0B874F] transition-colors duration-300">
                      <img 
                        src={activity.user.avatar || (activity.user.githubUsername ? `https://github.com/${activity.user.githubUsername}.png` : '')} 
                        alt={activity.user.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : activity.user?.githubUsername ? (
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#0B874F]/30 group-hover:border-[#0B874F] transition-colors duration-300">
                      <img 
                        src={`https://github.com/${activity.user.githubUsername}.png`} 
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