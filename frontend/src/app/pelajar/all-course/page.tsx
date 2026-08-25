"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { ChevronRight, ChevronLeft, Clock, Users, BookOpen, Sparkles, Filter } from "lucide-react";
import DashboardLayout from "@/components/dashboardPelajar/DashboardLayout";
import { courseService, Course } from "@/services/courseService";
import { GridSkeleton } from "@/components/ui/PageSkeleton";
import SmartPagination from "@/components/common/SmartPagination";

const ITEMS_PER_PAGE = 9;

function AllCoursesContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [enrolledMap, setEnrolledMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const q = searchParams.get("search");
    if (q !== null) {
      setSearch(q);
      setCurrentPage(1);
    }
  }, [searchParams]);

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
    setCurrentPage(1);
    fetchCourses();
  }, [category, difficulty, search]);

  const totalPages = Math.max(1, Math.ceil(courses.length / ITEMS_PER_PAGE));
  const paginatedCourses = courses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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
          <div className="rounded-2xl bg-white/10 p-4"><GridSkeleton count={6} /></div>
        ) : courses.length === 0 ? (
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 text-center max-w-md mx-auto my-12">
            <BookOpen className="w-12 h-12 text-[#008be3] mx-auto mb-3 opacity-60" />
            <h3 className="text-base font-bold text-[#00172e] mb-1">Tidak ada kursus ditemukan</h3>
            <p className="text-xs text-slate-500 mb-4">Coba sesuaikan pencarian atau filter kategori Anda.</p>
          </div>
        ) : (
          <>
            <div data-tour="course-list" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5 mb-8">
              {paginatedCourses.map((course) => (
                <div
                  key={course.id}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-black/20 hover:-translate-y-1 transition-all duration-300 flex flex-col"
                >
                  <Link data-tour={courses[0]?.id === course.id ? "course-card" : undefined} href={`/course/${course.id}`} className="block cursor-pointer">
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
                    <div className="px-4 pt-4 pb-2 flex flex-col gap-3">
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
                    </div>
                  </Link>

                  <div className="px-4 pb-4 mt-auto pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold capitalize text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {course.difficulty || "Semua Tingkat"}
                    </span>
                    <button
                      onClick={(e) => handleEnrollToggle(e, course.id)}
                      className={`cursor-pointer flex items-center gap-1 rounded-full px-4 py-1.5 text-[11px] font-bold transition-colors ${
                        enrolledMap[course.id]
                          ? "bg-emerald-500 text-white hover:bg-emerald-600"
                          : "bg-[#008be3] text-white hover:bg-[#0078c8]"
                      }`}
                    >
                      {enrolledMap[course.id] ? "Terdaftar ✓" : "Ikuti Kursus"}
                      {!enrolledMap[course.id] && <ChevronRight className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                <p className="text-xs text-white/80 font-medium">
                  Menampilkan <span className="font-bold text-white">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span>-
                  <span className="font-bold text-white">{Math.min(courses.length, currentPage * ITEMS_PER_PAGE)}</span> dari{" "}
                  <span className="font-bold text-white">{courses.length}</span> kursus
                </p>
                <SmartPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(p) => setCurrentPage(p)}
                  variant="white"
                />
              </div>
            )}
          </>
        )}
      </main>
    </DashboardLayout>
  );
}

export default function PelajarAllCoursePage() {
  return (
    <Suspense fallback={null}>
      <AllCoursesContent />
    </Suspense>
  );
}
