"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Course, UserType, Category, Registration } from "./types";
import { adminService } from "@/services/adminService";

interface AdminContextType {
  courses: Course[];
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  coursesLoading: boolean;
  refreshCourses: () => void;
  users: UserType[];
  setUsers: React.Dispatch<React.SetStateAction<UserType[]>>;
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  registrations: Registration[];
  setRegistrations: React.Dispatch<React.SetStateAction<Registration[]>>;
  searchGlobal: string;
  setSearchGlobal: (val: string) => void;
  toast: { message: string; type: "success" | "error" } | null;
  showToast: (msg: string, type?: "success" | "error") => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const INITIAL_USERS: UserType[] = [
  { id: "U-01", name: "Kapten Budi", email: "budi@eduwave.id", role: "Pengajar", status: "Aktif" },
  { id: "U-02", name: "Kapten Siti", email: "siti@eduwave.id", role: "Pengajar", status: "Aktif" },
  { id: "U-03", name: "Rasya Raya", email: "rasya@eduwave.id", role: "Siswa", status: "Aktif" },
  { id: "U-04", name: "Kapten Andi", email: "andi@eduwave.id", role: "Pengajar", status: "Aktif" },
  { id: "U-05", name: "Sarah Amalia", email: "sarah@eduwave.id", role: "Siswa", status: "Nonaktif" },
];

const INITIAL_CATEGORIES: Category[] = [
  { id: "KAT-01", name: "Teknologi", description: "Pengembangan web, mobile app, dan software engineering", courseCount: 0, icon: "💻" },
  { id: "KAT-02", name: "Desain", description: "UI/UX, desain grafis, dan ilustrasi digital", courseCount: 0, icon: "🎨" },
  { id: "KAT-03", name: "Sains", description: "Biologi samudra, fisika laut, dan ilmu kelautan", courseCount: 0, icon: "🔬" },
  { id: "KAT-04", name: "Bisnis", description: "Kewirausahaan digital dan manajemen proyek", courseCount: 0, icon: "💼" },
];

const INITIAL_REGISTRATIONS: Registration[] = [
  { id: "LOG-101", user: "Dina Fitriani", email: "dina@mail.com", action: "Registrasi Akun Baru", ip: "180.252.12.44", device: "Chrome / Windows", timeAgo: "12 detik lalu", isSuspicious: false },
  { id: "LOG-102", user: "Unknown", email: "guest@anon.org", action: "Percobaan Login Gagal (5x)", ip: "103.14.22.99", device: "Unknown / Linux", timeAgo: "2 menit lalu", isSuspicious: true },
  { id: "LOG-103", user: "Ariel Saputra", email: "ariel@mail.com", action: "Pendaftaran Kursus UI/UX", ip: "180.252.15.10", device: "Safari / macOS", timeAgo: "15 menit lalu", isSuspicious: false },
  { id: "LOG-104", user: "Sekar Ayu", email: "sekar@mail.com", action: "Pendaftaran Kursus Biologi", ip: "114.122.45.88", device: "Chrome / Android", timeAgo: "1 jam lalu", isSuspicious: false },
  { id: "LOG-105", user: "Unknown", email: "admin@fake.com", action: "Injection Attempt Flagged", ip: "192.168.100.99", device: "Python Script", timeAgo: "3 jam lalu", isSuspicious: true },
  { id: "LOG-106", user: "Raka Putra", email: "raka@mail.com", action: "Registrasi Akun Baru", ip: "180.252.20.01", device: "Edge / Windows", timeAgo: "5 jam lalu", isSuspicious: false },
  { id: "LOG-107", user: "Maya Lestari", email: "maya@mail.com", action: "Pendaftaran Kursus React", ip: "114.122.90.12", device: "Firefox / macOS", timeAgo: "1 hari lalu", isSuspicious: false },
  { id: "LOG-108", user: "Bimo Adi", email: "bimo@mail.com", action: "Registrasi Akun Baru", ip: "180.252.33.77", device: "Chrome / Android", timeAgo: "2 hari lalu", isSuspicious: false },
];

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [users, setUsers] = useState<UserType[]>(INITIAL_USERS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [registrations, setRegistrations] = useState<Registration[]>(INITIAL_REGISTRATIONS);
  const [searchGlobal, setSearchGlobal] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const refreshCourses = useCallback(async () => {
    setCoursesLoading(true);
    try {
      const res = await adminService.getAllCourses();
      if (res.success && res.data) {
        setCourses(res.data);
      }
    } catch {
      showToast("Gagal memuat data kursus dari server.", "error");
    } finally {
      setCoursesLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCourses();
  }, [refreshCourses]);

  return (
    <AdminContext.Provider
      value={{
        courses,
        setCourses,
        coursesLoading,
        refreshCourses,
        users,
        setUsers,
        categories,
        setCategories,
        registrations,
        setRegistrations,
        searchGlobal,
        setSearchGlobal,
        toast,
        showToast,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}
