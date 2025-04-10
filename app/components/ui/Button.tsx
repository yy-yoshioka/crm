'use client';

import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react';
import { VariantProps, cva } from 'class-variance-authority';
import { cn } from '@/app/lib/utils';
import Link from 'next/link';

// Define button variants using class-variance-authority
const buttonVariants = cva(
  // Base button styles
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        default: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm',
        destructive: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
        outline: 'border border-gray-300 bg-transparent hover:bg-gray-100 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800',
        secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 shadow-sm',
        ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200',
        link: 'text-blue-600 underline-offset-4 hover:underline dark:text-blue-500 shadow-none bg-transparent h-auto p-0',
      },
      size: {
        default: 'h-10 py-2 px-4',
        xs: 'h-7 px-2 text-xs',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-6 text-base',
        icon: 'h-9 w-9 p-0',
        'icon-sm': 'h-7 w-7 p-0',
        'full': 'w-full h-10 py-2 px-4',
      },
      responsive: {
        true: 'flex-1 sm:flex-initial',
        false: '',
      },
      iconPosition: {
        left: 'flex-row',
        right: 'flex-row-reverse',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      responsive: false,
      iconPosition: 'left',
    },
    compoundVariants: [
      {
        iconPosition: 'left',
        class: 'space-x-2',
      },
      {
        iconPosition: 'right',
        class: 'space-x-reverse space-x-2',
      },
      {
        variant: 'link',
        class: 'h-auto px-0 py-0',
      },
    ],
  }
);

// Extend button props with our custom variants
export interface ButtonProps 
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  icon?: ReactNode;
  asChild?: boolean;
  href?: string;
  loadingText?: string;
}

// Create the Button component with ref forwarding
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    responsive,
    iconPosition,
    isLoading, 
    icon,
    children, 
    disabled, 
    asChild,
    href,
    loadingText = 'Loading...',
    ...props 
  }, ref) => {
    const Comp = asChild && href ? Link : 'button';
    const linkProps = href && asChild ? { href } : {};

    return (
      <Comp
        className={cn(buttonVariants({ 
          variant, 
          size, 
          responsive,
          iconPosition,
          className 
        }))}
        ref={ref}
        disabled={isLoading || disabled}
        {...linkProps}
        {...props}
      >
        {isLoading ? (
          <>
            <svg 
              className="animate-spin h-4 w-4 text-current" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {size !== 'icon' && size !== 'icon-sm' && (
              <span>{loadingText}</span>
            )}
          </>
        ) : (
          <>
            {icon && <span className="flex-shrink-0">{icon}</span>}
            {children && <span className={icon ? "" : "w-full"}>{children}</span>}
          </>
        )}
      </Comp>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };