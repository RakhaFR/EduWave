import { api } from "@/lib/axios";

export interface AdminCourse {
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

export const adminService = {
  async getAllCourses(params?: { search?: string; category?: string; difficulty?: string; status?: string; per_page?: number }) {
    const response = await api.get("/courses", { params: { per_page: 50, ...params } });
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

  async deleteCourse(id: string) {
    const response = await api.delete(`/courses/${id}`);
    return response.data;
  },
};
