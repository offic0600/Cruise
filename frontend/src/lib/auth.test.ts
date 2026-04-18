import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearSession, getStoredSession, storeSession } from '@/lib/auth';

const localStorageMock = (() => {
  let store = new Map<string, string>();

  return {
    getItem: vi.fn((key: string) => store.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store.set(key, value);
    }),
    removeItem: vi.fn((key: string) => {
      store.delete(key);
    }),
    clear: vi.fn(() => {
      store.clear();
    }),
    reset: () => {
      store = new Map<string, string>();
      localStorageMock.getItem.mockClear();
      localStorageMock.setItem.mockClear();
      localStorageMock.removeItem.mockClear();
      localStorageMock.clear.mockClear();
    },
  };
})();

describe('auth storage', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', localStorageMock);
    localStorageMock.reset();
  });

  afterEach(() => {
    clearSession();
    vi.unstubAllGlobals();
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
    expect(localStorageMock.setItem).toHaveBeenCalledWith(expect.any(String), 'token-1');
  });
});
