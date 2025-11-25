"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Globe, Lock, Share2, Eye, Copy, Check, ExternalLink, Plus, X, Save } from 'lucide-react';
import GitCommandsLoader from '@/components/ui/git-commands-loader';

interface PortfolioSettings {
  portfolioSlug: string;
  portfolioPublic: boolean;
  tagline: string;
  techStack: string[];
  resumeUrl: string;
  websiteUrl: string;
  linkedinUrl: string;
  twitterUrl: string;
}

export default function PortfolioSettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<PortfolioSettings>({
    portfolioSlug: '',
    portfolioPublic: false,
    tagline: '',
    techStack: [],
    resumeUrl: '',
    websiteUrl: '',
    linkedinUrl: '',
    twitterUrl: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [newTech, setNewTech] = useState('');
  const [slugError, setSlugError] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/portfolio-settings');
      
      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }

      const data = await response.json();
      setSettings({
        portfolioSlug: data.portfolioSlug || '',
        portfolioPublic: data.portfolioPublic || false,
        tagline: data.tagline || '',
        techStack: data.techStack || [],
        resumeUrl: data.resumeUrl || '',
        websiteUrl: data.websiteUrl || '',
        linkedinUrl: data.linkedinUrl || '',
        twitterUrl: data.twitterUrl || ''
      });
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSlugError('');

      const response = await fetch('/api/dashboard/portfolio-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === 'Slug already taken') {
          setSlugError('This portfolio URL is already taken. Please choose another.');
        } else if (data.error?.includes('migration required')) {
          alert('⚠️ Database Migration Required\n\nPlease run the following command:\nnpx prisma migrate dev\n\nThen restart the server.');
        } else {
          alert(`Error: ${data.error || 'Failed to update settings'}\n\nCheck the browser console for more details.`);
        }
        console.error('API Error:', data);
        return;
      }

      alert('✅ Portfolio settings saved successfully!');
    } catch (err: any) {
      console.error('Error saving settings:', err);
      alert(`Failed to save settings: ${err.message || 'Unknown error'}\n\nCheck the browser console for more details.`);
    } finally {
      setSaving(false);
    }
  };

  const handleSlugChange = (value: string) => {
    // Only allow lowercase letters, numbers, and hyphens
    const sanitized = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSettings({ ...settings, portfolioSlug: sanitized });
    setSlugError('');
  };

  const addTech = () => {
    if (newTech.trim() && !settings.techStack.includes(newTech.trim())) {
      setSettings({
        ...settings,
        techStack: [...settings.techStack, newTech.trim()]
      });
      setNewTech('');
    }
  };

  const removeTech = (tech: string) => {
    setSettings({
      ...settings,
      techStack: settings.techStack.filter(t => t !== tech)
    });
  };

  const copyPortfolioLink = () => {
    const link = `${window.location.origin}/portfolio/${settings.portfolioSlug}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openPortfolio = () => {
    window.open(`/portfolio/${settings.portfolioSlug}`, '_blank');
  };

  if (loading) {
    return <GitCommandsLoader />;
  }

  const portfolioUrl = settings.portfolioSlug 
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/portfolio/${settings.portfolioSlug}`
    : '';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-black/60 to-[#0B874F]/10 backdrop-blur-sm border border-[#0B874F]/30 rounded-xl p-8">
        <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
          <Globe className="w-10 h-10 mr-4 text-[#0B874F]" />
          Portfolio Settings
        </h1>
        <p className="text-gray-300 text-lg">
          Customize your public portfolio and share your achievements
        </p>
      </div>

      {/* Portfolio URL */}
      <div className="bg-black/40 backdrop-blur-sm border border-[#0B874F]/30 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Portfolio URL</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Custom URL Slug
            </label>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">{typeof window !== 'undefined' ? window.location.origin : ''}/portfolio/</span>
              <input
                type="text"
                value={settings.portfolioSlug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="your-name"
                className="flex-1 px-3 py-2 bg-black/50 border border-[#0B874F]/30 rounded-lg text-white focus:outline-none focus:border-[#0B874F]"
              />
            </div>
            {slugError && (
              <p className="text-red-400 text-sm mt-2">{slugError}</p>
            )}
            <p className="text-gray-500 text-sm mt-2">
              Choose a unique URL for your portfolio. Only lowercase letters, numbers, and hyphens allowed.
            </p>
          </div>

          {settings.portfolioSlug && (
            <div className="flex items-center gap-2 p-4 bg-[#0B874F]/10 border border-[#0B874F]/30 rounded-lg">
              <div className="flex-1 text-[#0B874F] font-mono text-sm break-all">
                {portfolioUrl}
              </div>
              <button
                onClick={copyPortfolioLink}
                className="p-2 hover:bg-[#0B874F]/20 rounded transition-colors"
                title="Copy link"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-green-500" />
                ) : (
                  <Copy className="w-5 h-5 text-[#0B874F]" />
                )}
              </button>
              <button
                onClick={openPortfolio}
                className="p-2 hover:bg-[#0B874F]/20 rounded transition-colors"
                title="Open portfolio"
              >
                <ExternalLink className="w-5 h-5 text-[#0B874F]" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="bg-black/40 backdrop-blur-sm border border-[#0B874F]/30 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Privacy</h2>
        
        <div className="flex items-center justify-between p-4 bg-black/30 rounded-lg">
          <div className="flex items-center gap-3">
            {settings.portfolioPublic ? (
              <Globe className="w-5 h-5 text-[#0B874F]" />
            ) : (
              <Lock className="w-5 h-5 text-gray-400" />
            )}
            <div>
              <div className="text-white font-semibold">
                {settings.portfolioPublic ? 'Public Portfolio' : 'Private Portfolio'}
              </div>
              <div className="text-sm text-gray-400">
                {settings.portfolioPublic 
                  ? 'Anyone with the link can view your portfolio'
                  : 'Only you can view your portfolio'}
              </div>
            </div>
          </div>
          <button
            onClick={() => setSettings({ ...settings, portfolioPublic: !settings.portfolioPublic })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.portfolioPublic ? 'bg-[#0B874F]' : 'bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.portfolioPublic ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* About Section */}
      <div className="bg-black/40 backdrop-blur-sm border border-[#0B874F]/30 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">About</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Tagline
            </label>
            <input
              type="text"
              value={settings.tagline}
              onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
              placeholder="Full Stack Developer | Open Source Enthusiast"
              maxLength={100}
              className="w-full px-3 py-2 bg-black/50 border border-[#0B874F]/30 rounded-lg text-white focus:outline-none focus:border-[#0B874F]"
            />
            <p className="text-gray-500 text-sm mt-1">
              A short headline that appears below your name
            </p>
          </div>
        </div>
      </div>

      {/* Tech Stack */}
      <div className="bg-black/40 backdrop-blur-sm border border-[#0B874F]/30 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Tech Stack</h2>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTech}
              onChange={(e) => setNewTech(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTech()}
              placeholder="Add a technology (e.g., React, Python)"
              className="flex-1 px-3 py-2 bg-black/50 border border-[#0B874F]/30 rounded-lg text-white focus:outline-none focus:border-[#0B874F]"
            />
            <button
              onClick={addTech}
              className="px-4 py-2 bg-[#0B874F] text-black rounded-lg hover:bg-[#0B874F]/80 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </button>
          </div>

          {settings.techStack.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {settings.techStack.map((tech, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-2 bg-[#0B874F]/10 border border-[#0B874F]/30 rounded-lg"
                >
                  <span className="text-[#0B874F]">{tech}</span>
                  <button
                    onClick={() => removeTech(tech)}
                    className="text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Links */}
      <div className="bg-black/40 backdrop-blur-sm border border-[#0B874F]/30 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Links</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Resume URL
            </label>
            <input
              type="url"
              value={settings.resumeUrl}
              onChange={(e) => setSettings({ ...settings, resumeUrl: e.target.value })}
              placeholder="https://drive.google.com/..."
              className="w-full px-3 py-2 bg-black/50 border border-[#0B874F]/30 rounded-lg text-white focus:outline-none focus:border-[#0B874F]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Personal Website
            </label>
            <input
              type="url"
              value={settings.websiteUrl}
              onChange={(e) => setSettings({ ...settings, websiteUrl: e.target.value })}
              placeholder="https://yourwebsite.com"
              className="w-full px-3 py-2 bg-black/50 border border-[#0B874F]/30 rounded-lg text-white focus:outline-none focus:border-[#0B874F]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              LinkedIn Profile
            </label>
            <input
              type="url"
              value={settings.linkedinUrl}
              onChange={(e) => setSettings({ ...settings, linkedinUrl: e.target.value })}
              placeholder="https://linkedin.com/in/username"
              className="w-full px-3 py-2 bg-black/50 border border-[#0B874F]/30 rounded-lg text-white focus:outline-none focus:border-[#0B874F]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Twitter Profile
            </label>
            <input
              type="url"
              value={settings.twitterUrl}
              onChange={(e) => setSettings({ ...settings, twitterUrl: e.target.value })}
              placeholder="https://twitter.com/username"
              className="w-full px-3 py-2 bg-black/50 border border-[#0B874F]/30 rounded-lg text-white focus:outline-none focus:border-[#0B874F]"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <button
          onClick={handleSave}
          disabled={saving || !settings.portfolioSlug}
          className="px-6 py-3 bg-[#0B874F] text-black font-semibold rounded-lg hover:bg-[#0B874F]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          <Save className="w-5 h-5 mr-2" />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {!settings.portfolioSlug && (
        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
          <p className="text-yellow-400 text-sm">
            Please set a portfolio URL slug before saving.
          </p>
        </div>
      )}
    </div>
  );
}
