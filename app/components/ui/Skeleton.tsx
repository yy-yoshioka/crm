'use client';

import { cn } from '@/app/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'rounded' | 'circular' | 'text' | 'rectangular';
  width?: string;
  height?: string;
  animation?: 'pulse' | 'wave' | 'none';
}

/**
 * Skeleton loading component
 * @example
 * // Basic usage
 * <Skeleton className="h-8 w-full" />
 * 
 * // Text skeleton with line breaks
 * <Skeleton variant="text" className="h-4 w-3/4 mb-2" />
 * <Skeleton variant="text" className="h-4 w-1/2" />
 * 
 * // Card skeleton
 * <div className="border p-4 rounded-md">
 *   <Skeleton variant="rectangular" className="h-32 w-full mb-4" />
 *   <Skeleton variant="text" className="h-5 w-3/4 mb-2" />
 *   <Skeleton variant="text" className="h-4 w-1/2" />
 * </div>
 */
export function Skeleton({
  className,
  variant = 'rounded',
  width,
  height,
  animation = 'pulse',
}: SkeletonProps) {
  // Base styles
  const baseStyles = 'bg-gray-200 dark:bg-gray-700';
  
  // Animation styles
  const animationStyles = {
    pulse: 'animate-pulse',
    wave: 'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/25 before:to-transparent relative overflow-hidden',
    none: '',
  };
  
  // Variant styles
  const variantStyles = {
    rounded: 'rounded-md',
    circular: 'rounded-full',
    text: 'rounded',
    rectangular: '',
  };
  
  return (
    <div
      className={cn(
        baseStyles,
        variantStyles[variant],
        animationStyles[animation],
        className
      )}
      style={{
        width: width,
        height: height,
      }}
    />
  );
}

/**
 * Text skeleton component for paragraph placeholder
 */
export function TextSkeleton({
  lines = 3,
  className,
  lastLineWidth = '75%',
}: {
  lines?: number;
  className?: string;
  lastLineWidth?: string;
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          className={cn('h-4', {
            'w-full': i !== lines - 1,
            [`w-[${lastLineWidth}]`]: i === lines - 1,
          })}
        />
      ))}
    </div>
  );
}

/**
 * Card skeleton component
 */
export function CardSkeleton({
  className,
  imageHeight = '150px',
}: {
  className?: string;
  imageHeight?: string;
}) {
  return (
    <div className={cn('rounded-lg border p-4', className)}>
      <Skeleton
        variant="rectangular"
        className="mb-4 w-full rounded-md"
        height={imageHeight}
      />
      <Skeleton variant="text" className="mb-2 h-6 w-3/4" />
      <Skeleton variant="text" className="mb-4 h-4 w-1/2" />
      <div className="flex justify-between">
        <Skeleton variant="text" className="h-4 w-1/4" />
        <Skeleton variant="text" className="h-4 w-1/4" />
      </div>
    </div>
  );
}

/**
 * Table skeleton component
 */
export function TableSkeleton({
  rows = 5,
  columns = 4,
  showHeader = true,
  className,
}: {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('overflow-hidden', className)}>
      <div className="mb-4 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          {showHeader && (
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                {Array.from({ length: columns }).map((_, i) => (
                  <th key={i} className="px-6 py-3">
                    <Skeleton variant="text" className="h-4 w-full" />
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td key={colIndex} className="px-6 py-4">
                    <Skeleton
                      variant="text"
                      className="h-4 w-full"
                      animation="pulse"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Form skeleton component
 */
export function FormSkeleton({
  rows = 4,
  className,
}: {
  rows?: number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-6', className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="space-y-1">
          <Skeleton variant="text" className="h-4 w-1/4 mb-1" />
          <Skeleton variant="rounded" className="h-10 w-full" />
        </div>
      ))}
      <div className="flex justify-end space-x-2 pt-4">
        <Skeleton variant="rounded" className="h-10 w-24" />
        <Skeleton variant="rounded" className="h-10 w-24" />
      </div>
    </div>
  );
}

/**
 * Profile skeleton component
 */
export function ProfileSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-8', className)}>
      <div className="flex items-center space-x-4">
        <Skeleton variant="circular" className="h-16 w-16" />
        <div className="space-y-2">
          <Skeleton variant="text" className="h-6 w-32" />
          <Skeleton variant="text" className="h-4 w-48" />
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton variant="text" className="h-4 w-full" />
        <Skeleton variant="text" className="h-4 w-full" />
        <Skeleton variant="text" className="h-4 w-3/4" />
      </div>
    </div>
  );
}