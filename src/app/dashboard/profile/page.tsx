"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { User, Github, MapPin, Calendar, Mail, Edit, Save, X } from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  githubUsername?: string;
  leetcodeUsername?: string;
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
  leetcodeStats?: {
    totalSolved: number;
    easySolved: number;
    mediumSolved: number;
    hardSolved: number;
    ranking: number | null;
    reputation: number;
    acceptanceRate: number | null;
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
    leetcodeUsername: '',
    location: '',
    bio: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/profile');
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setProfile(data.profile);
      
      // Initialize edit form
      setEditForm({
        name: data.profile.name || '',
        githubUsername: data.profile.githubUsername || '',
        leetcodeUsername: data.profile.leetcodeUsername || '',
        location: data.profile.location || '',
        bio: data.profile.bio || ''
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
      leetcodeUsername: profile?.leetcodeUsername || '',
      location: profile?.location || '',
      bio: profile?.bio || ''
    });
    setEditing(false);
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
                <label className="block text-sm font-medium text-gray-400 mb-2">LeetCode Username</label>
                {editing ? (
                  <input
                    type="text"
                    value={editForm.leetcodeUsername}
                    onChange={(e) => setEditForm({ ...editForm, leetcodeUsername: e.target.value })}
                    className="w-full px-3 py-2 bg-black/50 border border-[#0B874F]/30 rounded-lg text-white focus:outline-none focus:border-[#0B874F]"
                    placeholder="your-leetcode-username"
                  />
                ) : (
                  <p className="text-white flex items-center">
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z"/>
                    </svg>
                    {profile.leetcodeUsername || 'Not connected'}
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

          {/* LeetCode Stats */}
          {profile.leetcodeStats && (
            <div className="bg-black/40 backdrop-blur-sm border border-[#0B874F]/30 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">LeetCode Statistics</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <div className="text-2xl font-bold text-green-500">{profile.leetcodeStats.easySolved}</div>
                  <div className="text-sm text-gray-400">Easy</div>
                </div>
                <div className="text-center p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-500">{profile.leetcodeStats.mediumSolved}</div>
                  <div className="text-sm text-gray-400">Medium</div>
                </div>
                <div className="text-center p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <div className="text-2xl font-bold text-red-500">{profile.leetcodeStats.hardSolved}</div>
                  <div className="text-sm text-gray-400">Hard</div>
                </div>
                <div className="text-center p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <div className="text-2xl font-bold text-blue-500">{profile.leetcodeStats.totalSolved}</div>
                  <div className="text-sm text-gray-400">Total</div>
                </div>
              </div>

              {profile.leetcodeStats.ranking && (
                <div className="flex items-center justify-between text-sm text-gray-400 pt-4 border-t border-gray-700">
                  <span>Global Ranking:</span>
                  <span className="text-white font-bold">#{profile.leetcodeStats.ranking.toLocaleString()}</span>
                </div>
              )}
            </div>
          )}

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