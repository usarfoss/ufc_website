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
    <div className="absolute top-6 right-8 z-30">
      <nav className="bg-black/40 backdrop-blur-lg border border-[#0B874F] shadow-lg rounded-lg p-4">
        <ul className="flex gap-6 text-sm font-mono">
          <li>
            <Link href="/" className="hover:text-[#0B874F] transition">
              Home
            </Link>
          </li>
          <li>
            <Link href="/about" className="hover:text-[#0B874F] transition">
              About
            </Link>
          </li>
          <li>
            <Link href="/projects" className="hover:text-[#0B874F] transition">
              Projects
            </Link>
          </li>
          <li>
            <Link href="/events" className="hover:text-[#0B874F] transition">
              Events
            </Link>
          </li>
          <li>
            <Link href="/login" className="hover:text-[#0B874F] transition">
              Login
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};
