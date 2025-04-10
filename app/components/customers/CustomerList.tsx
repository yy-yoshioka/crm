'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CustomerStatus } from '@/app/lib/database.types';
import { CustomerFilters } from './CustomerFilters';
import { CustomerCard } from './CustomerCard';
import { Table, TableColumn } from '@/app/components/ui/Table';
import { Pagination } from '@/app/components/ui/Pagination';
import { Button } from '@/app/components/ui/Button';
import { LoadingSpinner } from '@/app/components/ui/LoadingSpinner';
import { Modal } from '@/app/components/ui/Modal';
import useCustomers, { Customer } from '@/app/hooks/useCustomers';

interface CustomerListProps {
  /**
   * Initial page number
   */
  initialPage?: number;
  /**
   * Initial page size
   */
  initialPageSize?: number;
  /**
   * Initial status filter
   */
  initialStatus?: CustomerStatus | null;
  /**
   * Initial search query
   */
  initialSearch?: string;
  /**
   * Display mode
   */
  viewMode?: 'grid' | 'table';
}

/**
 * Component for displaying a list of customers with pagination and filtering
 */
export function CustomerList({
  initialPage = 1,
  initialPageSize = 10,
  initialStatus = null,
  initialSearch = '',
  viewMode: initialViewMode = 'table',
}: CustomerListProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>(initialViewMode);
  
  // State for delete confirmation modal
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  
  // Get customers data with filters and pagination
  const {
    customers,
    isLoading,
    isDeleting,
    error,
    totalCount,
    currentPage,
    totalPages,
    pageSize,
    handlePageChange,
    handleStatusFilterChange,
    handleSearchChange,
    handlePageSizeChange,
    selectedStatus,
    searchQuery,
    deleteCustomer,
    updateCustomerStatus,
  } = useCustomers({
    page: initialPage,
    limit: initialPageSize,
    status: initialStatus || undefined,
    search: initialSearch,
  });
  
  // Navigate to customer detail page
  const handleCustomerClick = useCallback((customerId: string) => {
    router.push(`/customers/${customerId}`);
  }, [router]);
  
  // Handlers for customer actions
  const handleDeleteClick = useCallback((e: React.MouseEvent, customer: Customer) => {
    e.stopPropagation(); // Prevent row click
    setCustomerToDelete(customer);
  }, []);
  
  const handleConfirmDelete = useCallback(async () => {
    if (customerToDelete) {
      await deleteCustomer(customerToDelete.id);
      setCustomerToDelete(null);
    }
  }, [customerToDelete, deleteCustomer]);
  
  const handleStatusChange = useCallback((e: React.MouseEvent, customer: Customer, newStatus: CustomerStatus) => {
    e.stopPropagation(); // Prevent row click
    updateCustomerStatus(customer.id, newStatus);
  }, [updateCustomerStatus]);
  
  // Define table columns
  const columns: TableColumn<typeof customers[0]>[] = [
    {
      header: 'Name',
      accessor: 'name',
      className: 'font-medium',
    },
    {
      header: 'Email',
      accessor: 'email',
      cell: (value) => value || '-',
    },
    {
      header: 'Phone',
      accessor: 'phone',
      cell: (value) => value || '-',
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (value, item) => {
        const statusStyles: Record<CustomerStatus, string> = {
          active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
          inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
          pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        };
        
        // Indicate optimistic update
        const isOptimistic = item.__optimistic;
        const statusClass = isOptimistic 
          ? 'animate-pulse opacity-70 ' + statusStyles[value as CustomerStatus]
          : statusStyles[value as CustomerStatus];
        
        return (
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass || ''}`}>
            {value ? (value as string).charAt(0).toUpperCase() + (value as string).slice(1) : ''}
          </span>
        );
      },
    },
    {
      header: 'Created',
      accessor: 'created_at',
      cell: (value) => new Date(value as string).toLocaleDateString(),
    },
    {
      header: 'Actions',
      accessor: 'id',
      cell: (_, item) => {
        const statusDropdownOptions = [
          { label: 'Active', value: 'active' as const, current: item.status === 'active' },
          { label: 'Inactive', value: 'inactive' as const, current: item.status === 'inactive' },
          { label: 'Pending', value: 'pending' as const, current: item.status === 'pending' },
        ];
        
        return (
          <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
            {/* Status dropdown */}
            <div className="relative group">
              <button
                type="button"
                className="px-2 py-1 text-xs rounded border border-gray-300 hover:bg-gray-100"
                aria-haspopup="true"
              >
                Status
              </button>
              
              <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded shadow-lg hidden group-hover:block z-10">
                <div className="py-1">
                  {statusDropdownOptions.map((option) => (
                    <button
                      key={option.value}
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        option.current ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'
                      }`}
                      onClick={(e) => handleStatusChange(e, item, option.value)}
                      disabled={option.current || isDeleting}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Edit button */}
            <button
              type="button"
              className="p-1 text-blue-600 hover:text-blue-800"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/customers/${item.id}/edit`);
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            
            {/* Delete button */}
            <button
              type="button"
              className="p-1 text-red-600 hover:text-red-800"
              onClick={(e) => handleDeleteClick(e, item)}
              disabled={isDeleting}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        );
      },
    },
  ];
  
  return (
    <div className="space-y-6">
      {/* Delete confirmation modal */}
      <Modal
        isOpen={!!customerToDelete}
        onClose={() => setCustomerToDelete(null)}
        title="Delete Customer"
      >
        <div className="p-4">
          <p className="mb-4">
            Are you sure you want to delete customer{' '}
            <span className="font-semibold">
              {customerToDelete?.name}
            </span>?
            This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setCustomerToDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              isLoading={isDeleting}
              disabled={isDeleting}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    
      <div className="flex justify-between items-start">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Customers</h2>
        
        {/* View mode toggle */}
        <div className="flex space-x-2">
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('table')}
            aria-label="Table view"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18M3 18h18M3 6h18" />
            </svg>
            <span className="ml-1">Table</span>
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
            aria-label="Grid view"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span className="ml-1">Grid</span>
          </Button>
        </div>
      </div>
      
      {/* Filters */}
      <CustomerFilters
        initialSearch={searchQuery}
        initialStatus={selectedStatus}
        onSearchChange={handleSearchChange}
        onStatusChange={handleStatusFilterChange}
        isLoading={isLoading}
      />
      
      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 dark:bg-red-900/20 dark:border-red-900 dark:text-red-400">
          {error}
        </div>
      )}
      
      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      )}
      
      {/* No results */}
      {!isLoading && customers.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg dark:bg-gray-900">
          <p className="text-gray-600 dark:text-gray-400">No customers found</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              handleSearchChange('');
              handleStatusFilterChange(null);
            }}
          >
            Clear filters
          </Button>
        </div>
      )}
      
      {/* Customer list */}
      {!isLoading && customers.length > 0 && (
        <>
          {viewMode === 'table' ? (
            <Table
              data={customers}
              columns={columns}
              keyExtractor={(item) => item.id}
              onRowClick={(item) => handleCustomerClick(item.id)}
              hover
              striped
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {customers.map((customer) => (
                <CustomerCard
                  key={customer.id}
                  id={customer.id}
                  name={customer.name}
                  email={customer.email}
                  phone={customer.phone}
                  status={customer.status}
                  createdAt={customer.created_at}
                  isOptimistic={customer.__optimistic}
                  onClick={() => handleCustomerClick(customer.id)}
                  onEditClick={(e) => {
                    e.stopPropagation();
                    router.push(`/customers/${customer.id}/edit`);
                  }}
                  onDeleteClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(e, customer);
                  }}
                  isDeleting={isDeleting}
                />
              ))}
            </div>
          )}
          
          {/* Pagination */}
          <Pagination
            currentPage={currentPage - 1}  // Convert to 0-based for component
            totalPages={totalPages}
            totalItems={totalCount}
            pageSize={pageSize}
            onPageChange={(page) => handlePageChange(page + 1)}  // Convert back to 1-based
            onPageSizeChange={handlePageSizeChange}
            showPageSizeSelector
            pageSizeOptions={[10, 25, 50, 100]}
          />
        </>
      )}
    </div>
  );
}