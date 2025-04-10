import { createClient } from './supabase/server';
import { redirect } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { UserRole } from './database.types';

/**
 * Get the current authenticated user
 * @returns The authenticated user or null if not authenticated
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Get the role of the current authenticated user
 * @returns The user's role or null if not authenticated
 */
export async function getCurrentUserRole(): Promise<UserRole | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();
  
  if (error || !data) return null;
  return data.role as UserRole;
}

/**
 * Check if the current user has the required role(s)
 * @param requiredRoles Array of roles that are allowed
 * @returns boolean indicating if the user has one of the required roles
 */
export async function hasRole(requiredRoles: UserRole[]): Promise<boolean> {
  const userRole = await getCurrentUserRole();
  if (!userRole) return false;
  return requiredRoles.includes(userRole);
}

/**
 * Create a new user in the users table with the specified role
 * @param userId The user's ID from Supabase Auth
 * @param email The user's email
 * @param role The user's role
 */
export async function createUserWithRole(userId: string, email: string, role: UserRole = 'viewer') {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('users')
    .insert({
      id: userId,
      email: email,
      role: role
    });
  
  if (error) {
    console.error('Error creating user with role:', error);
    throw error;
  }
}

/**
 * Update a user's role
 * @param userId The user's ID
 * @param role The new role
 */
export async function updateUserRole(userId: string, role: UserRole) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('users')
    .update({ role })
    .eq('id', userId);
  
  if (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
}

/**
 * Redirect if user is not authenticated
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }
  return user;
}

/**
 * Redirect if user does not have one of the required roles
 * @param requiredRoles Array of roles that are allowed
 */
export async function requireRole(requiredRoles: UserRole[]) {
  const user = await requireAuth();
  const hasRequiredRole = await hasRole(requiredRoles);
  
  if (!hasRequiredRole) {
    redirect('/unauthorized');
  }
  
  return user;
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}

/**
 * Creates a user record in our database after signup
 * This function is meant to be called after Supabase Auth signup
 */
export async function handleAuthStateChange(user: User | null) {
  if (user) {
    try {
      // Check if user already exists in our database
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('users')
        .select()
        .eq('id', user.id)
        .single();
      
      // If user doesn't exist, create a new user record
      if (error || !data) {
        await createUserWithRole(user.id, user.email || '', 'viewer');
      }
    } catch (error) {
      console.error('Error in auth state change handler:', error);
    }
  }
}