'use client';

import React from 'react';
import { cn } from '@/app/lib/utils';

type FormErrorProps = {
  error?: string;
  className?: string;
  id?: string;
};

export default function FormError({ error, className, id }: FormErrorProps) {
  if (!error) return null;

  return (
    <p
      id={id}
      className={cn(
        'mt-1 text-xs text-red-500 first-letter:uppercase',
        className
      )}
    >
      {error}
    </p>
  );
}

type FormErrorsProps = {
  errors?: string[] | Record<string, string[] | undefined> | null;
  className?: string;
};

export function FormErrors({ errors, className }: FormErrorsProps) {
  if (!errors || (Array.isArray(errors) && errors.length === 0) || Object.keys(errors).length === 0) {
    return null;
  }

  const errorMessages = Array.isArray(errors)
    ? errors
    : Object.values(errors)
        .filter(Boolean)
        .flat()
        .filter(Boolean) as string[];

  if (errorMessages.length === 0) return null;

  return (
    <div
      className={cn(
        'rounded-md bg-red-50 p-4 border border-red-100 mb-4',
        className
      )}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-red-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">
            {errorMessages.length === 1
              ? 'There was an error with your submission'
              : `There were ${errorMessages.length} errors with your submission`}
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <ul className="list-disc pl-5 space-y-1">
              {errorMessages.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

type FormFieldProps = {
  name: string;
  label: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
  description?: string;
};

export function FormField({
  name,
  label,
  error,
  required = false,
  className,
  children,
  description,
}: FormFieldProps) {
  const id = `form-field-${name}`;
  const errorId = `form-field-error-${name}`;

  return (
    <div className={cn('mb-4', className)}>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {description && (
        <p className="text-xs text-gray-500 mb-1">{description}</p>
      )}
      
      {React.cloneElement(children as React.ReactElement, {
        id,
        name,
        'aria-invalid': error ? 'true' : 'false',
        'aria-describedby': error ? errorId : undefined,
        'aria-required': required,
      })}
      
      <FormError error={error} id={errorId} />
    </div>
  );
}