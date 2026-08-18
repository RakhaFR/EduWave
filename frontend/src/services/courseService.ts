import { api } from "@/lib/axios";

export interface Instructor {
  id: string;
  full_name: string;
  avatar_url: string | null;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: Instructor | null;
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
  progress_pct?: number;
  is_enrolled?: boolean;
}

export interface Lesson {
  id: string;
  course_id?: string;
  title: string;
  type: string;
  content?: string;
  video_url?: string;
  duration_minutes: number;
  order: number;
  xp_reward: number;
  is_preview: boolean;
  is_completed?: boolean;
  exam_id?: string | null;
}

export interface EnrollmentProgress {
  id: string;
  course_id: string;
  course_title: string;
  user_id: string;
  progress_pct: number;
  status: string;
  enrolled_at: string;
  completed_at: string | null;
}

export interface ExamQuestion {
  id: string;
  question_text: string;
  options: string[]; // parsed json or string[]
  points: number;
}

export interface Exam {
  id: string;
  course_id: string;
  lesson_id: string;
  title: string;
  time_limit_sec: number;
  passing_score: number;
  max_attempts: number;
  pearls_reward: number;
  questions?: ExamQuestion[];
}

export const courseService = {
  async getAllCourses(params?: { category?: string; difficulty?: string; search?: string; sort?: string }) {
    const response = await api.get("/courses", { params });
    return response.data;
  },

  async getCourseById(id: string) {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  },

  async enrollCourse(courseId: string) {
    const response = await api.post(`/courses/${courseId}/enroll`);
    return response.data;
  },

  async unenrollCourse(courseId: string) {
    const response = await api.delete(`/courses/${courseId}/enroll`);
    return response.data;
  },

  async getCourseProgress(courseId: string) {
    const response = await api.get(`/courses/${courseId}/progress`);
    return response.data;
  },

  async getLessonById(lessonId: string) {
    const response = await api.get(`/lessons/${lessonId}`);
    return response.data;
  },

  async completeLesson(lessonId: string, watchSeconds: number = 0) {
    const response = await api.post(`/lessons/${lessonId}/complete`, { watch_seconds: watchSeconds });
    return response.data;
  },

  async getExamById(examId: string) {
    const response = await api.get(`/exams/${examId}`);
    return response.data;
  },

  async submitExamAttempt(examId: string, attemptId: string, answers: Record<string, any>) {
    const response = await api.post(`/exams/${examId}/attempts/${attemptId}/submit`, { answers });
    return response.data;
  },

  async startExamAttempt(examId: string) {
    const response = await api.post(`/exams/${examId}/attempts`);
    return response.data;
  }
};
