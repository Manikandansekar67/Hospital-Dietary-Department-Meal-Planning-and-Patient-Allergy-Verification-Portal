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
<<<<<<< HEAD
    const token = localStorage.getItem('hdmp_token');
    const userStr = localStorage.getItem('hdmp_current_user');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role) {
          config.headers['X-User-Role'] = String(user.role).toUpperCase();
        }
      } catch {
=======
    const userStr = localStorage.getItem('hdmp_current_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        config.headers.Authorization = `Bearer mock-jwt-token-for-${user.id}`;
        config.headers['X-User-Role'] = user.role;
      } catch (e) {
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
        // ignore
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

<<<<<<< HEAD
// Response interceptor to handle 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      const hadAuth = !!localStorage.getItem('hdmp_token');
      // Do not clear token on login attempts, background notifications polling, or public status check
      if (hadAuth && !url.includes('/auth/') && !url.includes('/notifications') && !url.includes('/kitchen/status')) {
        console.warn('Session expired or unauthorized for', url, '- clearing stored token.');
        localStorage.removeItem('hdmp_token');
        localStorage.removeItem('hdmp_current_user');
      }
    }
    return Promise.reject(error);
  }
);
=======
// Helper for simulated network latency
export const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
