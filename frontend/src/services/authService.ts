import { api } from '@/lib/axios';
import { ApiResponse, AuthResponseData, UserProfile } from '@/types/auth';

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  password_confirmation: string;
  full_name: string;
  role?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authService = {
  // 1. Register: POST /api/v1/auth/register (Tested: ✓)
  register: async (payload: RegisterPayload): Promise<ApiResponse<AuthResponseData>> => {
    const response = await api.post<ApiResponse<AuthResponseData>>('/auth/register', payload);
    return response.data;
  },

  // 2. Login: POST /api/v1/auth/login (Tested: ✓)
  login: async (payload: LoginPayload): Promise<ApiResponse<AuthResponseData>> => {
    const response = await api.post<ApiResponse<AuthResponseData>>('/auth/login', payload);
    return response.data;
  },

  // 3. Auth Me: GET /api/v1/auth/me (Tested: ✓)
  getAuthMe: async (): Promise<ApiResponse<{ user: UserProfile }>> => {
    const response = await api.get<ApiResponse<{ user: UserProfile }>>('/auth/me');
    return response.data;
  },

  // 4. User Me (Profile Detail): GET /api/v1/users/me (Tested: ☐)
  getUserMe: async (): Promise<ApiResponse<{ user: UserProfile }>> => {
    const response = await api.get<ApiResponse<{ user: UserProfile }>>('/users/me');
    return response.data;
  },
};
