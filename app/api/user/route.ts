import { NextRequest } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';
import { updateUserRoleSchema } from '@/app/lib/validations/user';
import { z } from 'zod';
import {
  errorResponse,
  handleSupabaseError,
  handleValidationError,
  successResponse,
} from '@/app/lib/api-response';

/**
 * GET /api/user
 * Get current user information
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    // Fetch user data from database
    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      return handleSupabaseError(error);
    }

    // Merge auth user and profile data
    const mergedUser = {
      id: user.id,
      email: user.email,
      role: userData.role,
      created_at: userData.created_at,
    };

    return successResponse(mergedUser);
  } catch (error) {
    console.error('Error fetching user:', error);
    return errorResponse('Internal Server Error', 500);
  }
}

/**
 * PUT /api/user
 * Update current user information
 * For admin users, can update other users' roles
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    // Fetch current user data
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError) {
      return handleSupabaseError(userError);
    }

    // Parse request body
    const body = await request.json();

    // For role updates
    if (body.role && body.id) {
      // Only admin can update roles
      if (currentUser.role !== 'admin') {
        return errorResponse('Only administrators can update user roles', 403);
      }

      const validatedData = updateUserRoleSchema.parse(body);

      // Update role in database
      const { data, error } = await supabase
        .from('users')
        .update({ role: validatedData.role })
        .eq('id', validatedData.id)
        .select()
        .single();

      if (error) {
        return handleSupabaseError(error);
      }

      return successResponse(data);
    }

    // For other profile updates (not implemented yet)
    return errorResponse('Unsupported operation', 400);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleValidationError(error);
    }

    console.error('Error updating user:', error);
    return errorResponse('Internal Server Error', 500);
  }
}
