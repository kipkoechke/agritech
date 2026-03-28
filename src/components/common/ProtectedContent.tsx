/**
 * ProtectedContent Component
 * Conditionally renders content based on user authentication and roles
 */

import { ReactNode } from "react";
import {
  useAuth,
  useHasRole,
  useIsAdmin,
  useIsManagement,
} from "@/hooks/useAuth";
import type { UserRole } from "@/types/auth";

interface ProtectedContentProps {
  children: ReactNode;
  fallback?: ReactNode;
  allowedRoles?: UserRole[];
  requireAdmin?: boolean;
  requireManagement?: boolean;
}

/**
 * Wrapper component that shows content only if user is authenticated
 * and optionally has the required role(s)
 */
export const ProtectedContent: React.FC<ProtectedContentProps> = ({
  children,
  fallback = null,
  allowedRoles,
  requireAdmin = false,
  requireManagement = false,
}) => {
  const { isAuthenticated, user } = useAuth();
  const isAdmin = useIsAdmin();
  const isManagement = useIsManagement();

  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  // Check admin requirement
  if (requireAdmin && !isAdmin) {
    return <>{fallback}</>;
  }

  // Check management requirement
  if (requireManagement && !isManagement) {
    return <>{fallback}</>;
  }

  // Check specific roles if provided
  if (allowedRoles && allowedRoles.length > 0 && user) {
    // Super admin always has access
    if (user.role !== "super-admin" && !allowedRoles.includes(user.role)) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
};

interface ProtectedActionProps {
  children: ReactNode;
  fallback?: ReactNode;
  allowedRoles?: UserRole[];
  requireAdmin?: boolean;
}

/**
 * Wrapper component for action buttons/links that require specific permissions
 */
export const ProtectedAction: React.FC<ProtectedActionProps> = ({
  children,
  fallback = null,
  allowedRoles,
  requireAdmin = false,
}) => {
  const { isAuthenticated, user } = useAuth();
  const isAdmin = useIsAdmin();

  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  // Check admin requirement
  if (requireAdmin && !isAdmin) {
    return <>{fallback}</>;
  }

  // Check specific roles if provided
  if (allowedRoles && allowedRoles.length > 0 && user) {
    // Super admin always has access
    if (user.role !== "super-admin" && !allowedRoles.includes(user.role)) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
};

interface RoleBasedContentProps {
  children: ReactNode;
  roles: UserRole[];
  fallback?: ReactNode;
}

/**
 * Shows content only for specific roles
 */
export const RoleBasedContent: React.FC<RoleBasedContentProps> = ({
  children,
  roles,
  fallback = null,
}) => {
  const hasRole = useHasRole(roles);
  const { user } = useAuth();

  // Super admin sees everything
  if (user?.role === "super-admin") {
    return <>{children}</>;
  }

  if (!hasRole) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

interface AdminOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Shows content only for admin users
 */
export const AdminOnly: React.FC<AdminOnlyProps> = ({
  children,
  fallback = null,
}) => {
  const isAdmin = useIsAdmin();

  if (!isAdmin) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

interface ManagementOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Shows content only for management users
 */
export const ManagementOnly: React.FC<ManagementOnlyProps> = ({
  children,
  fallback = null,
}) => {
  const isManagement = useIsManagement();

  if (!isManagement) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
