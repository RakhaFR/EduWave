"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, CheckCircle2, PlayCircle, Trophy, Clock,
  BookOpen, Sparkles, Menu, X, ChevronRight, ChevronLeft,
  FileText, Video, List,
} from "lucide-react";
import { courseService, Lesson } from "@/services/courseService";
import StudentTutorial from "@/components/ui/StudentTutorial";

function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div
      className="prose prose-slate max-w-none text-sm leading-relaxed whitespace-pre-wrap"
    >
      {content}
    </div>
  );
}

const TYPE_ICON: Record<string, React.ReactNode> = {
  video: <Video className="w-3.5 h-3.5" />,
  text: <FileText className="w-3.5 h-3.5" />,
  quiz: <List className="w-3.5 h-3.5" />,
};

export default function PelajarLessonDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [message, setMessage] = useState("");
  const [courseLessons, setCourseLessons] = useState<Lesson[]>([]);
  const [courseTitle, setCourseTitle] = useState("");
  const [courseId, setCourseId] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Tracking: Durasi dinamis berbasis lesson.duration_minutes (default 5 menit / 300 detik)
  const durationMin = lesson?.duration_minutes && lesson.duration_minutes > 0 ? lesson.duration_minutes : 5;
  const REQUIRED_TIME_SEC = durationMin * 60;
  const [secondsSpent, setSecondsSpent] = useState(0);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const contentAreaRef = useRef<HTMLDivElement>(null);

  // Load saved time & scroll status on lesson change & when lesson duration is loaded
  useEffect(() => {
    if (!params.id) return;
    try {
      const savedTime = localStorage.getItem(`lesson_time_${params.id}`);
      if (savedTime) {
        const parsedSec = parseInt(savedTime, 10) || 0;
        setSecondsSpent(Math.min(REQUIRED_TIME_SEC, parsedSec));
      } else {
        setSecondsSpent(0);
      }

      const savedScroll = localStorage.getItem(`lesson_scrolled_${params.id}`);
      if (savedScroll === "true") {
        setHasScrolledToBottom(true);
      } else {
        setHasScrolledToBottom(false);
      }
    } catch {
      // ignore
    }
  }, [params.id, REQUIRED_TIME_SEC]);

  // Timer counter + persist to localStorage
  useEffect(() => {
    if (isCompleted || !params.id) return;
    const interval = setInterval(() => {
      setSecondsSpent((prev) => {
        const nextVal = prev >= REQUIRED_TIME_SEC ? REQUIRED_TIME_SEC : prev + 1;
        try {
          localStorage.setItem(`lesson_time_${params.id}`, nextVal.toString());
        } catch {
          // ignore
        }
        if (nextVal >= REQUIRED_TIME_SEC) {
          clearInterval(interval);
        }
        return nextVal;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isCompleted, params.id]);

  // Check if content fits in view without scrollbar or check scroll position
  const checkScrollEligibility = () => {
    if (isCompleted || hasScrolledToBottom) return;
    const el = contentAreaRef.current;
    if (!el) return;
    const isBottomOrNoScroll = el.scrollHeight <= el.clientHeight + 150 || el.scrollHeight - el.scrollTop <= el.clientHeight + 150;
    if (isBottomOrNoScroll) {
      setHasScrolledToBottom(true);
      if (params.id) {
        try {
          localStorage.setItem(`lesson_scrolled_${params.id}`, "true");
        } catch {
          // ignore
        }
      }
    }
  };

  // Auto check scroll eligibility when lesson content is rendered or window resized
  useEffect(() => {
    if (!lesson) return;
    const timer = setTimeout(() => {
      checkScrollEligibility();
    }, 500);
    window.addEventListener("resize", checkScrollEligibility);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", checkScrollEligibility);
    };
  }, [lesson, params.id]);

  // Scroll listener + persist to localStorage
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    checkScrollEligibility();
  };

  const isEligibleToComplete = isCompleted || (secondsSpent >= REQUIRED_TIME_SEC && (hasScrolledToBottom || !lesson?.content));

  useEffect(() => {
    async function loadLesson() {
      if (!params.id) return;
      setLoading(true);
      try {
        const [response, progressRes] = await Promise.all([
          courseService.getLessonById(params.id),
          courseService.getUserCourseProgress().catch(() => null),
        ]);

        const lessonData = response.data?.lesson ?? response.lesson ?? response.data ?? response;
        setLesson(lessonData);

        // Check completion status from DB / progressRes + lessonData (isolated per current user)
        let currentUserId = "";
        try {
          const userObj = JSON.parse(localStorage.getItem("user") || "{}");
          currentUserId = userObj?.id || "";
        } catch {
          currentUserId = "";
        }
        const userCompletedKey = currentUserId ? `completed_lesson_ids_${currentUserId}` : "completed_lesson_ids";
        const localCompleted = typeof window !== "undefined" ? JSON.parse(localStorage.getItem(userCompletedKey) || "[]") : [];
        const completedIds = new Set([
          ...localCompleted,
          ...(progressRes?.success && progressRes.data?.completed_lessons ? progressRes.data.completed_lessons.map((l: any) => l.lesson_id || l.id || l) : []),
        ]);

        const completed = Boolean(lessonData.is_completed) || completedIds.has(params.id);
        setIsCompleted(completed);

        if (lessonData.course_id) {
          setCourseId(lessonData.course_id);
          const courseResponse = await courseService.getCourseById(lessonData.course_id);
          const courseData = courseResponse.data?.course ?? courseResponse.data ?? courseResponse;
          setCourseTitle(courseData?.title ?? "");

        // Mark completed status on course lessons list
          const rawLessons: Lesson[] = courseData?.lessons ?? [];
          const mappedLessons = rawLessons.map((l) => {
            const isFinished = Boolean(l.is_completed) || completedIds.has(l.id) || (l.id === params.id && completed);
            return { ...l, is_completed: isFinished };
          });
          setCourseLessons(mappedLessons);
          const courseLesson = mappedLessons.find((item) => item.id === params.id);
          if (!lessonData.exam_id && courseLesson?.exam_id) {
            setLesson({ ...lessonData, exam_id: courseLesson.exam_id });
          }
        }
      } catch (err: any) {
        if (err?.response?.status === 403 || err?.response?.data?.error?.code === "LESSON_LOCKED") {
          setMessage(err?.response?.data?.error?.message || "Selesaikan lesson sebelumnya terlebih dahulu sebelum mengakses lesson ini.");
        } else {
          setMessage(err?.response?.data?.message || err?.response?.data?.error?.message || "Gagal memuat materi lesson.");
        }
      } finally {
        setLoading(false);
      }
    }
    loadLesson();
  }, [params.id]);

  const handleComplete = async () => {
    if (!lesson) return;
    setCompleting(true);
    setMessage("");
    try {
      await courseService.completeLesson(lesson.id);
      setIsCompleted(true);
      setCourseLessons((prev) => prev.map((l) => l.id === lesson.id ? { ...l, is_completed: true } : l));

      // Save to localStorage completed IDs backup (isolated per current user)
      if (typeof window !== "undefined") {
        let currentUserId = "";
        try {
          const userObj = JSON.parse(localStorage.getItem("user") || "{}");
          currentUserId = userObj?.id || "";
        } catch {
          currentUserId = "";
        }
        const userCompletedKey = currentUserId ? `completed_lesson_ids_${currentUserId}` : "completed_lesson_ids";
        const localCompleted = JSON.parse(localStorage.getItem(userCompletedKey) || "[]");
        if (!localCompleted.includes(lesson.id)) {
          localCompleted.push(lesson.id);
          localStorage.setItem(userCompletedKey, JSON.stringify(localCompleted));
        }
      }
    } catch (err: any) {
      setMessage(err?.response?.data?.message || "Gagal menyelesaikan lesson.");
    } finally {
      setCompleting(false);
    }
  };

  const currentIdx = courseLessons.findIndex((l) => l.id === lesson?.id);
  const prevLesson = currentIdx > 0 ? courseLessons[currentIdx - 1] : null;
  const nextLesson = currentIdx >= 0 && currentIdx < courseLessons.length - 1 ? courseLessons[currentIdx + 1] : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#00172e]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-[#008be3]/20" />
            <div className="absolute inset-0 rounded-full border-4 border-t-[#008be3] animate-spin" />
            <BookOpen className="absolute inset-0 m-auto w-6 h-6 text-[#008be3]" />
          </div>
          <p className="text-white/60 text-sm font-medium">Memuat materi...</p>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#00172e] text-white">
        <p>{message || "Materi lesson tidak ditemukan."}</p>
        <button onClick={() => router.back()} className="rounded-full bg-white px-4 py-2 text-sm font-bold text-[#008be3]">
          Kembali
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-[#00172e] flex flex-col max-w-full overflow-x-hidden">

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Topbar ── */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-100 bg-white/95 backdrop-blur px-4 py-3 md:px-6 shadow-sm">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden rounded-xl p-2 hover:bg-slate-100 transition-colors shrink-0"
          >
            <Menu className="w-5 h-5 text-slate-600" />
          </button>
          <button
             onClick={() => courseId ? router.push(`/course/${courseId}`) : router.back()}
            className="rounded-xl p-2 hover:bg-slate-100 transition-colors shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div className="min-w-0">
            {courseTitle && (
              <p className="text-[10px] text-[#008be3] font-semibold truncate">{courseTitle}</p>
            )}
            <h1 className="font-extrabold text-sm md:text-base truncate">{lesson.title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {lesson.exam_id && (
            <Link
               href={`/pelajar/exam/${lesson.exam_id}?returnTo=${encodeURIComponent(`/pelajar/lesson/${lesson.id}`)}`}
              className="hidden sm:flex items-center gap-1.5 rounded-full bg-amber-500 px-4 py-2 text-xs font-bold text-white hover:bg-amber-600 shadow-md shadow-amber-500/20 transition-colors"
            >
              <Trophy className="w-3.5 h-3.5" />
              Ujian
            </Link>
          )}
        </div>
      </header>

      {/* ── Body: sidebar + content ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Sidebar Kiri ── */}
        <aside
          className={`
            fixed left-0 top-0 bottom-0 z-40 w-72 bg-white border-r border-slate-100 shadow-xl flex flex-col
            transition-transform duration-300 ease-in-out
            lg:sticky lg:top-[57px] lg:h-[calc(100vh-57px)] lg:translate-x-0 lg:shadow-none
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          {/* Sidebar header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bab & Materi</p>
              <p className="font-extrabold text-sm text-[#00172e] mt-0.5 line-clamp-1">{courseTitle || "Kursus"}</p>
            </div>
            <button className="lg:hidden rounded-xl p-1.5 hover:bg-slate-100" onClick={() => setSidebarOpen(false)}>
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>

          {/* Progress bar */}
          {courseLessons.length > 0 && (
            <div className="px-5 py-3 border-b border-slate-50 shrink-0">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-semibold text-slate-400">Progress</span>
                <span className="text-[10px] font-bold text-[#008be3]">
                  {courseLessons.filter((l) => l.is_completed).length}/{courseLessons.length} selesai
                </span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#42AEED] to-[#008be3] rounded-full transition-all"
                  style={{
                    width: `${Math.round((courseLessons.filter((l) => l.is_completed).length / courseLessons.length) * 100)}%`
                  }}
                />
              </div>
            </div>
          )}

          {/* Lesson list */}
          <div className="flex-1 overflow-y-auto py-2">
            {courseLessons.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">Tidak ada lesson</p>
            ) : (
              courseLessons.map((item, idx) => {
                const isActive = item.id === lesson.id;
                // Lock if previous lesson is not completed
                const isLocked = idx > 0 && !courseLessons[idx - 1].is_completed && !item.is_completed;

                if (isLocked) {
                  return (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 px-4 py-3 mx-2 my-0.5 rounded-xl text-slate-400 opacity-60 bg-slate-50 border border-transparent cursor-not-allowed select-none"
                    >
                      <div className="shrink-0 w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-extrabold mt-0.5 text-slate-400">
                        🔒
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold leading-snug truncate">{item.title}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Terkunci (Selesaikan modul {idx})</p>
                      </div>
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.id}
                    href={`/pelajar/lesson/${item.id}`}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-start gap-3 px-4 py-3 mx-2 my-0.5 rounded-xl transition-all text-left
                      ${isActive
                        ? "bg-[#008be3]/10 border border-[#008be3]/20"
                        : "hover:bg-slate-50 border border-transparent"
                      }
                    `}
                  >
                    {/* Nomor / check */}
                    <div className={`
                      shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold mt-0.5
                      ${item.is_completed
                        ? "bg-emerald-100 text-emerald-600"
                        : isActive
                        ? "bg-[#008be3] text-white"
                        : "bg-slate-100 text-slate-500"
                      }
                    `}>
                      {item.is_completed ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold leading-snug ${isActive ? "text-[#008be3]" : item.is_completed ? "text-slate-500" : "text-[#00172e]"}`}>
                        {item.title}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={`text-[10px] ${isActive ? "text-[#008be3]/70" : "text-slate-400"}`}>
                          {TYPE_ICON[item.type ?? "text"]}
                        </span>
                        <span className="text-[10px] text-slate-400">{item.duration_minutes}m</span>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </aside>

        {/* ── Main Content ── */}
        <main
          data-tour="lesson-content"
          ref={contentAreaRef}
          onScroll={handleScroll}
          className="flex-1 min-w-0 overflow-y-auto"
        >
          <div className="max-w-3xl mx-auto px-4 py-6 md:px-8">

            {/* Video */}
            {lesson.video_url && (
              <div className="mb-6 rounded-2xl overflow-hidden shadow-md aspect-video bg-black">
                <iframe
                  src={lesson.video_url.includes("watch?v=")
                    ? lesson.video_url.replace("watch?v=", "embed/")
                    : lesson.video_url}
                  title={lesson.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#008be3]/10 px-3 py-1 text-xs font-bold text-[#008be3] capitalize">
                {TYPE_ICON[lesson.type ?? "text"]}
                {lesson.type || "materi"}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                <Clock className="w-3 h-3" />
                {lesson.duration_minutes} menit
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-600 border border-amber-200">
                <Sparkles className="w-3 h-3 text-amber-500 fill-amber-400" />
                +{lesson.xp_reward} XP
              </span>
              {isCompleted && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" />
                  Selesai
                </span>
              )}
            </div>

            {/* Title */}
            <h2 className="text-xl md:text-2xl font-extrabold text-[#00172e] mb-5 leading-tight">{lesson.title}</h2>

            {/* Content */}
            {lesson.content ? (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:p-7 mb-6">
                <MarkdownRenderer content={lesson.content} />
              </div>
            ) : !lesson.video_url ? (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 mb-6 text-center">
                <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">Konten materi belum tersedia.</p>
              </div>
            ) : null}

            {/* Ujian CTA */}
            {lesson.exam_id && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Trophy className="w-8 h-8 text-amber-500 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-[#00172e]">Ada Ujian di Lesson Ini</p>
                    <p className="text-xs text-slate-500">Selesaikan materi lalu kerjakan ujian untuk mendapatkan poin.</p>
                  </div>
                </div>
                <Link
                   href={`/pelajar/exam/${lesson.exam_id}?returnTo=${encodeURIComponent(`/pelajar/lesson/${lesson.id}`)}`}
                  className="shrink-0 flex items-center gap-1.5 rounded-full bg-amber-500 hover:bg-amber-600 px-4 py-2 text-xs font-bold text-white transition-colors shadow-sm"
                >
                  Kerjakan
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {/* Complete bar */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 md:p-5 flex flex-col gap-4 mb-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {isCompleted
                    ? <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                    : <PlayCircle className="w-6 h-6 text-[#008be3] shrink-0" />
                  }
                  <div>
                    <p className="font-bold text-sm">
                      {isCompleted ? "Lesson Telah Selesai!" : "Sudah Selesai Membaca & Memahami?"}
                    </p>
                    <p className="text-xs text-slate-400">
                      {isCompleted
                        ? `Kamu telah memperoleh +${lesson.xp_reward} XP dari lesson ini.`
                        : `Selesaikan syarat membaca untuk mengklaim +${lesson.xp_reward} XP.`
                      }
                    </p>
                  </div>
                </div>

                <button
                  disabled={!isEligibleToComplete || completing}
                  onClick={handleComplete}
                  className={`w-full sm:w-auto rounded-full px-6 py-2.5 text-xs font-bold transition-all shadow-md
                    ${isCompleted
                      ? "bg-emerald-500 text-white cursor-default"
                      : isEligibleToComplete
                      ? "bg-[#008be3] text-white hover:bg-[#0078c8] shadow-[#008be3]/20 cursor-pointer active:scale-95"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                    }
                  `}
                >
                  {isCompleted ? "Selesai ✓" : completing ? "Memproses..." : isEligibleToComplete ? "Tandai Selesai" : "Belum Memenuhi Syarat"}
                </button>
              </div>

              {/* Syarat Membaca Tracker jika belum selesai */}
              {!isCompleted && (
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50 p-3 rounded-xl">
                  <div className="flex items-center gap-4 flex-wrap">
                    {/* Timer tracker */}
                    <div className="flex items-center gap-1.5 font-semibold">
                      <Clock className={`w-3.5 h-3.5 ${secondsSpent >= REQUIRED_TIME_SEC ? "text-emerald-500" : "text-amber-500"}`} />
                      <span className={secondsSpent >= REQUIRED_TIME_SEC ? "text-emerald-600 font-bold" : "text-slate-600"}>
                        Waktu Baca: {Math.floor(secondsSpent / 60).toString().padStart(2, '0')}:{(secondsSpent % 60).toString().padStart(2, '0')} / {Math.floor(REQUIRED_TIME_SEC / 60).toString().padStart(2, '0')}:00
                      </span>
                    </div>

                    {/* Scroll tracker */}
                    {lesson.content && (
                      <div className="flex items-center gap-1.5 font-semibold">
                        <span className={`w-2 h-2 rounded-full ${hasScrolledToBottom ? "bg-emerald-500" : "bg-amber-400 animate-pulse"}`} />
                        <span className={hasScrolledToBottom ? "text-emerald-600 font-bold" : "text-slate-600"}>
                          {hasScrolledToBottom ? "Sudah scroll ke akhir materi ✓" : "Scroll ke akhir materi"}
                        </span>
                      </div>
                    )}
                  </div>

                  {!isEligibleToComplete && (
                    <span className="text-[10px] text-amber-600 font-medium bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                      Baca minimal {Math.floor(REQUIRED_TIME_SEC / 60)} menit & scroll sampai bawah untuk membuka tombol
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Prev / Next navigation */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 overflow-hidden">
              {prevLesson ? (
                <Link
                  href={`/pelajar/lesson/${prevLesson.id}`}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-600 hover:border-[#008be3]/30 hover:text-[#008be3] transition-all shadow-sm flex-1 min-w-0"
                >
                  <ChevronLeft className="w-4 h-4 shrink-0" />
                  <span className="truncate">{prevLesson.title}</span>
                </Link>
              ) : <div className="hidden sm:block flex-1" />}

              {nextLesson ? (
                <Link
                  href={`/pelajar/lesson/${nextLesson.id}`}
                  className="flex items-center justify-end gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-600 hover:border-[#008be3]/30 hover:text-[#008be3] transition-all shadow-sm flex-1 min-w-0"
                >
                  <span className="truncate">{nextLesson.title}</span>
                  <ChevronRight className="w-4 h-4 shrink-0" />
                </Link>
              ) : <div className="hidden sm:block flex-1" />}
            </div>

            {message && (
              <p className="mt-4 rounded-xl bg-red-50 p-3 text-xs text-red-500 text-center">{message}</p>
            )}
          </div>
        </main>
      </div>
      <StudentTutorial />
    </div>
  );
}
