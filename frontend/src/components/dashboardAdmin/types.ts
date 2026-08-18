export type TabType = "dashboard" | "kursus" | "pengguna" | "pendaftaran" | "kategori";

export interface Course {
  id: string;
  title: string;
  category: string;
  instructor: string;
  students: number;
  status: string;
}

export interface UserType {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

export interface Registration {
  id: string;
  user: string;
  email: string;
  action: string;
  ip: string;
  device: string;
  timeAgo: string;
  isSuspicious: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  courseCount: number;
  icon: string;
}
