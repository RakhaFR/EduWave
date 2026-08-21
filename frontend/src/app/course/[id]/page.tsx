"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, CheckCircle2, Clock, PlayCircle, Trophy } from "lucide-react";
import { courseService, Course, Lesson } from "@/services/courseService";
import StudentTutorial from "@/components/ui/StudentTutorial";

export default function CourseDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [completing, setCompleting] = useState<string | null>(null);

  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    async function loadCourse() {
      try {
        const [courseResponse, progressResponse] = await Promise.all([
          courseService.getCourseById(params.id),
          courseService.getCourseProgress(params.id).catch(() => null),
        ]);
        const courseData = courseResponse.data;
        const lessonProgress = progressResponse?.data?.lessons_progress || [];
        setCourse(courseData?.course || courseData || null);
        setLessons((courseData?.lessons || []).map((lesson: Lesson) => ({
          ...lesson,
          is_completed: lessonProgress.find((item: { id: string }) => item.id === lesson.id)?.is_completed || false,
        })));
        
        if (progressResponse?.success && progressResponse?.data?.enrollment) {
          setIsEnrolled(true);
          setProgress(Number(progressResponse.data.enrollment.progress_pct || 0));
        } else {
          setIsEnrolled(false);
        }
      } catch {
        setMessage("Kursus tidak dapat dimuat.");
      } finally {
        setLoading(false);
      }
    }

    if (params.id) loadCourse();
  }, [params.id]);

  const handleEnrollToggle = async () => {
    if (!course) return;
    setEnrolling(true);
    setMessage("");
    try {
      if (isEnrolled) {
        if (!confirm("Apakah Anda yakin ingin membatalkan pendaftaran kursus ini?")) {
          setEnrolling(false);
          return;
        }
        await courseService.unenrollCourse(course.id);
        setIsEnrolled(false);
        setProgress(0);
      } else {
        await courseService.enrollCourse(course.id);
        setIsEnrolled(true);
        // Refresh progress after enrolling
        const pRes = await courseService.getCourseProgress(course.id).catch(() => null);
        if (pRes?.data?.enrollment) {
          setProgress(Number(pRes.data.enrollment.progress_pct || 0));
        }
      }
    } catch (err: any) {
      if (err.response?.status === 409) {
        setIsEnrolled(true);
      } else {
        setMessage(err.response?.data?.error?.message || "Gagal memperbarui pendaftaran kursus.");
      }
    } finally {
      setEnrolling(false);
    }
  };

  const completedLessons = useMemo(() => {
    const progressResponse = lessons.filter((lesson) => lesson.is_completed);
    return progressResponse.length;
  }, [lessons]);

  const completeLesson = async (lesson: Lesson) => {
    setCompleting(lesson.id);
    setMessage("");
    try {
      const response = await courseService.completeLesson(lesson.id);
      setLessons((current) => current.map((item) => item.id === lesson.id ? { ...item, is_completed: true } : item));
      if (response.data?.enrollment?.progress_pct !== undefined) {
        setProgress(Number(response.data.enrollment.progress_pct));
      }
    } catch {
      setMessage("Lesson hanya dapat diselesaikan setelah terdaftar di kursus.");
    } finally {
      setCompleting(null);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#0063A7]"><div className="w-9 h-9 border-4 border-white border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!course) {
    return <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#0063A7] text-white"><p>{message || "Kursus tidak ditemukan."}</p><Link href="/pelajar/all-course" className="rounded-full bg-white px-4 py-2 text-sm font-bold text-[#008be3]">Kembali ke All Course</Link></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-[#00172e]">
      <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-slate-100 bg-white px-4 py-3 md:px-8">
        <button onClick={() => router.back()} className="rounded-full p-2 hover:bg-slate-100"><ArrowLeft className="w-5 h-5" /></button>
        <div className="min-w-0"><h1 className="truncate font-extrabold">{course.title}</h1><p className="text-xs text-slate-400">{course.instructor?.full_name || "Instruktur EduWave"}</p></div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6 md:px-8">
        <section data-tour="course-overview" className="mb-6 overflow-hidden rounded-3xl bg-white shadow-sm">
          <div className="h-48 bg-[#c9e8ff]"><img src={course.thumbnail_url || "/ocean-bg.jpg"} alt={course.title} className="h-full w-full object-cover" onError={(event) => { event.currentTarget.src = "/ocean-bg.jpg"; }} /></div>
          <div className="p-5 md:p-7">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-[#008be3]/10 px-3 py-1 text-xs font-bold text-[#008be3]">{course.category}</span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">{course.difficulty}</span>
              </div>
              <button
                onClick={handleEnrollToggle}
                disabled={enrolling}
                className={`rounded-full px-5 py-2 text-xs font-bold transition-all shadow-sm ${
                  isEnrolled
                    ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                    : "bg-[#008be3] text-white hover:bg-[#0078c8]"
                }`}
              >
                {enrolling
                  ? "Memproses..."
                  : isEnrolled
                  ? "Batalkan Enrolled"
                  : "Enroll Kursus Ini"}
              </button>
            </div>
            <p className="text-sm leading-6 text-slate-600">{course.description}</p>
            <div className="mt-5 flex items-center gap-5 text-xs text-slate-400">
              <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" />{lessons.length} lesson</span>
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{course.duration_minutes} menit</span>
            </div>
          </div>
        </section>
        <section data-tour="lesson-list" className="rounded-3xl bg-white p-5 shadow-sm md:p-7"><div className="mb-5 flex items-center justify-between"><div><h2 className="font-extrabold">Daftar Lesson</h2><p className="text-xs text-slate-400">{completedLessons} dari {lessons.length} lesson selesai</p></div><span className="text-sm font-extrabold text-[#008be3]">{Math.round(progress)}%</span></div><div className="mb-6 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#008be3] transition-all" style={{ width: `${Math.min(100, progress)}%` }} /></div>              <div className="divide-y divide-slate-100">
                {lessons.map((lesson, idx) => {
                  const isLocked = idx > 0 && !lessons[idx - 1].is_completed && !lesson.is_completed;

                  return (
                    <div key={lesson.id} className="flex items-center gap-3 py-4">
                      <div className="shrink-0">
                        {lesson.is_completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : isLocked ? (
                          <div className="w-5 h-5 flex items-center justify-center text-slate-400 text-xs">🔒</div>
                        ) : (
                          <PlayCircle className="w-5 h-5 text-[#008be3]" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        {isLocked ? (
                          <span className="font-bold text-sm text-slate-400 cursor-not-allowed select-none">
                            {lesson.order}. {lesson.title}
                          </span>
                        ) : (
                          <Link href={`/pelajar/lesson/${lesson.id}`} className="font-bold text-sm text-[#00172e] hover:text-[#008be3] hover:underline">
                            {lesson.order}. {lesson.title}
                          </Link>
                        )}
                        <p className="text-xs text-slate-400">
                          {lesson.type} · {lesson.duration_minutes} menit · +{lesson.xp_reward} XP
                          {isLocked && " · Terkunci"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {lesson.exam_id && !isLocked && (
                          <Link
                            href={`/pelajar/exam/${lesson.exam_id}`}
                            className="flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1.5 text-[11px] font-bold text-amber-600 hover:bg-amber-500/20"
                          >
                            <Trophy className="w-3 h-3" />
                            Ujian
                          </Link>
                        )}
                        {isLocked ? (
                          <button
                            disabled
                            className="rounded-full bg-slate-100 text-slate-400 px-4 py-1.5 text-[11px] font-bold cursor-not-allowed border border-slate-200"
                          >
                            Terkunci 🔒
                          </button>
                        ) : (
                          <Link
                            href={`/pelajar/lesson/${lesson.id}`}
                            className="rounded-full bg-[#008be3] hover:bg-[#0078c8] px-4 py-1.5 text-[11px] font-bold text-white shadow-sm transition-all active:scale-95"
                          >
                            Enter Lesson
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>{message && <p className="mt-4 rounded-xl bg-red-50 p-3 text-xs text-red-500">{message}</p>}</section>
      </main>
      <StudentTutorial />
    </div>
  );
}
