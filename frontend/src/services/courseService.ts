import { api } from "@/lib/axios";
import { cachedRequest, invalidateCache } from "@/lib/requestCache";

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

export interface ExamQuestionOption {
  key: string;
  value: string;
}

export interface ExamQuestion {
  id: string;
  question_text: string;
  type: string;
  options: ExamQuestionOption[];
  points: number;
  order: number;
}

export interface Exam {
  id: string;
  course_id: string;
  lesson_id: string | null;
  title: string;
  time_limit_sec: number;
  passing_score: number;
  max_attempts: number;
  pearls_reward: number;
  questions?: ExamQuestion[];
}

export interface ExamAttempt {
  attempt_id: string;
  exam: {
    id: string;
    title: string;
    time_limit_sec: number;
    question_count: number;
    passing_score: number;
  };
  questions: ExamQuestion[];
  started_at: string;
  expires_at: string;
}

export interface ExamAttemptResult {
  attempt_id: string;
  score: number;
  passed: boolean;
  passing_score: number;
  pearls_earned: number;
  xp_earned: number;
  correct_count: number;
  total_count: number;
  time_taken_seconds: number;
  results: {
    question_id: string;
    is_correct: boolean;
    your_answer: string;
    correct_answer: string;
    explanation: string;
  }[];
}

export interface ExamAttemptHistory {
  id: string;
  score: number | null;
  passed: boolean | null;
  submitted_at: string | null;
  started_at: string;
}

export const courseService = {
  async getAllCourses(params?: { category?: string; difficulty?: string; search?: string; sort?: string }) {
    const cacheKey = `courses:${JSON.stringify(params ?? {})}`;
    return cachedRequest(cacheKey, async () => {
      const response = await api.get("/courses", { params });
      return response.data;
    });
  },

  async getCourseById(id: string) {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  },

  async enrollCourse(courseId: string) {
    const response = await api.post(`/courses/${courseId}/enroll`);
    invalidateCache("courses:");
    invalidateCache("course-progress");
    return response.data;
  },

  async unenrollCourse(courseId: string) {
    const response = await api.delete(`/courses/${courseId}/enroll`);
    invalidateCache("courses:");
    invalidateCache("course-progress");
    return response.data;
  },

  async getCourseProgress(courseId: string) {
    const response = await api.get(`/courses/${courseId}/progress`);
    return response.data;
  },

  async getUserCourseProgress() {
    return cachedRequest("course-progress:me", async () => {
      const response = await api.get('/users/me/course-progress');
      return response.data;
    });
  },

  async getLessonById(lessonId: string) {
    const response = await api.get(`/lessons/${lessonId}`);
    return response.data;
  },

  async completeLesson(lessonId: string, watchSeconds: number = 0) {
    const response = await api.post(`/lessons/${lessonId}/complete`, { watch_seconds: watchSeconds });
    invalidateCache("course-progress");
    invalidateCache("courses:");
    return response.data;
  },

  async getExamById(examId: string) {
    const response = await api.get(`/exams/${examId}`);
    return response.data;
  },

  async startExamAttempt(examId: string) {
    const response = await api.post(`/exams/${examId}/attempts`);
    return response.data;
  },

  async submitExamAttempt(examId: string, attemptId: string, answers: { question_id: string; selected_key: string }[]) {
    const response = await api.post(`/exams/${examId}/attempts/${attemptId}/submit`, { answers });
    return response.data;
  },

  async getExamAttempts(examId: string) {
    const response = await api.get(`/exams/${examId}/attempts`);
    return response.data;
  },

  async getExamAttemptDetail(examId: string, attemptId: string) {
    const response = await api.get(`/exams/${examId}/attempts/${attemptId}`);
    return response.data;
  },

  async getLeaderboard(limit: number = 50, page: number = 1) {
    return cachedRequest(`leaderboard:${limit}:${page}`, async () => {
      const response = await api.get("/leaderboard", { params: { limit, per_page: limit, page } });
      return response.data;
    });
  },

  async getWeeklyLeaderboard(limit: number = 50, page: number = 1) {
    const response = await api.get("/leaderboard/weekly", { params: { limit, per_page: limit, page } });
    return response.data;
  },

  async getMyRank(scope: "global" | "weekly" = "global") {
    const response = await api.get("/leaderboard/me", { params: { scope } });
    return response.data;
  },
};
