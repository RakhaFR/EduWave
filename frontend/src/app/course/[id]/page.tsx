"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, CheckCircle2, Clock, PlayCircle, Trophy } from "lucide-react";
import { courseService, Course, Lesson } from "@/services/courseService";

export default function CourseDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [completing, setCompleting] = useState<string | null>(null);

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
        setProgress(Number(progressResponse?.data?.enrollment?.progress_pct || 0));
      } catch {
        setMessage("Kursus tidak dapat dimuat.");
      } finally {
        setLoading(false);
      }
    }

    if (params.id) loadCourse();
  }, [params.id]);

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
        <section className="mb-6 overflow-hidden rounded-3xl bg-white shadow-sm">
          <div className="h-48 bg-[#c9e8ff]"><img src={course.thumbnail_url || "/ocean-bg.jpg"} alt={course.title} className="h-full w-full object-cover" onError={(event) => { event.currentTarget.src = "/ocean-bg.jpg"; }} /></div>
          <div className="p-5 md:p-7"><div className="mb-3 flex flex-wrap gap-2"><span className="rounded-full bg-[#008be3]/10 px-3 py-1 text-xs font-bold text-[#008be3]">{course.category}</span><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">{course.difficulty}</span></div><p className="text-sm leading-6 text-slate-600">{course.description}</p><div className="mt-5 flex items-center gap-5 text-xs text-slate-400"><span className="flex items-center gap-1"><BookOpen className="w-4 h-4" />{lessons.length} lesson</span><span className="flex items-center gap-1"><Clock className="w-4 h-4" />{course.duration_minutes} menit</span></div></div>
        </section>
        <section className="rounded-3xl bg-white p-5 shadow-sm md:p-7"><div className="mb-5 flex items-center justify-between"><div><h2 className="font-extrabold">Daftar Lesson</h2><p className="text-xs text-slate-400">{completedLessons} dari {lessons.length} lesson selesai</p></div><span className="text-sm font-extrabold text-[#008be3]">{Math.round(progress)}%</span></div><div className="mb-6 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#008be3] transition-all" style={{ width: `${Math.min(100, progress)}%` }} /></div>              <div className="divide-y divide-slate-100">
                {lessons.map((lesson) => (
                  <div key={lesson.id} className="flex items-center gap-3 py-4">
                    <div className="shrink-0">
                      {lesson.is_completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <PlayCircle className="w-5 h-5 text-[#008be3]" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-sm">
                        {lesson.order}. {lesson.title}
                      </p>
                      <p className="text-xs text-slate-400">
                        {lesson.type} · {lesson.duration_minutes} menit · +{lesson.xp_reward} XP
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {lesson.exam_id && (
                        <Link
                          href={`/pelajar/exam/${lesson.exam_id}`}
                          className="flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1.5 text-[11px] font-bold text-amber-600 hover:bg-amber-500/20"
                        >
                          <Trophy className="w-3 h-3" />
                          Ujian
                        </Link>
                      )}
                      <button
                        disabled={Boolean(lesson.is_completed) || completing === lesson.id}
                        onClick={() => completeLesson(lesson)}
                        className="rounded-full bg-[#008be3] px-3 py-1.5 text-[11px] font-bold text-white disabled:bg-slate-200 disabled:text-slate-400"
                      >
                        {lesson.is_completed ? "Selesai" : completing === lesson.id ? "Memproses..." : "Selesaikan"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>{message && <p className="mt-4 rounded-xl bg-red-50 p-3 text-xs text-red-500">{message}</p>}</section>
      </main>
    </div>
  );
}
