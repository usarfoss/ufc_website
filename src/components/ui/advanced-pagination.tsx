'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface AdvancedPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showQuickJump?: boolean;
  maxVisiblePages?: number;
}

export default function AdvancedPagination({
  currentPage,
  totalPages,
  onPageChange,
  showQuickJump = true,
  maxVisiblePages = 5
}: AdvancedPaginationProps) {
  const [jumpToPage, setJumpToPage] = useState('');
  const [showJumpInput, setShowJumpInput] = useState(false);

  if (totalPages <= 1) return null;

  const handleJumpToPage = () => {
    const page = parseInt(jumpToPage);
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
      setJumpToPage('');
      setShowJumpInput(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleJumpToPage();
    } else if (e.key === 'Escape') {
      setShowJumpInput(false);
      setJumpToPage('');
    }
  };

  const generatePageNumbers = () => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          pages.push(i);
        }
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const pageNumbers = generatePageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
      {/* Main Pagination */}
      <div className="flex items-center space-x-1">
        {/* First Page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-2 bg-black/40 border border-[#0B874F]/30 rounded-lg text-[#0B874F] hover:bg-[#0B874F]/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="First page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Previous Page */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 bg-black/40 border border-[#0B874F]/30 rounded-lg text-[#0B874F] hover:bg-[#0B874F]/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page Numbers */}
        <div className="flex items-center space-x-1">
          {pageNumbers.map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <button
                  onClick={() => setShowJumpInput(!showJumpInput)}
                  className="px-3 py-2 bg-black/40 border border-[#0B874F]/30 rounded-lg text-[#0B874F] hover:bg-[#0B874F]/20 transition-colors"
                  title="Click to jump to specific page"
                >
                  ...
                </button>
              ) : (
                <button
                  onClick={() => onPageChange(page as number)}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    currentPage === page
                      ? 'bg-[#0B874F] text-black font-bold'
                      : 'bg-black/40 border border-[#0B874F]/30 text-[#0B874F] hover:bg-[#0B874F]/20'
                  }`}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Next Page */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 bg-black/40 border border-[#0B874F]/30 rounded-lg text-[#0B874F] hover:bg-[#0B874F]/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Last Page */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-2 bg-black/40 border border-[#0B874F]/30 rounded-lg text-[#0B874F] hover:bg-[#0B874F]/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Last page"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Jump Input */}
      {showQuickJump && (
        <div className="flex items-center space-x-2">
          {showJumpInput ? (
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={jumpToPage}
                onChange={(e) => setJumpToPage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Page"
                min="1"
                max={totalPages}
                className="w-20 px-2 py-1 bg-black/40 border border-[#0B874F]/30 rounded text-[#0B874F] text-center focus:outline-none focus:border-[#0B874F]"
                autoFocus
              />
              <button
                onClick={handleJumpToPage}
                className="px-3 py-1 bg-[#0B874F] text-black rounded hover:bg-[#0B874F]/80 transition-colors"
              >
                Go
              </button>
              <button
                onClick={() => {
                  setShowJumpInput(false);
                  setJumpToPage('');
                }}
                className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowJumpInput(true)}
              className="px-3 py-2 bg-black/40 border border-[#0B874F]/30 rounded-lg text-[#0B874F] hover:bg-[#0B874F]/20 transition-colors text-sm"
            >
              Jump to page
            </button>
          )}
        </div>
      )}

      {/* Page Info */}
      <div className="text-[#0B874F] text-sm font-mono">
        Page {currentPage} of {totalPages}
      </div>
    </div>
  );
}
