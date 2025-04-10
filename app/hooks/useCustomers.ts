'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { CustomerStatus } from '@/app/lib/database.types';
import { useOptimisticList } from '@/app/hooks/useOptimisticUpdate';
import { useToast } from '@/app/hooks/useToast';

interface CustomerListParams {
  page?: number;
  limit?: number;
  status?: CustomerStatus;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  status: CustomerStatus;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  __optimistic?: boolean;
}

interface UseCustomersReturn {
  customers: Customer[];
  isLoading: boolean;
  isDeleting: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  handlePageChange: (page: number) => void;
  handleStatusFilterChange: (status: CustomerStatus | null) => void;
  handleSearchChange: (query: string) => void;
  handleSortChange: (field: string, direction: 'asc' | 'desc') => void;
  handlePageSizeChange: (size: number) => void;
  selectedStatus: CustomerStatus | null;
  searchQuery: string;
  sortField: string;
  sortOrder: 'asc' | 'desc';
  refreshData: () => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  updateCustomerStatus: (id: string, status: CustomerStatus) => Promise<void>;
}

/**
 * Custom hook for fetching and managing customers
 */
export default function useCustomers(initialParams?: CustomerListParams): UseCustomersReturn {
  // Router and URL state
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  
  // Parse URL parameters or use defaults
  const initPage = searchParams.get('page') 
    ? parseInt(searchParams.get('page') as string, 10) 
    : initialParams?.page || 1;
  
  const initLimit = searchParams.get('limit') 
    ? parseInt(searchParams.get('limit') as string, 10) 
    : initialParams?.limit || 10;
  
  const initStatus = searchParams.get('status') as CustomerStatus || initialParams?.status || null;
  const initSearch = searchParams.get('q') || initialParams?.search || '';
  const initSort = searchParams.get('sort') || initialParams?.sort || 'created_at';
  const initOrder = (searchParams.get('order') || initialParams?.order || 'desc') as 'asc' | 'desc';
  
  // Local state
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(initPage);
  const [pageSize, setPageSize] = useState(initLimit);
  const [selectedStatus, setSelectedStatus] = useState<CustomerStatus | null>(initStatus);
  const [searchQuery, setSearchQuery] = useState(initSearch);
  const [sortField, setSortField] = useState(initSort);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initOrder);
  
  // Calculate total pages
  const totalPages = Math.ceil(totalCount / pageSize);
  
  /**
   * Update URL parameters when filters change
   */
  const updateUrlParams = useCallback((params: Record<string, string>) => {
    // Create a new URLSearchParams object from the current URL
    const newParams = new URLSearchParams(searchParams);
    
    // Update parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    
    // Update the URL
    router.push(`${pathname}?${newParams.toString()}`);
  }, [pathname, router, searchParams]);
  
  /**
   * Fetch customers data from API
   */
  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Build query parameters
      const params = new URLSearchParams();
      params.set('page', currentPage.toString());
      params.set('limit', pageSize.toString());
      
      if (selectedStatus) {
        params.set('status', selectedStatus);
      }
      
      if (searchQuery) {
        params.set('query', searchQuery);
      }
      
      params.set('sort', sortField);
      params.set('order', sortOrder);
      
      // Determine API endpoint
      const endpoint = searchQuery
        ? `/api/customers/search?${params.toString()}`
        : `/api/customers?${params.toString()}`;
      
      // Fetch data
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setCustomers(data.data);
        setTotalCount(data.pagination?.total || 0);
      } else {
        throw new Error(data.error?.message || 'Failed to fetch customers');
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError('Failed to load customers. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, selectedStatus, searchQuery, sortField, sortOrder]);
  
  // Setup optimistic list operations
  const { 
    removeItem: optimisticDeleteCustomer,
    updateItem: optimisticUpdateCustomer,
    isPending: isUpdatingOptimistically 
  } = useOptimisticList({
    items: customers,
    setItems: setCustomers,
    idField: 'id',
    apis: {
      remove: async (id) => {
        const response = await fetch(`/api/customers/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || 'Failed to delete customer');
        }
      },
      update: async (id, updates) => {
        const response = await fetch(`/api/customers/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || 'Failed to update customer');
        }
        
        const data = await response.json();
        return data.data;
      },
    },
    onSuccess: (operation, updatedItem) => {
      if (operation === 'remove') {
        addToast({
          title: 'Customer deleted',
          description: 'The customer was successfully deleted.',
          type: 'success',
        });
        // Update total count
        setTotalCount(prev => Math.max(0, prev - 1));
      } else if (operation === 'update') {
        addToast({
          title: 'Customer updated',
          description: 'The customer was successfully updated.',
          type: 'success',
        });
      }
    },
    onError: (error, operation) => {
      addToast({
        title: 'Error',
        description: 
          operation === 'remove' 
            ? 'Failed to delete customer. Please try again.' 
            : 'Failed to update customer. Please try again.',
        type: 'error',
      });
    },
  });
  
  // Delete a customer with optimistic update
  const deleteCustomer = useCallback(async (id: string) => {
    try {
      await optimisticDeleteCustomer(id);
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  }, [optimisticDeleteCustomer]);
  
  // Update a customer status with optimistic update
  const updateCustomerStatus = useCallback(async (id: string, status: CustomerStatus) => {
    try {
      await optimisticUpdateCustomer(id, { status });
    } catch (error) {
      console.error('Error updating customer status:', error);
    }
  }, [optimisticUpdateCustomer]);
  
  // Fetch data when dependencies change
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);
  
  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    updateUrlParams({ page: page.toString() });
  }, [updateUrlParams]);
  
  // Handle status filter change
  const handleStatusFilterChange = useCallback((status: CustomerStatus | null) => {
    setSelectedStatus(status);
    setCurrentPage(1); // Reset to first page
    updateUrlParams({
      status: status || '',
      page: '1',
    });
  }, [updateUrlParams]);
  
  // Handle search change
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page
    updateUrlParams({
      q: query,
      page: '1',
    });
  }, [updateUrlParams]);
  
  // Handle sort change
  const handleSortChange = useCallback((field: string, direction: 'asc' | 'desc') => {
    setSortField(field);
    setSortOrder(direction);
    updateUrlParams({
      sort: field,
      order: direction,
    });
  }, [updateUrlParams]);
  
  // Handle page size change
  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page
    updateUrlParams({
      limit: size.toString(),
      page: '1',
    });
  }, [updateUrlParams]);
  
  // Manually refresh data
  const refreshData = useCallback(async () => {
    await fetchCustomers();
  }, [fetchCustomers]);
  
  return {
    customers,
    isLoading,
    isDeleting: isUpdatingOptimistically,
    error,
    totalCount,
    currentPage,
    totalPages,
    pageSize,
    handlePageChange,
    handleStatusFilterChange,
    handleSearchChange,
    handleSortChange,
    handlePageSizeChange,
    selectedStatus,
    searchQuery,
    sortField,
    sortOrder,
    refreshData,
    deleteCustomer,
    updateCustomerStatus,
  };
}