'use client';

import { ReactNode, useMemo, useState } from 'react';
import { cn } from '@/app/lib/utils';
import { LoadingSpinner } from './LoadingSpinner';

/**
 * Column definition for Table component
 */
export interface TableColumn<T> {
  /**
   * Header title
   */
  header: string;
  /**
   * Key of the data object or function to access the cell value
   */
  accessor: keyof T | ((row: T) => ReactNode);
  /**
   * Cell renderer function (optional)
   */
  cell?: (value: unknown, row: T) => ReactNode;
  /**
   * Optional CSS classes for the column
   */
  className?: string;
  /**
   * Responsive visibility (default: 'always')
   * - 'always': Always visible
   * - 'sm': Visible on small screens and up
   * - 'md': Visible on medium screens and up
   * - 'lg': Visible on large screens and up
   * - 'xl': Visible only on extra large screens
   */
  responsive?: 'always' | 'sm' | 'md' | 'lg' | 'xl';
  /**
   * Whether this is considered a primary column (used for card view)
   */
  isPrimary?: boolean;
  /**
   * Whether this is a secondary column (used for card view)
   */
  isSecondary?: boolean;
  /**
   * Whether to enable sorting for this column
   */
  sortable?: boolean;
}

/**
 * Props for the Table component
 */
export interface TableProps<T> {
  /**
   * Array of data objects
   */
  data: T[];
  /**
   * Array of column definitions
   */
  columns: TableColumn<T>[];
  /**
   * Key function to generate unique keys for each row
   */
  keyExtractor: (item: T) => string | number;
  /**
   * Whether data is currently loading
   */
  isLoading?: boolean;
  /**
   * Message to display when there is no data
   */
  emptyMessage?: string;
  /**
   * Handle row click
   */
  onRowClick?: (item: T) => void;
  /**
   * Optional CSS classes for the table
   */
  className?: string;
  /**
   * Zebra striping for rows
   */
  striped?: boolean;
  /**
   * Whether to display a hover effect on rows
   */
  hover?: boolean;
  /**
   * Display as cards on mobile
   */
  cardOnMobile?: boolean;
  /**
   * Additional actions for each row
   */
  rowActions?: (item: T) => ReactNode;
}

/**
 * Reusable table component for displaying data in a structured format
 */
