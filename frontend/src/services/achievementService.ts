import { api } from "@/lib/axios";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon_url: string | null;
  condition_type: "course_completion" | "lesson_completion" | "exam_pass" | "xp_milestone" | "streak_days";
  condition_value: number;
  pearls_reward: number;
  is_earned?: boolean;
  earned_at?: string | null;
  progress?: {
    current: number;
    target: number;
    percentage: number;
  };
}

export interface MyAchievementsResponse {
  achievements: Achievement[];
  count: number;
  total_pearls_earned: number;
}

export const achievementService = {
  async getAll() {
    const response = await api.get("/achievements");
    return response.data as {
      success: boolean;
      data: { achievements: Achievement[]; count: number } | null;
      error: { code: string; message: string } | null;
    };
  },

  async getMyAchievements() {
    const response = await api.get("/achievements/me");
    return response.data as {
      success: boolean;
      data: MyAchievementsResponse | null;
      error: { code: string; message: string } | null;
    };
  },

  async checkAndUnlock() {
    try {
      const response = await api.post("/achievements/check");
      return response.data;
    } catch {
      return null;
    }
  },
};
