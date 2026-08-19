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

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [users, setUsers] = useState<UserType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [searchGlobal, setSearchGlobal] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const refreshCourses = useCallback(async () => {
    setCoursesLoading(true);
    try {
      const [coursesRes, usersRes, analyticsRes] = await Promise.all([
        adminService.getAllCourses().catch(() => null),
        adminService.getUsers().catch(() => null),
        adminService.getAnalyticsOverview().catch(() => null),
      ]);

      if (coursesRes?.success && coursesRes.data) {
        const courseData: Course[] = coursesRes.data;
        setCourses(courseData);

        // Calculate Categories count dynamically based on actual courses in database
        const catMap: Record<string, number> = {};
        courseData.forEach((c) => {
          const catKey = c.category || "lainnya";
          catMap[catKey] = (catMap[catKey] || 0) + 1;
        });

        const categoryList: Category[] = [
          { id: "technology", name: "Teknologi", description: "Pengembangan web, mobile, & software engineering", courseCount: catMap["technology"] || 0, icon: "💻" },
          { id: "design", name: "Desain", description: "UI/UX, desain grafis, dan ilustrasi digital", courseCount: catMap["design"] || 0, icon: "🎨" },
          { id: "marine", name: "Marine", description: "Biologi samudra, fisika laut, & teknologi maritim", courseCount: catMap["marine"] || 0, icon: "🌊" },
          { id: "language", name: "Bahasa", description: "Bahasa asing & komunikasi maritim internasional", courseCount: catMap["language"] || 0, icon: "🗣️" },
          { id: "science", name: "Sains", description: "Sains dasar & ilmu kelautan lanjutan", courseCount: catMap["science"] || 0, icon: "🔬" },
          { id: "business", name: "Bisnis", description: "Kewirausahaan digital & manajemen proyek", courseCount: catMap["business"] || 0, icon: "💼" },
        ];
        setCategories(categoryList);
      }

      if (usersRes?.success && Array.isArray(usersRes.data)) {
        const mappedUsers: UserType[] = usersRes.data.map((u: any) => ({
          id: u.id,
          name: u.full_name || u.username,
          email: u.email,
          role: u.role === "admin" ? "Admin" : u.role === "instructor" ? "Pengajar" : "Siswa",
          status: u.is_active === false ? "Nonaktif" : "Aktif",
        }));
        setUsers(mappedUsers);
      }

      if (analyticsRes?.success && analyticsRes.data?.recent_users) {
        const logs: Registration[] = analyticsRes.data.recent_users.map((ru: any) => ({
          id: ru.id,
          user: ru.full_name || ru.username,
          email: ru.email,
          action: `Registrasi Akun (${ru.role})`,
          ip: "Server Log",
          device: "Web Browser",
          timeAgo: new Date(ru.created_at).toLocaleDateString("id-ID"),
          isSuspicious: false,
        }));
        setRegistrations(logs);
      }
    } catch {
      showToast("Gagal memuat data dari server.", "error");
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
