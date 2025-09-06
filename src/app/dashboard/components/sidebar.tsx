"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Trophy, 
  User, 
  Settings, 
  Calendar,
  GitBranch,
  Users,
  Activity
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Leaderboard", href: "/dashboard/leaderboard", icon: Trophy },
  { name: "Projects", href: "/dashboard/projects", icon: GitBranch },
  { name: "Events", href: "/dashboard/events", icon: Calendar },
  { name: "Members", href: "/dashboard/members", icon: Users },
  { name: "Activity", href: "/dashboard/activity", icon: Activity },
  { name: "Profile", href: "/dashboard/profile", icon: User },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

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
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              prefetch={true}
              className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 group ${
                isActive
                  ? "bg-[#0B874F]/20 text-[#0B874F] border border-[#0B874F]/50"
                  : "text-gray-300 hover:bg-[#0B874F]/10 hover:text-[#0B874F]"
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              <span className="font-medium">{item.name}</span>
              {isActive && (
                <div className="ml-auto w-2 h-2 bg-[#0B874F] rounded-full"></div>
              )}
            </Link>
          );
        })}
      </nav>


    </div>
  );
}