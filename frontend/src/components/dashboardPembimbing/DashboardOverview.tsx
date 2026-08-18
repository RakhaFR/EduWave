"use client";

import { useMemo } from "react";
import {
  BookOpen,
  ClipboardList,
  Users,
  CheckCircle,
  Sparkles
} from "lucide-react";
import { PembimbingCourse, Exam } from "./types";

interface DashboardOverviewProps {
  courses: PembimbingCourse[];
  exams: Exam[];
}

export default function DashboardOverview({ courses, exams }: DashboardOverviewProps) {
  const courseStats = useMemo(() => {
    const total = courses.length;
    const published = courses.filter((c) => c.status === "Terbit").length;
    const draft = courses.filter((c) => c.status === "Draft").length;
    const totalStudents = courses.reduce((acc, c) => acc + c.students, 0);
    return { total, published, draft, totalStudents };
  }, [courses]);

  const examStats = useMemo(() => {
    const total = exams.length;
    const active = exams.filter((e) => e.status === "Aktif").length;
    const draft = exams.filter((e) => e.status === "Draft").length;
    return { total, active, draft };
  }, [exams]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-[#0073e6]" />
        <h2 className="text-base font-extrabold text-[#00172e]">Ringkasan Statistik</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-[#f0f7ff] to-white border border-blue-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#0073e6] text-white flex items-center justify-center shadow-md shadow-blue-200 group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold bg-blue-50 text-[#0073e6] px-2.5 py-1 rounded-full">Kursus</span>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-black text-[#00172e]">{courseStats.total}</p>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">Total Kursus Saya</p>
          </div>
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 pt-3 mt-3 border-t border-blue-50">
            <span>Terbit: <strong className="text-green-600 font-bold">{courseStats.published}</strong></span>
            <span>Draft: <strong className="text-slate-600 font-bold">{courseStats.draft}</strong></span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#f5f3ff] to-white border border-purple-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-200 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold bg-purple-50 text-purple-600 px-2.5 py-1 rounded-full">Siswa</span>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-black text-[#00172e]">{courseStats.totalStudents}</p>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">Total Siswa Terdaftar</p>
          </div>
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 pt-3 mt-3 border-t border-purple-50">
            <span>Dari <strong className="text-purple-600 font-bold">{courseStats.total}</strong> kursus</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#ecfdf5] to-white border border-emerald-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-200 group-hover:scale-110 transition-transform">
              <ClipboardList className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full">Ujian</span>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-black text-[#00172e]">{examStats.total}</p>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">Total Ujian Dibuat</p>
          </div>
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 pt-3 mt-3 border-t border-emerald-50">
            <span>Aktif: <strong className="text-emerald-600 font-bold">{examStats.active}</strong></span>
            <span>Draft: <strong className="text-slate-600 font-bold">{examStats.draft}</strong></span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#fff7ed] to-white border border-amber-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-200 group-hover:scale-110 transition-transform">
              <CheckCircle className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold bg-amber-50 text-amber-600 px-2.5 py-1 rounded-full">Aktif</span>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-black text-[#00172e]">{examStats.active}</p>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">Ujian Sedang Berjalan</p>
          </div>
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 pt-3 mt-3 border-t border-amber-50">
            <span>Dari <strong className="text-amber-600 font-bold">{examStats.total}</strong> total ujian</span>
          </div>
        </div>
      </div>

      <div className="mt-2">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-[#0073e6]" />
          <h3 className="text-base font-extrabold text-[#00172e]">Kursus Terbaru Saya</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.slice(0, 3).map((course) => (
            <div
              key={course.id}
              className="border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col gap-3 bg-white"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-bold text-sm text-[#00172e] leading-tight">{course.title}</p>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                    course.status === "Terbit"
                      ? "bg-green-50 text-green-600"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {course.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{course.description}</p>
              <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 pt-2 border-t border-slate-50">
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-bold">{course.category}</span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {course.students} siswa
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
