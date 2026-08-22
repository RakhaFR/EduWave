"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { usePathname } from "next/navigation";
import { PembimbingCourse, Exam } from "./types";
import { pembimbingService } from "@/services/pembimbingService";

interface PembimbingContextType {
  courses: PembimbingCourse[];
  setCourses: React.Dispatch<React.SetStateAction<PembimbingCourse[]>>;
  coursesLoading: boolean;
  dataLoading: boolean;
  refreshCourses: () => void;
  refreshExams: () => void;
  exams: Exam[];
  setExams: React.Dispatch<React.SetStateAction<Exam[]>>;
  searchGlobal: string;
  setSearchGlobal: (val: string) => void;
  toast: { message: string; type: "success" | "error" } | null;
  showToast: (msg: string, type?: "success" | "error") => void;
}

const PembimbingContext = createContext<PembimbingContextType | undefined>(undefined);

export function PembimbingProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [courses, setCourses] = useState<PembimbingCourse[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [examsLoading, setExamsLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);
  const [exams, setExams] = useState<Exam[]>([]);
  const [searchGlobal, setSearchGlobal] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

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

  const refreshExams = useCallback(async () => {
    setExamsLoading(true);
    try {
      const res = await pembimbingService.getMyExams();
      if (res.success && Array.isArray(res.data)) {
        setExams(res.data);
      }
    } catch {
      showToast("Gagal memuat data ujian dari server.", "error");
    } finally {
      setExamsLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.all([refreshCourses(), refreshExams()]).finally(() => setDataLoading(false));
  }, [refreshCourses, refreshExams, pathname]);

  const contextValue = useMemo(() => ({
    courses, setCourses, coursesLoading, dataLoading, refreshCourses, refreshExams,
    exams, setExams, searchGlobal, setSearchGlobal, toast, showToast,
  }), [courses, coursesLoading, dataLoading, refreshCourses, refreshExams, exams, searchGlobal, toast, showToast]);

  return (
    <PembimbingContext.Provider value={contextValue}>
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
