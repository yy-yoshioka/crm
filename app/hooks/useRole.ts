'use client';

import { UserRole } from '../lib/database.types';
import { useAuth } from '../components/providers/AuthProvider';

/**
 * Custom hook for checking user roles and permissions
 */
export default function useRole() {
  const { userRole } = useAuth();

  /**
   * Check if the user has one of the specified roles
   */
  const hasRole = (allowedRoles: UserRole[]): boolean => {
    if (!userRole) return false;
    return allowedRoles.includes(userRole);
  };

  /**
   * Check if the user is an admin
   */
  const isAdmin = (): boolean => {
    return userRole === 'admin';
  };

  /**
   * Check if the user is a manager
   */
  const isManager = (): boolean => {
    return userRole === 'manager';
  };

  /**
   * Check if the user is a viewer
   */
  const isViewer = (): boolean => {
    return userRole === 'viewer';
  };

  /**
   * Check if the user has at least manager permissions (admin or manager)
   */
  const hasManagerAccess = (): boolean => {
    return ['admin', 'manager'].includes(userRole as UserRole);
  };

  return {
    userRole,
    hasRole,
    isAdmin,
    isManager,
    isViewer,
    hasManagerAccess,
  };
}
