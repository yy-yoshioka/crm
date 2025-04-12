import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';
import { customerFormSchema } from '@/app/components/customers/CustomerFormSchema';
import { z } from 'zod';

/**
 * GET /api/customers
 * Get a paginated list of customers
 */
export async function GET(req: NextRequest) {
  const supabase = await createClient();

  // Pagination parameters
  const searchParams = req.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const status = searchParams.get('status');
  const sort = searchParams.get('sort') || 'created_at';
  const order = searchParams.get('order') || 'desc';
  const offset = (page - 1) * limit;

  try {
    // Build the query
    let query = supabase.from('customers').select('*', { count: 'exact' });

    // Add status filter if provided
    if (status) {
      query = query.eq('status', status);
    }

    // Add sorting
    query = query.order(sort, { ascending: order === 'asc' });

    // Add pagination
    query = query.range(offset, offset + limit - 1);

    // Execute the query
    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching customers:', error);
      return NextResponse.json(
        {
          success: false,
          error: { message: error.message },
        },
        { status: 500 }
      );
    }

    // Calculate pagination info
    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        total: count || 0,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/customers:', error);
    return NextResponse.json(
      {
        success: false,
        error: { message: 'Failed to fetch customers' },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/customers
 * Create a new customer
 */
export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();

    // Validate the incoming data
    const validatedData = customerFormSchema.parse(body);

    // Get current user for created_by field if not provided
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Authentication required' },
        },
        { status: 401 }
      );
    }

    // Insert the customer - server-side operation bypasses RLS
    const { data, error } = await supabase
      .from('customers')
      .insert({
        ...validatedData,
        created_by: validatedData.created_by || user.id,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating customer:', error);

      // Handle specific database errors
      if (error.code === '23505') {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: 'A customer with this information already exists',
            },
          },
          { status: 409 }
        );
      }

      if (error.code === '23503') {
        return NextResponse.json(
          {
            success: false,
            error: { message: 'Failed to link customer to required data' },
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: { message: 'Failed to create customer', details: error },
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/customers:', error);

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Invalid customer data',
            details: error.format(),
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: { message: 'An unexpected error occurred' },
      },
      { status: 500 }
    );
  }
}
