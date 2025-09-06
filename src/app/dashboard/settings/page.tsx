"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Settings, Bell, Shield, Github, Save, RefreshCw } from "lucide-react";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: false,
      achievements: true,
      events: true,
      projects: true
    },
    privacy: {
      profileVisible: true,
      statsVisible: true,
      activityVisible: false
    }
  });

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/dashboard/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      alert('Settings saved successfully!');
    } catch (err) {
      console.error('Error saving settings:', err);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSyncGitHub = async () => {
    if (!user?.githubUsername) {
      alert('No GitHub username configured. Please update your profile first.');
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

      alert('GitHub data synced successfully!');
    } catch (err) {
      console.error('Error syncing GitHub:', err);
      alert(err instanceof Error ? err.message : 'Failed to sync GitHub data');
    } finally {
      setSyncing(false);
    }
  };

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      await logout();
      window.location.href = '/login';
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notifications */}
        <div className="bg-black/40 backdrop-blur-sm border border-[#0B874F]/30 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Notifications
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-white font-medium">Email Notifications</label>
                <p className="text-sm text-gray-400">Receive updates via email</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications.email}
                onChange={(e) => setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, email: e.target.checked }
                })}
                className="w-4 h-4 text-[#0B874F] bg-black border-[#0B874F]/30 rounded focus:ring-[#0B874F]"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-white font-medium">Push Notifications</label>
                <p className="text-sm text-gray-400">Browser notifications</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications.push}
                onChange={(e) => setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, push: e.target.checked }
                })}
                className="w-4 h-4 text-[#0B874F] bg-black border-[#0B874F]/30 rounded focus:ring-[#0B874F]"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-white font-medium">Achievement Alerts</label>
                <p className="text-sm text-gray-400">New badges and achievements</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications.achievements}
                onChange={(e) => setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, achievements: e.target.checked }
                })}
                className="w-4 h-4 text-[#0B874F] bg-black border-[#0B874F]/30 rounded focus:ring-[#0B874F]"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-white font-medium">Event Updates</label>
                <p className="text-sm text-gray-400">Workshop and meetup notifications</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications.events}
                onChange={(e) => setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, events: e.target.checked }
                })}
                className="w-4 h-4 text-[#0B874F] bg-black border-[#0B874F]/30 rounded focus:ring-[#0B874F]"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-white font-medium">Project Updates</label>
                <p className="text-sm text-gray-400">New projects and contributions</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications.projects}
                onChange={(e) => setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, projects: e.target.checked }
                })}
                className="w-4 h-4 text-[#0B874F] bg-black border-[#0B874F]/30 rounded focus:ring-[#0B874F]"
              />
            </div>
          </div>
        </div>

        {/* Privacy */}
        <div className="bg-black/40 backdrop-blur-sm border border-[#0B874F]/30 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Privacy
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-white font-medium">Public Profile</label>
                <p className="text-sm text-gray-400">Make your profile visible to others</p>
              </div>
              <input
                type="checkbox"
                checked={settings.privacy.profileVisible}
                onChange={(e) => setSettings({
                  ...settings,
                  privacy: { ...settings.privacy, profileVisible: e.target.checked }
                })}
                className="w-4 h-4 text-[#0B874F] bg-black border-[#0B874F]/30 rounded focus:ring-[#0B874F]"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-white font-medium">Show Statistics</label>
                <p className="text-sm text-gray-400">Display your GitHub stats publicly</p>
              </div>
              <input
                type="checkbox"
                checked={settings.privacy.statsVisible}
                onChange={(e) => setSettings({
                  ...settings,
                  privacy: { ...settings.privacy, statsVisible: e.target.checked }
                })}
                className="w-4 h-4 text-[#0B874F] bg-black border-[#0B874F]/30 rounded focus:ring-[#0B874F]"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-white font-medium">Activity Feed</label>
                <p className="text-sm text-gray-400">Show your activity to others</p>
              </div>
              <input
                type="checkbox"
                checked={settings.privacy.activityVisible}
                onChange={(e) => setSettings({
                  ...settings,
                  privacy: { ...settings.privacy, activityVisible: e.target.checked }
                })}
                className="w-4 h-4 text-[#0B874F] bg-black border-[#0B874F]/30 rounded focus:ring-[#0B874F]"
              />
            </div>
          </div>
        </div>

        {/* GitHub Integration */}
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
                    disabled={syncing}
                    className="w-full flex items-center justify-center px-4 py-2 bg-[#0B874F]/10 border border-[#0B874F]/30 rounded-lg text-[#0B874F] hover:bg-[#0B874F]/20 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                    {syncing ? 'Syncing...' : 'Sync GitHub Data'}
                  </button>
                  
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

        {/* Account Actions */}
        <div className="bg-black/40 backdrop-blur-sm border border-[#0B874F]/30 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Account Actions</h2>
          
          <div className="space-y-4">
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="w-full flex items-center justify-center px-4 py-2 bg-[#0B874F] text-black rounded-lg hover:bg-[#0B874F]/80 transition-colors disabled:opacity-50 font-medium"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
            
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 bg-red-600/20 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}