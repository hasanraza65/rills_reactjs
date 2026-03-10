/**
 * @fileoverview Centralized Axios client for API communication.
 */

import axios from 'axios';

/**
 * Enhanced Axios instance for the backend API.
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

/**
 * Request interceptor to add the JWT token to headers.
 */
apiClient.interceptors.request.use((config) => {
  const authStorage = localStorage.getItem('auth-storage');
  if (authStorage) {
    try {
      const { state } = JSON.parse(authStorage);
      if (state?.token) {
        config.headers.Authorization = `Bearer ${state.token}`;
      }
    } catch (error) {
      console.error('Error parsing auth storage:', error);
    }
  }
  return config;
});

/**
 * Response interceptor to handle common errors.
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle unauthorized errors
    if (error.response?.status === 401) {
      localStorage.removeItem('auth-storage');
      // Optional: window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
