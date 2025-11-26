"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Github, Linkedin, Twitter, Globe, MapPin, Calendar, Mail, ExternalLink, Download, Code, Trophy, Award, Briefcase, Star, X, Terminal, GitBranch } from 'lucide-react';
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
    portfolioTitle?: string;
    portfolioSubtitle?: string;
    githubUsername?: string;
    leetcodeUsername?: string;
    websiteUrl?: string;
    linkedinUrl?: string;
    twitterUrl?: string;
    resumeUrl?: string;
    techStack?: string[];
    joinedAt: string;
    showEmail: boolean;
    showLocation: boolean;
    showJoinDate: boolean;
    showGithubStats: boolean;
    showLeetcodeStats: boolean;
    showProjects: boolean;
    showBootcamps: boolean;
    showAchievements: boolean;
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
        <div className="bg-red-900/20 backdrop-blur-sm border border-red-500/30 rounded-xl p-6 max-w-md text-center">
          <div className="w-12 h-12 mx-auto mb-3 bg-red-500/20 rounded-full flex items-center justify-center">
            <X className="w-6 h-6 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-red-400 mb-2">
            {error || 'Portfolio Not Found'}
          </h2>
          <p className="text-sm text-gray-400">
            {error === 'This portfolio is private' 
              ? 'The owner has set this portfolio to private.'
              : 'The portfolio you are looking for does not exist.'}
          </p>
        </div>
      </div>
    );
  }

  const { user, githubStats, leetcodeStats, projects, bootcamps, achievements } = portfolio;
  const displayName = user.portfolioTitle || user.name || 'Developer';
  const displaySubtitle = user.portfolioSubtitle || user.tagline;

  return (
    <div className="min-h-screen bg-black py-8 px-4">
      {/* Grid Background Effect */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(11, 135, 79, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(11, 135, 79, 0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Content Area */}
        <div className="bg-black/40 backdrop-blur-sm border border-[#0B874F]/30 rounded-xl p-6">
          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Sidebar - Profile & Quick Stats */}
            <div className="lg:col-span-1 space-y-4">
              {/* Profile Card */}
              <div className="space-y-4">
                {/* Avatar & Name */}
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto mb-4 rounded-lg bg-gradient-to-br from-[#0B874F] to-[#065a33] p-0.5">
                    <div className="w-full h-full rounded-lg bg-black flex items-center justify-center overflow-hidden">
                      {user.avatar ? (
                        <img src={user.avatar} alt={displayName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[#0B874F] text-4xl font-bold">
                          {displayName.charAt(0)}
                        </span>
                      )}
                    </div>
                  </div>
                  <h1 className="text-2xl font-bold text-white mb-1 font-mono">{displayName}</h1>
                  {displaySubtitle && (
                    <p className="text-[#0B874F] text-sm mb-2">{displaySubtitle}</p>
                  )}
                </div>

                {/* Bio */}
                {user.bio && (
                  <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                    <p className="text-xs text-gray-400 leading-relaxed">{user.bio}</p>
                  </div>
                )}

                {/* Meta Info */}
                <div className="space-y-2 text-xs">
                  {user.showLocation && user.location && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <MapPin className="w-3 h-3 text-[#0B874F]" />
                      <span className="font-mono">{user.location}</span>
                    </div>
                  )}
                  {user.showJoinDate && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <Calendar className="w-3 h-3 text-[#0B874F]" />
                      <span className="font-mono">Joined {new Date(user.joinedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                    </div>
                  )}
                  {user.showEmail && user.email && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <Mail className="w-3 h-3 text-[#0B874F]" />
                      <span className="font-mono text-xs break-all">{user.email}</span>
                    </div>
                  )}
                </div>

                {/* Social Links */}
                <div className="flex flex-wrap gap-2">
                  {user.githubUsername && (
                    <a href={`https://github.com/${user.githubUsername}`} target="_blank" rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 p-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#0B874F]/50 rounded-lg transition-all text-xs">
                      <Github className="w-4 h-4" />
                      <span>GitHub</span>
                    </a>
                  )}
                  {user.leetcodeUsername && (
                    <a href={`https://leetcode.com/${user.leetcodeUsername}`} target="_blank" rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 p-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#ffa116]/50 rounded-lg transition-all text-xs">
                      <Code className="w-4 h-4" />
                      <span>LeetCode</span>
                    </a>
                  )}
                  {user.linkedinUrl && (
                    <a href={user.linkedinUrl} target="_blank" rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 p-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/50 rounded-lg transition-all text-xs">
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                  {user.twitterUrl && (
                    <a href={user.twitterUrl} target="_blank" rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 p-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-sky-500/50 rounded-lg transition-all text-xs">
                      <Twitter className="w-4 h-4" />
                    </a>
                  )}
                  {user.websiteUrl && (
                    <a href={user.websiteUrl} target="_blank" rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 p-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 rounded-lg transition-all text-xs">
                      <Globe className="w-4 h-4" />
                    </a>
                  )}
                </div>

                {user.resumeUrl && (
                  <a href={user.resumeUrl} target="_blank" rel="noopener noreferrer"
                    className="block w-full text-center px-4 py-2 bg-[#0B874F] hover:bg-[#0B874F]/80 text-black font-semibold rounded-lg transition-all text-sm">
                    <Download className="w-4 h-4 inline mr-2" />
                    Download Resume
                  </a>
                )}

                {/* Quick Stats */}
                {((user.showGithubStats && githubStats) || (user.showLeetcodeStats && leetcodeStats)) && (
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-gray-400 font-mono flex items-center gap-2">
                      <Terminal className="w-3 h-3" />
                      <span>$ stats --summary</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {user.showGithubStats && githubStats && (
                        <>
                          <div className="p-2 bg-green-500/10 border border-green-500/30 rounded text-center">
                            <div className="text-lg font-bold text-green-400 font-mono">{githubStats.commits}</div>
                            <div className="text-xs text-gray-500">Commits</div>
                          </div>
                          <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded text-center">
                            <div className="text-lg font-bold text-blue-400 font-mono">{githubStats.pullRequests}</div>
                            <div className="text-xs text-gray-500">PRs</div>
                          </div>
                        </>
                      )}
                      {user.showLeetcodeStats && leetcodeStats && (
                        <>
                          <div className="p-2 bg-orange-500/10 border border-orange-500/30 rounded text-center">
                            <div className="text-lg font-bold text-orange-400 font-mono">{leetcodeStats.totalSolved}</div>
                            <div className="text-xs text-gray-500">Solved</div>
                          </div>
                          {leetcodeStats.ranking && (
                            <div className="p-2 bg-purple-500/10 border border-purple-500/30 rounded text-center">
                              <div className="text-lg font-bold text-purple-400 font-mono">#{(leetcodeStats.ranking / 1000).toFixed(0)}k</div>
                              <div className="text-xs text-gray-500">Rank</div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Tech Stack */}
                {user.techStack && user.techStack.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-gray-400 font-mono flex items-center gap-2">
                      <Code className="w-3 h-3" />
                      <span>$ tech --list</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {user.techStack.map((tech, index) => (
                        <span key={index} className="px-2 py-1 bg-[#0B874F]/10 border border-[#0B874F]/30 rounded text-xs text-[#0B874F] font-mono">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Content - Projects, Heatmaps, etc */}
            <div className="lg:col-span-2 space-y-4">
              {/* Projects Section - Expanded */}
              {user.showProjects && projects.length > 0 && (
                <div className="space-y-3">
                  <div className="text-sm font-semibold text-gray-400 font-mono flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-[#0B874F]" />
                    <span>$ projects --list</span>
                  </div>
                  <div className="space-y-3">
                    {projects.map((project) => (
                      <div key={project.id} className="group p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#0B874F]/50 rounded-lg transition-all">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="text-base font-bold text-white group-hover:text-[#0B874F] transition-colors font-mono">
                              {project.name}
                            </h3>
                            <p className="text-sm text-gray-400 mt-1 leading-relaxed">{project.description}</p>
                          </div>
                          {project.repoUrl && (
                            <a href={project.repoUrl} target="_blank" rel="noopener noreferrer"
                              className="ml-3 p-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#0B874F]/50 rounded transition-all">
                              <ExternalLink className="w-4 h-4 text-gray-400 hover:text-[#0B874F]" />
                            </a>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          <span className="px-2 py-1 bg-[#0B874F]/20 border border-[#0B874F]/30 rounded text-xs text-[#0B874F] font-mono">
                            {project.language}
                          </span>
                          <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-gray-400 font-mono">
                            {project.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* GitHub Heatmap */}
              {user.showGithubStats && user.githubUsername && (
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-gray-400 font-mono flex items-center gap-2">
                    <Github className="w-4 h-4 text-[#0B874F]" />
                    <span>$ github --contributions</span>
                  </div>
                  <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                    <GitHubHeatmap username={user.githubUsername} />
                  </div>
                </div>
              )}

              {/* LeetCode Heatmap */}
              {user.showLeetcodeStats && user.leetcodeUsername && (
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-gray-400 font-mono flex items-center gap-2">
                    <Code className="w-4 h-4 text-[#ffa116]" />
                    <span>$ leetcode --activity</span>
                  </div>
                  <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                    <LeetCodeHeatmap username={user.leetcodeUsername} />
                  </div>
                </div>
              )}

              {/* Stats Breakdown */}
              {((user.showGithubStats && githubStats) || (user.showLeetcodeStats && leetcodeStats)) && (
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-gray-400 font-mono flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-[#0B874F]" />
                    <span>$ stats --detailed</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {/* GitHub Stats */}
                    {user.showGithubStats && githubStats && (
                      <div className="space-y-2">
                        <div className="text-xs text-gray-500 font-mono mb-2">GitHub</div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-2 bg-green-500/10 border border-green-500/30 rounded text-center">
                            <div className="text-lg font-bold text-green-400 font-mono">{githubStats.commits}</div>
                            <div className="text-xs text-gray-500">Commits</div>
                          </div>
                          <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded text-center">
                            <div className="text-lg font-bold text-blue-400 font-mono">{githubStats.pullRequests}</div>
                            <div className="text-xs text-gray-500">PRs</div>
                          </div>
                          <div className="p-2 bg-red-500/10 border border-red-500/30 rounded text-center">
                            <div className="text-lg font-bold text-red-400 font-mono">{githubStats.issues}</div>
                            <div className="text-xs text-gray-500">Issues</div>
                          </div>
                          <div className="p-2 bg-purple-500/10 border border-purple-500/30 rounded text-center">
                            <div className="text-lg font-bold text-purple-400 font-mono">{githubStats.repositories}</div>
                            <div className="text-xs text-gray-500">Repos</div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* LeetCode Stats */}
                    {user.showLeetcodeStats && leetcodeStats && (
                      <div className="space-y-2">
                        <div className="text-xs text-gray-500 font-mono mb-2">LeetCode</div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-2 bg-green-500/10 border border-green-500/30 rounded text-center">
                            <div className="text-lg font-bold text-green-400 font-mono">{leetcodeStats.easySolved}</div>
                            <div className="text-xs text-gray-500">Easy</div>
                          </div>
                          <div className="p-2 bg-yellow-500/10 border border-yellow-500/30 rounded text-center">
                            <div className="text-lg font-bold text-yellow-400 font-mono">{leetcodeStats.mediumSolved}</div>
                            <div className="text-xs text-gray-500">Medium</div>
                          </div>
                          <div className="p-2 bg-red-500/10 border border-red-500/30 rounded text-center">
                            <div className="text-lg font-bold text-red-400 font-mono">{leetcodeStats.hardSolved}</div>
                            <div className="text-xs text-gray-500">Hard</div>
                          </div>
                          <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded text-center">
                            <div className="text-lg font-bold text-blue-400 font-mono">{leetcodeStats.totalSolved}</div>
                            <div className="text-xs text-gray-500">Total</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Bootcamps */}
              {user.showBootcamps && bootcamps.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-gray-400 font-mono flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-[#0B874F]" />
                    <span>$ bootcamps --achievements</span>
                  </div>
                  <div className="space-y-2">
                    {bootcamps.map((bootcamp) => (
                      <div key={bootcamp.id} className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#0B874F]/20 rounded flex items-center justify-center">
                            <Trophy className="w-4 h-4 text-[#0B874F]" />
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-white font-mono">{bootcamp.name}</h3>
                            <p className="text-xs text-gray-400">{bootcamp.type}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {bootcamp.finalRank && (
                            <div className="text-sm font-bold text-[#0B874F] font-mono">#{bootcamp.finalRank}</div>
                          )}
                          <div className="text-xs text-gray-400 font-mono">{bootcamp.finalPoints}pts</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Achievements */}
              {user.showAchievements && achievements.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-gray-400 font-mono flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#0B874F]" />
                    <span>$ achievements --unlocked</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {achievements.map((achievement) => (
                      <div key={achievement.id} className="p-3 bg-gradient-to-br from-[#0B874F]/10 to-transparent border border-[#0B874F]/30 rounded-lg">
                        <div className="text-2xl mb-2">{achievement.icon}</div>
                        <h3 className="text-sm font-semibold text-white mb-1 font-mono">{achievement.name}</h3>
                        <p className="text-xs text-gray-400 line-clamp-2">{achievement.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-[#0B874F]/30 text-center">
            <p className="text-xs text-gray-600 font-mono">
              <span className="text-[#0B874F]">$</span> powered by UFC Platform <span className="text-gray-700 mx-2">|</span> <span className="text-gray-700">~/{slug}/portfolio</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
