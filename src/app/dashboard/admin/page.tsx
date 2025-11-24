"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Shield, CheckCircle, XCircle, Clock, GitBranch, Calendar, Users, AlertCircle } from "lucide-react";

interface PendingProject {
  id: string;
  name: string;
  description: string;
  repoUrl?: string;
  language: string;
  createdAt: string;
  creator: {
    name: string;
    githubUsername?: string;
  };
  members: Array<{
    user: {
      name: string;
      githubUsername?: string;
    };
    role: string;
  }>;
}

interface PendingEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  type: string;
  maxAttendees: number;
  createdAt: string;
  creator: {
    name: string;
    githubUsername?: string;
  };
}

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [pendingProjects, setPendingProjects] = useState<PendingProject[]>([]);
  const [pendingEvents, setPendingEvents] = useState<PendingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'projects' | 'events'>('projects');
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    // Check if user has admin access
    if (!user || !['ADMIN', 'MAINTAINER', 'MODERATOR'].includes(user.role?.toUpperCase() || '')) {
      router.push('/dashboard');
      return;
    }

    fetchPendingItems();
  }, [user, router]);

  const fetchPendingItems = async () => {
    try {
      setLoading(true);
      const [projectsRes, eventsRes] = await Promise.all([
        fetch('/api/dashboard/admin/pending-projects'),
        fetch('/api/dashboard/admin/pending-events')
      ]);

      if (projectsRes.ok) {
        const projectsData = await projectsRes.json();
        setPendingProjects(projectsData.projects || []);
      }

      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        setPendingEvents(eventsData.events || []);
      }
    } catch (error) {
      console.error('Error fetching pending items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveProject = async (projectId: string) => {
    try {
      setProcessing(projectId);
      const response = await fetch(`/api/dashboard/admin/approve-project`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, action: 'approve' })
      });

      if (response.ok) {
        await fetchPendingItems();
        alert('Project approved successfully!');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to approve project');
      }
    } catch (error) {
      console.error('Error approving project:', error);
      alert('Failed to approve project');
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectProject = async (projectId: string) => {
    const reason = prompt('Enter rejection reason (optional):');
    
    try {
      setProcessing(projectId);
      const response = await fetch(`/api/dashboard/admin/approve-project`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, action: 'reject', reason })
      });

      if (response.ok) {
        await fetchPendingItems();
        alert('Project rejected');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to reject project');
      }
    } catch (error) {
      console.error('Error rejecting project:', error);
      alert('Failed to reject project');
    } finally {
      setProcessing(null);
    }
  };

  const handleApproveEvent = async (eventId: string) => {
    try {
      setProcessing(eventId);
      const response = await fetch(`/api/dashboard/admin/approve-event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, action: 'approve' })
      });

      if (response.ok) {
        await fetchPendingItems();
        alert('Event approved successfully!');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to approve event');
      }
    } catch (error) {
      console.error('Error approving event:', error);
      alert('Failed to approve event');
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectEvent = async (eventId: string) => {
    const reason = prompt('Enter rejection reason (optional):');
    
    try {
      setProcessing(eventId);
      const response = await fetch(`/api/dashboard/admin/approve-event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, action: 'reject', reason })
      });

      if (response.ok) {
        await fetchPendingItems();
        alert('Event rejected');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to reject event');
      }
    } catch (error) {
      console.error('Error rejecting event:', error);
      alert('Failed to reject event');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-black/40 backdrop-blur-sm border border-yellow-500/30 rounded-lg p-6">
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
      <div className="bg-gradient-to-r from-black/60 to-yellow-500/10 backdrop-blur-sm border border-yellow-500/30 rounded-xl p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
              <Shield className="w-10 h-10 mr-4 text-yellow-500" />
              Admin Panel
            </h1>
            <p className="text-gray-300 text-lg">
              Review and approve pending projects and events
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-500">{pendingProjects.length}</div>
              <div className="text-sm text-gray-400">Pending Projects</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-500">{pendingEvents.length}</div>
              <div className="text-sm text-gray-400">Pending Events</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4">
        <button
          onClick={() => setActiveTab('projects')}
          className={`flex items-center px-6 py-3 rounded-xl transition-all duration-300 font-medium ${
            activeTab === 'projects'
              ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/30'
              : 'bg-black/30 text-gray-400 hover:text-yellow-500 hover:bg-yellow-500/10'
          }`}
        >
          <GitBranch className="w-4 h-4 mr-2" />
          Projects ({pendingProjects.length})
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`flex items-center px-6 py-3 rounded-xl transition-all duration-300 font-medium ${
            activeTab === 'events'
              ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/30'
              : 'bg-black/30 text-gray-400 hover:text-yellow-500 hover:bg-yellow-500/10'
          }`}
        >
          <Calendar className="w-4 h-4 mr-2" />
          Events ({pendingEvents.length})
        </button>
      </div>

      {/* Projects Tab */}
      {activeTab === 'projects' && (
        <div className="space-y-4">
          {pendingProjects.length > 0 ? (
            pendingProjects.map((project) => (
              <div
                key={project.id}
                className="bg-black/40 backdrop-blur-sm border border-yellow-500/30 rounded-lg p-6 hover:border-yellow-500/50 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-2xl font-bold text-white">{project.name}</h3>
                      <span className="px-3 py-1 bg-yellow-500/20 text-yellow-500 rounded-full text-xs font-medium border border-yellow-500/30">
                        <Clock className="w-3 h-3 inline mr-1" />
                        Pending Approval
                      </span>
                    </div>

                    <p className="text-gray-400 mb-4">{project.description}</p>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-sm">
                        <span className="text-gray-500">Language:</span>
                        <span className="text-white ml-2">{project.language}</span>
                      </div>
                      {project.repoUrl && (
                        <div className="text-sm">
                          <span className="text-gray-500">Repository:</span>
                          <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="text-[#0B874F] ml-2 hover:underline">
                            View Repo
                          </a>
                        </div>
                      )}
                      <div className="text-sm">
                        <span className="text-gray-500">Created:</span>
                        <span className="text-white ml-2">{new Date(project.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-500">Creator:</span>
                        <span className="text-white ml-2">{project.creator.name}</span>
                      </div>
                    </div>

                    {/* Collaborators */}
                    {project.members.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-400 mb-2 flex items-center">
                          <Users className="w-4 h-4 mr-2" />
                          Collaborators ({project.members.length})
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {project.members.map((member, idx) => (
                            <div key={idx} className="px-3 py-1 bg-[#0B874F]/10 border border-[#0B874F]/30 rounded-full text-sm">
                              <span className="text-white">{member.user.name}</span>
                              {member.user.githubUsername && (
                                <span className="text-gray-400 ml-1">(@{member.user.githubUsername})</span>
                              )}
                              <span className="text-gray-500 ml-2">• {member.role}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col space-y-2 ml-6">
                    <button
                      onClick={() => handleApproveProject(project.id)}
                      disabled={processing === project.id}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectProject(project.id)}
                      disabled={processing === project.id}
                      className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-black/40 backdrop-blur-sm border border-yellow-500/30 rounded-lg p-12 text-center">
              <GitBranch className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
              <h3 className="text-xl font-bold text-gray-400 mb-2">No Pending Projects</h3>
              <p className="text-gray-500">All projects have been reviewed!</p>
            </div>
          )}
        </div>
      )}

      {/* Events Tab */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          {pendingEvents.length > 0 ? (
            pendingEvents.map((event) => (
              <div
                key={event.id}
                className="bg-black/40 backdrop-blur-sm border border-yellow-500/30 rounded-lg p-6 hover:border-yellow-500/50 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-2xl font-bold text-white">{event.title}</h3>
                      <span className="px-3 py-1 bg-yellow-500/20 text-yellow-500 rounded-full text-xs font-medium border border-yellow-500/30">
                        <Clock className="w-3 h-3 inline mr-1" />
                        Pending Approval
                      </span>
                    </div>

                    <p className="text-gray-400 mb-4">{event.description}</p>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-sm">
                        <span className="text-gray-500">Type:</span>
                        <span className="text-white ml-2">{event.type}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-500">Date:</span>
                        <span className="text-white ml-2">{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-500">Location:</span>
                        <span className="text-white ml-2">{event.location}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-500">Max Attendees:</span>
                        <span className="text-white ml-2">{event.maxAttendees}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-500">Creator:</span>
                        <span className="text-white ml-2">{event.creator.name}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col space-y-2 ml-6">
                    <button
                      onClick={() => handleApproveEvent(event.id)}
                      disabled={processing === event.id}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectEvent(event.id)}
                      disabled={processing === event.id}
                      className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-black/40 backdrop-blur-sm border border-yellow-500/30 rounded-lg p-12 text-center">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
              <h3 className="text-xl font-bold text-gray-400 mb-2">No Pending Events</h3>
              <p className="text-gray-500">All events have been reviewed!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
