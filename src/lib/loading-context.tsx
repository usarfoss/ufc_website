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
      // Show loading for 10 seconds on first visit
      setTimeout(() => {
        setIsLoading(false);
      }, 10000);
    }
  }, []);

  // Show loading screen on route changes (10 seconds as requested)
  useEffect(() => {
    if (!isFirstVisit) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 10000);
      
      return () => clearTimeout(timer);
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
