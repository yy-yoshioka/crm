import { createClient } from '@/app/lib/supabase/server';
import { errorResponse, successResponse } from '@/app/lib/api-response';
import { UserRole } from '@/app/lib/database.types';

/**
 * Role information with descriptions
 */
const roleInfo = {
  admin: {
    id: 'admin',
    name: 'Administrator',
    description: 'Full access to all system features including user management',
    capabilities: [
      'View all customers',
      'Manage all customers',
      'Manage users and roles',
      'Access system settings',
    ],
  },
  manager: {
    id: 'manager',
    name: 'Manager',
    description: 'Can manage assigned customers and create new customers',
    capabilities: [
      'View assigned customers',
      'Manage assigned customers',
      'Create new customers',
    ],
  },
  viewer: {
    id: 'viewer',
    name: 'Viewer',
    description: 'Read-only access to assigned customers',
    capabilities: ['View assigned customers', 'View customer details'],
  },
};

/**
 * GET /api/roles
 * Get available roles with descriptions
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

    // Get current user role
    const { data: userData, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (error) {
      return errorResponse('Error fetching user data', 500);
    }

    // Only admins can see all roles
    if (userData.role !== 'admin') {
      // Non-admins only see their own role
      const ownRole = roleInfo[userData.role as UserRole];
      return successResponse([ownRole]);
    }

    // Return all roles
    const roles = Object.values(roleInfo);
    return successResponse(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    return errorResponse('Internal Server Error', 500);
  }
}

/**
 * GET /api/roles/users
 * Get users with their roles (admin only)
 */
export async function GET_USERS() {
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

    // Get all users with roles
    const { data, error } = await supabase
      .from('users')
      .select('id, email, role, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      return errorResponse('Error fetching users', 500);
    }

    return successResponse(data);
  } catch (error) {
    console.error('Error fetching users with roles:', error);
    return errorResponse('Internal Server Error', 500);
  }
}
