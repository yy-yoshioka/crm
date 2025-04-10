import { NextRequest } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';
import { errorResponse, successResponse } from '@/app/lib/api-response';

/**
 * GET /api/roles/users
 * Get users with their roles (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    // Get current user role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError) {
      return errorResponse('Error fetching user data', 500);
    }

    // Only admins can list users with roles
    if (userData.role !== 'admin') {
      return errorResponse('Only administrators can access user roles', 403);
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const query = searchParams.get('q') || '';

    // Calculate pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Build query
    let dbQuery = supabase
      .from('users')
      .select('id, email, role, created_at', { count: 'exact' });

    // Add search if provided
    if (query) {
      dbQuery = dbQuery.ilike('email', `%${query}%`);
    }

    // Add sorting and pagination
    dbQuery = dbQuery.order('created_at', { ascending: false }).range(from, to);

    // Execute query
    const { data, error, count } = await dbQuery;

    if (error) {
      return errorResponse('Error fetching users', 500);
    }

    // Calculate pagination info
    const totalPages = Math.ceil((count || 0) / limit);

    return successResponse(data, 200, {
      total: count || 0,
      page,
      limit,
      totalPages,
    });
  } catch (error) {
    console.error('Error fetching users with roles:', error);
    return errorResponse('Internal Server Error', 500);
  }
}
