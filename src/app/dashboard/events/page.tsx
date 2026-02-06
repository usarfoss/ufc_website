"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Calendar, MapPin, Users, Clock, Plus, Settings, CheckCircle, X } from "lucide-react";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  maxAttendees: number;
  currentAttendees: number;
  type: string;
  status: string;
  approvalStatus: string;
  rejectionReason?: string;
  approvedAt?: string;
  creator: {
    name: string;
    githubUsername?: string;
  };
  approvedBy?: {
    name: string;
    githubUsername?: string;
  };
  isRegistered: boolean;
}

export default function EventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    maxAttendees: 50,
    type: 'WORKSHOP'
  });
  const [creating, setCreating] = useState(false);
  const [activeView, setActiveView] = useState<'approved' | 'pending' | 'rejected' | 'all'>('approved');
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [eventToReject, setEventToReject] = useState<string | null>(null);

  // Check if user can create events (ADMIN, MAINTAINER, MODERATOR)
  const canCreateEvent = user?.role ? ['ADMIN', 'MAINTAINER', 'MODERATOR'].includes(user.role.toUpperCase()) : false;
  // Check if user can approve/reject events
  const canManageEvents = user?.role ? ['ADMIN', 'MAINTAINER', 'MODERATOR'].includes(user.role.toUpperCase()) : false;

  useEffect(() => {
    fetchEvents();
  }, [activeView]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/dashboard/events?view=${activeView}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      const data = await response.json();
      setEvents(data.events || []);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'workshop':
        return 'bg-[#0B874F]/20 text-[#0B874F] border-[#0B874F]/30';
      case 'hackathon':
        return 'bg-[#E74C3C]/20 text-[#E74C3C] border-[#E74C3C]/30';
      case 'meetup':
        return 'bg-[#F5A623]/20 text-[#F5A623] border-[#F5A623]/30';
      case 'conference':
        return 'bg-[#9B59B6]/20 text-[#9B59B6] border-[#9B59B6]/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'upcoming':
        return 'bg-[#0B874F]/20 text-[#0B874F]';
      case 'ongoing':
        return 'bg-[#F5A623]/20 text-[#F5A623]';
      case 'completed':
        return 'bg-gray-500/20 text-gray-400';
      case 'cancelled':
        return 'bg-[#E74C3C]/20 text-[#E74C3C]';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const handleCreateEvent = async () => {
    if (!createForm.title.trim() || !createForm.description.trim() || !createForm.date || !createForm.location.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setCreating(true);
      const response = await fetch('/api/dashboard/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create event');
      }

      // Reset form and close modal
      setCreateForm({
        title: '',
        description: '',
        date: '',
        location: '',
        maxAttendees: 50,
        type: 'WORKSHOP'
      });
      setShowCreateModal(false);
      
      // Refresh events list
      await fetchEvents();
      
      alert('Event created successfully!');
    } catch (err) {
      console.error('Error creating event:', err);
      alert(err instanceof Error ? err.message : 'Failed to create event');
    } finally {
      setCreating(false);
    }
  };

  const handleRegister = async (eventId: string) => {
    try {
      const response = await fetch(`/api/dashboard/events/${eventId}/register`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to register for event');
      }

      // Refresh events to update registration status
      await fetchEvents();
    } catch (err) {
      console.error('Error registering for event:', err);
      alert('Failed to register for event');
    }
  };

  const handleApproveEvent = async (eventId: string) => {
    try {
      setApprovingId(eventId);
      const response = await fetch(`/api/dashboard/events/${eventId}/approve`, {
        method: 'POST'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to approve event');
      }

      await fetchEvents();
      alert('Event approved successfully!');
    } catch (err) {
      console.error('Error approving event:', err);
      alert(err instanceof Error ? err.message : 'Failed to approve event');
    } finally {
      setApprovingId(null);
    }
  };

  const handleRejectEvent = async () => {
    if (!eventToReject || !rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      setRejectingId(eventToReject);
      const response = await fetch(`/api/dashboard/events/${eventToReject}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectionReason })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reject event');
      }

      setShowRejectModal(false);
      setEventToReject(null);
      setRejectionReason('');
      await fetchEvents();
      alert('Event rejected successfully!');
    } catch (err) {
      console.error('Error rejecting event:', err);
      alert(err instanceof Error ? err.message : 'Failed to reject event');
    } finally {
      setRejectingId(null);
    }
  };

  const openRejectModal = (eventId: string) => {
    setEventToReject(eventId);
    setShowRejectModal(true);
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
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
          <h2 className="text-xl font-bold text-red-400 mb-2">Error Loading Events</h2>
          <p className="text-gray-400">{error}</p>
          <button 
            onClick={fetchEvents}
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
      <div className="bg-gradient-to-r from-black/60 to-[#0B874F]/10 backdrop-blur-sm border border-[#0B874F]/30 rounded-xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
              <Calendar className="w-10 h-10 mr-4 text-[#0B874F]" />
              Events
            </h1>
            <p className="text-gray-300 text-lg">
              Join workshops, hackathons, and community meetups
            </p>
          </div>
          
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-6 py-3 bg-[#0B874F] text-black rounded-xl hover:bg-[#0B874F]/80 transition-colors font-medium shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            {canCreateEvent ? 'Create Event' : 'Propose Event'}
          </button>
        </div>
        
        {/* View Tabs */}
        <div className="flex space-x-2">
          {[
            { key: 'approved', label: 'Approved', icon: CheckCircle },
            { key: 'pending', label: 'Pending', icon: Clock },
            { key: 'rejected', label: 'Rejected', icon: X },
            { key: 'all', label: 'All', icon: Calendar }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveView(key as any)}
              className={`flex items-center px-4 py-2 rounded-lg transition-all duration-300 font-medium ${
                activeView === key
                  ? 'bg-[#0B874F] text-black shadow-lg'
                  : 'bg-black/30 text-gray-400 hover:text-[#0B874F] hover:bg-[#0B874F]/10'
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      {events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((event) => {
            const { date, time } = formatDate(event.date);
            const spotsLeft = event.maxAttendees - event.currentAttendees;
            
            return (
          <div
            key={event.id}
            className="bg-black/40 backdrop-blur-sm border border-[#0B874F]/30 rounded-lg p-6 hover:border-[#0B874F]/50 transition-all duration-200"
          >
                {/* Event Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getEventTypeColor(event.type)}`}>
                        {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                  </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
              </div>
            </div>

                {/* Description */}
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {event.description}
                </p>

            {/* Event Details */}
            <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-400">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{date}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-400">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{time}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-400">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{event.location}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-400">
                    <Users className="w-4 h-4 mr-2" />
                    <span>
                      {event.currentAttendees}/{event.maxAttendees} attendees
                      {spotsLeft > 0 && (
                        <span className="text-[#0B874F] ml-1">({spotsLeft} spots left)</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Creator */}
                <div className="mb-4 pb-4 border-t border-[#0B874F]/20 pt-4">
                  <div className="flex items-center text-sm">
                    <div className="w-6 h-6 bg-[#0B874F]/20 rounded-full flex items-center justify-center mr-2">
                      <span className="text-[#0B874F] text-xs font-bold">
                        {event.creator.name?.charAt(0) || '?'}
                      </span>
                    </div>
                    <span className="text-gray-400">
                      by <span className="text-white">{event.creator.name}</span>
                      {event.creator.githubUsername && (
                        <span className="text-gray-500"> (@{event.creator.githubUsername})</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Approval Status */}
                <div className="mt-4 pt-4 border-t border-[#0B874F]/20">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      event.approvalStatus === 'approved' 
                        ? 'bg-[#0B874F]/20 text-[#0B874F] border-[#0B874F]/30'
                        : event.approvalStatus === 'pending'
                        ? 'bg-[#F5A623]/20 text-[#F5A623] border-[#F5A623]/30'
                        : 'bg-[#E74C3C]/20 text-[#E74C3C] border-[#E74C3C]/30'
                    }`}>
                      {event.approvalStatus.charAt(0).toUpperCase() + event.approvalStatus.slice(1)}
                    </span>
                    
                    {event.approvedBy && (
                      <span className="text-xs text-gray-400">
                        by {event.approvedBy.name}
                      </span>
                    )}
                  </div>
                  
                  {event.rejectionReason && (
                    <p className="text-xs text-[#E74C3C] mb-3 p-2 bg-[#E74C3C]/10 rounded border border-[#E74C3C]/20">
                      <strong>Reason:</strong> {event.rejectionReason}
                    </p>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="space-y-2">
                    {event.approvalStatus === 'pending' && canManageEvents && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApproveEvent(event.id)}
                          disabled={approvingId === event.id}
                          className="flex-1 px-3 py-2 bg-[#0B874F]/10 border border-[#0B874F]/30 rounded-lg text-[#0B874F] hover:bg-[#0B874F]/20 transition-colors text-sm font-medium disabled:opacity-50"
                        >
                          {approvingId === event.id ? 'Approving...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => openRejectModal(event.id)}
                          disabled={rejectingId === event.id}
                          className="flex-1 px-3 py-2 bg-[#E74C3C]/10 border border-[#E74C3C]/30 rounded-lg text-[#E74C3C] hover:bg-[#E74C3C]/20 transition-colors text-sm font-medium disabled:opacity-50"
                        >
                          {rejectingId === event.id ? 'Rejecting...' : 'Reject'}
                        </button>
                      </div>
                    )}
                    
                    {event.approvalStatus === 'approved' && event.status.toLowerCase() === 'upcoming' && (
                      <button
                        onClick={() => handleRegister(event.id)}
                        disabled={event.isRegistered || spotsLeft <= 0}
                        className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                          event.isRegistered
                            ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                            : spotsLeft <= 0
                            ? 'bg-red-500/20 text-red-400 cursor-not-allowed'
                            : 'bg-[#0B874F]/10 border border-[#0B874F]/30 text-[#0B874F] hover:bg-[#0B874F]/20'
                        }`}
                      >
                        {event.isRegistered
                          ? 'Already Registered'
                          : spotsLeft <= 0
                          ? 'Event Full'
                          : 'Register Now'
                        }
                      </button>
                    )}
                    
                    {event.approvalStatus === 'approved' && event.status.toLowerCase() !== 'upcoming' && (
                      <button className="w-full px-4 py-2 bg-gray-500/20 text-gray-400 rounded-lg cursor-not-allowed font-medium">
                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                      </button>
                    )}
                    
                    {event.approvalStatus === 'rejected' && (
                      <button className="w-full px-4 py-2 bg-gray-500/20 text-gray-400 rounded-lg cursor-not-allowed font-medium">
                        Rejected
                      </button>
                    )}
                    
                    {event.approvalStatus === 'pending' && !canManageEvents && (
                      <button className="w-full px-4 py-2 bg-[#F5A623]/20 text-[#F5A623] rounded-lg cursor-not-allowed font-medium">
                        Awaiting Approval
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-black/40 backdrop-blur-sm border border-[#0B874F]/30 rounded-lg p-12 text-center">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
          <h3 className="text-xl font-bold text-gray-400 mb-2">No Events Scheduled</h3>
          <p className="text-gray-500 mb-6">Check back later for upcoming workshops and meetups!</p>
          <button className="px-6 py-3 bg-[#0B874F] text-black rounded-lg hover:bg-[#0B874F]/80 transition-colors font-medium">
            <Plus className="w-4 h-4 inline mr-2" />
            Create Event
          </button>
        </div>
      )}

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-black/90 border border-[#0B874F]/30 rounded-xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-white mb-6">Create New Event</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Event Title *</label>
                <input
                  type="text"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-black/50 border border-[#0B874F]/30 rounded-lg text-white focus:outline-none focus:border-[#0B874F]"
                  placeholder="React Workshop"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Description *</label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-black/50 border border-[#0B874F]/30 rounded-lg text-white focus:outline-none focus:border-[#0B874F]"
                  placeholder="Learn React fundamentals..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Date & Time *</label>
                <input
                  type="datetime-local"
                  value={createForm.date}
                  onChange={(e) => setCreateForm({ ...createForm, date: e.target.value })}
                  className="w-full px-3 py-2 bg-black/50 border border-[#0B874F]/30 rounded-lg text-white focus:outline-none focus:border-[#0B874F]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Location *</label>
                <input
                  type="text"
                  value={createForm.location}
                  onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
                  className="w-full px-3 py-2 bg-black/50 border border-[#0B874F]/30 rounded-lg text-white focus:outline-none focus:border-[#0B874F]"
                  placeholder="Online / Room 101"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Max Attendees</label>
                  <input
                    type="number"
                    value={createForm.maxAttendees}
                    onChange={(e) => setCreateForm({ ...createForm, maxAttendees: parseInt(e.target.value) || 50 })}
                    className="w-full px-3 py-2 bg-black/50 border border-[#0B874F]/30 rounded-lg text-white focus:outline-none focus:border-[#0B874F]"
                    min="1"
                  />
            </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Event Type</label>
                  <select
                    value={createForm.type}
                    onChange={(e) => setCreateForm({ ...createForm, type: e.target.value })}
                    className="w-full px-3 py-2 bg-black/50 border border-[#0B874F]/30 rounded-lg text-white focus:outline-none focus:border-[#0B874F]"
                  >
                    <option value="WORKSHOP">Workshop</option>
                    <option value="HACKATHON">Hackathon</option>
                    <option value="MEETUP">Meetup</option>
                    <option value="CONFERENCE">Conference</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleCreateEvent}
                disabled={creating}
                className="flex-1 px-4 py-2 bg-[#0B874F] text-black rounded-lg hover:bg-[#0B874F]/80 transition-colors font-medium disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create Event'}
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

      {/* Reject Event Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-black/90 border border-[#E74C3C]/30 rounded-xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-white mb-6">Reject Event</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Rejection Reason *</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 bg-black/50 border border-[#E74C3C]/30 rounded-lg text-white focus:outline-none focus:border-[#E74C3C]"
                  placeholder="Please provide a clear reason for rejection..."
                />
          </div>
        </div>
        
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleRejectEvent}
                disabled={rejectingId === eventToReject || !rejectionReason.trim()}
                className="flex-1 px-4 py-2 bg-[#E74C3C] text-white rounded-lg hover:bg-[#E74C3C]/80 transition-colors font-medium disabled:opacity-50"
              >
                {rejectingId === eventToReject ? 'Rejecting...' : 'Reject Event'}
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setEventToReject(null);
                  setRejectionReason('');
                }}
                className="px-4 py-2 bg-gray-500/20 text-gray-400 rounded-lg hover:bg-gray-500/30 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}