import { NextRequest } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';
import { createCustomerSchema } from '@/app/lib/validations/customer';
import { z } from 'zod';
import {
  successResponse,
  withErrorHandling,
  handleSupabaseError,
} from '@/app/lib/api-response';
import { AuthenticationError } from '@/app/lib/errors';

/**
 * GET /api/customers
 * Get a paginated list of customers
 */
export const GET = withErrorHandling(async (request: NextRequest) => {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new AuthenticationError();
  }

  // Parse query parameters
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const status = searchParams.get('status') as string | null;
  const sort = searchParams.get('sort') || 'created_at';
  const order = searchParams.get('order') || 'desc';

  // Validate parameters
  const paramsSchema = z.object({
    page: z.number().int().positive().default(1),
    limit: z.number().int().min(1).max(100).default(10),
    status: z.enum(['active', 'inactive', 'pending']).optional(),
    sort: z
      .enum(['name', 'email', 'created_at', 'updated_at', 'status'])
      .default('created_at'),
    order: z.enum(['asc', 'desc']).default('desc'),
  });

  const params = paramsSchema.parse({
    page,
    limit,
    status: status || undefined,
    sort,
    order,
  });

  // Calculate pagination
  const from = (params.page - 1) * params.limit;
  const to = from + params.limit - 1;

  // Build query
  let query = supabase.from('customers').select('*', { count: 'exact' });

  // Add filters
  if (params.status) {
    query = query.eq('status', params.status);
  }

  // Add sorting
  query = query.order(params.sort, { ascending: params.order === 'asc' });

  // Add pagination
  query = query.range(from, to);

  // Execute query
  const { data, error, count } = await query;

  if (error) {
    handleSupabaseError(error);
  }

  // Calculate pagination info
  const totalPages = Math.ceil((count || 0) / params.limit);

  return successResponse(data, 200, {
    total: count || 0,
    page: params.page,
    limit: params.limit,
    totalPages,
  });
});

/**
 * POST /api/customers
 * Create a new customer
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new AuthenticationError();
  }

  // Parse and validate request body
  const body = await request.json();
  const validatedData = createCustomerSchema.parse(body);

  // Create customer in database
  const { data, error } = await supabase
    .from('customers')
    .insert({
      ...validatedData,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    handleSupabaseError(error);
  }

  return successResponse(data, 201);
});
