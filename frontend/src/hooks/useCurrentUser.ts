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
      // 1. Panggil GET /api/v1/users/me (Tested: ☐)
      const res = await authService.getUserMe();
      if (res.success && res.data?.user) {
        setUser(res.data.user);
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(res.data.user));
        }
      } else {
        // 2. Fallback GET /api/v1/auth/me (Tested: ✓)
        const authRes = await authService.getAuthMe();
        if (authRes.success && authRes.data?.user) {
          setUser(authRes.data.user);
          if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(authRes.data.user));
          }
        } else {
          setError(res.error?.message || 'Gagal memuat profil');
        }
      }
    } catch (err: any) {
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
    fetchUser();
  }, []);

  return { user, loading, error, refetch: fetchUser };
}
