import { NextResponse } from 'next/server';
import { z } from 'zod';
import { 
  AppError, 
  ValidationError, 
  AuthenticationError, 
  AuthorizationError, 
  NotFoundError, 
  DatabaseError, 
  handleApiError 
} from '@/app/lib/errors';

/**
 * Standard API response format
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Success response with data
 */
export function successResponse<T>(data: T, status = 200, pagination?: ApiResponse<T>['pagination']) {
  return NextResponse.json<ApiResponse<T>>(
    {
      success: true,
      data,
      ...(pagination && { pagination }),
    },
    { status }
  );
}

/**
 * Error response
 */
export function errorResponse(
  message: string,
  status = 400,
  code?: string,
  details?: any
) {
  return NextResponse.json<ApiResponse<null>>(
    {
      success: false,
      error: {
        message,
        ...(code && { code }),
        ...(details && { details }),
      },
    },
    { status }
  );
}

/**
 * Handle validation errors from Zod
 */
export function handleValidationError(error: z.ZodError) {
  // Format Zod errors into a more user-friendly format
  const formattedErrors: Record<string, string[]> = {};
  
  error.errors.forEach((err) => {
    const path = err.path.join('.');
    if (!formattedErrors[path]) {
      formattedErrors[path] = [];
    }
    formattedErrors[path].push(err.message);
  });

  throw new ValidationError('Validation error', formattedErrors);
}

/**
 * Handle Supabase errors by converting them to our custom error types
 */
export function handleSupabaseError(error: any, defaultMessage = 'Database operation failed') {
  console.error('Supabase error:', error);
  
  // Extract error message
  const message = error.message || defaultMessage;
  
  // Extract error code
  const code = error.code || 'DATABASE_ERROR';
  
  // Map Supabase errors to our custom error types
  if (code === 'PGRST116') {
    // Resource not found error
    throw new NotFoundError(message);
  } else if (code === '23505') {
    // Unique constraint violation
    throw new ValidationError(`Duplicate entry: ${message}`, {
      general: [message]
    });
  } else if (code === '23503') {
    // Foreign key constraint violation
    throw new ValidationError(`Invalid reference: ${message}`, {
      general: [message]
    });
  } else if (code === 'PGRST301') {
    // Authentication required
    throw new AuthenticationError(message);
  } else if (code === '42501') {
    // Permission denied
    throw new AuthorizationError(message);
  } else {
    // Generic database error
    throw new DatabaseError(message, error);
  }
}

/**
 * Wrap a route handler with error handling
 */
export function withErrorHandling<Args extends any[], T>(
  handler: (...args: Args) => Promise<T>
) {
  return async (...args: Args) => {
    try {
      return await handler(...args);
    } catch (error) {
      // Handle Zod validation errors
      if (error instanceof z.ZodError) {
        return handleApiError(new ValidationError('Validation error', formatZodError(error)));
      }
      
      // Handle other errors
      return handleApiError(error);
    }
  };
}

/**
 * Format Zod errors
 */
function formatZodError(error: z.ZodError): Record<string, string[]> {
  const formattedErrors: Record<string, string[]> = {};
  
  error.errors.forEach((err) => {
    const path = err.path.join('.') || 'general';
    if (!formattedErrors[path]) {
      formattedErrors[path] = [];
    }
    formattedErrors[path].push(err.message);
  });
  
  return formattedErrors;
}