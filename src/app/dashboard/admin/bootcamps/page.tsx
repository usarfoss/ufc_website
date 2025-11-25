"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { 
  Trophy, 
  Plus, 
  Calendar, 
  Users, 
  Play, 
  Edit, 
  Trash2,
  CheckCircle,
  Target
} from "lucide-react";

interface Bootcamp {
  id: string;
  name: string;
  description: string;
  type: 'LEETCODE' | 'GITHUB';
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  startDate: string;
  endDate: string;
  createdAt: string;
  creator: {
    name: string;
    email: string;
  };
  _count: {
    participants: number;
  };
}

export default function AdminBootcampsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [bootcamps, setBootcamps] = useState<Bootcamp[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    type: 'LEETCODE' as 'LEETCODE' | 'GITHUB',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    if (!user || !['ADMIN', 'MAINTAINER', 'MODERATOR'].includes(user.role?.toUpperCase() || '')) {
      router.push('/dashboard');
      return;
    }
    fetchBootcamps();
  }, [user, router]);

  const fetchBootcamps = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/bootcamps');
      if (response.ok) {
        const data = await response.json();
        setBootcamps(data.bootcamps || []);
      }
    } catch (error) {
      console.error('Error fetching bootcamps:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBootcamp = async () => {
    if (!createForm.name.trim() || !createForm.description.trim() || !createForm.startDate || !createForm.endDate) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setCreating(true);
      const response = await fetch('/api/admin/bootcamps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm)
      });

      if (response.ok) {
        setCreateForm({
          name: '',
          description: '',
          type: 'LEETCODE',
          startDate: '',
          endDate: ''
        });
        setShowCreateModal(false);
        await fetchBootcamps();
        alert('Bootcamp created successfully!');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to create bootcamp');
      }
    } catch (error) {
      console.error('Error creating bootcamp:', error);
      alert('Failed to create bootcamp');
    } finally {
      setCreating(false);
    }
  };

  const handleActivateBootcamp = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/bootcamps/${id}/activate`, {
        method: 'POST'
      });
      if (response.ok) {
        await fetchBootcamps();
        alert('Bootcamp activated successfully!');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to activate bootcamp');
      }
    } catch (error) {
      console.error('Error activating bootcamp:', error);
      alert('Failed to activate bootcamp');
    }
  };

  const handleCompleteBootcamp = async (id: string) => {
    if (!confirm('Are you sure you want to complete this bootcamp? This will finalize all rankings.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/bootcamps/${id}/complete`, {
        method: 'POST'
      });
      if (response.ok) {
        await fetchBootcamps();
        alert('Bootcamp completed successfully!');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to complete bootcamp');
      }
    } catch (error) {
      console.error('Error completing bootcamp:', error);
      alert('Failed to complete bootcamp');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UPCOMING': return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
      case 'ACTIVE': return 'text-green-400 bg-green-400/10 border-green-400/30';
      case 'COMPLETED': return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
      case 'CANCELLED': return 'text-red-400 bg-red-400/10 border-red-400/30';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-black/60 to-[#0B874F]/10 backdrop-blur-sm border border-[#0B874F]/30 rounded-xl p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
              <Trophy className="w-10 h-10 mr-4 text-[#0B874F]" />
              Bootcamp Management
            </h1>
            <p className="text-gray-300 text-lg">
              Create and manage coding competitions
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-6 py-3 bg-[#0B874F] text-white rounded-lg hover:bg-[#0B874F]/80 transition-colors font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Bootcamp
          </button>
        </div>
      </div>

      {/* Bootcamps List */}
      <div className="space-y-4">
        {bootcamps.length > 0 ? (
          <>
            {bootcamps
              .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
              .map((bootcamp) => (
            <div
              key={bootcamp.id}
              className="bg-black/40 backdrop-blur-sm border border-[#0B874F]/30 rounded-lg p-6 hover:border-[#0B874F]/50 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-2xl font-bold text-white">{bootcamp.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(bootcamp.status)}`}>
                      {bootcamp.status}
                    </span>
                  </div>
                  <p className="text-gray-400 mb-4">{bootcamp.description}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-sm">
                      <span className="text-gray-500">Type:</span>
                      <span className="text-white ml-2">{bootcamp.type}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">Participants:</span>
                      <span className="text-white ml-2">{bootcamp._count.participants}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">Start:</span>
                      <span className="text-white ml-2">{new Date(bootcamp.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">End:</span>
                      <span className="text-white ml-2">{new Date(bootcamp.endDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    Created by {bootcamp.creator.name} on {new Date(bootcamp.createdAt).toLocaleDateString()}
                  </div>
                </div>
                {/* Action Buttons */}
                <div className="flex flex-col space-y-2 ml-6">
                  {bootcamp.status === 'UPCOMING' && (
                    <button
                      onClick={() => handleActivateBootcamp(bootcamp.id)}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Activate
                    </button>
                  )}
                  {bootcamp.status === 'ACTIVE' && (
                    <button
                      onClick={() => handleCompleteBootcamp(bootcamp.id)}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Complete
                    </button>
                  )}
                  <button
                    onClick={() => router.push(`/bootcamp/${bootcamp.id}/leaderboard`)}
                    className="flex items-center px-4 py-2 bg-[#0B874F] text-white rounded-lg hover:bg-[#0B874F]/80 transition-colors text-sm"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    View
                  </button>
                </div>
              </div>
            </div>
              ))}

            {/* Pagination */}
            {bootcamps.length > itemsPerPage && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-[#0B874F]/20">
                <div className="text-sm text-gray-400">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, bootcamps.length)} of {bootcamps.length} bootcamps
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-[#0B874F]/20 text-[#0B874F] rounded-lg hover:bg-[#0B874F]/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.ceil(bootcamps.length / itemsPerPage) }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-lg transition-colors ${
                          currentPage === page
                            ? 'bg-[#0B874F] text-white'
                            : 'bg-[#0B874F]/20 text-[#0B874F] hover:bg-[#0B874F]/30'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(Math.ceil(bootcamps.length / itemsPerPage), p + 1))}
                    disabled={currentPage === Math.ceil(bootcamps.length / itemsPerPage)}
                    className="px-4 py-2 bg-[#0B874F]/20 text-[#0B874F] rounded-lg hover:bg-[#0B874F]/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-black/40 backdrop-blur-sm border border-[#0B874F]/30 rounded-lg p-12 text-center">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
            <h3 className="text-xl font-bold text-gray-400 mb-2">No Bootcamps Yet</h3>
            <p className="text-gray-500 mb-6">Create your first coding competition!</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-[#0B874F] text-white rounded-lg hover:bg-[#0B874F]/80 transition-colors font-medium"
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Create Bootcamp
            </button>
          </div>
        )}
      </div>

      {/* Create Bootcamp Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-black/90 border border-[#0B874F]/30 rounded-xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-white mb-6">Create New Bootcamp</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Name *</label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-black/50 border border-[#0B874F]/30 rounded-lg text-white focus:outline-none focus:border-[#0B874F]"
                  placeholder="DSA Challenge 2024"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Description *</label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-black/50 border border-[#0B874F]/30 rounded-lg text-white focus:outline-none focus:border-[#0B874F]"
                  rows={3}
                  placeholder="A 7-day intensive coding challenge..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Type *</label>
                <select
                  value={createForm.type}
                  onChange={(e) => setCreateForm({ ...createForm, type: e.target.value as 'LEETCODE' | 'GITHUB' })}
                  className="w-full px-3 py-2 bg-black/50 border border-[#0B874F]/30 rounded-lg text-white focus:outline-none focus:border-[#0B874F]"
                >
                  <option value="LEETCODE">LeetCode DSA</option>
                  <option value="GITHUB">GitHub Open Source</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Start Date *</label>
                  <input
                    type="datetime-local"
                    value={createForm.startDate}
                    onChange={(e) => setCreateForm({ ...createForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-black/50 border border-[#0B874F]/30 rounded-lg text-white focus:outline-none focus:border-[#0B874F]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">End Date *</label>
                  <input
                    type="datetime-local"
                    value={createForm.endDate}
                    onChange={(e) => setCreateForm({ ...createForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 bg-black/50 border border-[#0B874F]/30 rounded-lg text-white focus:outline-none focus:border-[#0B874F]"
                  />
                </div>
              </div>
            </div>
            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 bg-gray-500/20 text-gray-400 rounded-lg hover:bg-gray-500/30 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBootcamp}
                disabled={creating}
                className="flex-1 px-4 py-2 bg-[#0B874F] text-white rounded-lg hover:bg-[#0B874F]/80 transition-colors font-medium disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
