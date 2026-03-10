/**
 * @fileoverview React Query hooks for authentication.
 */

import { useMutation } from '@tanstack/react-query';
import { authService } from '../lib/services/auth-service';
import { useAuthStore } from '../store/use-auth-store';
import { LoginFormData } from '../lib/validations/auth';

/**
 * Custom hook for performing login with React Query.
 */
export const useLogin = () => {
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: (data: LoginFormData) => authService.login(data),
    onSuccess: (user) => {
      if (user.token) {
        setAuth(user, user.token);
      }
    },
  });
};
