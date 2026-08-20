"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { Course, UserType, Category, Registration } from "./types";
import { adminService, AdminAnalytics } from "@/services/adminService";

interface AdminContextType {
  courses: Course[];
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  coursesLoading: boolean;
  dataLoading: boolean;
  refreshCourses: () => void;
  users: UserType[];
  setUsers: React.Dispatch<React.SetStateAction<UserType[]>>;
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  registrations: Registration[];
  setRegistrations: React.Dispatch<React.SetStateAction<Registration[]>>;
  analytics: AdminAnalytics | null;
  searchGlobal: string;
  setSearchGlobal: (val: string) => void;
  toast: { message: string; type: "success" | "error" } | null;
  showToast: (msg: string, type?: "success" | "error") => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);
  const [users, setUsers] = useState<UserType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [searchGlobal, setSearchGlobal] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

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

        const categoryList: Category[] = Object.entries(catMap).map(([name, courseCount]) => ({
          id: name,
          name,
          description: "Kategori yang digunakan oleh kursus di database.",
          courseCount,
          icon: "📁",
        }));
        setCategories(categoryList);
      }

      if (analyticsRes?.success && analyticsRes.data) {
        setAnalytics(analyticsRes.data);
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
          action: `Registrasi akun (${ru.role})`,
          ip: "Tidak tersedia",
          device: "Tidak tersedia",
          timeAgo: new Date(ru.created_at).toLocaleDateString("id-ID"),
          isSuspicious: false,
        }));
        setRegistrations(logs);
      }
    } catch {
      showToast("Gagal memuat data dari server.", "error");
    } finally {
      setCoursesLoading(false);
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCourses();
  }, [refreshCourses]);

  const contextValue = useMemo(() => ({
    courses, setCourses, coursesLoading, dataLoading, refreshCourses, users, setUsers,
    categories, setCategories, registrations, setRegistrations, analytics, searchGlobal,
    setSearchGlobal, toast, showToast,
  }), [courses, coursesLoading, dataLoading, refreshCourses, users, categories, registrations, analytics, searchGlobal, toast, showToast]);

  return (
    <AdminContext.Provider value={contextValue}>
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
