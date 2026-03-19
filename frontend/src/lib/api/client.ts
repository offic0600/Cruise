import axios from 'axios';
import { defaultLocale, getLocaleFromPathname, localizePath } from '@/i18n/config';
import { clearSession, getStoredToken } from '@/lib/auth';

const API_BASE = 'http://localhost:8080/api';

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
    if ((error.response?.status === 401 || error.response?.status === 403) && typeof window !== 'undefined') {
      clearSession();
      const locale = getLocaleFromPathname(window.location.pathname) ?? defaultLocale;
      window.location.href = localizePath(locale, '/login');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
