import axios from 'axios';
import { clearSession, getStoredToken } from '@/lib/auth';
import { publicPath } from '@/lib/routes';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only clear the local session on authentication failure.
    // A 403 means the user is authenticated but forbidden from a specific action,
    // and treating it as logout causes unexpected redirects while navigating.
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      clearSession();
      window.location.href = publicPath('/login');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
