"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, CheckCircle2, PlayCircle, Trophy, Clock,
  BookOpen, Sparkles, Menu, X, ChevronRight, ChevronLeft,
  FileText, Video, List,
} from "lucide-react";
import { courseService, Lesson } from "@/services/courseService";
import { marked } from "marked";

marked.setOptions({ breaks: true, gfm: true } as any);

function MarkdownRenderer({ content }: { content: string }) {
  const html = useMemo(() => {
    try {
      return marked.parse(content) as string;
    } catch {
      return content;
    }
  }, [content]);

  return (
    <div
      className="prose prose-slate max-w-none text-sm leading-relaxed
        prose-headings:text-[#00172e] prose-headings:font-extrabold
        prose-h1:text-2xl prose-h1:mt-6 prose-h1:mb-3
        prose-h2:text-xl prose-h2:mt-5 prose-h2:mb-2
        prose-h3:text-lg prose-h3:mt-4 prose-h3:mb-2
        prose-p:text-slate-600 prose-p:leading-7 prose-p:my-2
        prose-a:text-[#008be3] prose-a:no-underline hover:prose-a:underline
        prose-strong:text-[#00172e] prose-strong:font-bold
        prose-em:text-slate-500 prose-em:italic
        prose-code:bg-slate-100 prose-code:text-[#008be3] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-mono
        prose-pre:bg-[#0f1b2d] prose-pre:text-slate-100 prose-pre:rounded-2xl prose-pre:p-4 prose-pre:overflow-x-auto prose-pre:text-xs
        prose-ul:my-3 prose-ul:pl-5 prose-li:text-slate-600 prose-li:my-1 prose-li:leading-6
        prose-ol:my-3 prose-ol:pl-5
        prose-blockquote:border-l-4 prose-blockquote:border-[#008be3] prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-slate-500 prose-blockquote:bg-[#f0f7ff] prose-blockquote:rounded-r-xl prose-blockquote:py-1
        prose-hr:border-slate-200 prose-hr:my-6
        prose-table:text-xs prose-th:bg-slate-50 prose-th:font-bold prose-td:border prose-td:border-slate-200 prose-th:border prose-th:border-slate-200"
      dangerouslySetInnerHTML={{ __html: html }}
    />
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

  useEffect(() => {
    async function loadLesson() {
      if (!params.id) return;
      try {
        const response = await courseService.getLessonById(params.id);
        const lessonData = response.data?.lesson ?? response.lesson ?? response.data ?? response;
        setLesson(lessonData);
        setIsCompleted(Boolean(lessonData.is_completed));
        if (lessonData.course_id) {
          setCourseId(lessonData.course_id);
          const courseResponse = await courseService.getCourseById(lessonData.course_id);
          const courseData = courseResponse.data?.course ?? courseResponse.data ?? courseResponse;
          setCourseTitle(courseData?.title ?? "");
          setCourseLessons(courseData?.lessons ?? []);
        }
      } catch (err: any) {
        setMessage(err?.response?.data?.message || "Gagal memuat materi lesson.");
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
            onClick={() => courseId ? router.push(`/pelajar/course`) : router.back()}
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
              href={`/pelajar/exam/${lesson.exam_id}`}
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
        <main className="flex-1 min-w-0 overflow-y-auto">
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
                  href={`/pelajar/exam/${lesson.exam_id}`}
                  className="shrink-0 flex items-center gap-1.5 rounded-full bg-amber-500 hover:bg-amber-600 px-4 py-2 text-xs font-bold text-white transition-colors shadow-sm"
                >
                  Kerjakan
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {/* Complete bar */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 md:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
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
                      : `Klik tombol untuk mengklaim +${lesson.xp_reward} XP.`
                    }
                  </p>
                </div>
              </div>
              <button
                disabled={isCompleted || completing}
                onClick={handleComplete}
                className="w-full sm:w-auto rounded-full bg-[#008be3] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#0078c8] disabled:bg-slate-200 disabled:text-slate-400 transition-colors shadow-md shadow-[#008be3]/20"
              >
                {isCompleted ? "Selesai ✓" : completing ? "Memproses..." : "Tandai Selesai"}
              </button>
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
    </div>
  );
}
