"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Settings, Github, RefreshCw } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const [syncing, setSyncing] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  // Check for existing cooldown on page load
  useEffect(() => {
    const lastSync = localStorage.getItem('lastGitHubSync');
    if (lastSync) {
      const timeSinceLastSync = Date.now() - parseInt(lastSync);
      const cooldownDuration = 10 * 60 * 1000; // 10 minutes
      
      if (timeSinceLastSync < cooldownDuration) {
        const remaining = Math.ceil((cooldownDuration - timeSinceLastSync) / 1000);
        setCooldownTime(remaining);
        
        // Start countdown
        const interval = setInterval(() => {
          setCooldownTime(prev => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
        return () => clearInterval(interval);
    }
    }
  }, []);

  const handleSyncGitHub = async () => {
    if (!user?.githubUsername) {
      alert('No GitHub username configured. Please update your profile first.');
      return;
    }

    if (cooldownTime > 0) {
      return; // Button should be disabled
    }

    try {
      setSyncing(true);
      setShowSuccess(false);
      
      const response = await fetch('/api/dashboard/sync-github', {
        method: 'POST'
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        if (errorData.rateLimited) {
          setCooldownTime(errorData.remainingTime);
          // Start countdown
          const interval = setInterval(() => {
            setCooldownTime(prev => {
              if (prev <= 1) {
                clearInterval(interval);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        }
        
        throw new Error(errorData.message || errorData.error || 'Failed to sync GitHub data');
      }

      // Success - set cooldown
      localStorage.setItem('lastGitHubSync', Date.now().toString());
      setCooldownTime(600); // 10 minutes
      setShowSuccess(true);
      
      // Start countdown
      const interval = setInterval(() => {
        setCooldownTime(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setShowSuccess(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (err) {
      console.error('Error syncing GitHub:', err);
      alert(err instanceof Error ? err.message : 'Failed to sync GitHub data');
    } finally {
      setSyncing(false);
    }
  };


  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-black/60 to-[#0B874F]/10 backdrop-blur-sm border border-[#0B874F]/30 rounded-xl p-8">
        <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
          <Settings className="w-10 h-10 mr-4 text-[#0B874F]" />
          Settings
        </h1>
        <p className="text-gray-300 text-lg">
          Manage your account preferences and integrations
        </p>
      </div>

        <div className="bg-black/40 backdrop-blur-sm border border-[#0B874F]/30 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <Github className="w-5 h-5 mr-2" />
            GitHub Integration
          </h2>
          
          <div className="space-y-4">
            <div>
              <p className="text-gray-400 mb-4">
                {user?.githubUsername 
                  ? `Connected as @${user.githubUsername}`
                  : 'No GitHub account connected'
                }
              </p>
              
              {user?.githubUsername ? (
                <div className="space-y-3">
                  <button
                    onClick={handleSyncGitHub}
                  disabled={syncing || cooldownTime > 0}
                    className="w-full flex items-center justify-center px-4 py-2 bg-[#0B874F]/10 border border-[#0B874F]/30 rounded-lg text-[#0B874F] hover:bg-[#0B874F]/20 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                  {syncing ? 'Syncing...' : cooldownTime > 0 ? `Wait ${Math.floor(cooldownTime / 60)}m ${cooldownTime % 60}s` : 'Sync GitHub Data'}
                  </button>
                
                {cooldownTime > 0 && (
                  <div className="text-xs text-gray-400 text-center">
                    <div className="w-full bg-gray-700 rounded-full h-1 mb-1">
                      <div 
                        className="bg-[#0B874F] h-1 rounded-full transition-all duration-1000"
                        style={{ width: `${((600 - cooldownTime) / 600) * 100}%` }}
                      />
                    </div>
                    <span>10min cooldown</span>
                  </div>
                )}
                
                {showSuccess && (
                  <div className="text-xs text-green-400 text-center animate-pulse">
                    ✓ Synced successfully
                  </div>
                )}
                  
                  <p className="text-xs text-gray-500">
                    Last sync updates your commits, PRs, and contribution stats
                  </p>
                </div>
              ) : (
                <div>
                  <button
                    onClick={() => window.location.href = '/dashboard/profile'}
                    className="w-full px-4 py-2 bg-[#0B874F] text-black rounded-lg hover:bg-[#0B874F]/80 transition-colors font-medium"
                  >
                    Connect GitHub Account
                  </button>
                  <p className="text-xs text-gray-500 mt-2">
                    Add your GitHub username in your profile to enable sync
                  </p>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}