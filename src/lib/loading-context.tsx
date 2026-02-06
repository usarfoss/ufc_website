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
  const [hasShownHomeLoading, setHasShownHomeLoading] = useState(false);
  const pathname = usePathname();

  // Only show loading on home page and only once per session
  useEffect(() => {
    const isHomePage = pathname === '/' || pathname === '/home';
    
    if (isHomePage && !hasShownHomeLoading) {
      setIsLoading(true);
      setHasShownHomeLoading(true);
      
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [pathname, hasShownHomeLoading]);

  // Immediately hide loading for non-home pages
  useEffect(() => {
    const isHomePage = pathname === '/' || pathname === '/home';
    if (!isHomePage) {
      setIsLoading(false);
    }
  }, [pathname]);

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