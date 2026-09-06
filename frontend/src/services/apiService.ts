import axios from 'axios';

export const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor for auth headers
apiClient.interceptors.request.use(
  (config) => {
    const userStr = localStorage.getItem('hdmp_current_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        config.headers.Authorization = `Bearer mock-jwt-token-for-${user.id}`;
        config.headers['X-User-Role'] = user.role;
      } catch (e) {
        // ignore
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Helper for simulated network latency
export const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));
