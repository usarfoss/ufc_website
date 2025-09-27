"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const Menu = () => {
  const pathname = usePathname();
  
  // Hide menu on dashboard pages
  if (pathname?.startsWith('/dashboard')) {
    return null;
  }

  return (
    <div className="fixed top-2 right-2 sm:top-4 sm:right-4 md:top-6 md:right-8 z-30">
      <nav className="bg-black/50 backdrop-blur-lg border border-[#0B874F] shadow-lg rounded-lg p-1.5 sm:p-2 md:p-4">
        <ul className="flex flex-wrap gap-1 sm:gap-2 md:gap-6 text-xs sm:text-sm md:text-sm font-mono">
          <li>
            <Link href="/" className="hover:text-[#0B874F] transition px-1.5 sm:px-2 py-1 rounded text-center min-w-[44px]">
              Home
            </Link>
          </li>
          <li>
            <Link href="/about" className="hover:text-[#0B874F] transition px-1.5 sm:px-2 py-1 rounded text-center min-w-[44px]">
              About
            </Link>
          </li>
          <li>
            <Link href="/projects" className="hover:text-[#0B874F] transition px-1.5 sm:px-2 py-1 rounded text-center min-w-[44px]">
              Projects
            </Link>
          </li>
          <li>
            <Link href="/events" className="hover:text-[#0B874F] transition px-1.5 sm:px-2 py-1 rounded text-center min-w-[44px]">
              Events
            </Link>
          </li>
          <li>
            <Link href="/login" className="hover:text-[#0B874F] transition px-1.5 sm:px-2 py-1 rounded text-center min-w-[44px]">
              Login
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};
