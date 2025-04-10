'use client';

import { useState, useEffect, ChangeEvent, KeyboardEvent } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/app/lib/utils';
import { Button } from './Button';

interface SearchBarProps {
  /**
   * URL search parameter to use for the search query
   */
  paramName?: string;
  /**
   * Initial search query
   */
  initialQuery?: string;
  /**
   * Placeholder text
   */
  placeholder?: string;
  /**
   * Callback when search query changes
   */
  onSearch?: (query: string) => void;
  /**
   * Debounce delay in milliseconds
   */
  debounceMs?: number;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Whether to add the search query to the URL
   */
  updateUrl?: boolean;
  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Search bar component with optional URL integration and debouncing
 */
export function SearchBar({
  paramName = 'q',
  initialQuery = '',
  placeholder = 'Search...',
  onSearch,
  debounceMs = 300,
  className,
  updateUrl = true,
  size = 'md',
}: SearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Get initial query from URL if available
  const urlQuery = searchParams.get(paramName) || '';
  const [query, setQuery] = useState(initialQuery || urlQuery);
  
  // Size classes
  const sizeClasses = {
    sm: 'h-8 text-xs',
    md: 'h-10 text-sm',
    lg: 'h-12 text-base',
  };
  
  // Update query when URL changes
  useEffect(() => {
    const urlQuery = searchParams.get(paramName) || '';
    if (urlQuery !== query) {
      setQuery(urlQuery);
    }
  }, [searchParams, paramName]);
  
  // Debounced search function
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearch) {
        onSearch(query);
      }
      
      if (updateUrl) {
        const params = new URLSearchParams(searchParams);
        if (query) {
          params.set(paramName, query);
        } else {
          params.delete(paramName);
        }
        
        router.push(`${pathname}?${params.toString()}`);
      }
    }, debounceMs);
    
    return () => clearTimeout(timer);
  }, [query, debounceMs, onSearch, updateUrl, pathname, router, searchParams, paramName]);
  
  // Handle input change
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };
  
  // Handle key press
  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (onSearch) {
        onSearch(query);
      }
      
      if (updateUrl) {
        const params = new URLSearchParams(searchParams);
        if (query) {
          params.set(paramName, query);
        } else {
          params.delete(paramName);
        }
        
        router.push(`${pathname}?${params.toString()}`);
      }
    }
  };
  
  // Handle clear
  const handleClear = () => {
    setQuery('');
    if (onSearch) {
      onSearch('');
    }
    
    if (updateUrl) {
      const params = new URLSearchParams(searchParams);
      params.delete(paramName);
      router.push(`${pathname}?${params.toString()}`);
    }
  };

  return (
    <div className={cn(
      'relative w-full',
      className
    )}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg
            className="w-4 h-4 text-gray-500 dark:text-gray-400"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 20"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
            />
          </svg>
        </div>
        <input
          type="search"
          className={cn(
            "block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white",
            sizeClasses[size]
          )}
          placeholder={placeholder}
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyPress}
        />
        {query && (
          <button
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            onClick={handleClear}
            type="button"
          >
            <svg
              className="w-4 h-4"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m1 1 12 12M13 1 1 13"
              />
            </svg>
            <span className="sr-only">Clear search</span>
          </button>
        )}
      </div>
    </div>
  );
}