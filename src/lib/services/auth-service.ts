/**
 * @fileoverview Authentication service for API communication.
 */

import { apiClient } from '../api-client';
import { LoginRequest, LoginResponse } from '../../types/api/auth';
import { ROLE_MAP, User } from '../../types/models/user';

/**
 * Maps the API user object to the domain User model.
 */
const mapApiUserToUser = (response: LoginResponse): User => {
  const { user, token } = response;
  return {
    id: String(user.id),
    name: user.name,
    email: user.email,
    role: ROLE_MAP[user.user_role] || 'GATE_KEEPER',
    avatar: user.avatar,
    cnic: user.cnic,
    token: token,
  };
};

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
    return mapApiUserToUser(response.data);
  },
};
