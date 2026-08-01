/**
 * @fileoverview React Query hooks for authentication.
 */

import { useEffect } from 'react';
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

/**
 * On app mount, re-fetch the current user so permission changes made by an
 * admin propagate to already-logged-in sessions without a forced re-login.
 * The persisted token is kept; only the user fields (incl. permissions) refresh.
 */
export const useSyncCurrentUser = () => {
  const { isAuthenticated, updateUser, logout } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) return;
    authService
      .getCurrentUser()
      .then(({ token, ...fresh }) => updateUser(fresh)) // keep existing token
      .catch((err) => {
        // A 401 means the token is stale/revoked — drop the session.
        if (err?.response?.status === 401) logout();
      });
    // Run once per mount; the token is read from the persisted store.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
