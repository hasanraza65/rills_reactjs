/**
 * @fileoverview Which role ids a given user role may assign to a staff member.
 * Mirrors app/Support/RoleHierarchy.php on the backend, which is the source of truth
 * for enforcement — this only controls what the UI offers.
 */

import type { UserRole } from '../types/models/user';

const ASSIGNABLE_ROLE_IDS: Record<UserRole, number[]> = {
  SUPER_ADMIN: [1, 2, 3, 4, 6, 7],
  SCHOOL_ADMIN: [2, 3, 4, 6, 7],
  BRANCH_ADMIN: [3, 4, 6, 7],
  TEACHER: [4, 6, 7],
  PARENT: [],
  GATE_KEEPER: [4, 6, 7],
  LIBRARIAN: [4, 6, 7],
};

export const getAssignableRoleIds = (role?: UserRole): number[] =>
  role ? ASSIGNABLE_ROLE_IDS[role] ?? [] : [];
