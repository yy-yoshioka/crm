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
   * On click handler
   */
  onClick?: () => void;
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
  onClick,
}: CustomerCardProps) {
  // Format date for display
  const formattedDate = new Date(createdAt).toLocaleDateString();
  
  // Status badge styles
  const statusStyles: Record<CustomerStatus, string> = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  };
  
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
      <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow transition-shadow duration-200 bg-white dark:bg-gray-800 dark:border-gray-700">
        <div className="p-5">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {name}
            </h3>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status]}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
          
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            {email && (
              <p className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {email}
              </p>
            )}
            
            {phone && (
              <p className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {phone}
              </p>
            )}
            
            <p className="flex items-center text-xs text-gray-500 dark:text-gray-500">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Added on {formattedDate}
            </p>
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-900 px-5 py-3 text-right">
          <span className="text-xs font-medium text-blue-600 dark:text-blue-400 group-hover:underline">
            View Details →
          </span>
        </div>
      </div>
    </Link>
  );
}