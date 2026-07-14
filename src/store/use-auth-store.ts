/**
 * @fileoverview Auth store using Zustand with persistence.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types/models/user';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  /** Merge fresh user fields (e.g. permissions) while keeping the current token. */
  updateUser: (patch: Partial<User>) => void;
  logout: () => void;
}

/**
 * Zustand store for managing authentication state.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      updateUser: (patch) =>
        set((state) => (state.user ? { user: { ...state.user, ...patch } } : {})),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
