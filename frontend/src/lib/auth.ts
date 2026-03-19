export interface StoredUser {
  id?: number;
  username: string;
  email: string;
  role: string;
  organizationId?: number | null;
}

export interface AuthSession {
  token: string;
  user: StoredUser;
}

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): StoredUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

export function getStoredSession(): AuthSession | null {
  const token = getStoredToken();
  const user = getStoredUser();
  if (!token || !user) return null;
  return { token, user };
}

export function storeSession(session: AuthSession) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, session.token);
  localStorage.setItem(USER_KEY, JSON.stringify(session.user));
}

export function updateStoredSession(patch: { token?: string; user?: Partial<StoredUser> }) {
  const existing = getStoredSession();
  if (!existing) return;
  storeSession({
    token: patch.token ?? existing.token,
    user: {
      ...existing.user,
      ...patch.user,
    },
  });
}

export function clearSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
