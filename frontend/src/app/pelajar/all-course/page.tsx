"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, ChevronLeft, Clock, Users, BookOpen, Sparkles, Filter } from "lucide-react";
import DashboardLayout from "@/components/dashboardPelajar/DashboardLayout";
import { courseService, Course } from "@/services/courseService";

export default function PelajarAllCoursePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [enrolledMap, setEnrolledMap] = useState<Record<string, boolean>>({});

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const [resCourses, resProgress] = await Promise.all([
        courseService.getAllCourses({
          search: search || undefined,
          category: category || undefined,
          difficulty: difficulty || undefined,
        }),
        courseService.getUserCourseProgress().catch(() => null),
      ]);

      if (resCourses.success && resCourses.data) {
        setCourses(resCourses.data);
        if (resCourses.meta) {
          setTotalPages(resCourses.meta.last_page || 1);
          setTotalItems(resCourses.meta.total || resCourses.data.length);
        } else {
          setTotalPages(1);
          setTotalItems(resCourses.data.length);
        }
      }

      if (resProgress?.success && resProgress.data?.enrollments) {
        const map: Record<string, boolean> = {};
        resProgress.data.enrollments.forEach((e: any) => {
          if (e.course_id && e.status !== "dropped") {
            map[e.course_id] = true;
          }
        });
        setEnrolledMap(map);
      }
    } catch (err) {
      console.error("Gagal mengambil data course:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [category, difficulty]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCourses();
  };

  const handleEnrollToggle = async (e: React.MouseEvent, courseId: string) => {
    e.preventDefault();
    const isEnrolled = enrolledMap[courseId];
    try {
      if (isEnrolled) {
        if (!confirm("Apakah Anda yakin ingin membatalkan pendaftaran kursus ini?")) return;
        await courseService.unenrollCourse(courseId);
        setEnrolledMap((prev) => ({ ...prev, [courseId]: false }));
      } else {
        await courseService.enrollCourse(courseId);
        setEnrolledMap((prev) => ({ ...prev, [courseId]: true }));
      }
    } catch (err: any) {
      if (err.response?.status === 409) {
        setEnrolledMap((prev) => ({ ...prev, [courseId]: true }));
      } else {
        console.error("Gagal toggle enroll:", err);
      }
    }
  };

  return (
    <DashboardLayout searchPlaceholder="Cari di All Course...">
      <main className="px-4 md:px-8 py-4 md:py-6 pb-8">
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-white mb-1">All Courses</h1>
            <p className="text-sm text-white/70">Jelajahi seluruh modul & kursus terbaik yang tersedia.</p>
          </div>
          
          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-white text-slate-700 text-xs rounded-xl px-3 py-2 outline-none shadow-sm font-medium"
            >
              <option value="">Semua Kategori</option>
              <option value="technology">Teknologi (technology)</option>
              <option value="design">Desain (design)</option>
              <option value="marine">Kelautan (marine)</option>
              <option value="language">Bahasa (language)</option>
              <option value="science">Sains (science)</option>
              <option value="business">Bisnis (business)</option>
            </select>

            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="bg-white text-slate-700 text-xs rounded-xl px-3 py-2 outline-none shadow-sm font-medium"
            >
              <option value="">Semua Tingkat</option>
              <option value="beginner">Pemula (Beginner)</option>
              <option value="intermediate">Menengah (Intermediate)</option>
              <option value="advanced">Lanjutan (Advanced)</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 text-center max-w-md mx-auto my-12">
            <BookOpen className="w-12 h-12 text-[#008be3] mx-auto mb-3 opacity-60" />
            <h3 className="text-base font-bold text-[#00172e] mb-1">Tidak ada kursus ditemukan</h3>
            <p className="text-xs text-slate-500 mb-4">Coba sesuaikan pencarian atau filter kategori Anda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5 mb-8">
            {courses.map((course) => (
              <Link
                key={course.id}
                href={`/course/${course.id}`}
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
                    <span className="text-[10px] font-semibold text-[#008be3]">{course.category || "Umum"}</span>
                  </div>
                  {course.pearls_reward > 0 && (
                    <div className="absolute top-3 right-3 bg-amber-400/90 backdrop-blur-sm rounded-full px-2 py-0.5 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-white fill-white" />
                      <span className="text-[10px] font-bold text-white">+{course.pearls_reward} Mutiara</span>
                    </div>
                  )}
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
                      {course.difficulty || "Semua Tingkat"}
                    </span>
                    <button
                      onClick={(e) => handleEnrollToggle(e, course.id)}
                      className={`flex items-center gap-1 rounded-full px-4 py-1.5 text-[11px] font-bold transition-colors ${
                        enrolledMap[course.id]
                          ? "bg-emerald-500 text-white hover:bg-emerald-600"
                          : "bg-[#008be3] text-white hover:bg-[#0078c8]"
                      }`}
                    >
                      {enrolledMap[course.id] ? "Terdaftar" : "Enroll Kursus"}
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </DashboardLayout>
  );
}
