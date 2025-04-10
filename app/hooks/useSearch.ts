'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { debounce } from '@/app/lib/utils';

interface UseSearchOptions {
  /**
   * The initial search query
   */
  initialQuery?: string;
  /**
   * The URL parameter name for the search query
   */
  paramName?: string;
  /**
   * Whether to update the URL with the search query
   */
  updateUrl?: boolean;
  /**
   * Debounce delay in milliseconds
   */
  debounceMs?: number;
  /**
   * Callback function when search query changes
   */
  onSearch?: (query: string) => void;
}

/**
 * Custom hook for search functionality
 */
export default function useSearch({
  initialQuery = '',
  paramName = 'q',
  updateUrl = true,
  debounceMs = 300,
  onSearch,
}: UseSearchOptions = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Initialize search query from URL or initial value
  const queryFromUrl = searchParams.get(paramName) || '';
  const [query, setQuery] = useState(initialQuery || queryFromUrl);
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [isSearching, setIsSearching] = useState(false);
  
  // Update URL when search query changes
  const updateSearchParams = useCallback((newQuery: string) => {
    if (!updateUrl) return;
    
    const params = new URLSearchParams(searchParams);
    if (newQuery) {
      params.set(paramName, newQuery);
    } else {
      params.delete(paramName);
    }
    
    router.push(`${pathname}?${params.toString()}`);
  }, [paramName, pathname, router, searchParams, updateUrl]);
  
  // Create debounced version of search handler
  const debouncedSearch = useCallback((value: string) => {
    const debouncedFn = debounce((searchValue: string) => {
      setDebouncedQuery(searchValue);
      setIsSearching(false);
      
      if (onSearch) {
        onSearch(searchValue);
      }
      
      updateSearchParams(searchValue);
    }, debounceMs);
    
    debouncedFn(value);
  }, [debounceMs, onSearch, updateSearchParams, setDebouncedQuery, setIsSearching]);
  
  // Handle search query changes
  const handleSearch = useCallback((value: string) => {
    setQuery(value);
    setIsSearching(true);
    debouncedSearch(value);
  }, [debouncedSearch]);
  
  // Clear search query
  const clearSearch = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
    setIsSearching(false);
    
    if (onSearch) {
      onSearch('');
    }
    
    updateSearchParams('');
  }, [onSearch, updateSearchParams]);
  
  // Update local state when URL changes
  useEffect(() => {
    const queryFromUrl = searchParams.get(paramName) || '';
    if (queryFromUrl !== query) {
      setQuery(queryFromUrl);
      setDebouncedQuery(queryFromUrl);
    }
  }, [searchParams, paramName, query]);
  
  return {
    query,
    debouncedQuery,
    isSearching,
    handleSearch,
    clearSearch,
  };
}