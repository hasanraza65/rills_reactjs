/**
 * @fileoverview Domain model for User.
 */

/**
 * User roles supported by the system.
 */
export type UserRole = 
  | 'SUPER_ADMIN' 
  | 'SCHOOL_ADMIN' 
  | 'BRANCH_ADMIN' 
  | 'TEACHER' 
  | 'PARENT' 
  | 'GATE_KEEPER' 
  | 'LIBRARIAN';

/**
 * Domain model for a User.
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roles?: UserRole[];
  avatar?: string | null;
  cnic?: string | null;
  token?: string;
}

/**
 * Mapping of numeric API roles to domain roles.
 * @todo Confirm complete mapping from backend documentation.
 */
export const ROLE_MAP: Record<number, UserRole> = {
  1: 'SUPER_ADMIN',
  2: 'SCHOOL_ADMIN',
  3: 'BRANCH_ADMIN',
  4: 'TEACHER',
  5: 'PARENT',
  6: 'GATE_KEEPER',
  7: 'LIBRARIAN',
};

/**
 * Mapping of domain roles to display labels.
 */
export const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  SCHOOL_ADMIN: 'School Admin',
  BRANCH_ADMIN: 'Branch Admin',
  TEACHER: 'Teacher',
  PARENT: 'Parent',
  GATE_KEEPER: 'Gate Keeper',
  LIBRARIAN: 'Librarian',
};
