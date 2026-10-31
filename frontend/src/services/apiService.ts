import axios from 'axios';

const rawBaseUrl: string = ((import.meta as any).env?.VITE_API_BASE_URL || '/api').trim();
const trimmedBaseUrl = rawBaseUrl.replace(/\/+$/, '');
export const API_BASE_URL =
  trimmedBaseUrl.startsWith('http') && !trimmedBaseUrl.endsWith('/api')
    ? `${trimmedBaseUrl}/api`
    : trimmedBaseUrl;

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
        // ignore
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

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
