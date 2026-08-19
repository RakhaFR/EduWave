import { useState, useEffect } from 'react';
import { authService } from '@/services/authService';
import { UserProfile } from '@/types/auth';

let cachedUserPromise: Promise<UserProfile | null> | null = null;
let cachedUser: UserProfile | null = null;

export function clearUserCache() {
  cachedUserPromise = null;
  cachedUser = null;
}

export function useCurrentUser() {
  const [user, setUser] = useState<UserProfile | null>(() => {
    if (cachedUser) return cachedUser;
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('user');
      if (stored) {
        try { return JSON.parse(stored); } catch (e) {}
      }
    }
    return null;
  });
  const [loading, setLoading] = useState<boolean>(!user);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async (force: boolean = false) => {
    if (force) {
      clearUserCache();
    }
    if (cachedUser && !force) {
      setUser(cachedUser);
      setLoading(false);
      return;
    }
    if (cachedUserPromise && !force) {
      const u = await cachedUserPromise;
      setUser(u);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    cachedUserPromise = (async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) {
          return null;
        }
        const res = await authService.getUserMe();
        if (res.success && res.data?.user) {
          cachedUser = res.data.user;
          if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(res.data.user));
          }
          return res.data.user;
        }
        const authRes = await authService.getAuthMe();
        if (authRes.success && authRes.data?.user) {
          cachedUser = authRes.data.user;
          if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(authRes.data.user));
          }
          return authRes.data.user;
        }
      } catch (err: any) {
        try {
          const authRes = await authService.getAuthMe();
          if (authRes.success && authRes.data?.user) {
            cachedUser = authRes.data.user;
            return authRes.data.user;
          }
        } catch (authErr: any) {}
      }
      return null;
    })();

    const result = await cachedUserPromise;
    setUser(result);
    setLoading(false);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return { user, loading, error, refetch: () => fetchUser(true) };
}
