import { NextResponse } from 'next/server';
import { z } from 'zod';

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
  const formattedErrors = error.errors.map((err) => ({
    path: err.path.join('.'),
    message: err.message,
  }));

  return errorResponse(
    'Validation error',
    400,
    'VALIDATION_ERROR',
    formattedErrors
  );
}

/**
 * Handle Supabase errors
 */
export function handleSupabaseError(error: any, defaultMessage = 'Database operation failed') {
  console.error('Supabase error:', error);
  
  // Extract error message
  const message = error.message || defaultMessage;
  
  // Extract error code
  const code = error.code || 'DATABASE_ERROR';
  
  // Determine appropriate status code
  let status = 500;
  
  if (code === 'PGRST116') {
    // Resource not found error
    status = 404;
  } else if (code === '23505') {
    // Unique constraint violation
    status = 409;
  } else if (code === '23503') {
    // Foreign key constraint violation
    status = 400;
  } else if (code === '42P01') {
    // Undefined table
    status = 500;
  } else if (code === '42703') {
    // Undefined column
    status = 500;
  }
  
  return errorResponse(message, status, code, {
    details: error.details || error.hint || null,
  });
}