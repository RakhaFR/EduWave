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
  mode?: "locked" | "quiz";
  requires_fullscreen?: boolean;
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
      mode: form.mode ?? "locked",
      requires_fullscreen: form.requires_fullscreen ?? form.mode !== "quiz",
    });
    return response.data;
  },

  async updateExam(id: string, form: Partial<PembimbingExamForm>) {
    const response = await api.put(`/exams/${id}`, {
      ...form,
      lesson_id: form.lesson_id || undefined,
      ...(form.mode ? { mode: form.mode } : {}),
      ...(form.requires_fullscreen !== undefined ? { requires_fullscreen: form.requires_fullscreen } : {}),
    });
    return response.data;
  },

  async deleteExam(id: string) {
    const response = await api.delete(`/exams/${id}`);
    return response.data;
  },

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

  async importExamPdf(examId: string, file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post(`/exams/${examId}/questions/import-pdf`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
};
