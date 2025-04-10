'use client';

import { CustomerStatus } from '@/app/lib/database.types';
import { useStatusFilter } from '@/app/hooks/useFilters';
import { cn } from '@/app/lib/utils';

interface StatusOption {
  label: string;
  value: CustomerStatus;
  color: string;
}

interface StatusFilterProps {
  /**
   * Initial selected status
   */
  initialStatus?: CustomerStatus | null;
  /**
   * Callback when status changes
   */
  onStatusChange?: (status: CustomerStatus | null) => void;
  /**
   * Filter type (tabs or pills)
   */
  variant?: 'tabs' | 'pills';
  /**
   * Text alignment
   */
  align?: 'left' | 'center';
  /**
   * Whether to include an "All" option
   */
  showAll?: boolean;
  /**
   * Custom label for the "All" option
   */
  allLabel?: string;
  /**
   * Show counts for each status
   */
  showCounts?: boolean;
  /**
   * Counts for each status
   */
  counts?: Record<CustomerStatus, number>;
}

// Define status options with colors
const statusOptions: StatusOption[] = [
  { 
    label: 'Active', 
    value: 'active', 
    color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-900'
  },
  { 
    label: 'Pending', 
    value: 'pending', 
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-900'
  },
  { 
    label: 'Inactive', 
    value: 'inactive', 
    color: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
  },
];

/**
 * Component for filtering customers by status
 */
export function StatusFilter({
  initialStatus = null,
  onStatusChange,
  variant = 'tabs',
  align = 'left',
  showAll = true,
  allLabel = 'All Statuses',
  showCounts = false,
  counts,
}: StatusFilterProps) {
  // Use the statusFilter hook for state management
  const { value: selectedStatus, handleChange } = useStatusFilter({
    initialValue: initialStatus,
    onChange: onStatusChange,
  });
  
  // Alignment class
  const alignClass = align === 'center' ? 'justify-center' : 'justify-start';
  
  // Render tabs variant
  if (variant === 'tabs') {
    return (
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className={`flex ${alignClass} space-x-8`} aria-label="Status filter">
          {showAll && (
            <button
              onClick={() => handleChange(null)}
              className={cn(
                'py-4 px-1 border-b-2 font-medium text-sm',
                selectedStatus === null
                  ? 'border-blue-500 text-blue-600 dark:border-blue-500 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-700'
              )}
            >
              {allLabel}
              {showCounts && (
                <span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400">
                  ({Object.values(counts || {}).reduce((sum, count) => sum + count, 0) || 0})
                </span>
              )}
            </button>
          )}
          
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleChange(option.value)}
              className={cn(
                'py-4 px-1 border-b-2 font-medium text-sm',
                selectedStatus === option.value
                  ? 'border-blue-500 text-blue-600 dark:border-blue-500 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-700'
              )}
            >
              {option.label}
              {showCounts && (
                <span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400">
                  ({counts?.[option.value] || 0})
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>
    );
  }
  
  // Render pills variant
  return (
    <div className={`flex ${alignClass} flex-wrap gap-2`}>
      {showAll && (
        <button
          onClick={() => handleChange(null)}
          className={cn(
            'px-3 py-1 rounded-full text-sm font-medium border',
            selectedStatus === null
              ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-900'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700'
          )}
        >
          {allLabel}
          {showCounts && (
            <span className="ml-2 text-xs">
              ({Object.values(counts || {}).reduce((sum, count) => sum + count, 0) || 0})
            </span>
          )}
        </button>
      )}
      
      {statusOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => handleChange(option.value)}
          className={cn(
            'px-3 py-1 rounded-full text-sm font-medium border',
            selectedStatus === option.value
              ? option.color
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700'
          )}
        >
          {option.label}
          {showCounts && (
            <span className="ml-2 text-xs">
              ({counts?.[option.value] || 0})
            </span>
          )}
        </button>
      ))}
    </div>
  );
}