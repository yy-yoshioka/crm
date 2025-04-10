'use client';

import { SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/app/lib/utils';

export interface SelectOption {
  /**
   * The label that users will see
   */
  label: string;
  /**
   * The value that will be sent on form submission
   */
  value: string;
  /**
   * Whether this option is disabled
   */
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  /**
   * List of options for the select
   */
  options: SelectOption[];
  /**
   * Label for the select field
   */
  label?: string;
  /**
   * Error message to display beneath the select
   */
  error?: string;
  /**
   * Whether to include an empty "Please select" option
   */
  placeholder?: string;
  /**
   * Optional helper text to display beneath the select
   */
  helperText?: string;
  /**
   * Callback when selection changes
   */
  onChange?: (value: string) => void;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, placeholder, helperText, label, error, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (onChange) {
        onChange(e.target.value);
      }
    };

    return (
      <div className="space-y-1 w-full">
        {label && (
          <label
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            htmlFor={props.id}
          >
            {label}
          </label>
        )}
        <select
          className={cn(
            "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100",
            error && "border-red-500 focus:ring-red-500",
            className
          )}
          ref={ref}
          onChange={handleChange}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        {helperText && !error && (
          <p className="text-xs text-gray-500 dark:text-gray-400">{helperText}</p>
        )}
        {error && (
          <p className="text-xs text-red-600 dark:text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select };