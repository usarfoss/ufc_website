"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { LogOut, User, Settings } from "lucide-react";

export default function Topbar() {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="h-16 bg-black/60 backdrop-blur-sm border-b border-[#0B874F]/30 flex items-center justify-end px-6 relative z-50">
      {/* Right Section */}
      <div className="flex items-center space-x-4">
        {/* User Menu */}
        <div className="relative z-50" ref={dropdownRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-[#0B874F]/10 transition-colors"
          >
            {user?.githubUsername ? (
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#0B874F]/30">
                <img
                  src={`https://github.com/${user?.githubUsername}.png`}
                  alt={user?.name || user?.email || 'User avatar'}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
            <div className="w-8 h-8 bg-[#0B874F] rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-black" />
            </div>
            )}
            <div className="text-left">
              <div className="text-sm font-medium text-white">{user?.name || user?.email}</div>
              <div className="text-xs text-gray-400 capitalize">{user?.role}</div>
            </div>
          </button>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-black/95 backdrop-blur-md border border-[#0B874F]/30 rounded-lg shadow-2xl z-[99999]">
              <div className="p-2">
                <button 
                  onClick={() => {
                    setShowUserMenu(false);
                    window.location.href = '/dashboard/profile';
                  }}
                  className="w-full flex items-center px-3 py-2 text-sm text-gray-300 hover:text-[#0B874F] hover:bg-[#0B874F]/10 rounded transition-colors"
                >
                  <User className="w-4 h-4 mr-3" />
                  Profile
                </button>
                <button 
                  onClick={() => {
                    setShowUserMenu(false);
                    window.location.href = '/dashboard/settings';
                  }}
                  className="w-full flex items-center px-3 py-2 text-sm text-gray-300 hover:text-[#0B874F] hover:bg-[#0B874F]/10 rounded transition-colors"
                >
                  <Settings className="w-4 h-4 mr-3" />
                  Settings
                </button>
                <hr className="my-2 border-[#0B874F]/30" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}