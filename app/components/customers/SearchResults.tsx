'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CustomerStatus } from '@/app/lib/database.types';
import { LoadingSpinner } from '@/app/components/ui/LoadingSpinner';
import { Button } from '@/app/components/ui/Button';

interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: CustomerStatus;
}

interface SearchResultsProps {
  /**
   * The search query to display results for
   */
  query: string;
  /**
   * Maximum number of results to display
   */
  limit?: number;
  /**
   * Whether to automatically redirect to customer detail for a single result
   */
  autoRedirect?: boolean;
}

/**
 * Component to display search results for customer search
 */
export function SearchResults({
  query,
  limit = 5,
  autoRedirect = false,
}: SearchResultsProps) {
  const router = useRouter();
  const [results, setResults] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch search results
  const fetchResults = useCallback(async () => {
    if (!query.trim()) {
      setResults([]);
      setTotalCount(0);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        query: query.trim(),
        limit: limit.toString(),
      });

      const response = await fetch(
        `/api/customers/search?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch search results');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to search customers');
      }

      setResults(data.data || []);
      setTotalCount(data.pagination?.total || 0);

      // Auto-redirect if there's only one result
      if (autoRedirect && data.data && data.data.length === 1) {
        router.push(`/customers/${data.data[0].id}`);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to load search results');
    } finally {
      setIsLoading(false);
    }
  }, [query, limit, router, autoRedirect]);

  // Fetch results when query changes
  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  // Status badge styles
  const statusStyles: Record<CustomerStatus, string> = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    pending:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  };

  // Handle empty state
  if (!query.trim()) {
    return null;
  }

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <LoadingSpinner />
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 dark:bg-red-900/20 dark:border-red-900 dark:text-red-400">
        {error}
      </div>
    );
  }

  // Handle no results
  if (results.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-400">
          No customers found for &quot;{query}&quot;
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {results.map(customer => (
          <li
            key={customer.id}
            className="hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <Link href={`/customers/${customer.id}`} className="block p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    {customer.name}
                  </h3>
                  {customer.email && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {customer.email}
                    </p>
                  )}
                  {customer.phone && !customer.email && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {customer.phone}
                    </p>
                  )}
                </div>
                <div className="flex items-center">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[customer.status]}`}
                  >
                    {customer.status.charAt(0).toUpperCase() +
                      customer.status.slice(1)}
                  </span>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {totalCount > limit && (
        <div className="bg-gray-50 dark:bg-gray-900 px-4 py-3 text-right">
          <Link href={`/customers?q=${encodeURIComponent(query)}`}>
            <Button variant="link" size="sm">
              View all {totalCount} results
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
