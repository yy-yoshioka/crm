'use client';

import { ReactNode } from 'react';
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
  cell?: (value: any, row: T) => ReactNode;
  /**
   * Optional CSS classes for the column
   */
  className?: string;
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
}: TableProps<T>) {
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
                  'px-6 py-3 font-medium',
                  column.className
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        
        <tbody>
          {isLoading ? (
            <tr className="bg-white dark:bg-gray-900">
              <td
                colSpan={columns.length}
                className="px-6 py-12 text-center"
              >
                <LoadingSpinner className="mx-auto" />
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr className="bg-white dark:bg-gray-900">
              <td
                colSpan={columns.length}
                className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, rowIndex) => (
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
                      'px-6 py-4',
                      column.className
                    )}
                  >
                    {getCellValue(item, column)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}