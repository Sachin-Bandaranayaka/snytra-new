'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  loading?: boolean;
  maxVisiblePages?: number;
  showFirstLast?: boolean;
  className?: string;
}

export function Pagination({ 
  currentPage, 
  totalPages, 
  loading = false,
  maxVisiblePages = 5,
  showFirstLast = true,
  className = ""
}: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);

  const handlePageChange = async (page: number) => {
    if (page === currentPage || page < 1 || page > totalPages || isNavigating) {
      return;
    }

    setIsNavigating(true);
    
    // Create new URL with updated page parameter
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete('page'); // Remove page param for first page
    } else {
      params.set('page', page.toString());
    }
    
    const newUrl = params.toString() ? `/blog?${params.toString()}` : '/blog';
    
    try {
      router.push(newUrl);
    } finally {
      // Reset navigating state after a short delay
      setTimeout(() => setIsNavigating(false), 500);
    }
  };

  // Calculate which page numbers to show
  const getVisiblePages = () => {
    const pages: (number | 'ellipsis')[] = [];
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      const startPage = Math.max(2, currentPage - Math.floor(maxVisiblePages / 2));
      const endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 3);
      
      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pages.push('ellipsis');
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pages.push('ellipsis');
      }
      
      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();
  const isLoading = loading || isNavigating;

  if (totalPages <= 1) {
    return null; // Don't show pagination for single page
  }

  return (
    <nav 
      role="navigation" 
      aria-label="Blog pagination"
      className={`flex justify-center ${className}`}
    >
      <div className="flex space-x-2">
        {/* Previous Button */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1 || isLoading}
          aria-label="Go to previous page"
          className="px-4 py-2 border border-gray-300 rounded-md text-charcoal hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <span className="inline-block w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          ) : (
            'Previous'
          )}
        </button>

        {/* Page Numbers */}
        {visiblePages.map((page, index) => {
          if (page === 'ellipsis') {
            return (
              <span 
                key={`ellipsis-${index}`}
                className="px-4 py-2 text-gray-500"
                aria-hidden="true"
              >
                ...
              </span>
            );
          }

          const isCurrentPage = page === currentPage;
          
          return (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              disabled={isLoading}
              aria-label={`Go to page ${page}`}
              aria-current={isCurrentPage ? "page" : undefined}
              className={`px-4 py-2 rounded-md transition-colors ${
                isCurrentPage
                  ? 'bg-primary text-white'
                  : 'border border-gray-300 text-charcoal hover:bg-gray-50 disabled:opacity-50'
              }`}
            >
              {page}
            </button>
          );
        })}

        {/* Next Button */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || isLoading}
          aria-label="Go to next page"
          className="px-4 py-2 border border-gray-300 rounded-md text-charcoal hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <span className="inline-block w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          ) : (
            'Next'
          )}
        </button>
      </div>
    </nav>
  );
}