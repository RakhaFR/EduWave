export interface PembimbingCourse {
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
  lessons?: any[];
}

export interface Exam {
  id: string;
  title: string;
  course_id: string;
  course_title: string;
  time_limit_sec: number;
  passing_score: number;
  max_attempts: number;
  pearls_reward: number;
  lesson_id?: string | null;
}
