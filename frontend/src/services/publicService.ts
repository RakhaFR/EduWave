import { api } from "@/lib/axios";

export interface PublicStats {
  active_students: number;
  published_courses: number;
  total_enrollments: number;
}

export interface InstructorDirectoryEntry {
  id: string;
  full_name: string;
  username: string;
  bio: string | null;
  avatar_url: string | null;
  courses_count: number;
  enrolled_students_count: number;
  categories: string[];
}

export const publicService = {
  async getStats() {
    const response = await api.get("/public/stats");
    return response.data;
  },

  async getInstructors(params?: { category?: string; search?: string }) {
    const response = await api.get("/instructors", { params });
    return response.data;
  },
};
