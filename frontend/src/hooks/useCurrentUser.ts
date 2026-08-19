import { useState, useEffect } from 'react';
import { authService } from '@/services/authService';
import { UserProfile } from '@/types/auth';

let cachedUser: UserProfile | null = null;
let cachedToken: string | null = null;
let fetchPromise: Promise<UserProfile | null> | null = null;

function getStoredUser(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function storeUser(u: UserProfile) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(u));
  }
}

async function doFetch(): Promise<UserProfile | null> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) return null;
  if (fetchPromise) return fetchPromise;
  fetchPromise = (async () => {
    try {
      const res = await authService.getUserMe();
      if (res.success && res.data?.user) {
        cachedUser = res.data.user;
        cachedToken = token;
        storeUser(res.data.user);
        return res.data.user;
      }
      const res2 = await authService.getAuthMe();
      if (res2.success && res2.data?.user) {
        cachedUser = res2.data.user;
        storeUser(res2.data.user);
        return res2.data.user;
      }
    } catch {
      try {
        const res2 = await authService.getAuthMe();
        if (res2.success && res2.data?.user) {
          cachedUser = res2.data.user;
          storeUser(res2.data.user);
          return res2.data.user;
        }
      } catch { /* ignore */ }
    }
    return null;
  })();
  const result = await fetchPromise;
  fetchPromise = null;
  return result;
}

export function clearUserCache() {
  cachedUser = null;
  cachedToken = null;
  fetchPromise = null;
}

export function useCurrentUser() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const initialUser = cachedToken === token ? cachedUser : getStoredUser();
  const [user, setUser] = useState<UserProfile | null>(initialUser);
  const [loading, setLoading] = useState<boolean>(!initialUser);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const currentToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (cachedUser && cachedToken === currentToken) {
      setUser(cachedUser);
      setLoading(false);
      return;
    }
    setLoading(true);
    doFetch().then((u) => {
      setUser(u);
      setLoading(false);
    }).catch(() => {
      setError('Gagal terhubung ke backend');
      setLoading(false);
    });
  }, []);

  const refetch = () => {
    clearUserCache();
    if (typeof window !== 'undefined') localStorage.removeItem('user');
    setLoading(true);
    doFetch().then((u) => {
      setUser(u);
      setLoading(false);
    });
  };

  return { user, loading, error, refetch };
}
