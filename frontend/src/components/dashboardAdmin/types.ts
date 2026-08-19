export type TabType = "dashboard" | "kursus" | "pengguna" | "pendaftaran" | "kategori";

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  } | null;
  category: string;
  difficulty: string;
  thumbnail_url: string | null;
  trailer_url: string | null;
  duration_minutes: number;
  lesson_count: number;
  enrolled_count: number;
  status: string;
  pearls_reward: number;
  created_at: string;
  updated_at: string;
}

export interface UserType {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

export interface Registration {
  id: string;
  user: string;
  email: string;
  action: string;
  ip: string;
  device: string;
  timeAgo: string;
  isSuspicious: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  courseCount: number;
  icon: string;
}
