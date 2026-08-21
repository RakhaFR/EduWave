import { useState, useEffect } from 'react';
import { authService } from '@/services/authService';
import { UserProfile } from '@/types/auth';
import { clearRequestCache } from '@/lib/requestCache';

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

function applyAdminEdits(u: UserProfile): UserProfile {
  if (typeof window === 'undefined') return u;
  try {
    const raw = localStorage.getItem('admin_edited_users');
    const edits = raw ? JSON.parse(raw) : {};
    const edit = edits[u.id];
    if (!edit) return u;
    return {
      ...u,
      full_name: edit.name || u.full_name,
      email: edit.email || u.email,
      role: edit.role || u.role,
      is_active: edit.status ? edit.status === 'Aktif' : (u as UserProfile & { is_active?: boolean }).is_active,
    } as UserProfile;
  } catch {
    return u;
  }
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
        cachedUser = applyAdminEdits(res.data.user);
        cachedToken = token;
        storeUser(cachedUser);
        return cachedUser;
      }
      const res2 = await authService.getAuthMe();
      if (res2.success && res2.data?.user) {
        cachedUser = applyAdminEdits(res2.data.user);
        cachedToken = token;
        storeUser(cachedUser);
        return cachedUser;
      }
    } catch {
      try {
        const res2 = await authService.getAuthMe();
        if (res2.success && res2.data?.user) {
          cachedUser = applyAdminEdits(res2.data.user);
          storeUser(cachedUser);
          return cachedUser;
        }
      } catch { /* ignore */ }
    }
    return null;
  })();
  try {
    return await fetchPromise;
  } finally {
    fetchPromise = null;
  }
}

export function clearUserCache() {
  clearRequestCache();
  if (typeof window !== "undefined") {
    for (let index = localStorage.length - 1; index >= 0; index -= 1) {
      const key = localStorage.key(index);
      if (key && (key.startsWith("lesson_time_") || key.startsWith("lesson_scrolled_"))) localStorage.removeItem(key);
    }
    localStorage.removeItem("completed_lesson_ids");
    localStorage.removeItem("active_mascot");
  }
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
