"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { User, Github, MapPin, Calendar, Mail, Edit, Save, X, Activity } from "lucide-react";
import GitCommandsLoader from '@/components/ui/git-commands-loader';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  githubUsername?: string;
  location?: string;
  bio?: string;
  avatar?: string;
  joinedAt: string;
  lastActive: string;
  githubStats?: {
    commits: number;
    pullRequests: number;
    issues: number;
    repositories: number;
    followers: number;
    contributions: number;
    languages: Record<string, number>;
  };
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    githubUsername: '',
    location: '',
    bio: ''
  });
  const [saving, setSaving] = useState(false);
  const [languages, setLanguages] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const [profileResponse, languagesResponse] = await Promise.all([
        fetch('/api/dashboard/profile'),
        fetch('/api/dashboard/top-languages')
      ]);
      
      if (!profileResponse.ok) {
        throw new Error('Failed to fetch profile');
      }

      const profileData = await profileResponse.json();
      setProfile(profileData.profile);
      
      // Fetch languages using getTopLanguagesFromReadmeStats method
      if (languagesResponse.ok) {
        const languagesData = await languagesResponse.json();
        if (languagesData.languages) {
          setLanguages(languagesData.languages);
        }
      }
      
      // Initialize edit form
      setEditForm({
        name: profileData.profile.name || '',
        githubUsername: profileData.profile.githubUsername || '',
        location: profileData.profile.location || '',
        bio: profileData.profile.bio || ''
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/dashboard/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      await fetchProfile();
      setEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditForm({
      name: profile?.name || '',
      githubUsername: profile?.githubUsername || '',
      location: profile?.location || '',
      bio: profile?.bio || ''
    });
    setEditing(false);
  };

  const getTopLanguages = () => {
    if (!languages || Object.keys(languages).length === 0) return [];
    
    // Filter out invalid language names and ensure they're strings
    const validLanguages = Object.entries(languages)
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
    return <GitCommandsLoader />;
  }

  if (!profile) {
    return (
      <div className="bg-red-900/20 backdrop-blur-sm border border-red-500/30 rounded-lg p-6">
        <h2 className="text-xl font-bold text-red-400 mb-2">Profile Not Found</h2>
        <p className="text-gray-400">Unable to load your profile information.</p>
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
              <User className="w-10 h-10 mr-4 text-[#0B874F]" />
              My Profile
            </h1>
            <p className="text-gray-300 text-lg">
              Manage your account information and GitHub integration
            </p>
          </div>
          
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center px-4 py-2 bg-[#0B874F]/10 border border-[#0B874F]/30 rounded-lg text-[#0B874F] hover:bg-[#0B874F]/20 transition-colors"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center px-4 py-2 bg-[#0B874F] text-black rounded-lg hover:bg-[#0B874F]/80 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center px-4 py-2 bg-gray-500/20 text-gray-400 rounded-lg hover:bg-gray-500/30 transition-colors"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-black/40 backdrop-blur-sm border border-[#0B874F]/30 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Basic Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Name</label>
                {editing ? (
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-black/50 border border-[#0B874F]/30 rounded-lg text-white focus:outline-none focus:border-[#0B874F]"
                  />
                ) : (
                  <p className="text-white">{profile.name || 'Not set'}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                <p className="text-white flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  {profile.email}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">GitHub Username</label>
                {editing ? (
                  <input
                    type="text"
                    value={editForm.githubUsername}
                    onChange={(e) => setEditForm({ ...editForm, githubUsername: e.target.value })}
                    className="w-full px-3 py-2 bg-black/50 border border-[#0B874F]/30 rounded-lg text-white focus:outline-none focus:border-[#0B874F]"
                    placeholder="your-github-username"
                  />
                ) : (
                  <p className="text-white flex items-center">
                    <Github className="w-4 h-4 mr-2" />
                    {profile.githubUsername || 'Not connected'}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Location</label>
                {editing ? (
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    className="w-full px-3 py-2 bg-black/50 border border-[#0B874F]/30 rounded-lg text-white focus:outline-none focus:border-[#0B874F]"
                    placeholder="City, Country"
                  />
                ) : (
                  <p className="text-white flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    {profile.location || 'Not set'}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Bio</label>
                {editing ? (
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 bg-black/50 border border-[#0B874F]/30 rounded-lg text-white focus:outline-none focus:border-[#0B874F]"
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="text-white">{profile.bio || 'No bio added yet'}</p>
                )}
              </div>
            </div>
          </div>

          {/* GitHub Stats */}
          {profile.githubStats && (
            <div className="bg-black/40 backdrop-blur-sm border border-[#0B874F]/30 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">GitHub Statistics</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#0B874F]">{profile.githubStats.commits}</div>
                  <div className="text-sm text-gray-400">Commits</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#F5A623]">{profile.githubStats.pullRequests}</div>
                  <div className="text-sm text-gray-400">Pull Requests</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#E74C3C]">{profile.githubStats.issues}</div>
                  <div className="text-sm text-gray-400">Issues</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#9B59B6]">{profile.githubStats.repositories}</div>
                  <div className="text-sm text-gray-400">Repositories</div>
                </div>
              </div>

              {/* Top Languages */}
              <div>
                <h3 className="text-lg font-bold text-white mb-3 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-[#0B874F]" />
                  Top Languages
                </h3>
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
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Avatar */}
          <div className="bg-black/40 backdrop-blur-sm border border-[#0B874F]/30 rounded-lg p-6 text-center">
            <div className="w-24 h-24 mx-auto mb-4 bg-[#0B874F]/20 rounded-full flex items-center justify-center overflow-hidden">
              {profile.avatar ? (
                <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-[#0B874F] text-3xl font-bold">
                  {profile.name?.charAt(0) || profile.email.charAt(0)}
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold text-white">{profile.name || 'Anonymous'}</h3>
            {profile.githubUsername && (
              <p className="text-gray-400">@{profile.githubUsername}</p>
            )}
          </div>

          {/* Account Info */}
          <div className="bg-black/40 backdrop-blur-sm border border-[#0B874F]/30 rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-4">Account Info</h3>
            
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                <span className="text-gray-400">Joined:</span>
                <span className="text-white ml-2">
                  {new Date(profile.joinedAt).toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex items-center text-sm">
                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                <span className="text-gray-400">Last Active:</span>
                <span className="text-white ml-2">
                  {new Date(profile.lastActive).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}