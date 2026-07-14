/**
 * @fileoverview Central permission gate. Everything that hides/shows UI by
 * permission should go through `can()` so the rules live in exactly one place.
 */

import { useMemo } from 'react';
import { useAuthStore } from '../store/use-auth-store';
import type { PermissionAction, PermissionMap, UserRole } from '../types/models/user';

/**
 * Top-tier admins always have full access. This is a deliberate safety valve so
 * these roles can never restrict themselves out of the Roles & Permissions UI
 * (or any other module). Everyone else is fully permission-driven.
 */
const PRIVILEGED_ROLES: UserRole[] = ['SUPER_ADMIN', 'SCHOOL_ADMIN'];

export interface PermissionApi {
  /** True if the current user may perform `action` on `moduleSlug`. */
  can: (moduleSlug: string, action?: PermissionAction) => boolean;
  /** Shorthand for `can(module, 'view')`. */
  canView: (moduleSlug: string) => boolean;
  /** Raw permission map for the current user. */
  permissions: PermissionMap;
  /** Super Admin / Admin bypass all checks (prevents self-lockout). */
  isPrivileged: boolean;
}

export const usePermissions = (): PermissionApi => {
  const user = useAuthStore((s) => s.user);

  return useMemo(() => {
    const isPrivileged = user?.role ? PRIVILEGED_ROLES.includes(user.role) : false;
    const permissions = user?.permissions ?? {};

    const can = (moduleSlug: string, action: PermissionAction = 'view'): boolean => {
      if (isPrivileged) return true;
      return Boolean(permissions[moduleSlug]?.[action]);
    };

    return {
      can,
      canView: (moduleSlug: string) => can(moduleSlug, 'view'),
      permissions,
      isPrivileged,
    };
  }, [user]);
};
