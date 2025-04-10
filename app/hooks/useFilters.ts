'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { CustomerStatus } from '@/app/lib/database.types';

interface UseFiltersOptions<T extends string> {
  /**
   * Initial filter value
   */
  initialValue?: T | null;
  /**
   * URL parameter name for the filter
   */
  paramName?: string;
  /**
   * Whether to update the URL with filter changes
   */
  updateUrl?: boolean;
  /**
   * Callback function when filter changes
   */
  onChange?: (value: T | null) => void;
  /**
   * Reset page to 1 when filter changes
   */
  resetPage?: boolean;
}

/**
 * Hook for managing filters with URL synchronization
 */
export function useFilter<T extends string>({
  initialValue = null,
  paramName,
  updateUrl = true,
  onChange,
  resetPage = true,
}: UseFiltersOptions<T>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get initial value from URL or prop
  const valueFromUrl = searchParams.get(paramName || '') as T | null;
  const [value, setValue] = useState<T | null>(valueFromUrl || initialValue);

  // Update URL when filter changes
  const updateSearchParams = useCallback(
    (newValue: T | null) => {
      if (!updateUrl || !paramName) return;

      const params = new URLSearchParams(searchParams);

      if (newValue) {
        params.set(paramName, newValue);
      } else {
        params.delete(paramName);
      }

      // Reset page parameter if needed
      if (resetPage && params.has('page')) {
        params.set('page', '1');
      }

      router.push(`${pathname}?${params.toString()}`);
    },
    [paramName, pathname, resetPage, router, searchParams, updateUrl]
  );

  // Handle filter change
  const handleChange = useCallback(
    (newValue: T | null) => {
      setValue(newValue);

      if (onChange) {
        onChange(newValue);
      }

      updateSearchParams(newValue);
    },
    [onChange, updateSearchParams]
  );

  // Reset filter
  const reset = useCallback(() => {
    setValue(null);

    if (onChange) {
      onChange(null);
    }

    updateSearchParams(null);
  }, [onChange, updateSearchParams]);

  // Update local state when URL changes
  useEffect(() => {
    if (paramName) {
      const valueFromUrl = searchParams.get(paramName) as T | null;
      if (valueFromUrl !== value) {
        setValue(valueFromUrl);
      }
    }
  }, [searchParams, paramName, value]);

  return {
    value,
    handleChange,
    reset,
  };
}

/**
 * Hook specifically for customer status filtering
 */
export function useStatusFilter(
  options: Omit<UseFiltersOptions<CustomerStatus>, 'paramName'> = {}
) {
  return useFilter<CustomerStatus>({
    ...options,
    paramName: 'status',
  });
}
