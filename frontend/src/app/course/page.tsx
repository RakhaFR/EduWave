"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Clock, Users, Lock, LogIn, BookOpen } from "lucide-react";
import PublicLayout from "@/components/home/PublicLayout";
import { courseService, Course } from "@/services/courseService";

export default function CoursePublicPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [totalCourses, setTotalCourses] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPublicCourses() {
      try {
        const res = await courseService.getAllCourses();
        if (res.success && res.data) {
          setCourses(res.data);
          setTotalCourses(res.meta?.total || res.data.length);
        }
      } catch (err) {
        console.error("Gagal memuat kursus publik:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPublicCourses();
  }, []);

  const previewCourses = courses.slice(0, 6);
  const remainingCount = Math.max(0, totalCourses - previewCourses.length);

  return (
    <PublicLayout>
      <main className="px-4 md:px-8 py-4 md:py-6 pb-8">
        <div className="mb-5 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-white mb-1">Jelajahi Kursus</h1>
            <p className="text-sm text-white/70">Preview kursus tersedia — masuk untuk akses penuh.</p>
          </div>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 bg-white text-[#008be3] font-bold text-xs px-4 py-2 rounded-full shadow hover:shadow-md transition-all hover:bg-[#f0f7ff]"
          >
            <LogIn className="w-3.5 h-3.5" /> Masuk untuk Akses Penuh
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        ) : previewCourses.length === 0 ? (
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 text-center max-w-md mx-auto my-12">
            <BookOpen className="w-12 h-12 text-[#008be3] mx-auto mb-3 opacity-60" />
            <h3 className="text-base font-bold text-[#00172e] mb-1">Belum ada kursus tersedia</h3>
            <p className="text-xs text-slate-500 mb-4">Silakan periksa kembali nanti.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5 mb-6">
            {previewCourses.map((course) => (
              <Link
                key={course.id}
                href="/auth/login"
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-black/20 hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                <div className="relative h-40 md:h-44 bg-[#c9e8ff] shrink-0">
                  <img
                    src={course.thumbnail_url || "/ocean-bg.jpg"}
                    alt={course.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/ocean-bg.jpg";
                    }}
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1">
                    <span className="text-[10px] font-semibold text-[#008be3] capitalize">
                      {course.category || "Umum"}
                    </span>
                  </div>
                </div>
                <div className="p-4 flex flex-col gap-3 flex-1">
                  <div>
                    <h3 className="font-bold text-[#00172e] text-sm leading-snug mb-1 line-clamp-2 min-h-[2.5rem]">
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {course.instructor?.full_name || "Instruktur EduWave"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-[#008be3]" />
                      {course.enrolled_count || 0} Siswa
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#008be3]" />
                      {course.duration_minutes || 0} Menit
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-[#008be3]" />
                      {course.lesson_count || 0} Lesson
                    </span>
                  </div>
                  <div className="mt-auto pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold capitalize text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {course.difficulty || "Pemula"}
                    </span>
                    <span className="flex items-center gap-1 rounded-full bg-[#008be3] px-4 py-1.5 text-[11px] font-bold text-white group-hover:bg-[#0078c8] transition-colors">
                      Daftar<ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="bg-white/15 backdrop-blur-sm border border-white/25 rounded-3xl px-6 py-8 text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <p className="text-white font-extrabold text-lg mb-1">
            +{remainingCount} Kursus Lainnya
          </p>
          <p className="text-white/70 text-sm mb-5">
            Masuk untuk mengakses semua kursus, melacak progress, dan mendapatkan sertifikat.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 bg-white text-[#008be3] font-bold text-sm px-6 py-2.5 rounded-xl shadow-lg hover:bg-[#f0f7ff] transition-all"
            >
              <LogIn className="w-4 h-4" /> Masuk Sekarang
            </Link>
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 bg-[#008be3] text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-lg hover:bg-[#0078c8] transition-all"
            >
              Daftar Gratis <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>
    </PublicLayout>
  );
}