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
  lessons?: Lesson[];
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

function accountCacheScope() {
  if (typeof window === "undefined") return "anonymous";
  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (user?.id) return user.id;
  } catch { /* ignore */ }
  return localStorage.getItem("token") || "anonymous";
}

export const courseService = {
  async getAllCourses(params?: { category?: string; difficulty?: string; search?: string; sort?: string }) {
    const cacheKey = `courses:${accountCacheScope()}:${JSON.stringify(params ?? {})}`;
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
    return cachedRequest(`course-progress:${accountCacheScope()}`, async () => {
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

  async getStudyRooms(params?: { status?: "active" | "closed"; is_public?: boolean }) {
    const query = new URLSearchParams({ status: params?.status ?? "active" });
    if (params?.is_public !== undefined) query.set("is_public", String(params.is_public));
    const response = await api.get(`/study-rooms?${query.toString()}`);
    return response.data;
  },

  async createStudyRoom(payload: { name: string; topic?: string; max_capacity?: number; is_public?: boolean }) {
    const response = await api.post("/study-rooms", payload);
    return response.data;
  },

  async getStudyRoom(roomId: string) {
    const response = await api.get(`/study-rooms/${roomId}`);
    return response.data;
  },

  async joinStudyRoom(roomId: string, code?: string) {
    const response = await api.post(`/study-rooms/${roomId}/join`, code ? { code } : undefined);
    return response.data;
  },

  async searchStudyRoomUsers(username: string) {
    const response = await api.get("/admin/users", { params: { search: username, per_page: 10 } });
    return response.data;
  },

  async inviteStudyRoomParticipant(roomId: string, userId: string) {
    const response = await api.post(`/study-rooms/${roomId}/invite`, { user_id: userId });
    return response.data;
  },

  async kickStudyRoomParticipant(roomId: string, userId: string) {
    const response = await api.delete(`/study-rooms/${roomId}/participants/${userId}`);
    return response.data;
  },

  async leaveStudyRoom(roomId: string) {
    const response = await api.delete(`/study-rooms/${roomId}/leave`);
    return response.data;
  },

  async closeStudyRoom(roomId: string) {
    const response = await api.delete(`/study-rooms/${roomId}`);
    return response.data;
  },

  async getStudyRoomMessages(roomId: string, params?: { limit?: number; before?: string }) {
    const response = await api.get(`/study-rooms/${roomId}/messages`, { params });
    return response.data;
  },

  async sendStudyRoomMessage(roomId: string, content: string, type = "text") {
    const response = await api.post(`/study-rooms/${roomId}/messages`, { content, type });
    return response.data;
  },

  async updateStudyRoomMessage(roomId: string, messageId: string, content: string, type = "text") {
    const response = await api.put(`/study-rooms/${roomId}/messages/${messageId}`, { content, type });
    return response.data;
  },

  async deleteStudyRoomMessage(roomId: string, messageId: string) {
    const response = await api.delete(`/study-rooms/${roomId}/messages/${messageId}`);
    return response.data;
  },

  async getLeaderboard(perPage: number = 50, page: number = 1) {
    const response = await api.get("/leaderboard", { params: { page, per_page: Math.min(perPage, 100) } });
    return response.data;
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
