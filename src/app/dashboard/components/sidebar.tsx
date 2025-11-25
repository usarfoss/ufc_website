"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import { 
  Home, 
  Trophy, 
  User, 
  Settings, 
  Calendar,
  GitBranch,
  Users,
  Activity,
  Shield,
  Target
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home, roles: [] },
  { name: "Bootcamps", href: "/dashboard/bootcamps", icon: Target, roles: [], hasNotification: true },
  { name: "Leaderboard", href: "/dashboard/leaderboard", icon: Trophy, roles: [] },
  { name: "Projects", href: "/dashboard/projects", icon: GitBranch, roles: [] },
  { name: "Events", href: "/dashboard/events", icon: Calendar, roles: ['ADMIN', 'MAINTAINER', 'MODERATOR'] },
  { name: "Members", href: "/dashboard/members", icon: Users, roles: [] },
  { name: "Activity", href: "/dashboard/activity", icon: Activity, roles: [] },
  { name: "Profile", href: "/dashboard/profile", icon: User, roles: [] },
  { name: "Settings", href: "/dashboard/settings", icon: Settings, roles: [] },
];

const adminNavigation = [
  { name: "Admin Panel", href: "/dashboard/admin", icon: Shield, roles: ['ADMIN', 'MAINTAINER', 'MODERATOR'] },
  { name: "Bootcamps", href: "/dashboard/admin/bootcamps", icon: Trophy, roles: ['ADMIN', 'MAINTAINER', 'MODERATOR'] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [hasActiveBootcamp, setHasActiveBootcamp] = useState(false);

  useEffect(() => {
    // Check for active bootcamp
    const checkActiveBootcamp = async () => {
      try {
        const response = await fetch('/api/bootcamps/active');
        if (response.ok) {
          const data = await response.json();
          setHasActiveBootcamp(!!data.bootcamp);
        }
      } catch (error) {
        console.error('Error checking active bootcamp:', error);
      }
    };

    checkActiveBootcamp();
    // Check every minute
    const interval = setInterval(checkActiveBootcamp, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-black/80 backdrop-blur-sm border-r border-[#0B874F]/30 z-30">
      {/* Logo */}
      <div className="p-6 border-b border-[#0B874F]/30">
        <h1 className="text-2xl font-bold text-[#0B874F]">
          // FOSSER
        </h1>
        <p className="text-sm text-gray-400 mt-1">Developer Hub</p>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {navigation.map((item) => {
          // Hide items that require specific roles
          if (item.roles.length > 0 && !item.roles.includes(user?.role?.toUpperCase() || '')) {
            return null;
          }
          
          const isActive = pathname === item.href;
          const Icon = item.icon;
          const showNotification = item.hasNotification && hasActiveBootcamp;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              prefetch={true}
              className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 group relative ${
                isActive
                  ? "bg-[#0B874F]/20 text-[#0B874F] border border-[#0B874F]/50"
                  : "text-gray-300 hover:bg-[#0B874F]/10 hover:text-[#0B874F]"
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              <span className="font-medium">{item.name}</span>
              {showNotification && (
                <div className="ml-auto w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              )}
              {isActive && !showNotification && (
                <div className="ml-auto w-2 h-2 bg-[#0B874F] rounded-full"></div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Admin Navigation */}
      {user && ['ADMIN', 'MAINTAINER', 'MODERATOR'].includes(user.role?.toUpperCase() || '') && (
        <>
          <div className="mx-4 border-t border-[#0B874F]/30 my-2"></div>
          <nav className="p-4 space-y-2">
            {adminNavigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  prefetch={true}
                  className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 group ${
                    isActive
                      ? "bg-yellow-500/20 text-yellow-500 border border-yellow-500/50"
                      : "text-yellow-400 hover:bg-yellow-500/10 hover:text-yellow-500"
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  <span className="font-medium">{item.name}</span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-yellow-500 rounded-full"></div>
                  )}
                </Link>
              );
            })}
          </nav>
        </>
      )}


    </div>
  );
}