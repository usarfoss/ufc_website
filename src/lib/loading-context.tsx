'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import LoadingPage from '@/app/loading';

interface LoadingContextType {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const pathname = usePathname();

  // Check if this is the first visit
  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisited');
    if (hasVisited) {
      setIsFirstVisit(false);
    } else {
      localStorage.setItem('hasVisited', 'true');
      setIsLoading(true);
      // Show loading for 10 seconds on first visit to home page
      setTimeout(() => {
        setIsLoading(false);
      }, 10000);
    }
  }, []);

  // Show loading screen on route changes with different durations
  useEffect(() => {
    if (!isFirstVisit) {
      // Define surface pages that should show loading animation
      const surfacePages = ['/', '/home', '/about', '/projects', '/events', '/login', '/signup'];
      const isSurfacePage = surfacePages.includes(pathname);
      
      // Only show loading for surface pages, skip dashboard and other internal pages
      if (isSurfacePage) {
        setIsLoading(true);
        
        // Determine loading duration based on the page
        const isHomePage = pathname === '/' || pathname === '/home';
        const loadingDuration = isHomePage ? 10000 : 300; // 10 seconds for home, 0.3 seconds for others
        
        const timer = setTimeout(() => {
          setIsLoading(false);
        }, loadingDuration);
        
        return () => clearTimeout(timer);
      }
    }
  }, [pathname, isFirstVisit]);

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
      {isLoading && <LoadingPage />}
      {!isLoading && children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within LoadingProvider');
  }
  return context;
}
