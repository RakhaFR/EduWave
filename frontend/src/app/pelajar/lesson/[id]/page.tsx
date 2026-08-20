"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, PlayCircle, Trophy, Clock, BookOpen, Sparkles, Menu, X } from "lucide-react";
import { courseService, Lesson } from "@/services/courseService";

function MarkdownContent({ content }: { content: string }) {
  const lines = content.split("\\n");
  return <div className="space-y-3">{lines.map((line, index) => {
    if (line.startsWith("### ")) return <h3 key={index} className="text-lg font-extrabold text-[#00172e]">{line.slice(4)}</h3>;
    if (line.startsWith("## ")) return <h2 key={index} className="mt-5 text-xl font-extrabold text-[#00172e]">{line.slice(3)}</h2>;
    if (line.startsWith("# ")) return <h1 key={index} className="text-2xl font-extrabold text-[#00172e]">{line.slice(2)}</h1>;
    if (/^---+$/.test(line.trim())) return <hr key={index} className="border-slate-200" />;
    if (line.startsWith("* ") || line.startsWith("- ")) return <li key={index} className="ml-5 list-disc">{line.slice(2)}</li>;
    if (line.startsWith("```") || line.trim() === "```") return <div key={index} className="h-2" />;
    if (!line.trim()) return <div key={index} className="h-1" />;
    return <p key={index}>{line.replace(/\\*([^*]+)\\*/g, "$1")}</p>;
  })}</div>;
}

export default function PelajarLessonDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [message, setMessage] = useState("");
  const [courseLessons, setCourseLessons] = useState<Lesson[]>([]);
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
           const courseResponse = await courseService.getCourseById(lessonData.course_id);
           const courseData = courseResponse.data?.course ?? courseResponse.data ?? courseResponse;
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0063A7]">
        <div className="w-9 h-9 border-4 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#0063A7] text-white">
        <p>{message || "Materi lesson tidak ditemukan."}</p>
        <button
          onClick={() => router.back()}
          className="rounded-full bg-white px-4 py-2 text-sm font-bold text-[#008be3]"
        >
          Kembali
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-[#00172e]">
      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside className={`fixed left-0 top-0 bottom-0 z-40 w-72 bg-white p-5 shadow-xl transition-transform lg:sticky lg:top-0 lg:block lg:h-screen lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="mb-5 flex items-center justify-between"><p className="font-extrabold text-[#00172e]">Bab & Materi</p><button className="lg:hidden" onClick={() => setSidebarOpen(false)}><X className="w-5 h-5" /></button></div>
        <div className="space-y-2 overflow-y-auto">{courseLessons.map((item) => <Link key={item.id} href={`/pelajar/lesson/${item.id}`} onClick={() => setSidebarOpen(false)} className={`block rounded-xl p-3 text-xs font-semibold ${item.id === lesson.id ? "bg-[#008be3]/10 text-[#008be3]" : "text-slate-600 hover:bg-slate-50"}`}>{item.order}. {item.title}</Link>)}</div>
      </aside>
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3 md:px-8">
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="rounded-full p-2 hover:bg-slate-100 lg:hidden"><Menu className="w-5 h-5" /></button>
          <button
            onClick={() => router.back()}
            className="rounded-full p-2 hover:bg-slate-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-extrabold text-sm md:text-base">{lesson.title}</h1>
            <p className="text-xs text-slate-400">Lesson #{lesson.order} · {lesson.duration_minutes} menit</p>
          </div>
        </div>

        {lesson.exam_id && (
          <Link
            href={`/pelajar/exam/${lesson.exam_id}`}
            className="flex items-center gap-1.5 rounded-full bg-amber-500 px-4 py-2 text-xs font-bold text-white hover:bg-amber-600 shadow-md shadow-amber-500/20"
          >
            <Trophy className="w-4 h-4" />
            Kerjakan Ujian
          </Link>
        )}
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6 md:px-8">
        {/* Video / Content Display */}
        <section className="mb-6 overflow-hidden rounded-3xl bg-white shadow-sm">
          {lesson.video_url ? (
            <div className="aspect-video w-full bg-black">
              <iframe
                src={lesson.video_url.replace("watch?v=", "embed/")}
                title={lesson.title}
                className="h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="flex h-48 md:h-64 items-center justify-center bg-gradient-to-br from-[#008be3] to-[#005a9c] p-6 text-white text-center">
              <div>
                <BookOpen className="mx-auto mb-3 w-12 h-12 text-white/80" />
                <h2 className="text-lg md:text-xl font-extrabold">{lesson.title}</h2>
                <p className="mt-1 text-xs text-white/80">Modul Pembelajaran Teks</p>
              </div>
            </div>
          )}

          <div className="p-5 md:p-7">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-[#008be3]/10 px-3 py-1 text-xs font-bold text-[#008be3] capitalize">
                  {lesson.type || "materi"}
                </span>
                <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  {lesson.duration_minutes} menit
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs font-extrabold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                +{lesson.xp_reward} XP
              </div>
            </div>

            <h3 className="mb-3 text-base font-bold">Ringkasan Materi</h3>
            <div className="prose prose-slate text-sm leading-relaxed text-slate-600">
              {lesson.content ? (
                <MarkdownContent content={lesson.content} />
              ) : (
                <p>Pelajari seluruh materi ini dengan seksama untuk mempersiapkan diri sebelum mengambil ujian akhir lesson.</p>
              )}
            </div>
          </div>
        </section>

        {/* Action Completion Bar */}
        <section className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl bg-white p-5 shadow-sm md:p-6">
          <div className="flex items-center gap-3">
            {isCompleted ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
            ) : (
              <PlayCircle className="w-6 h-6 text-[#008be3] shrink-0" />
            )}
            <div>
              <p className="font-bold text-sm">
                {isCompleted ? "Lesson Ini Telah Selesai!" : "Sudah Selesai Membaca & Memahami?"}
              </p>
              <p className="text-xs text-slate-400">
                {isCompleted
                  ? `Kamu telah memperoleh +${lesson.xp_reward} XP dari lesson ini.`
                  : `Klik tombol di sebelah kanan untuk mengklaim +${lesson.xp_reward} XP.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {lesson.exam_id && (
              <Link
                href={`/pelajar/exam/${lesson.exam_id}`}
                className="flex-1 sm:flex-none text-center rounded-full bg-amber-50 px-5 py-2.5 text-xs font-bold text-amber-700 hover:bg-amber-100 border border-amber-200"
              >
                Ikuti Ujian
              </Link>
            )}
            <button
              disabled={isCompleted || completing}
              onClick={handleComplete}
              className="flex-1 sm:flex-none rounded-full bg-[#008be3] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#0078c8] disabled:bg-slate-200 disabled:text-slate-400 transition-colors shadow-md shadow-[#008be3]/20"
            >
              {isCompleted ? "Selesai ✓" : completing ? "Memproses..." : "Tandai Selesai"}
            </button>
          </div>
        </section>

        {message && (
          <p className="mt-4 rounded-xl bg-red-50 p-3 text-xs text-red-500 text-center">
            {message}
          </p>
        )}
      </main>
    </div>
  );
}