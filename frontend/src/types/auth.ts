export interface UserProfile {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: 'student' | 'instructor' | 'admin';
  avatar_url?: string | null;
  bio?: string | null;
  pearls?: number;
  xp?: number;
  level?: number;
  streak_days?: number;
  last_active?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AuthResponseData {
  user: UserProfile;
  token?: string;
  token_type?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: {
    code: string;
    message: string;
    details?: unknown;
  } | null;
  meta: unknown;
}
