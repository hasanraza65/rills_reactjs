/**
 * @fileoverview Authentication API types.
 */

import { UserRole } from '../models/user';

import { Branch } from '../models/branch';

/**
 * Interface for the user object returned by the API.
 */
export interface ApiUser {
  id: number;
  name: string;
  email: string;
  user_role: number;
  cnic: string | null;
  phone: string | null;
  avatar: string | null;
  email_verified_at: string;
  is_active: number;
  created_at: string;
  updated_at: string;
  branches?: Branch[];
}

/**
 * Interface for the login response.
 */
export interface LoginResponse {
  user: ApiUser;
  token: string;
}

/**
 * Interface for the login request.
 */
export interface LoginRequest {
  email?: string;
  password?: string;
  cnic?: string;
}
