import { api } from "@/lib/axios";

export interface PembimbingCourseBackend {
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

export interface PembimbingCourseForm {
  title: string;
  description: string;
  category: string;
  difficulty: string;
  status: string;
  pearls_reward: number;
  duration_minutes: number;
  thumbnail_url?: string;
}

export interface PembimbingExamForm {
  course_id: string;
  title: string;
  time_limit_sec: number;
  passing_score: number;
  max_attempts: number;
  pearls_reward: number;
  lesson_id?: string;
}

export const pembimbingService = {
  async getMyCourses() {
    const response = await api.get("/instructor/courses");
    return response.data;
  },

  async getMyExams() {
    const response = await api.get("/exams");
    return response.data;
  },

  async createCourse(form: PembimbingCourseForm) {
    const response = await api.post("/courses", {
      ...form,
      thumbnail_url: form.thumbnail_url || undefined,
    });
    return response.data;
  },

  async updateCourse(id: string, form: Partial<PembimbingCourseForm>) {
    const response = await api.put(`/courses/${id}`, {
      ...form,
      thumbnail_url: form.thumbnail_url || undefined,
    });
    return response.data;
  },

  async deleteCourse(id: string) {
    const response = await api.delete(`/courses/${id}`);
    return response.data;
  },

  async createExam(form: PembimbingExamForm) {
    const response = await api.post("/exams", {
      ...form,
      lesson_id: form.lesson_id || undefined,
    });
    return response.data;
  },

  async updateExam(id: string, form: Partial<PembimbingExamForm>) {
    const response = await api.put(`/exams/${id}`, {
      ...form,
      lesson_id: form.lesson_id || undefined,
    });
    return response.data;
  },

  async deleteExam(id: string) {
    const response = await api.delete(`/exams/${id}`);
    return response.data;
  },
};
