'use client';

import { ReactNode, useState, useEffect } from 'react';
import { cn } from '@/app/lib/utils';
import { useRouter } from 'next/navigation';

interface PageContainerProps {
  /**
   * Page content
   */
  children: ReactNode;
  /**
   * Optional page title
   */
  title?: string;
  /**
   * Optional page description
   */
  description?: string;
  /**
   * Optional header actions (e.g., buttons)
   */
  actions?: ReactNode;
  /**
   * Max width of the container
   */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Whether to show a back button
   */
  showBackButton?: boolean;
  /**
   * Back button text
   */
  backButtonText?: string;
  /**
   * Back button URL
   */
  backButtonUrl?: string;
  /**
   * Whether to show a divider under the header
   */
  showHeaderDivider?: boolean;
  /**
   * Whether to use sticky header
   */
  stickyHeader?: boolean;
}

/**
 * A container for page content with optional header
 */
export function PageContainer({
  children,
  title,
  description,
  actions,
  maxWidth = '2xl',
  className,
  showBackButton = false,
  backButtonText = 'Back',
  backButtonUrl,
  showHeaderDivider = false,
  stickyHeader = false,
}: PageContainerProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Mount after SSR
  useEffect(() => {
    setMounted(true);

    // Add scroll listener for sticky header
    if (stickyHeader) {
      const handleScroll = () => {
        setScrolled(window.scrollY > 10);
      };

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [stickyHeader]);

  // Max width classes
  const maxWidthClasses = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    full: 'max-w-full',
  };

  // Handle back button click
  const handleBackClick = () => {
    if (backButtonUrl) {
      router.push(backButtonUrl);
    } else {
      router.back();
    }
  };

  // Header classes
  const headerClasses = cn(
    'mb-6 sm:mb-8',
    stickyHeader && 'sticky top-0 z-10 backdrop-blur-sm',
    scrolled && stickyHeader && 'bg-white/90 dark:bg-gray-900/90 shadow-sm',
    showHeaderDivider && 'pb-4 border-b border-gray-200 dark:border-gray-800'
  );

  return (
    <div
      className={cn(
        'w-full mx-auto px-4 py-4 sm:py-6 lg:py-8 sm:px-6 lg:px-8',
        maxWidthClasses[maxWidth],
        className
      )}
    >
      {/* Page Header */}
      {(title || description || actions || showBackButton) && (
        <div className={headerClasses}>
          {/* Back button */}
          {showBackButton && mounted && (
            <button
              type="button"
              onClick={handleBackClick}
              className="mb-4 inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <svg
                className="mr-1 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              {backButtonText}
            </button>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 min-w-0">
              {title && (
                <h1 className="text-xl font-bold leading-7 text-gray-900 dark:text-gray-100 sm:text-2xl lg:text-3xl sm:truncate">
                  {title}
                </h1>
              )}
              {description && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-3xl">
                  {description}
                </p>
              )}
            </div>
            {actions && (
              <div className="flex mt-4 sm:mt-0 sm:ml-4 space-x-2 sm:space-x-3 justify-start sm:justify-end flex-wrap sm:flex-nowrap">
                {actions}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Page Content */}
      <main className="w-full">{children}</main>
    </div>
  );
}
