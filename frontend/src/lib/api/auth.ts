import apiClient from './client';

export interface AuthProvider {
  providerKey: string;
  providerType: string;
  protocol: string;
  displayName: string;
  loginUrl?: string | null;
  configured: boolean;
  disabledReason?: string | null;
  scopeLevel: string;
  organizationId?: number | null;
  buttonText?: string | null;
  buttonLogoUrl?: string | null;
  priority: number;
  ssoEnforced: boolean;
  supportsPasswordFallback: boolean;
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

export interface ProviderDiscoveryResponse {
  matched?: AuthProvider | null;
  ssoEnforced: boolean;
  supportsPasswordFallback: boolean;
  supportsMagicLinkFallback: boolean;
}

export interface ClaimMappingConfig {
  subjectClaim: string;
  emailClaim: string;
  emailVerifiedClaim: string;
  displayNameClaim: string;
  usernameClaim: string;
  avatarClaim: string;
}

export interface AuthProviderAdmin {
  id: number;
  providerKey: string;
  displayName: string;
  protocol: string;
  providerType: string;
  slug?: string | null;
  scopeLevel: string;
  organizationId?: number | null;
  issuerUrl?: string | null;
  discoveryUrl?: string | null;
  authorizationUrl?: string | null;
  tokenUrl?: string | null;
  userinfoUrl?: string | null;
  jwksUrl?: string | null;
  endSessionUrl?: string | null;
  clientId?: string | null;
  clientSecretMasked?: string | null;
  clientAuthMethod: string;
  scopes?: string | null;
  usePkce: boolean;
  pkceMethod: string;
  prompt?: string | null;
  loginHintTemplate?: string | null;
  domainMatchMode: string;
  allowedEmailDomains: string[];
  enforceSso: boolean;
  autoProvisionUsers: boolean;
  accountLinkPolicy: string;
  profileSyncMode: string;
  claimMapping: ClaimMappingConfig;
  buttonText?: string | null;
  buttonLogoUrl?: string | null;
  displayOrder: number;
  enabled: boolean;
  isDefault: boolean;
  lastTestedAt?: string | null;
  lastTestResult?: string | null;
}

export interface AuthProviderUpsertRequest {
  providerKey?: string;
  displayName: string;
  scopeLevel: string;
  organizationId?: number | null;
  slug?: string | null;
  issuerUrl?: string | null;
  discoveryUrl?: string | null;
  authorizationUrl?: string | null;
  tokenUrl?: string | null;
  userinfoUrl?: string | null;
  jwksUrl?: string | null;
  endSessionUrl?: string | null;
  clientId?: string | null;
  clientSecret?: string | null;
  clientSecretChanged?: boolean;
  clientAuthMethod: string;
  scopes: string;
  usePkce: boolean;
  pkceMethod: string;
  prompt?: string | null;
  loginHintTemplate?: string | null;
  domainMatchMode: string;
  allowedEmailDomains: string[];
  enforceSso: boolean;
  autoProvisionUsers: boolean;
  accountLinkPolicy: string;
  profileSyncMode: string;
  claimMapping: ClaimMappingConfig;
  buttonText?: string | null;
  buttonLogoUrl?: string | null;
  displayOrder: number;
  enabled: boolean;
  isDefault: boolean;
}

export interface TestAuthProviderResponse {
  success: boolean;
  message: string;
  metadata?: {
    issuer?: string | null;
    authorizationEndpoint?: string | null;
    tokenEndpoint?: string | null;
    userinfoEndpoint?: string | null;
    jwksUri?: string | null;
    endSessionEndpoint?: string | null;
  } | null;
}

export const getAuthProviders = (organizationId?: number | null) =>
  apiClient
    .get<AuthProvidersResponse>('/auth/providers', { params: organizationId ? { organizationId } : undefined })
    .then((r) => r.data);

export const discoverAuthProvider = (email: string, organizationId?: number | null) =>
  apiClient.post<ProviderDiscoveryResponse>('/auth/provider-discovery', { email, organizationId }).then((r) => r.data);

export const login = (username: string, password: string) =>
  apiClient.post<AuthResponse>('/auth/login', { username, password }).then((r) => r.data);

export const register = (username: string, password: string, email: string, role: string = 'USER') =>
  apiClient.post('/auth/register', { username, password, email, role }).then((r) => r.data);

export const sendMagicLink = (email: string, organizationId?: number | null) =>
  apiClient.post<MagicLinkSendResponse>('/auth/magic-link/send', { email, organizationId }).then((r) => r.data);

export const getCurrentUser = () =>
  apiClient.get('/auth/me').then((r) => r.data);

export const listAdminAuthProviders = (scopeLevel?: string, organizationId?: number | null) =>
  apiClient.get<AuthProviderAdmin[]>('/admin/auth-providers', { params: { scopeLevel, organizationId } }).then((r) => r.data);

export const createAdminAuthProvider = (payload: AuthProviderUpsertRequest) =>
  apiClient.post<AuthProviderAdmin>('/admin/auth-providers', payload).then((r) => r.data);

export const updateAdminAuthProvider = (id: number, payload: AuthProviderUpsertRequest) =>
  apiClient.put<AuthProviderAdmin>(`/admin/auth-providers/${id}`, payload).then((r) => r.data);

export const enableAdminAuthProvider = (id: number) =>
  apiClient.post<AuthProviderAdmin>(`/admin/auth-providers/${id}/enable`).then((r) => r.data);

export const disableAdminAuthProvider = (id: number) =>
  apiClient.post<AuthProviderAdmin>(`/admin/auth-providers/${id}/disable`).then((r) => r.data);

export const setDefaultAdminAuthProvider = (id: number) =>
  apiClient.post<AuthProviderAdmin>(`/admin/auth-providers/${id}/set-default`).then((r) => r.data);

export const testAdminAuthProvider = (id: number) =>
  apiClient.post<TestAuthProviderResponse>(`/admin/auth-providers/${id}/test-connection`).then((r) => r.data);

export const deleteAdminAuthProvider = (id: number) =>
  apiClient.delete(`/admin/auth-providers/${id}`).then((r) => r.data);
