'use client';

import { UserRole } from "@/app/lib/database.types";
import { ReactNode } from "react";

interface RoleGateProps {
  /**
   * Array of roles that should be allowed to see the children
   */
  allowedRoles: UserRole[];
  /**
   * The current user's role
   */
  userRole: UserRole | null;
  /**
   * Content to show if the user has permission
   */
  children: ReactNode;
  /**
   * Optional content to show if the user doesn't have permission
   */
  fallback?: ReactNode;
}

/**
 * A component that conditionally renders its children based on user role
 */
export default function RoleGate({
  allowedRoles,
  userRole,
  children,
  fallback
}: RoleGateProps) {
  if (!userRole) {
    return fallback || null;
  }

  if (allowedRoles.includes(userRole)) {
    return <>{children}</>;
  }

  return fallback || null;
}