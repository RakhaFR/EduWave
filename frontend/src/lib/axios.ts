import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1',
  headers: {
    'Accept': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        const isAuthPage = window.location.pathname.startsWith('/auth');
        if (!isAuthPage) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          const serverMsg = error.response?.data?.error?.message || error.response?.data?.message;
          const displayMsg = serverMsg && serverMsg.includes("dipakai") ? serverMsg : "Akun sedang dipakai di perangkat lain atau sesi telah berakhir, mohon login kembali.";
          console.warn(displayMsg);
          window.location.href = `/auth/login?error=${encodeURIComponent(displayMsg)}`;
        }
      }
    }
    return Promise.reject(error);
  }
);
