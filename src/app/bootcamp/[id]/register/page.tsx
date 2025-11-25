"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter, useParams } from "next/navigation";
import { Trophy, Calendar, Users, Target, CheckCircle, AlertCircle } from "lucide-react";

interface Bootcamp {
  id: string;
  name: string;
  description: string;
  type: 'LEETCODE' | 'GITHUB';
  status: string;
  startDate: string;
  endDate: string;
  _count: {
    participants: number;
  };
}

export default function BootcampRegisterPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const bootcampId = params.id as string;

  const [bootcamp, setBootcamp] = useState<Bootcamp | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchBootcamp();
  }, [user, bootcampId]);

  // Check for required username and redirect if missing
  useEffect(() => {
    if (bootcamp && user) {
      const requiredUsername = bootcamp.type === 'LEETCODE' ? user.leetcodeUsername : user.githubUsername;
      if (!requiredUsername) {
        // Store bootcamp ID in session storage to return after profile update
        sessionStorage.setItem('pendingBootcampRegistration', bootcampId);
        sessionStorage.setItem('bootcampType', bootcamp.type);
        
        // Redirect to profile with message
        const message = `Please add your ${bootcamp.type === 'LEETCODE' ? 'LeetCode' : 'GitHub'} username to join the bootcamp`;
        router.push(`/dashboard/profile?message=${encodeURIComponent(message)}&returnTo=bootcamp`);
      }
    }
  }, [bootcamp, user, bootcampId, router]);

  const fetchBootcamp = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/bootcamps/active`);
      if (response.ok) {
        const data = await response.json();
        if (data.bootcamp && data.bootcamp.id === bootcampId) {
          setBootcamp(data.bootcamp);
        } else {
          setError('Bootcamp not found or not active');
        }
      }
    } catch (error) {
      console.error('Error fetching bootcamp:', error);
      setError('Failed to load bootcamp details');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!bootcamp || !user) return;

    const requiredUsername = bootcamp.type === 'LEETCODE' ? user.leetcodeUsername : user.githubUsername;
    if (!requiredUsername) {
      setError(`Please add your ${bootcamp.type === 'LEETCODE' ? 'LeetCode' : 'GitHub'} username to your profile first`);
      return;
    }

    try {
      setRegistering(true);
      setError('');
      
      const response = await fetch(`/api/bootcamps/${bootcampId}/register`, {
        method: 'POST'
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push(`/bootcamp/${bootcampId}/leaderboard`);
        }, 2000);
      } else {
        setError(data.error || 'Failed to register');
      }
    } catch (error) {
      console.error('Error registering:', error);
      setError('Failed to register for bootcamp');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (!bootcamp) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Bootcamp Not Found</h2>
          <p className="text-gray-400 mb-6">{error || 'This bootcamp is not available'}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 transition-colors font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const getTypeEmoji = (type: string) => type === 'LEETCODE' ? '🧠' : '💻';
  const requiredUsername = bootcamp.type === 'LEETCODE' ? user?.leetcodeUsername : user?.githubUsername;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Success Message */}
        {success && (
          <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-6 mb-6 animate-pulse">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div>
                <h3 className="text-xl font-bold text-white">Registration Successful!</h3>
                <p className="text-gray-300">Redirecting to leaderboard...</p>
              </div>
            </div>
          </div>
        )}

        {/* Bootcamp Card */}
        <div className="bg-black/60 backdrop-blur-sm border border-yellow-500/30 rounded-xl p-8 mb-6">
          <div className="flex items-center space-x-4 mb-6">
            <span className="text-5xl">{getTypeEmoji(bootcamp.type)}</span>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{bootcamp.name}</h1>
              <p className="text-gray-400 text-lg">{bootcamp.description}</p>
            </div>
          </div>

          {/* Bootcamp Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-black/40 rounded-lg p-4 border border-yellow-500/20">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="w-5 h-5 text-yellow-500" />
                <span className="text-gray-400 text-sm">Duration</span>
              </div>
              <p className="text-white font-medium">
                {new Date(bootcamp.startDate).toLocaleDateString()} - {new Date(bootcamp.endDate).toLocaleDateString()}
              </p>
            </div>

            <div className="bg-black/40 rounded-lg p-4 border border-yellow-500/20">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="w-5 h-5 text-yellow-500" />
                <span className="text-gray-400 text-sm">Participants</span>
              </div>
              <p className="text-white font-medium text-2xl">{bootcamp._count.participants}</p>
            </div>

            <div className="bg-black/40 rounded-lg p-4 border border-yellow-500/20">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="w-5 h-5 text-yellow-500" />
                <span className="text-gray-400 text-sm">Type</span>
              </div>
              <p className="text-white font-medium">{bootcamp.type} Challenge</p>
            </div>
          </div>

          {/* Requirements */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Trophy className="w-6 h-6 mr-2 text-yellow-500" />
              Requirements
            </h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center">
                <CheckCircle className={`w-5 h-5 mr-2 ${requiredUsername ? 'text-green-500' : 'text-gray-500'}`} />
                {bootcamp.type === 'LEETCODE' ? 'LeetCode' : 'GitHub'} username in profile
                {requiredUsername && <span className="ml-2 text-yellow-500 font-medium">({requiredUsername})</span>}
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                Active account on {bootcamp.type === 'LEETCODE' ? 'LeetCode' : 'GitHub'}
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                Commitment to participate for the full duration
              </li>
            </ul>
          </div>

          {/* Scoring Info */}
          <div className="bg-black/40 rounded-lg p-6 mb-6 border border-yellow-500/20">
            <h3 className="text-xl font-bold text-white mb-4">Scoring System</h3>
            {bootcamp.type === 'LEETCODE' ? (
              <div className="space-y-2 text-gray-300">
                <p>• <span className="text-green-400 font-medium">Easy Problem:</span> 2 points</p>
                <p>• <span className="text-yellow-400 font-medium">Medium Problem:</span> 4 points</p>
                <p>• <span className="text-red-400 font-medium">Hard Problem:</span> 6 points</p>
                <p className="text-sm text-gray-500 mt-4">* Only problems solved during the bootcamp period count</p>
              </div>
            ) : (
              <div className="space-y-2 text-gray-300">
                <p>• <span className="text-blue-400 font-medium">Commit:</span> 1 point</p>
                <p>• <span className="text-green-400 font-medium">Pull Request:</span> 5 points</p>
                <p>• <span className="text-yellow-400 font-medium">Issue:</span> 2 points</p>
                <p className="text-sm text-gray-500 mt-4">* Only contributions during the bootcamp period count</p>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <p className="text-red-400">{error}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4">
            {!requiredUsername ? (
              <button
                onClick={() => router.push('/dashboard/profile')}
                className="flex-1 px-6 py-4 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 transition-colors font-bold text-lg"
              >
                Add {bootcamp.type === 'LEETCODE' ? 'LeetCode' : 'GitHub'} Username
              </button>
            ) : (
              <button
                onClick={handleRegister}
                disabled={registering || success}
                className="flex-1 px-6 py-4 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 transition-colors font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {registering ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-black mr-2"></div>
                    Registering...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Registered!
                  </>
                ) : (
                  <>
                    <Trophy className="w-5 h-5 mr-2" />
                    Join Competition
                  </>
                )}
              </button>
            )}
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-4 bg-gray-500/20 text-gray-400 rounded-lg hover:bg-gray-500/30 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
