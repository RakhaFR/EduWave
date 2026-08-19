"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { PembimbingCourse, Exam } from "./types";
import { pembimbingService } from "@/services/pembimbingService";

interface PembimbingContextType {
  courses: PembimbingCourse[];
  setCourses: React.Dispatch<React.SetStateAction<PembimbingCourse[]>>;
  coursesLoading: boolean;
  refreshCourses: () => void;
  exams: Exam[];
  setExams: React.Dispatch<React.SetStateAction<Exam[]>>;
  searchGlobal: string;
  setSearchGlobal: (val: string) => void;
  toast: { message: string; type: "success" | "error" } | null;
  showToast: (msg: string, type?: "success" | "error") => void;
}

const PembimbingContext = createContext<PembimbingContextType | undefined>(undefined);

const INITIAL_EXAMS: Exam[] = [];

export function PembimbingProvider({ children }: { children: React.ReactNode }) {
  const [courses, setCourses] = useState<PembimbingCourse[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [exams, setExams] = useState<Exam[]>(INITIAL_EXAMS);
  const [searchGlobal, setSearchGlobal] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const refreshCourses = useCallback(async () => {
    setCoursesLoading(true);
    try {
      const res = await pembimbingService.getMyCourses();
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
    <PembimbingContext.Provider
      value={{
        courses,
        setCourses,
        coursesLoading,
        refreshCourses,
        exams,
        setExams,
        searchGlobal,
        setSearchGlobal,
        toast,
        showToast,
      }}
    >
      {children}
    </PembimbingContext.Provider>
  );
}

export function usePembimbing() {
  const context = useContext(PembimbingContext);
  if (!context) {
    throw new Error("usePembimbing must be used within a PembimbingProvider");
  }
  return context;
}
