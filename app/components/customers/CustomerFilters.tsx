'use client';

import { useState, useEffect } from 'react';
import { CustomerStatus } from '@/app/lib/database.types';
import { Button } from '@/app/components/ui/Button';
import { SearchBar } from '@/app/components/ui/SearchBar';
import { Select } from '@/app/components/ui/Select';
import { statusOptions } from './CustomerFormSchema';

interface CustomerFiltersProps {
  /**
   * Initial search query
   */
  initialSearch?: string;
  /**
   * Initial status filter
   */
  initialStatus?: CustomerStatus | null;
  /**
   * Callback when search query changes
   */
  onSearchChange: (query: string) => void;
  /**
   * Callback when status filter changes
   */
  onStatusChange: (status: CustomerStatus | null) => void;
  /**
   * Whether filters are loading
   */
  isLoading?: boolean;
}

/**
 * Component for filtering customers by status and search
 */
export function CustomerFilters({
  initialSearch = '',
  initialStatus = null,
  onSearchChange,
  onStatusChange,
  isLoading = false,
}: CustomerFiltersProps) {
  const [search, setSearch] = useState(initialSearch);
  const [status, setStatus] = useState<CustomerStatus | null>(initialStatus);
  
  // Update local state when props change
  useEffect(() => {
    setSearch(initialSearch);
  }, [initialSearch]);
  
  useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);
  
  // Handle status filter change
  const handleStatusChange = (value: string) => {
    const newStatus = value ? (value as CustomerStatus) : null;
    setStatus(newStatus);
    onStatusChange(newStatus);
  };
  
  // Handle search query change
  const handleSearchChange = (query: string) => {
    setSearch(query);
    onSearchChange(query);
  };
  
  // Handle clear filters
  const handleClearFilters = () => {
    setSearch('');
    setStatus(null);
    onSearchChange('');
    onStatusChange(null);
  };

  // Add "All" option to status options
  const allStatusOptions = [
    { label: 'All Statuses', value: '' },
    ...statusOptions,
  ];
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        {/* Search bar */}
        <div className="flex-1">
          <SearchBar
            placeholder="Search customers..."
            initialQuery={search}
            onSearch={handleSearchChange}
            updateUrl={false}
          />
        </div>
        
        <div className="flex flex-row gap-3 sm:gap-4">
          {/* Status filter */}
          <div className="w-full sm:w-auto min-w-[150px]">
            <Select
              options={allStatusOptions}
              value={status || ''}
              onChange={handleStatusChange}
              placeholder="Filter by status"
              disabled={isLoading}
              className="h-full"
            />
          </div>
          
          {/* Clear filters button */}
          {(search || status) && (
            <div className="flex-shrink-0">
              <Button
                variant="outline"
                onClick={handleClearFilters}
                disabled={isLoading}
                size="default"
                className="h-full w-full sm:w-auto whitespace-nowrap"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}