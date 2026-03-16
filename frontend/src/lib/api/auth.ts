import apiClient from './client';

export const login = (username: string, password: string) =>
  apiClient.post('/auth/login', { username, password }).then((r) => r.data);

export const register = (username: string, password: string, email: string, role: string = 'USER') =>
  apiClient.post('/auth/register', { username, password, email, role }).then((r) => r.data);
