"use client";

import { useMemo } from "react";
import {
  BookOpen,
  ClipboardList,
  Users,
  CheckCircle,
  Loader2,
  Activity
} from "lucide-react";
import { PembimbingCourse, Exam } from "./types";
import { Card } from "@/components/ui/card";

interface DashboardOverviewProps {
  courses: PembimbingCourse[];
  coursesLoading?: boolean;
  exams: Exam[];
}

export default function DashboardOverview({ courses, coursesLoading = false, exams }: DashboardOverviewProps) {
  const courseStats = useMemo(() => {
    const total = courses.length;
    const published = courses.filter((c) => c.status === "published").length;
    const draft = courses.filter((c) => c.status === "draft").length;
    const totalEnrolled = courses.reduce((acc, c) => acc + (c.enrolled_count ?? 0), 0);
    return { total, published, draft, totalEnrolled };
  }, [courses]);

  const examStats = useMemo(() => {
    const total = exams.length;
    return { total };
  }, [exams]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0073e6] flex items-center justify-center border border-blue-100/80">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#00172e] tracking-tight">Ringkasan Statistik</h2>
            <p className="text-xs text-slate-500 font-medium">Statistik kursus & materi bimbingan Anda</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <Card className="bg-white border-slate-200/80 p-5 rounded-2xl shadow-sm hover:border-blue-200 transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Kursus Saya</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0073e6] border border-blue-100 flex items-center justify-center group-hover:bg-[#0073e6] group-hover:text-white transition-all">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              {coursesLoading ? (
                <Loader2 className="w-6 h-6 animate-spin text-slate-300 my-1" />
              ) : (
                <p className="text-3xl font-extrabold text-[#00172e] tracking-tight">{courseStats.total}</p>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between text-xs font-medium text-slate-600 pt-3 mt-4 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Terbit: <strong className="text-slate-800 font-semibold">{courseStats.published}</strong></span>
            </div>
            <span className="text-slate-400">|</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-300"></span>
              <span>Draft: <strong className="text-slate-800 font-semibold">{courseStats.draft}</strong></span>
            </div>
          </div>
        </Card>

        {/* Card 2 */}
        <Card className="bg-white border-slate-200/80 p-5 rounded-2xl shadow-sm hover:border-blue-200 transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Siswa Terdaftar</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0073e6] border border-blue-100 flex items-center justify-center group-hover:bg-[#0073e6] group-hover:text-white transition-all">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              {coursesLoading ? (
                <Loader2 className="w-6 h-6 animate-spin text-slate-300 my-1" />
              ) : (
                <p className="text-3xl font-extrabold text-[#00172e] tracking-tight">{courseStats.totalEnrolled}</p>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between text-xs font-medium text-slate-600 pt-3 mt-4 border-t border-slate-100">
            <span>Dari <strong className="text-slate-800 font-semibold">{courseStats.total}</strong> total kursus</span>
          </div>
        </Card>

        {/* Card 3 */}
        <Card className="bg-white border-slate-200/80 p-5 rounded-2xl shadow-sm hover:border-blue-200 transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Total Ujian</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0073e6] border border-blue-100 flex items-center justify-center group-hover:bg-[#0073e6] group-hover:text-white transition-all">
                <ClipboardList className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-3xl font-extrabold text-[#00172e] tracking-tight">{examStats.total}</p>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs font-medium text-slate-600 pt-3 mt-4 border-t border-slate-100">
            <span>Ujian terkonfigurasi</span>
          </div>
        </Card>

        {/* Card 4 */}
        <Card className="bg-white border-slate-200/80 p-5 rounded-2xl shadow-sm hover:border-blue-200 transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Kursus Aktif</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0073e6] border border-blue-100 flex items-center justify-center group-hover:bg-[#0073e6] group-hover:text-white transition-all">
                <CheckCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              {coursesLoading ? (
                <Loader2 className="w-6 h-6 animate-spin text-slate-300 my-1" />
              ) : (
                <p className="text-3xl font-extrabold text-[#00172e] tracking-tight">{courseStats.published}</p>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between text-xs font-medium text-slate-600 pt-3 mt-4 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Siap diakses siswa</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-2">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-[#0073e6]" />
          <h3 className="text-base font-extrabold text-[#00172e]">Kursus Terbaru Saya</h3>
        </div>
        {coursesLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
          </div>
        ) : (
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
                      course.status === "published"
                        ? "bg-green-50 text-green-600"
                        : course.status === "archived"
                        ? "bg-amber-50 text-amber-600"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {course.status === "published" ? "Terbit" : course.status === "archived" ? "Arsip" : "Draft"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{course.description}</p>
                <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 pt-2 border-t border-slate-50">
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-bold">{course.category}</span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {course.enrolled_count} siswa
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
