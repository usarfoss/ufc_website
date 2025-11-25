"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Github, Linkedin, Twitter, Globe, MapPin, Calendar, Mail, ExternalLink, Download, Code, Trophy, Award, Briefcase } from 'lucide-react';
import GitHubHeatmap from '@/components/ui/github-heatmap';
import LeetCodeHeatmap from '@/components/ui/leetcode-heatmap';
import GitCommandsLoader from '@/components/ui/git-commands-loader';

interface PortfolioData {
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    location?: string;
    bio?: string;
    tagline?: string;
    githubUsername?: string;
    leetcodeUsername?: string;
    websiteUrl?: string;
    linkedinUrl?: string;
    twitterUrl?: string;
    resumeUrl?: string;
    techStack?: string[];
    joinedAt: string;
  };
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
  };
  projects: Array<{
    id: string;
    name: string;
    description: string;
    repoUrl?: string;
    language: string;
    status: string;
  }>;
  bootcamps: Array<{
    id: string;
    name: string;
    type: string;
    finalRank?: number;
    finalPoints: number;
  }>;
  achievements: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    unlockedAt: string;
  }>;
}

export default function PortfolioPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPortfolio();
  }, [slug]);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/portfolio/${slug}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Portfolio not found');
        } else if (response.status === 403) {
          setError('This portfolio is private');
        } else {
          setError('Failed to load portfolio');
        }
        return;
      }

      const data = await response.json();
      setPortfolio(data);
    } catch (err) {
      console.error('Error fetching portfolio:', err);
      setError('Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <GitCommandsLoader />
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-red-900/20 backdrop-blur-sm border border-red-500/30 rounded-lg p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-2">
            {error || 'Portfolio Not Found'}
          </h2>
          <p className="text-gray-400">
            {error === 'This portfolio is private' 
              ? 'The owner has set this portfolio to private.'
              : 'The portfolio you are looking for does not exist.'}
          </p>
        </div>
      </div>
    );
  }

  const { user, githubStats, leetcodeStats, projects, bootcamps, achievements } = portfolio;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B874F]/10 to-transparent"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Avatar */}
            <div className="relative">
              <div className="w-40 h-40 rounded-full bg-gradient-to-br from-[#0B874F] to-[#065a33] p-1">
                <div className="w-full h-full rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center overflow-hidden">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[#0B874F] text-5xl font-bold">
                      {user.name?.charAt(0) || user.email.charAt(0)}
                    </span>
                  )}
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-[#0B874F] text-black px-3 py-1 rounded-full text-sm font-bold">
                Active
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-5xl font-bold text-white mb-2">{user.name || 'Anonymous'}</h1>
              {user.tagline && (
                <p className="text-xl text-[#0B874F] mb-4">{user.tagline}</p>
              )}
              {user.bio && (
                <p className="text-gray-300 mb-4 max-w-2xl">{user.bio}</p>
              )}
              
              {/* Meta Info */}
              <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm text-gray-400 mb-4">
                {user.location && (
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {user.location}
                  </div>
                )}
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Joined {new Date(user.joinedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </div>
              </div>

              {/* Social Links */}
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                {user.githubUsername && (
                  <a
                    href={`https://github.com/${user.githubUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Github className="w-4 h-4 mr-2" />
                    GitHub
                  </a>
                )}
                {user.leetcodeUsername && (
                  <a
                    href={`https://leetcode.com/${user.leetcodeUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center px-4 py-2 bg-orange-900/30 hover:bg-orange-900/50 rounded-lg transition-colors"
                  >
                    <Code className="w-4 h-4 mr-2" />
                    LeetCode
                  </a>
                )}
                {user.linkedinUrl && (
                  <a
                    href={user.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center px-4 py-2 bg-blue-900/30 hover:bg-blue-900/50 rounded-lg transition-colors"
                  >
                    <Linkedin className="w-4 h-4 mr-2" />
                    LinkedIn
                  </a>
                )}
                {user.twitterUrl && (
                  <a
                    href={user.twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center px-4 py-2 bg-sky-900/30 hover:bg-sky-900/50 rounded-lg transition-colors"
                  >
                    <Twitter className="w-4 h-4 mr-2" />
                    Twitter
                  </a>
                )}
                {user.websiteUrl && (
                  <a
                    href={user.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center px-4 py-2 bg-purple-900/30 hover:bg-purple-900/50 rounded-lg transition-colors"
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Website
                  </a>
                )}
                {user.resumeUrl && (
                  <a
                    href={user.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center px-4 py-2 bg-[#0B874F] hover:bg-[#0B874F]/80 text-black font-semibold rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Resume
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 pb-20 space-y-12">
        {/* Tech Stack */}
        {user.techStack && user.techStack.length > 0 && (
          <section className="bg-black/40 backdrop-blur-sm border border-[#0B874F]/30 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
              <Code className="w-6 h-6 mr-2 text-[#0B874F]" />
              Tech Stack
            </h2>
            <div className="flex flex-wrap gap-2">
              {user.techStack.map((tech, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-[#0B874F]/10 border border-[#0B874F]/30 rounded-lg text-[#0B874F] font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Stats Overview */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {githubStats && (
            <>
              <div className="bg-gradient-to-br from-green-900/20 to-black/40 backdrop-blur-sm border border-green-500/30 rounded-xl p-6">
                <div className="text-3xl font-bold text-green-400 mb-1">{githubStats.commits}</div>
                <div className="text-sm text-gray-400">GitHub Commits</div>
              </div>
              <div className="bg-gradient-to-br from-blue-900/20 to-black/40 backdrop-blur-sm border border-blue-500/30 rounded-xl p-6">
                <div className="text-3xl font-bold text-blue-400 mb-1">{githubStats.pullRequests}</div>
                <div className="text-sm text-gray-400">Pull Requests</div>
              </div>
            </>
          )}
          {leetcodeStats && (
            <>
              <div className="bg-gradient-to-br from-orange-900/20 to-black/40 backdrop-blur-sm border border-orange-500/30 rounded-xl p-6">
                <div className="text-3xl font-bold text-orange-400 mb-1">{leetcodeStats.totalSolved}</div>
                <div className="text-sm text-gray-400">Problems Solved</div>
              </div>
              {leetcodeStats.ranking && (
                <div className="bg-gradient-to-br from-purple-900/20 to-black/40 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6">
                  <div className="text-3xl font-bold text-purple-400 mb-1">#{leetcodeStats.ranking.toLocaleString()}</div>
                  <div className="text-sm text-gray-400">LeetCode Rank</div>
                </div>
              )}
            </>
          )}
        </section>

        {/* Heatmaps */}
        {(user.githubUsername || user.leetcodeUsername) && (
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {user.githubUsername && (
              <div className="bg-black/40 backdrop-blur-sm border border-[#0B874F]/30 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Github className="w-5 h-5 mr-2 text-[#0B874F]" />
                  GitHub Activity
                </h2>
                <GitHubHeatmap username={user.githubUsername} />
              </div>
            )}
            {user.leetcodeUsername && (
              <div className="bg-black/40 backdrop-blur-sm border border-[#0B874F]/30 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Code className="w-5 h-5 mr-2 text-[#ffa116]" />
                  LeetCode Activity
                </h2>
                <LeetCodeHeatmap username={user.leetcodeUsername} />
              </div>
            )}
          </section>
        )}

        {/* LeetCode Detailed Stats */}
        {leetcodeStats && (
          <section className="bg-black/40 backdrop-blur-sm border border-[#0B874F]/30 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Trophy className="w-6 h-6 mr-2 text-[#ffa116]" />
              LeetCode Statistics
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="text-3xl font-bold text-green-500">{leetcodeStats.easySolved}</div>
                <div className="text-sm text-gray-400 mt-1">Easy</div>
              </div>
              <div className="text-center p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <div className="text-3xl font-bold text-yellow-500">{leetcodeStats.mediumSolved}</div>
                <div className="text-sm text-gray-400 mt-1">Medium</div>
              </div>
              <div className="text-center p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div className="text-3xl font-bold text-red-500">{leetcodeStats.hardSolved}</div>
                <div className="text-sm text-gray-400 mt-1">Hard</div>
              </div>
              <div className="text-center p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="text-3xl font-bold text-blue-500">{leetcodeStats.totalSolved}</div>
                <div className="text-sm text-gray-400 mt-1">Total</div>
              </div>
            </div>
          </section>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <section className="bg-black/40 backdrop-blur-sm border border-[#0B874F]/30 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Briefcase className="w-6 h-6 mr-2 text-[#0B874F]" />
              Projects
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="p-4 bg-black/30 border border-[#0B874F]/20 rounded-lg hover:border-[#0B874F]/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold text-white">{project.name}</h3>
                    {project.repoUrl && (
                      <a
                        href={project.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#0B874F] hover:text-[#0B874F]/80"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm mb-3">{project.description}</p>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-[#0B874F]/10 border border-[#0B874F]/30 rounded text-xs text-[#0B874F]">
                      {project.language}
                    </span>
                    <span className="px-2 py-1 bg-gray-700/50 rounded text-xs text-gray-300">
                      {project.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Bootcamps */}
        {bootcamps.length > 0 && (
          <section className="bg-black/40 backdrop-blur-sm border border-[#0B874F]/30 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Trophy className="w-6 h-6 mr-2 text-[#0B874F]" />
              Bootcamp Participations
            </h2>
            <div className="space-y-3">
              {bootcamps.map((bootcamp) => (
                <div
                  key={bootcamp.id}
                  className="flex items-center justify-between p-4 bg-black/30 border border-[#0B874F]/20 rounded-lg"
                >
                  <div>
                    <h3 className="text-white font-semibold">{bootcamp.name}</h3>
                    <p className="text-sm text-gray-400">{bootcamp.type}</p>
                  </div>
                  <div className="text-right">
                    {bootcamp.finalRank && (
                      <div className="text-[#0B874F] font-bold">Rank #{bootcamp.finalRank}</div>
                    )}
                    <div className="text-sm text-gray-400">{bootcamp.finalPoints} points</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Achievements */}
        {achievements.length > 0 && (
          <section className="bg-black/40 backdrop-blur-sm border border-[#0B874F]/30 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Award className="w-6 h-6 mr-2 text-[#0B874F]" />
              Achievements
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="p-4 bg-gradient-to-br from-[#0B874F]/10 to-black/30 border border-[#0B874F]/30 rounded-lg"
                >
                  <div className="text-3xl mb-2">{achievement.icon}</div>
                  <h3 className="text-white font-semibold mb-1">{achievement.name}</h3>
                  <p className="text-sm text-gray-400 mb-2">{achievement.description}</p>
                  <p className="text-xs text-gray-500">
                    Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-400 text-sm">
          <p>Portfolio powered by UFC Platform</p>
        </div>
      </footer>
    </div>
  );
}
