'use client';

import { createClient } from '@/app/lib/supabase/client';
import { UserRole } from '@/app/lib/database.types';
import { useAuth as useAuthContext } from '@/app/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

/**
 * Custom hook for authentication operations
 */
export default function useAuth() {
  const { user, userRole, isLoading } = useAuthContext();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  /**
   * Sign in with email and password
   */
  const signIn = async (email: string, password: string) => {
    try {
      setIsAuthLoading(true);
      setAuthError(null);

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setAuthError(error.message);
        return false;
      }

      router.refresh();
      return true;
    } catch (error) {
      console.error('Sign in error:', error);
      setAuthError('An unexpected error occurred');
      return false;
    } finally {
      setIsAuthLoading(false);
    }
  };

  /**
   * Sign up with email and password
   */
  const signUp = async (email: string, password: string) => {
    try {
      setIsAuthLoading(true);
      setAuthError(null);

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });

      if (error) {
        setAuthError(error.message);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Sign up error:', error);
      setAuthError('An unexpected error occurred');
      return false;
    } finally {
      setIsAuthLoading(false);
    }
  };

  /**
   * Sign out the current user
   */
  const signOut = async () => {
    try {
      setIsAuthLoading(true);
      await supabase.auth.signOut();
      router.refresh();
      router.push('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsAuthLoading(false);
    }
  };

  /**
   * Request a password reset
   */
  const resetPassword = async (email: string) => {
    try {
      setIsAuthLoading(true);
      setAuthError(null);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/api/auth/callback?next=/reset-password`,
      });

      if (error) {
        setAuthError(error.message);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Reset password error:', error);
      setAuthError('An unexpected error occurred');
      return false;
    } finally {
      setIsAuthLoading(false);
    }
  };

  /**
   * Check if the user has one of the specified roles
   */
  const hasRole = (allowedRoles: UserRole[]): boolean => {
    if (!userRole) return false;
    return allowedRoles.includes(userRole);
  };

  return {
    user,
    userRole,
    isLoading: isLoading || isAuthLoading,
    error: authError,
    signIn,
    signUp,
    signOut,
    resetPassword,
    hasRole,
  };
}
