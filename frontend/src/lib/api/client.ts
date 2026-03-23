import axios from 'axios';
import { clearSession, getStoredToken } from '@/lib/auth';
import { publicPath } from '@/lib/routes';

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
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      clearSession();
      window.location.href = publicPath('/login');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
