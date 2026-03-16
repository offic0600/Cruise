import apiClient from './client';

export interface AuthProvider {
  providerKey: string;
  providerType: string;
  displayName: string;
  loginUrl?: string | null;
}

export interface AuthProvidersResponse {
  providers: AuthProvider[];
  legacyPasswordEnabled: boolean;
}

export interface AuthResponse {
  token: string;
  userId: number;
  username: string;
  email: string;
  role: string;
  organizationId?: number | null;
  providerKey?: string | null;
}

export interface MagicLinkSendResponse {
  sent: boolean;
  expiresInMinutes: number;
}

export const getAuthProviders = () =>
  apiClient.get<AuthProvidersResponse>('/auth/providers').then((r) => r.data);

export const login = (username: string, password: string) =>
  apiClient.post<AuthResponse>('/auth/login', { username, password }).then((r) => r.data);

export const register = (username: string, password: string, email: string, role: string = 'USER') =>
  apiClient.post('/auth/register', { username, password, email, role }).then((r) => r.data);

export const sendMagicLink = (email: string, organizationId?: number | null) =>
  apiClient.post<MagicLinkSendResponse>('/auth/magic-link/send', { email, organizationId }).then((r) => r.data);

export const getCurrentUser = () =>
  apiClient.get('/auth/me').then((r) => r.data);
