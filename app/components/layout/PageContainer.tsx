'use client';

import { ReactNode } from 'react';
import { cn } from '@/app/lib/utils';

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
}: PageContainerProps) {
  // Max width classes
  const maxWidthClasses = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    full: 'max-w-full',
  };

  return (
    <div className={cn(
      'w-full mx-auto px-4 py-8 sm:px-6 lg:px-8',
      maxWidthClasses[maxWidth],
      className
    )}>
      {/* Page Header */}
      {(title || description || actions) && (
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              {title && (
                <h1 className="text-2xl font-bold leading-7 text-gray-900 dark:text-gray-100 sm:text-3xl sm:truncate">
                  {title}
                </h1>
              )}
              {description && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {description}
                </p>
              )}
            </div>
            {actions && (
              <div className="flex mt-4 md:mt-0 md:ml-4 space-x-3">
                {actions}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Page Content */}
      <main>{children}</main>
    </div>
  );
}