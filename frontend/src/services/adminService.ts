import { api } from "@/lib/axios";

export interface AdminCourse {
  id: string;
  title: string;
  description: string;
  instructor: {
    id: string;
    full_name: string;
    email?: string;
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

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: "student" | "instructor" | "admin";
  avatar_url: string | null;
  pearls: number;
  xp: number;
  level: number;
  is_active?: boolean;
  created_at: string;
}

export interface AdminAnalytics {
  users: {
    total: number;
    active: number;
    students: number;
    instructors: number;
  };
  courses: {
    total: number;
    published: number;
    draft: number;
  };
  enrollments: {
    total: number;
    active: number;
    completed: number;
  };
  exams: {
    total_attempts: number;
    passed_attempts: number;
    average_score: number;
  };
  recent_users: AdminUser[];
  top_courses: {
    id: string;
    title: string;
    category: string;
    enrollments_count: number;
  }[];
}

export interface AdminCourseForm {
  title: string;
  description: string;
  category: string;
  difficulty: string;
  status: string;
  pearls_reward: number;
  duration_minutes: number;
  thumbnail_url?: string;
}

export interface ExamQuestion {
  id: string;
  exam_id: string;
  question_text: string;
  type: "multiple_choice" | "essay";
  options: string[] | null;
  correct_answer: string;
  explanation: string | null;
  points: number;
  order: number;
}

export interface ExamQuestionForm {
  question_text: string;
  type: "multiple_choice" | "essay";
  options?: string[];
  correct_answer: string;
  explanation?: string;
  points: number;
  order: number;
}

export const adminService = {
  // Courses
  async getAllCourses(params?: { search?: string; category?: string; difficulty?: string; status?: string; per_page?: number }) {
    const response = await api.get("/admin/courses", { params: { per_page: 50, ...params } }).catch(() => api.get("/courses", { params: { per_page: 50, ...params } }));
    return response.data;
  },

  async createCourse(form: AdminCourseForm) {
    const response = await api.post("/courses", form);
    return response.data;
  },

  async updateCourse(id: string, form: Partial<AdminCourseForm>) {
    const response = await api.put(`/courses/${id}`, form);
    return response.data;
  },

  async updateCourseStatus(id: string, status: string) {
    const response = await api.put(`/admin/courses/${id}/status`, { status });
    return response.data;
  },

  async deleteCourse(id: string) {
    const response = await api.delete(`/courses/${id}`);
    return response.data;
  },

  // Users
  async getUsers(params?: { page?: number; per_page?: number; role?: string; search?: string }) {
    const response = await api.get("/admin/users", { params: { per_page: 50, ...params } });
    return response.data;
  },

  async updateUser(id: string, form: { full_name?: string; email?: string; username?: string; role?: string; is_active?: boolean }) {
    const response = await api.put(`/admin/users/${id}`, form);
    return response.data;
  },

  async updateUserRole(id: string, role: "student" | "instructor" | "admin") {
    const response = await api.put(`/admin/users/${id}/role`, { role });
    return response.data;
  },

  async getUserGamification(id: string) {
    const response = await api.get(`/admin/users/${id}/gamification`);
    return response.data;
  },

  async deleteUser(id: string) {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  // Analytics
  async getAnalyticsOverview() {
    const response = await api.get("/admin/analytics/overview");
    return response.data;
  },

  // Lessons
  async createLesson(form: {
    course_id: string;
    title: string;
    type: string;
    content?: string;
    video_url?: string;
    duration_minutes?: number;
    order: number;
    xp_reward?: number;
    is_preview?: boolean;
  }) {
    const response = await api.post("/lessons", form);
    return response.data;
  },

  async updateLesson(id: string, form: {
    course_id?: string;
    title?: string;
    type?: string;
    content?: string;
    video_url?: string;
    duration_minutes?: number;
    order?: number;
    xp_reward?: number;
    is_preview?: boolean;
  }) {
    const response = await api.put(`/lessons/${id}`, form);
    return response.data;
  },

  async deleteLesson(id: string) {
    const response = await api.delete(`/lessons/${id}`);
    return response.data;
  },

  // Exam Questions
  async getExams() {
    const response = await api.get("/exams");
    return response.data;
  },

  async getExamQuestions(examId: string) {
    const response = await api.get(`/exams/${examId}/questions`);
    return response.data as { success: boolean; data: ExamQuestion[] | null; error: null };
  },

  async createExamQuestion(examId: string, form: ExamQuestionForm) {
    const response = await api.post(`/exams/${examId}/questions`, form);
    return response.data as { success: boolean; data: ExamQuestion | null; error: null };
  },

  async updateExamQuestion(examId: string, questionId: string, form: Partial<ExamQuestionForm>) {
    const response = await api.put(`/exams/${examId}/questions/${questionId}`, form);
    return response.data as { success: boolean; data: ExamQuestion | null; error: null };
  },

  async deleteExamQuestion(examId: string, questionId: string) {
    const response = await api.delete(`/exams/${examId}/questions/${questionId}`);
    return response.data;
  },
};
