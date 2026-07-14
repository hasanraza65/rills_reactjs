/**
 * @fileoverview Authentication service for API communication.
 */

import { apiClient } from '../api-client';
import { ApiUser, LoginRequest, LoginResponse } from '../../types/api/auth';
import { ROLE_MAP, User } from '../../types/models/user';

/**
 * Maps the API user object to the domain User model.
 * `token` is optional because `/user` returns the user without a fresh token.
 */
const mapApiUserToUser = (user: ApiUser, token?: string): User => ({
  id: String(user.id),
  name: user.name,
  email: user.email,
  role: ROLE_MAP[user.user_role] || 'GATE_KEEPER',
  avatar: user.avatar,
  cnic: user.cnic,
  token,
  branches: user.branches,
  branchId: user.branch_id ?? null,
  permissions: user.permissions ?? {},
});

/**
 * Service for auth-related API calls.
 */
export const authService = {
  /**
   * Performs the login API call.
   */
  login: async (data: LoginRequest): Promise<User> => {
    const formData = new FormData();
    if (data.email) formData.append('email', data.email);
    if (data.password) formData.append('password', data.password);
    if (data.cnic) formData.append('cnic', data.cnic);

    const response = await apiClient.post<LoginResponse>('/login', formData);
    return mapApiUserToUser(response.data.user, response.data.token);
  },

  /**
   * Re-fetches the current user (including up-to-date permissions).
   * Used on app load so permission changes propagate without a re-login.
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<ApiUser>('/user');
    return mapApiUserToUser(response.data);
  },
};
