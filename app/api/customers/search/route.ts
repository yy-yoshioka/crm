import { NextRequest } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';
import { customerSearchSchema } from '@/app/lib/validations/customer';
import { z } from 'zod';
import { 
  errorResponse, 
  handleSupabaseError, 
  handleValidationError, 
  successResponse 
} from '@/app/lib/api-response';

/**
 * GET /api/customers/search
 * Search customers by name, email, or phone
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }
    
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query') || '';
    const status = searchParams.get('status') as any;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const sort = searchParams.get('sort') || 'created_at';
    const order = searchParams.get('order') || 'desc';
    
    // Validate parameters
    const params = customerSearchSchema.parse({
      query: query || undefined,
      status: status || undefined,
      page,
      limit,
      sort,
      order,
    });
    
    // Calculate pagination
    const from = (params.page - 1) * params.limit;
    const to = from + params.limit - 1;
    
    // Build query
    let dbQuery = supabase
      .from('customers')
      .select('*', { count: 'exact' });
    
    // Add search filter
    if (params.query) {
      dbQuery = dbQuery.or(`name.ilike.%${params.query}%,email.ilike.%${params.query}%,phone.ilike.%${params.query}%`);
    }
    
    // Add status filter
    if (params.status) {
      dbQuery = dbQuery.eq('status', params.status);
    }
    
    // Add sorting
    dbQuery = dbQuery.order(params.sort, { ascending: params.order === 'asc' });
    
    // Add pagination
    dbQuery = dbQuery.range(from, to);
    
    // Execute query
    const { data, error, count } = await dbQuery;
    
    if (error) {
      return handleSupabaseError(error);
    }
    
    // Calculate pagination info
    const totalPages = Math.ceil((count || 0) / params.limit);
    
    return successResponse(data, 200, {
      total: count || 0,
      page: params.page,
      limit: params.limit,
      totalPages,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleValidationError(error);
    }
    
    console.error('Error searching customers:', error);
    return errorResponse('Internal Server Error', 500);
  }
}