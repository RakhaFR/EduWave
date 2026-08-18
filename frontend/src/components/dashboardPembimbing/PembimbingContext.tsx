"use client";

import React, { createContext, useContext, useState } from "react";
import { PembimbingCourse, Exam } from "./types";

interface PembimbingContextType {
  courses: PembimbingCourse[];
  setCourses: React.Dispatch<React.SetStateAction<PembimbingCourse[]>>;
  exams: Exam[];
  setExams: React.Dispatch<React.SetStateAction<Exam[]>>;
  searchGlobal: string;
  setSearchGlobal: (val: string) => void;
  toast: { message: string; type: "success" | "error" } | null;
  showToast: (msg: string, type?: "success" | "error") => void;
}

const PembimbingContext = createContext<PembimbingContextType | undefined>(undefined);

const INITIAL_COURSES: PembimbingCourse[] = [
  { id: "PC-01", title: "Web Dev Dasar", category: "Teknologi", students: 120, status: "Terbit", description: "Pengenalan pembuatan website dari dasar hingga mahir." },
  { id: "PC-02", title: "UI/UX Bawah Laut", category: "Desain", students: 85, status: "Terbit", description: "Prinsip desain antarmuka yang intuitif dan estetis." },
  { id: "PC-03", title: "Biologi Samudra", category: "Sains", students: 60, status: "Draft", description: "Eksplorasi kehidupan laut dan ekosistem samudra dalam." },
  { id: "PC-04", title: "JavaScript Arus Dalam", category: "Teknologi", students: 95, status: "Terbit", description: "Pemahaman mendalam tentang JavaScript modern dan ES6+." },
  { id: "PC-05", title: "React.js Kapal Induk", category: "Teknologi", students: 72, status: "Draft", description: "Membangun aplikasi web dinamis dengan React.js." },
];

const INITIAL_EXAMS: Exam[] = [
  { id: "EX-01", title: "UTS Web Dev Dasar", courseId: "PC-01", courseTitle: "Web Dev Dasar", duration: 60, totalQuestions: 30, status: "Aktif", deadline: "2025-08-30" },
  { id: "EX-02", title: "Kuis UI/UX Bab 1", courseId: "PC-02", courseTitle: "UI/UX Bawah Laut", duration: 30, totalQuestions: 15, status: "Aktif", deadline: "2025-08-20" },
  { id: "EX-03", title: "UAS Biologi Samudra", courseId: "PC-03", courseTitle: "Biologi Samudra", duration: 90, totalQuestions: 50, status: "Draft", deadline: "2025-09-15" },
  { id: "EX-04", title: "Kuis JavaScript ES6", courseId: "PC-04", courseTitle: "JavaScript Arus Dalam", duration: 45, totalQuestions: 20, status: "Aktif", deadline: "2025-08-25" },
  { id: "EX-05", title: "Proyek Akhir React", courseId: "PC-05", courseTitle: "React.js Kapal Induk", duration: 120, totalQuestions: 10, status: "Draft", deadline: "2025-09-30" },
];

export function PembimbingProvider({ children }: { children: React.ReactNode }) {
  const [courses, setCourses] = useState<PembimbingCourse[]>(INITIAL_COURSES);
  const [exams, setExams] = useState<Exam[]>(INITIAL_EXAMS);
  const [searchGlobal, setSearchGlobal] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <PembimbingContext.Provider
      value={{
        courses,
        setCourses,
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
