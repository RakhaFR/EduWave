import { useState, useEffect } from 'react';
import { authService } from '@/services/authService';
import { UserProfile } from '@/types/auth';

export function useCurrentUser() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    setLoading(true);
    setError(null);
    try {
      // Endpoint 4: GET /api/v1/users/me
      const res = await authService.getUserMe();
      if (res.success && res.data?.user) {
        setUser(res.data.user);
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(res.data.user));
        }
      } else {
        // Fallback endpoint 3: GET /api/v1/auth/me
        const authRes = await authService.getAuthMe();
        if (authRes.success && authRes.data?.user) {
          setUser(authRes.data.user);
        } else {
          setError(res.error?.message || 'Gagal memuat profil');
        }
      }
    } catch (err: any) {
      // Fallback try auth/me if users/me fails
      try {
        const authRes = await authService.getAuthMe();
        if (authRes.success && authRes.data?.user) {
          setUser(authRes.data.user);
        } else {
          setError(err.response?.data?.error?.message || 'Gagal terhubung ke backend');
        }
      } catch (authErr: any) {
        setError(err.response?.data?.error?.message || 'Gagal terhubung ke backend');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check cached user in localStorage first for instant initial render
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('user');
      if (cached) {
        try {
          setUser(JSON.parse(cached));
        } catch (e) {
          // ignore
        }
      }
    }
    fetchUser();
  }, []);

  return { user, loading, error, refetch: fetchUser };
}
