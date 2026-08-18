"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Clock, BookOpen, Trash2, CheckCircle2, PlayCircle } from "lucide-react";
import DashboardLayout from "@/components/dashboardPelajar/DashboardLayout";
import { courseService, Course } from "@/services/courseService";

export default function PelajarMyCoursesPage() {
  const [enrolledCourses, setEnrolledCourses] = useState<(Course & { progress_pct: number })[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyCourses = async () => {
    setLoading(true);
    try {
      // Get all published courses first
      const res = await courseService.getAllCourses();
      if (res.success && res.data) {
        const all: Course[] = res.data;
        const enrolledList: (Course & { progress_pct: number })[] = [];

        // Check progress / enrollment for each course
        for (const course of all) {
          try {
            const progRes = await courseService.getCourseProgress(course.id);
            if (progRes.success && progRes.data?.enrollment) {
              enrolledList.push({
                ...course,
                progress_pct: progRes.data.enrollment.progress_pct || 0,
              });
            }
          } catch (e) {
            // User is not enrolled in this course
          }
        }
        setEnrolledCourses(enrolledList);
      }
    } catch (err) {
      console.error("Gagal mengambil data My Courses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const handleUnenroll = async (e: React.MouseEvent, courseId: string) => {
    e.preventDefault();
    if (!confirm("Apakah Anda yakin ingin membatalkan pendaftaran kursus ini?")) return;

    try {
      await courseService.unenrollCourse(courseId);
      setEnrolledCourses((prev) => prev.filter((c) => c.id !== courseId));
    } catch (err) {
      console.error("Gagal unenroll:", err);
    }
  };

  return (
    <DashboardLayout searchPlaceholder="Cari di My Courses...">
      <main className="px-4 md:px-8 py-4 md:py-6 pb-8">
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-extrabold text-white mb-1">My Courses</h1>
          <p className="text-sm text-white/70">Kursus yang sedang Anda pelajari dan perkembangan belajar Anda.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        ) : enrolledCourses.length === 0 ? (
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 text-center max-w-md mx-auto my-12 shadow-xl">
            <BookOpen className="w-12 h-12 text-[#008be3] mx-auto mb-3 opacity-60" />
            <h3 className="text-base font-bold text-[#00172e] mb-1">Belum Ada Kursus Diikuti</h3>
            <p className="text-xs text-slate-500 mb-6">
              Anda belum terdaftar di kursus apa pun. Jelajahi katalog kursus dan mulailah belajar!
            </p>
            <Link
              href="/pelajar/all-course"
              className="inline-flex items-center gap-2 bg-[#008be3] text-white text-xs font-bold px-5 py-2.5 rounded-full hover:bg-[#0078c8] transition-colors"
            >
              Cari Kursus di All Course <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5 mb-8">
            {enrolledCourses.map((course) => {
              const isFinished = course.progress_pct >= 100;
              return (
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
                    <div className="absolute top-3 right-3 bg-green-500 rounded-full px-2.5 py-1 flex items-center gap-1 shadow-sm">
                      {isFinished ? (
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      ) : (
                        <PlayCircle className="w-3 h-3 text-white" />
                      )}
                      <span className="text-[10px] font-bold text-white">
                        {isFinished ? "Selesai" : "Sedang Dipelajari"}
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

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-semibold text-slate-400">Progress Belajar</span>
                        <span className="text-[10px] font-extrabold text-[#008be3]">
                          {Math.round(course.progress_pct)}%
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-[#008be3] to-cyan-400 transition-all duration-500"
                          style={{ width: `${course.progress_pct}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-auto pt-2 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={(e) => handleUnenroll(e, course.id)}
                        className="text-red-400 hover:text-red-500 transition-colors p-1 flex items-center gap-1 text-[11px]"
                        title="Batalkan Pendaftaran"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Keluar</span>
                      </button>

                      <span className="flex items-center gap-1 rounded-full bg-[#008be3] px-4 py-1.5 text-[11px] font-bold text-white group-hover:bg-[#0078c8] transition-colors">
                        Lanjutkan Belajar <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </DashboardLayout>
  );
}
