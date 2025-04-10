'use client';

import { Button } from './Button';
import { Select } from './Select';
import { cn } from '@/app/lib/utils';

interface PaginationProps {
  /**
   * Current page index (0-based)
   */
  currentPage: number;
  /**
   * Total number of pages
   */
  totalPages: number;
  /**
   * Total number of items
   */
  totalItems: number;
  /**
   * Number of items per page
   */
  pageSize: number;
  /**
   * Available page size options
   */
  pageSizeOptions?: number[];
  /**
   * Callback for page change
   */
  onPageChange: (page: number) => void;
  /**
   * Callback for page size change
   */
  onPageSizeChange?: (pageSize: number) => void;
  /**
   * Whether to show page size selector
   */
  showPageSizeSelector?: boolean;
  /**
   * Whether data is currently loading
   */
  isLoading?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Pagination component for navigating through multi-page data
 */
export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  pageSizeOptions = [10, 25, 50, 100],
  onPageChange,
  onPageSizeChange,
  showPageSizeSelector = true,
  isLoading = false,
  className,
}: PaginationProps) {
  // Generate page numbers to display (always show first, last, current, and some adjacent pages)
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 7; // Total pages to show including first, last, and ellipses

    if (totalPages <= maxPagesToShow) {
      // Show all pages if there are few
      for (let i = 0; i < totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always include first page
      pageNumbers.push(0);

      // Calculate range around current page
      const leftBound = Math.max(1, currentPage - 1);
      const rightBound = Math.min(totalPages - 2, currentPage + 1);

      // Add ellipsis after first page if needed
      if (leftBound > 1) {
        pageNumbers.push(-1); // Use -1 to represent ellipsis
      }

      // Add pages around current page
      for (let i = leftBound; i <= rightBound; i++) {
        pageNumbers.push(i);
      }

      // Add ellipsis before last page if needed
      if (rightBound < totalPages - 2) {
        pageNumbers.push(-2); // Use -2 to represent ellipsis
      }

      // Always include last page
      pageNumbers.push(totalPages - 1);
    }

    return pageNumbers;
  };

  // Handle page size change
  const handlePageSizeChange = (value: string) => {
    const newPageSize = parseInt(value, 10);
    if (onPageSizeChange) {
      onPageSizeChange(newPageSize);
    }
  };

  // Don't render if there's only one page and no page size selector
  if (totalPages <= 1 && !showPageSizeSelector) {
    return null;
  }

  // Calculate the range of items being displayed
  const startItem = currentPage * pageSize + 1;
  const endItem = Math.min(startItem + pageSize - 1, totalItems);

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 gap-4',
        className
      )}
    >
      <div className="text-sm text-gray-700 dark:text-gray-300">
        Showing <span className="font-medium">{startItem}</span> to{' '}
        <span className="font-medium">{endItem}</span> of{' '}
        <span className="font-medium">{totalItems}</span> results
      </div>

      <div className="flex items-center space-x-4">
        {/* Page size selector */}
        {showPageSizeSelector && onPageSizeChange && (
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-700 dark:text-gray-300">
              Show
            </label>
            <Select
              className="w-20"
              value={pageSize.toString()}
              onChange={handlePageSizeChange}
              options={pageSizeOptions.map(size => ({
                label: size.toString(),
                value: size.toString(),
              }))}
            />
          </div>
        )}

        {/* Pagination controls */}
        {totalPages > 1 && (
          <nav className="flex items-center space-x-1">
            {/* Previous page button */}
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              disabled={currentPage === 0 || isLoading}
              onClick={() => onPageChange(currentPage - 1)}
              aria-label="Previous page"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Button>

            {/* Page numbers */}
            {getPageNumbers().map((pageNum, index) => {
              // Render ellipsis
              if (pageNum < 0) {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="px-2 py-1 text-gray-500 dark:text-gray-400"
                  >
                    ...
                  </span>
                );
              }

              // Render page button
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === currentPage ? 'default' : 'outline'}
                  size="sm"
                  className="h-8 w-8 p-0"
                  disabled={isLoading}
                  onClick={() => onPageChange(pageNum)}
                  aria-label={`Page ${pageNum + 1}`}
                  aria-current={pageNum === currentPage ? 'page' : undefined}
                >
                  {pageNum + 1}
                </Button>
              );
            })}

            {/* Next page button */}
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              disabled={currentPage === totalPages - 1 || isLoading}
              onClick={() => onPageChange(currentPage + 1)}
              aria-label="Next page"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Button>
          </nav>
        )}
      </div>
    </div>
  );
}
