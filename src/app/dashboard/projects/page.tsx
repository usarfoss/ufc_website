"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { GitBranch, Plus, ExternalLink, Users, Calendar, Code, Settings, CheckCircle, Clock, Archive, X } from "lucide-react";

interface Project {
  id: string;
  name: string;
  description: string;
  repoUrl?: string;
  language: string;
  status: string;
  createdAt: string;
  memberCount: number;
  creator: {
    name: string;
    githubUsername?: string;
  };
}

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    repoUrl: '',
    language: '',
    collaborators: [] as Array<{ userId: string; role: string; name: string }>
  });
  const [allUsers, setAllUsers] = useState<Array<{ id: string; name: string; email: string; githubUsername?: string }>>([]);
  const [showCollaboratorModal, setShowCollaboratorModal] = useState(false);
  const [creating, setCreating] = useState(false);

  // All users can create projects (they go through approval)
  const canCreateProject = true;

  useEffect(() => {
    fetchProjects();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/dashboard/users');
      if (response.ok) {
        const data = await response.json();
        setAllUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/projects');
      
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }

      const data = await response.json();
      // Remove duplicates based on project ID
      const uniqueProjects = data.projects?.filter((project: Project, index: number, self: Project[]) => 
        index === self.findIndex(p => p.id === project.id)
      ) || [];
      setProjects(uniqueProjects);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!createForm.name.trim() || !createForm.description.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setCreating(true);
      const response = await fetch('/api/dashboard/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: createForm.name,
          description: createForm.description,
          repoUrl: createForm.repoUrl,
          language: createForm.language,
          collaborators: createForm.collaborators.map(c => ({ userId: c.userId, role: c.role }))
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create project');
      }

      const data = await response.json();

      // Reset form and close modal
      setCreateForm({ name: '', description: '', repoUrl: '', language: '', collaborators: [] });
      setShowCreateModal(false);
      
      // Refresh projects list
      await fetchProjects();
      
      alert(data.message || 'Project submitted for approval!');
    } catch (err) {
      console.error('Error creating project:', err);
      alert(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  const addCollaborator = (userId: string, role: string) => {
    const selectedUser = allUsers.find(u => u.id === userId);
    if (!selectedUser) return;

    // Don't add if already added or if it's the current user
    if (createForm.collaborators.some(c => c.userId === userId) || userId === user?.id) {
      return;
    }

    setCreateForm({
      ...createForm,
      collaborators: [...createForm.collaborators, { userId, role, name: selectedUser.name || selectedUser.email }]
    });
  };

  const removeCollaborator = (userId: string) => {
    setCreateForm({
      ...createForm,
      collaborators: createForm.collaborators.filter(c => c.userId !== userId)
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-[#0B874F]/20 text-[#0B874F] border-[#0B874F]/30';
      case 'planning':
        return 'bg-[#F5A623]/20 text-[#F5A623] border-[#F5A623]/30';
      case 'completed':
        return 'bg-[#9B59B6]/20 text-[#9B59B6] border-[#9B59B6]/30';
      case 'archived':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-black/40 backdrop-blur-sm border border-[#0B874F]/30 rounded-lg p-6">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-2/3"></div>
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
          <h2 className="text-xl font-bold text-red-400 mb-2">Error Loading Projects</h2>
          <p className="text-gray-400">{error}</p>
          <button 
            onClick={fetchProjects}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-black/40 backdrop-blur-sm border border-[#0B874F]/30 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#0B874F] mb-2 flex items-center">
              <GitBranch className="w-8 h-8 mr-3" />
              Projects
            </h1>
            <p className="text-gray-400">
              Explore and contribute to open source projects
            </p>
          </div>
          
          {canCreateProject && (
            <button 
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-4 py-2 bg-[#0B874F] text-black rounded-lg hover:bg-[#0B874F]/80 transition-colors font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </button>
          )}
        </div>
      </div>

      {/* Projects Grid */}
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-black/40 backdrop-blur-sm border border-[#0B874F]/30 rounded-lg p-6 hover:border-[#0B874F]/50 transition-all duration-200"
            >
              {/* Project Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">{project.name}</h3>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                    {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                  </span>
                </div>
                {project.repoUrl && (
                  <a
                    href={project.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-[#0B874F] transition-colors"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                {project.description}
              </p>

              {/* Project Info */}
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-400">
                  <Code className="w-4 h-4 mr-2" />
                  <span>{project.language}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-400">
                  <Users className="w-4 h-4 mr-2" />
                  <span>{project.memberCount} member{project.memberCount !== 1 ? 's' : ''}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-400">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Creator */}
              <div className="mt-4 pt-4 border-t border-[#0B874F]/20">
                <div className="flex items-center text-sm">
                  <div className="w-6 h-6 bg-[#0B874F]/20 rounded-full flex items-center justify-center mr-2">
                    <span className="text-[#0B874F] text-xs font-bold">
                      {project.creator.name?.charAt(0) || '?'}
                    </span>
                  </div>
                  <span className="text-gray-400">
                    by <span className="text-white">{project.creator.name}</span>
                    {project.creator.githubUsername && (
                      <span className="text-gray-500"> (@{project.creator.githubUsername})</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button className="w-full mt-4 px-4 py-2 bg-[#0B874F]/10 border border-[#0B874F]/30 rounded-lg text-[#0B874F] hover:bg-[#0B874F]/20 transition-colors font-medium">
                View Project
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-black/40 backdrop-blur-sm border border-[#0B874F]/30 rounded-lg p-12 text-center">
          <GitBranch className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
          <h3 className="text-xl font-bold text-gray-400 mb-2">No Projects Yet</h3>
          <p className="text-gray-500 mb-6">Start your first project and begin contributing!</p>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-[#0B874F] text-black rounded-lg hover:bg-[#0B874F]/80 transition-colors font-medium"
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Create Project
          </button>
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-black/90 border border-[#0B874F]/30 rounded-xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-white mb-6">Create New Project</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Project Name *</label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-black/50 border border-[#0B874F]/30 rounded-lg text-white focus:outline-none focus:border-[#0B874F]"
                  placeholder="My Awesome Project"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Description *</label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-black/50 border border-[#0B874F]/30 rounded-lg text-white focus:outline-none focus:border-[#0B874F]"
                  placeholder="Describe your project..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Repository URL</label>
                <input
                  type="url"
                  value={createForm.repoUrl}
                  onChange={(e) => setCreateForm({ ...createForm, repoUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-black/50 border border-[#0B874F]/30 rounded-lg text-white focus:outline-none focus:border-[#0B874F]"
                  placeholder="https://github.com/username/repo"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Primary Language</label>
                <select
                  value={createForm.language}
                  onChange={(e) => setCreateForm({ ...createForm, language: e.target.value })}
                  className="w-full px-3 py-2 bg-black/50 border border-[#0B874F]/30 rounded-lg text-white focus:outline-none focus:border-[#0B874F]"
                >
                  <option value="">Select Language</option>
                  <option value="JavaScript">JavaScript</option>
                  <option value="TypeScript">TypeScript</option>
                  <option value="Python">Python</option>
                  <option value="Java">Java</option>
                  <option value="C++">C++</option>
                  <option value="Go">Go</option>
                  <option value="Rust">Rust</option>
                  <option value="PHP">PHP</option>
                  <option value="Ruby">Ruby</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Collaborators Section */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Collaborators (Optional)</label>
                <div className="space-y-2">
                  {createForm.collaborators.map((collab) => (
                    <div key={collab.userId} className="flex items-center justify-between px-3 py-2 bg-[#0B874F]/10 border border-[#0B874F]/30 rounded-lg">
                      <span className="text-white text-sm">{collab.name}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-400 text-xs">{collab.role}</span>
                        <button
                          type="button"
                          onClick={() => removeCollaborator(collab.userId)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setShowCollaboratorModal(true)}
                    className="w-full px-3 py-2 bg-black/50 border border-[#0B874F]/30 rounded-lg text-[#0B874F] hover:bg-[#0B874F]/10 transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4 inline mr-2" />
                    Add Collaborator
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleCreateProject}
                disabled={creating}
                className="flex-1 px-4 py-2 bg-[#0B874F] text-black rounded-lg hover:bg-[#0B874F]/80 transition-colors font-medium disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create Project'}
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-gray-500/20 text-gray-400 rounded-lg hover:bg-gray-500/30 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Collaborator Selection Modal */}
      {showCollaboratorModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60]">
          <div className="bg-black/90 border border-[#0B874F]/30 rounded-xl p-8 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Add Collaborator</h2>
            
            {allUsers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-400 opacity-50" />
                <p className="text-gray-400">Loading users...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {allUsers
                  .filter(u => u.id !== user?.id && !createForm.collaborators.some(c => c.userId === u.id))
                  .length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 mx-auto mb-4 text-gray-400 opacity-50" />
                      <p className="text-gray-400">No more users available</p>
                      <p className="text-gray-500 text-sm mt-2">All users have been added or you're the only user</p>
                    </div>
                  ) : (
                    allUsers
                      .filter(u => u.id !== user?.id && !createForm.collaborators.some(c => c.userId === u.id))
                      .map((u) => (
                        <div key={u.id} className="flex items-center justify-between p-3 bg-black/50 border border-[#0B874F]/30 rounded-lg hover:border-[#0B874F]/50 transition-colors">
                          <div className="flex-1">
                            <div className="text-white font-medium">{u.name || u.email}</div>
                            {u.githubUsername && (
                              <div className="text-gray-400 text-sm">@{u.githubUsername}</div>
                            )}
                          </div>
                          <select
                            onChange={(e) => {
                              if (e.target.value) {
                                addCollaborator(u.id, e.target.value);
                                setShowCollaboratorModal(false);
                              }
                            }}
                            className="px-3 py-1 bg-black/50 border border-[#0B874F]/30 rounded text-white text-sm focus:outline-none focus:border-[#0B874F]"
                            defaultValue=""
                          >
                            <option value="">Select Role</option>
                            <option value="contributor">Contributor</option>
                            <option value="maintainer">Maintainer</option>
                            <option value="reviewer">Reviewer</option>
                          </select>
                        </div>
                      ))
                  )
                }
              </div>
            )}
            
            <button
              onClick={() => setShowCollaboratorModal(false)}
              className="w-full mt-6 px-4 py-2 bg-gray-500/20 text-gray-400 rounded-lg hover:bg-gray-500/30 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}