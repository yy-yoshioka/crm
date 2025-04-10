'use client';

import { useState, useCallback } from 'react';
import { getErrorMessage } from '@/app/lib/errors';

interface ErrorState {
  message: string;
  code?: string;
  details?: Record<string, string[]>;
}

export function useErrorHandler() {
  const [error, setError] = useState<ErrorState | null>(null);

  const handleError = useCallback((err: unknown) => {
    console.error('Error caught by useErrorHandler:', err);

    // Handle API response errors
    if (
      typeof err === 'object' &&
      err !== null &&
      'error' in err &&
      typeof err.error === 'object' &&
      err.error !== null &&
      'message' in err.error
    ) {
      const apiError = err.error as {
        message: string;
        code?: string;
        details?: Record<string, string[]>;
      };
      setError({
        message: apiError.message,
        code: apiError.code,
        details: apiError.details,
      });
      return;
    }

    // Handle other errors
    setError({
      message: getErrorMessage(err),
    });
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Convenience method to get field errors for form validation
  const getFieldError = useCallback(
    (fieldName: string): string | undefined => {
      if (!error?.details) return undefined;
      const fieldErrors = error.details[fieldName];
      return fieldErrors?.length ? fieldErrors[0] : undefined;
    },
    [error]
  );

  return {
    error,
    handleError,
    clearError,
    getFieldError,
  };
}
