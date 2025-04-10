'use client';

import Link from 'next/link';
import { CustomerStatus } from '@/app/lib/database.types';

interface CustomerCardProps {
  /**
   * Customer ID
   */
  id: string;
  /**
   * Customer name
   */
  name: string;
  /**
   * Customer email
   */
  email?: string | null;
  /**
   * Customer phone
   */
  phone?: string | null;
  /**
   * Customer status
   */
  status: CustomerStatus;
  /**
   * Creation date
   */
  createdAt: string;
  /**
   * Whether this is an optimistic update
   */
  isOptimistic?: boolean;
  /**
   * On click handler
   */
  onClick?: () => void;
  /**
   * On delete click handler
   */
  onDeleteClick?: (e: React.MouseEvent) => void;
  /**
   * On edit click handler
   */
  onEditClick?: (e: React.MouseEvent) => void;
  /**
   * Whether delete is in progress
   */
  isDeleting?: boolean;
}

/**
 * Card displaying customer summary information
 */
export function CustomerCard({
  id,
  name,
  email,
  phone,
  status,
  createdAt,
  isOptimistic = false,
  onClick,
  onDeleteClick,
  onEditClick,
  isDeleting = false,
}: CustomerCardProps) {
  // Format date for display
  const formattedDate = new Date(createdAt).toLocaleDateString();
  
  // Status badge styles
  const statusStyles: Record<CustomerStatus, string> = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  };
  
  // Apply animation for optimistic updates
  const cardClasses = `border rounded-lg overflow-hidden shadow-sm hover:shadow transition-shadow duration-200 bg-white dark:bg-gray-800 dark:border-gray-700 ${
    isOptimistic ? 'animate-pulse opacity-80' : ''
  }`;
  
  return (
    <Link
      href={`/customers/${id}`}
      className="block group"
      onClick={(e) => {
        if (onClick) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className={cardClasses}>
        <div className="p-3 sm:p-5">
          <div className="flex flex-wrap justify-between items-start mb-2 gap-2">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate max-w-[calc(100%-80px)]">
              {name}
            </h3>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status]}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
          
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            {email && (
              <p className="flex items-start">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="truncate break-all">{email}</span>
              </p>
            )}
            
            {phone && (
              <p className="flex items-start">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="truncate break-all">{phone}</span>
              </p>
            )}
            
            <p className="flex items-center text-xs text-gray-500 dark:text-gray-500">
              <svg className="w-4 h-4 flex-shrink-0 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Added on {formattedDate}
            </p>
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-900 px-3 sm:px-5 py-3 flex justify-between items-center">
          {/* Action buttons */}
          <div className="flex items-center space-x-3">
            {onEditClick && (
              <button
                type="button"
                className="p-2 sm:p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full sm:rounded transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onEditClick(e);
                }}
                disabled={isDeleting}
                aria-label="Edit customer"
              >
                <svg className="w-5 h-5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            
            {onDeleteClick && (
              <button
                type="button"
                className="p-2 sm:p-1 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full sm:rounded transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDeleteClick(e);
                }}
                disabled={isDeleting}
                aria-label="Delete customer"
              >
                <svg className="w-5 h-5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
          
          <span className="text-xs font-medium text-blue-600 dark:text-blue-400 group-hover:underline whitespace-nowrap">
            View Details →
          </span>
        </div>
      </div>
    </Link>
  );
}