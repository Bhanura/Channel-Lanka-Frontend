/**
 * src/lib/api.ts
 * Axios instance for calling the Channel Lanka backend API.
 * Automatically attaches the Supabase JWT token from localStorage.
 */
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  // Token stored by AuthContext after login
  const token = typeof window !== 'undefined' ? localStorage.getItem('cl_token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global error handler
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired — clear and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cl_token');
        localStorage.removeItem('cl_user');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
