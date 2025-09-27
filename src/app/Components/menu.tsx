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
    <div className="absolute top-4 right-4 md:top-6 md:right-8 z-30">
      <nav className="bg-black/40 backdrop-blur-lg border border-[#0B874F] shadow-lg rounded-lg p-2 md:p-4">
        <ul className="flex flex-wrap gap-2 md:gap-6 text-xs md:text-sm font-mono">
          <li>
            <Link href="/" className="hover:text-[#0B874F] transition px-2 py-1 rounded">
              Home
            </Link>
          </li>
          <li>
            <Link href="/about" className="hover:text-[#0B874F] transition px-2 py-1 rounded">
              About
            </Link>
          </li>
          <li>
            <Link href="/projects" className="hover:text-[#0B874F] transition px-2 py-1 rounded">
              Projects
            </Link>
          </li>
          <li>
            <Link href="/events" className="hover:text-[#0B874F] transition px-2 py-1 rounded">
              Events
            </Link>
          </li>
          <li>
            <Link href="/login" className="hover:text-[#0B874F] transition px-2 py-1 rounded">
              Login
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};
