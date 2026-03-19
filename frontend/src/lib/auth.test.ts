import { afterEach, describe, expect, it } from 'vitest';
import { clearSession, getStoredSession, storeSession } from '@/lib/auth';

describe('auth storage', () => {
  afterEach(() => {
    clearSession();
  });

  it('stores and restores a session', () => {
    storeSession({
      token: 'token-1',
      user: {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        role: 'ADMIN',
      },
    });

    expect(getStoredSession()).toEqual({
      token: 'token-1',
      user: {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        role: 'ADMIN',
      },
    });
  });
});
