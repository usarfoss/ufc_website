'use client';

import React, { useState, useEffect } from 'react';
import { Terminal, GitBranch, GitCommit, GitMerge, Code, History, Search, Layers, Zap, RefreshCw, GitCompare } from 'lucide-react';

interface GitCommand {
  command: string;
  description: string;
  icon: React.ReactNode;
}

const gitCommands: GitCommand[] = [
  {
    command: 'git rebase -i HEAD~3',
    description: 'Interactive rebase to edit, squash, or reorder commits',
    icon: <GitMerge className="w-5 h-5" />
  },
  {
    command: 'git cherry-pick <commit-hash>',
    description: 'Apply a specific commit from another branch to current branch',
    icon: <GitCommit className="w-5 h-5" />
  },
  {
    command: 'git stash push -m "message"',
    description: 'Temporarily save uncommitted changes for later use',
    icon: <Layers className="w-5 h-5" />
  },
  {
    command: 'git bisect start',
    description: 'Binary search through commits to find the bug introduction',
    icon: <Search className="w-5 h-5" />
  },
  {
    command: 'git reflog',
    description: 'View reference logs to recover lost commits or branches',
    icon: <History className="w-5 h-5" />
  },
  {
    command: 'git reset --soft HEAD~1',
    description: 'Undo last commit but keep changes staged',
    icon: <RefreshCw className="w-5 h-5" />
  },
  {
    command: 'git log --graph --oneline --all',
    description: 'Visual commit history with branch visualization',
    icon: <GitBranch className="w-5 h-5" />
  },
  {
    command: 'git diff --staged',
    description: 'View differences of staged changes before committing',
    icon: <Code className="w-5 h-5" />
  },
  {
    command: 'git worktree add ../feature-branch',
    description: 'Create multiple working trees for parallel development',
    icon: <Zap className="w-5 h-5" />
  },
  {
    command: 'git blame <file>',
    description: 'Show who last modified each line of a file',
    icon: <Search className="w-5 h-5" />
  },
  {
    command: 'git revert <commit-hash>',
    description: 'Create a new commit that undoes changes from a commit',
    icon: <GitCompare className="w-5 h-5" />
  },
  {
    command: 'git submodule update --init --recursive',
    description: 'Initialize and update git submodules recursively',
    icon: <Layers className="w-5 h-5" />
  }
];

export default function GitCommandsLoader() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    const currentCommand = gitCommands[currentIndex];
    let charIndex = 0;
    let timeoutId: NodeJS.Timeout;

    const typeCommand = () => {
      if (charIndex < currentCommand.command.length) {
        setDisplayedText(currentCommand.command.substring(0, charIndex + 1));
        charIndex++;
        timeoutId = setTimeout(typeCommand, 50);
      } else {
        setIsTyping(false);
        // Wait before moving to next command
        timeoutId = setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % gitCommands.length);
          setDisplayedText('');
          setIsTyping(true);
        }, 2000);
      }
    };

    typeCommand();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [currentIndex]);

  const currentCommand = gitCommands[currentIndex];

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      {/* Terminal Window */}
      <div className="w-full max-w-2xl bg-black/80 backdrop-blur-sm border border-[#0B874F]/30 rounded-xl overflow-hidden shadow-2xl">
        {/* Terminal Header */}
        <div className="bg-[#0B874F]/20 border-b border-[#0B874F]/30 px-4 py-3 flex items-center gap-2">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <Terminal className="w-4 h-4 text-[#0B874F]" />
            <span className="text-xs text-gray-400 font-mono">terminal</span>
          </div>
        </div>

        {/* Terminal Body */}
        <div className="p-6 font-mono">
          {/* Prompt */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[#0B874F]">$</span>
            <span className="text-gray-400">git</span>
          </div>

          {/* Command Display */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="text-[#0B874F]">
                {currentCommand.icon}
              </div>
              <div className="flex-1">
                <div className="text-white text-lg font-semibold">
                  {displayedText}
                  {isTyping && (
                    <span className="inline-block w-2 h-5 bg-[#0B874F] ml-1 animate-pulse"></span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Description */}
            <div className="ml-8 text-gray-400 text-sm italic">
              {currentCommand.description}
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="mt-8 pt-4 border-t border-[#0B874F]/20">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span>Loading your data...</span>
              <span>{currentIndex + 1} / {gitCommands.length}</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#0B874F] to-[#0B874F]/50 rounded-full transition-all duration-500"
                style={{ width: `${((currentIndex + 1) / gitCommands.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