export function Table<T>({
  data,
  columns,
  keyExtractor,
  isLoading = false,
  emptyMessage = 'No data available',
  onRowClick,
  className,
  striped = true,
  hover = true,
  cardOnMobile = true,
  rowActions,
}: TableProps<T>) {
  const [sortField, setSortField] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Function to get cell value
  const getCellValue = (item: T, column: TableColumn<T>) => {
    if (typeof column.accessor === 'function') {
      return column.accessor(item);
    }
    
    const value = item[column.accessor];
    
    if (column.cell) {
      return column.cell(value, item);
    }
    
    return value;
  };
  
  // Sort the data if sortField is set
  const sortedData = useMemo(() => {
    if (!sortField) return data;
    
    return [...data].sort((a, b) => {
      // Skip sorting for function accessors
      if (typeof columns.find(c => c.accessor === sortField)?.accessor === 'function') {
        return 0;
      }
      
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue === bValue) return 0;
      
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      // Compare based on type
      const result = 
        typeof aValue === 'string' ? aValue.localeCompare(String(bValue)) : 
        (aValue as number | string | boolean) > (bValue as number | string | boolean) ? 1 : -1;
      
      return sortDirection === 'asc' ? result : -result;
    });
  }, [data, sortField, sortDirection, columns]);
  
  // Handle sort toggle
  const handleSort = (columnAccessor: keyof T) => {
    if (typeof columnAccessor === 'function') return;
    
    if (sortField === columnAccessor) {
      // Toggle direction if same field
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and reset direction
      setSortField(columnAccessor);
      setSortDirection('asc');
    }
  };
  
  // Get responsive classes for columns
  const getResponsiveClasses = (responsive?: 'always' | 'sm' | 'md' | 'lg' | 'xl') => {
    switch (responsive) {
      case 'sm': return 'hidden sm:table-cell';
      case 'md': return 'hidden md:table-cell';
      case 'lg': return 'hidden lg:table-cell';
      case 'xl': return 'hidden xl:table-cell';
      default: return '';
    }
  };

  // Card view for mobile
  if (cardOnMobile && !isLoading && data.length > 0) {
    return (
      <div className="space-y-4">
        {/* Regular table view (hidden on mobile) */}
        <div className="hidden sm:block relative overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
          <table className={cn(
            'w-full text-sm text-left',
            className
          )}>
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-400">
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={index}
                    scope="col"
                    className={cn(
                      'px-4 py-3 font-medium',
                      getResponsiveClasses(column.responsive),
                      column.sortable && 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700',
                      column.className
                    )}
                    onClick={column.sortable ? () => handleSort(column.accessor as keyof T) : undefined}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.header}</span>
                      {column.sortable && sortField === column.accessor && (
                        <span className="text-gray-500">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
                {rowActions && (
                  <th className="px-4 py-3 font-medium">
                    <span className="sr-only">Actions</span>
                  </th>
                )}
              </tr>
            </thead>
            
            <tbody>
              {sortedData.map((item, rowIndex) => (
                <tr
                  key={keyExtractor(item)}
                  className={cn(
                    'bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800',
                    striped && rowIndex % 2 === 1 && 'bg-gray-50 dark:bg-gray-950',
                    hover && 'hover:bg-gray-100 dark:hover:bg-gray-800',
                    onRowClick && 'cursor-pointer'
                  )}
                  onClick={onRowClick ? () => onRowClick(item) : undefined}
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      className={cn(
                        'px-4 py-3',
                        getResponsiveClasses(column.responsive),
                        column.className
                      )}
                    >
                      {getCellValue(item, column)}
                    </td>
                  ))}
                  {rowActions && (
                    <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                      {rowActions(item)}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Card view (visible only on mobile) */}
        <div className="sm:hidden space-y-3">
          {sortedData.map(item => (
            <div 
              key={keyExtractor(item)}
              className={cn(
                "border rounded-lg p-3 bg-white dark:bg-gray-900 dark:border-gray-800 shadow-sm",
                hover && 'hover:bg-gray-50 dark:hover:bg-gray-800',
                onRowClick && 'cursor-pointer'
              )}
              onClick={onRowClick ? () => onRowClick(item) : undefined}
            >
              <div className="mb-3 flex justify-between items-start gap-3">
                {/* Primary column */}
                {columns.find(col => col.isPrimary) ? (
                  <div className="font-medium text-gray-900 dark:text-white break-words">
                    {getCellValue(item, columns.find(col => col.isPrimary)!)}
                  </div>
                ) : (
                  <div className="font-medium text-gray-900 dark:text-white break-words">
                    {getCellValue(item, columns[0])}
                  </div>
                )}
                
                {/* Actions if any */}
                {rowActions && (
                  <div onClick={e => e.stopPropagation()} className="flex-shrink-0">
                    {rowActions(item)}
                  </div>
                )}
              </div>
              
              {/* Secondary columns */}
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 divide-y divide-gray-100 dark:divide-gray-800">
                {columns
                  .filter(col => col.isSecondary || (!col.isPrimary && !columns.some(c => c.isPrimary) && columns.indexOf(col) !== 0))
                  .slice(0, 4) // Limit to 4 secondary fields on mobile
                  .map((column, idx) => (
                    <div key={idx} className={`flex flex-col ${idx > 0 ? 'pt-2' : ''}`}>
                      <span className="font-medium text-gray-500 dark:text-gray-400 text-xs mb-1">{column.header}</span>
                      <span className="break-words overflow-hidden">{getCellValue(item, column)}</span>
                    </div>
                  ))
                }
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Standard table view
  return (
    <div className="relative overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
      <table className={cn(
        'w-full text-sm text-left',
        className
      )}>
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-400">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                scope="col"
                className={cn(
                  'px-4 py-3 font-medium',
                  getResponsiveClasses(column.responsive),
                  column.sortable && 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700',
                  column.className
                )}
                onClick={column.sortable ? () => handleSort(column.accessor as keyof T) : undefined}
              >
                <div className="flex items-center space-x-1">
                  <span>{column.header}</span>
                  {column.sortable && sortField === column.accessor && (
                    <span className="text-gray-500">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
            ))}
            {rowActions && (
              <th className="px-4 py-3 font-medium">
                <span className="sr-only">Actions</span>
              </th>
            )}
          </tr>
        </thead>
        
        <tbody>
          {isLoading ? (
            <tr className="bg-white dark:bg-gray-900">
              <td
                colSpan={columns.length + (rowActions ? 1 : 0)}
                className="px-4 py-12 text-center"
              >
                <LoadingSpinner className="mx-auto" />
              </td>
            </tr>
          ) : sortedData.length === 0 ? (
            <tr className="bg-white dark:bg-gray-900">
              <td
                colSpan={columns.length + (rowActions ? 1 : 0)}
                className="px-4 py-12 text-center text-gray-500 dark:text-gray-400"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sortedData.map((item, rowIndex) => (
              <tr
                key={keyExtractor(item)}
                className={cn(
                  'bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800',
                  striped && rowIndex % 2 === 1 && 'bg-gray-50 dark:bg-gray-950',
                  hover && 'hover:bg-gray-100 dark:hover:bg-gray-800',
                  onRowClick && 'cursor-pointer'
                )}
                onClick={onRowClick ? () => onRowClick(item) : undefined}
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className={cn(
                      'px-4 py-3',
                      getResponsiveClasses(column.responsive),
                      column.className
                    )}
                  >
                    {getCellValue(item, column)}
                  </td>
                ))}
                {rowActions && (
                  <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                    {rowActions(item)}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}