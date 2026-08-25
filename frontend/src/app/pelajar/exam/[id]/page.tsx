"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle, Clock, Trophy, XCircle } from "lucide-react";
import DashboardLayout from "@/components/dashboardPelajar/DashboardLayout";
import { PageToast, usePageToast } from "@/components/ui/PageToast";
import {
  courseService,
  Exam,
  ExamAttempt,
  ExamAttemptHistory,
  ExamAttemptResult,
  ExamQuestion,
  ExamViolationEvent,
} from "@/services/courseService";

type Phase = "info" | "doing" | "result" | "maxed";

export default function PelajarExamPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo");

  const [exam, setExam] = useState<Exam | null>(null);
  const [history, setHistory] = useState<ExamAttemptHistory[]>([]);
  const [phase, setPhase] = useState<Phase>("info");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [starting, setStarting] = useState(false);

  const [result, setResult] = useState<ExamAttemptResult | null>(null);

  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const answersRef = useRef<Record<string, string>>({});
  const violationInFlightRef = useRef(false);
  const [fullscreenLost, setFullscreenLost] = useState(false);
  const { toast, showToast, hideToast } = usePageToast();

  answersRef.current = answers;
  const resultReturnHref = returnTo || "/pelajar/my-courses";

  useEffect(() => {
    if (!id) return;
    async function load() {
      try {
        const [examRes, histRes] = await Promise.all([
          courseService.getExamById(id),
          courseService.getExamAttempts(id).catch(() => ({ data: [] })),
        ]);
         const examData = examRes.data?.exam ?? examRes.data ?? null;
         setExam(examData);

         const raw = histRes.data ?? histRes ?? [];
        const list: ExamAttemptHistory[] = Array.isArray(raw) ? raw : [];
        setHistory(list);
      } catch (err: unknown) {
        const message = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
        setError(message || "Ujian tidak dapat dimuat.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  useEffect(() => {
    if (phase === "doing" && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(timerRef.current!);
            handleSubmit(true);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  useEffect(() => {
    const locked = phase === "doing" && exam?.mode === "locked";
    if (!locked) return;

    // Keep the student on the active exam route while the attempt is open.
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
    };
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [exam?.mode, phase]);

  useEffect(() => {
    const locked = phase === "doing" && exam?.mode === "locked";
    if (!locked) {
      setFullscreenLost(false);
      return;
    }

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setFullscreenLost(true);
        showToast("Fullscreen keluar. Kembali ke fullscreen untuk melanjutkan ujian.", "error");
        void reportViolation("fullscreen_exit");
      } else {
        setFullscreenLost(false);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [exam?.mode, phase, showToast]);

  const startExam = async () => {
    setStarting(true);
    setError("");
    try {
      const res = await courseService.startExamAttempt(id);
      const data: ExamAttempt = res.data;
      setAttempt(data);
      setAnswers({});
       setTimeLeft(Math.max(0, Math.floor((new Date(data.expires_at).getTime() - Date.now()) / 1000)) || data.exam.time_limit_sec);
       setPhase("doing");
        if (exam?.mode === "locked") {
         try { await document.documentElement.requestFullscreen?.(); } catch { setError("Mode ujian terkunci membutuhkan fullscreen."); }
       }
     } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: { code?: string } } } };
      if (err?.response?.data?.error?.code === "MAX_ATTEMPTS_EXCEEDED") {
        setPhase("maxed");
      } else {
        const message = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
        setError(message || "Ujian tidak dapat dimulai. Pastikan Anda sudah enroll kursus ini.");
      }
    } finally {
      setStarting(false);
    }
  };

  const handleSubmit = async (forced = false) => {
    if (!attempt) return;
    if (!forced) {
      const unanswered = attempt.questions.filter((q: ExamQuestion) => !answers[q.id]);
      if (unanswered.length > 0) {
        setError(`Masih ada ${unanswered.length} soal yang belum dijawab.`);
        return;
      }
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setSubmitting(true);
    setError("");
    try {
      const formatted = Object.entries(answers).map(([question_id, selected_key]) => ({
        question_id,
        selected_key,
      }));
      const res = await courseService.submitExamAttempt(id, attempt.attempt_id, formatted);
       await finishSubmission(res.data);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      setError(message || "Gagal mengirim jawaban. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  const finishSubmission = async (submissionResult: ExamAttemptResult) => {
    setResult(submissionResult);
    if (exam?.mode === "locked" && document.fullscreenElement) {
      await document.exitFullscreen().catch(() => undefined);
    }

    if (exam?.lesson_id && submissionResult.passed) {
      await courseService.completeLesson(exam.lesson_id).catch(() => null);
      if (typeof window !== "undefined") {
        let currentUserId = "";
        try {
          currentUserId = JSON.parse(localStorage.getItem("user") || "{}").id || "";
        } catch {
          currentUserId = "";
        }
        const key = currentUserId ? `completed_lesson_ids_${currentUserId}` : "completed_lesson_ids";
        const completed = JSON.parse(localStorage.getItem(key) || "[]");
        if (!completed.includes(exam.lesson_id)) {
          completed.push(exam.lesson_id);
          localStorage.setItem(key, JSON.stringify(completed));
        }
      }
    }

    const histRes = await courseService.getExamAttempts(id).catch(() => ({ data: [] }));
    const raw = histRes.data ?? histRes ?? [];
    setHistory(Array.isArray(raw) ? raw : []);
    setPhase("result");
  };

  const reportViolation = async (event: ExamViolationEvent) => {
    if (!attempt || submitting || violationInFlightRef.current) return;
    violationInFlightRef.current = true;
    const latestAnswers = Object.entries(answersRef.current).map(([question_id, selected_key]) => ({ question_id, selected_key }));
    try {
      const response = await courseService.reportExamViolation(id, attempt.attempt_id, event, latestAnswers);
      const violation = response.data ?? response;
      if (violation.auto_submitted && violation.result) {
        setSubmitting(true);
        await finishSubmission(violation.result);
        setSubmitting(false);
      } else if (typeof violation.violation_count === "number") {
        showToast(`Peringatan ${violation.violation_count}/${violation.max_violations}: jangan meninggalkan ujian.`, "error");
      }
    } catch {
      showToast("Pelanggaran ujian gagal dicatat ke server. Periksa koneksi internet.", "error");
    } finally {
      violationInFlightRef.current = false;
    }
  };

  useEffect(() => {
    const locked = phase === "doing" && exam?.mode === "locked";
    if (!locked) return;

    const handleWindowBlur = () => {
      void reportViolation("blur");
    };

    window.addEventListener("blur", handleWindowBlur);
    return () => window.removeEventListener("blur", handleWindowBlur);
  }, [exam?.mode, phase]);

  useEffect(() => {
    const locked = phase === "doing" && exam?.mode === "locked";
    if (!locked) {
      return;
    }

    const handleVisibilityChange = () => {
      if (!document.hidden || submitting) return;
      void reportViolation("visibility_hidden");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [exam?.mode, phase, submitting]);

  const reenterFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen?.();
      setFullscreenLost(false);
      hideToast();
    } catch {
      showToast("Klik tombol ini dari halaman ujian untuk mengaktifkan fullscreen.", "error");
    }
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const completedAttempts = history.filter((a) => a.submitted_at !== null);
  const bestScore = completedAttempts.length > 0 ? Math.max(...completedAttempts.map((a) => a.score ?? 0)) : null;

  if (loading) {
    return (
      <DashboardLayout searchPlaceholder="Cari ujian...">
        <div className="flex justify-center py-32">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-white border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  if (!exam) {
    return (
      <DashboardLayout searchPlaceholder="Cari ujian...">
        <main className="mx-auto max-w-3xl px-4 py-8">
          <div className="rounded-3xl bg-white p-8 text-center text-sm text-slate-500">
            {error || "Ujian tidak ditemukan."}
          </div>
        </main>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      searchPlaceholder="Cari ujian..."
      navigationLocked={phase === "doing" && exam.mode === "locked"}
    >
      <main className="mx-auto max-w-3xl px-4 py-4 md:px-8 md:py-6 space-y-4">
        {phase === "doing" && exam.mode === "locked" && fullscreenLost && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#00172e]/95 p-6 text-center">
            <div className="max-w-md rounded-3xl bg-white p-8 shadow-2xl">
              <h2 className="text-xl font-extrabold text-[#00172e]">Ujian Terkunci</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-500">
                Kamu keluar dari fullscreen. Soal tidak dapat dilanjutkan sebelum fullscreen diaktifkan kembali.
              </p>
              <button
                type="button"
                onClick={reenterFullscreen}
                className="mt-6 rounded-full bg-[#008be3] px-6 py-3 text-sm font-bold text-white hover:bg-[#0078c8]"
              >
                Kembali ke Fullscreen
              </button>
            </div>
          </div>
        )}
        <Link
          href={returnTo || "/pelajar/my-courses"}
          onClick={(event) => {
            if (phase === "doing" && exam.mode === "locked") {
              event.preventDefault();
              event.stopPropagation();
            }
          }}
          aria-disabled={phase === "doing" && exam.mode === "locked"}
          className="inline-flex items-center gap-1 text-sm font-bold text-white/90 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke My Courses
        </Link>

        {/* ── PHASE: INFO ───────────────────────────────── */}
        {phase === "info" && (
          <section className="rounded-3xl bg-white p-6 shadow-lg md:p-8 space-y-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50">
              <Trophy className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-[#00172e] md:text-2xl">{exam.title}</h1>
              <p className="mt-1 text-sm text-slate-500">
                Baca instruksi di bawah sebelum memulai ujian.
              </p>
            </div>

             <div className={`rounded-2xl p-4 text-sm ${exam.mode === "locked" ? "bg-amber-50 text-amber-800" : "bg-blue-50 text-blue-800"}`}>
               {exam.mode === "locked" ? "Mode ujian terkunci: layar akan dikunci selama pengerjaan." : "Mode quiz: kamu dapat mengerjakan tanpa fullscreen."}
             </div>

             <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: "Batas Waktu", value: `${Math.ceil(exam.time_limit_sec / 60)} menit`, icon: <Clock className="h-4 w-4 text-[#008be3]" /> },
                { label: "Nilai Lulus", value: `${exam.passing_score}%`, icon: <Trophy className="h-4 w-4 text-amber-500" /> },
                { label: "Max Percobaan", value: `${exam.max_attempts}x`, icon: <CheckCircle className="h-4 w-4 text-green-500" /> },
                { label: "Hadiah", value: `${exam.pearls_reward} 🪸`, icon: null },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl bg-slate-50 p-4">
                  {item.icon && <div className="mb-2">{item.icon}</div>}
                  <p className="text-xs text-slate-400">{item.label}</p>
                  <p className="font-extrabold text-[#00172e]">{item.value}</p>
                </div>
              ))}
            </div>

            {completedAttempts.length > 0 && (
              <div className="rounded-2xl bg-blue-50 p-4 text-sm text-[#00172e]">
                <p className="font-bold">Riwayat Percobaan</p>
                <p className="text-slate-500 text-xs mt-0.5">
                  Sudah {completedAttempts.length}x mencoba · Nilai terbaik:{" "}
                  <span className="font-bold text-[#008be3]">{bestScore}%</span>
                </p>
              </div>
            )}

            {error && (
              <p className="rounded-xl bg-red-50 p-3 text-xs text-red-500">{error}</p>
            )}

            <button
              onClick={startExam}
              disabled={starting || completedAttempts.length >= exam.max_attempts}
              className="rounded-full bg-[#008be3] px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#0078c8] disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              {starting ? "Memulai..." : completedAttempts.length >= exam.max_attempts ? "Batas Percobaan Habis" : "Mulai Ujian"}
            </button>
          </section>
        )}

        {/* ── PHASE: MAXED ──────────────────────────────── */}
        {phase === "maxed" && (
          <section className="rounded-3xl bg-white p-8 shadow-lg text-center space-y-4">
            <XCircle className="mx-auto h-12 w-12 text-red-400" />
            <h2 className="text-lg font-extrabold text-[#00172e]">Batas Percobaan Habis</h2>
            <p className="text-sm text-slate-500">
              Anda telah mencapai batas maksimal {exam.max_attempts} percobaan untuk ujian ini.
            </p>
            {bestScore !== null && (
              <p className="text-sm">
                Nilai terbaik Anda:{" "}
                <span className={`font-bold ${bestScore >= exam.passing_score ? "text-green-500" : "text-red-400"}`}>
                  {bestScore}%
                </span>
              </p>
            )}
          </section>
        )}

        {/* ── PHASE: DOING ──────────────────────────────── */}
        {phase === "doing" && attempt && (
          <section className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl bg-white px-5 py-3 shadow">
              <p className="font-bold text-[#00172e] text-sm">{attempt.exam.title}</p>
              <div className={`flex items-center gap-1.5 font-mono font-bold text-sm ${timeLeft < 60 ? "text-red-500" : "text-[#008be3]"}`}>
                <Clock className="h-4 w-4" />
                {formatTime(timeLeft)}
              </div>
            </div>

            <div className="text-xs text-white/80 text-right">
              {Object.keys(answers).length} / {attempt.questions.length} soal terjawab
            </div>

            {attempt.questions.map((q: ExamQuestion, idx: number) => (
              <div key={q.id} className="rounded-3xl bg-white p-5 shadow space-y-3">
                <div className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#008be3] text-xs font-bold text-white">
                    {idx + 1}
                  </span>
                  <p className="text-sm font-semibold text-[#00172e] leading-snug pt-0.5">
                    {q.question_text}
                  </p>
                </div>
                <div className="space-y-2 pl-10">
                  {(Array.isArray(q.options) ? q.options : []).map((opt: any, oIdx: number) => {
                    const optionText = typeof opt === "string" ? opt : opt?.value ?? opt?.text ?? String(opt);
                    const optionKey = typeof opt === "string" ? opt : opt?.key ?? opt?.value ?? String(opt);
                    const label = String.fromCharCode(65 + oIdx);
                    const selected = answers[q.id] === optionKey;
                    return (
                      <button
                        key={oIdx}
                        type="button"
                        onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: optionKey }))}
                        className={`w-full text-left rounded-xl border px-4 py-2.5 text-sm transition-colors cursor-pointer ${
                          selected
                            ? "border-[#008be3] bg-[#f0f7ff] font-semibold text-[#008be3] ring-1 ring-[#008be3]"
                            : "border-slate-200 bg-slate-50 text-slate-700 hover:border-[#008be3]/40 hover:bg-blue-50"
                        }`}
                      >
                        <span className="font-bold mr-2">{label}.</span>
                        {optionText}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {error && (
              <p className="rounded-xl bg-red-50 p-3 text-xs text-red-500">{error}</p>
            )}

            <div className="flex justify-end pb-6">
              <button
                onClick={() => handleSubmit(false)}
                disabled={submitting}
                className="rounded-full bg-[#008be3] px-8 py-3 text-sm font-bold text-white transition-colors hover:bg-[#0078c8] disabled:bg-slate-300"
              >
                {submitting ? "Mengirim..." : "Kirim Jawaban"}
              </button>
            </div>
          </section>
        )}

        {/* ── PHASE: RESULT ─────────────────────────────── */}
        {phase === "result" && result && exam && (
          <section className="space-y-4">
            <div className={`rounded-3xl p-6 shadow-lg text-center space-y-2 ${result.passed ? "bg-green-50" : "bg-red-50"}`}>
              {result.passed ? (
                <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
              ) : (
                <XCircle className="mx-auto h-12 w-12 text-red-400" />
              )}
              <h2 className="text-xl font-extrabold text-[#00172e]">
                {result.passed ? "Selamat, Anda Lulus!" : "Belum Lulus"}
              </h2>
              <p className="text-3xl font-black text-[#008be3]">{result.score.toFixed(0)}%</p>
              <p className="text-xs text-slate-500">
                Nilai kelulusan: {result.passing_score}% · {result.correct_count}/{result.total_count} benar
              </p>
              {result.passed && (
                <p className="text-sm font-semibold text-green-600">
                  +{result.xp_earned} XP · +{result.pearls_earned} 🪸 mutiara
                </p>
              )}
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-lg space-y-3">
              <h3 className="font-extrabold text-[#00172e]">Review Jawaban</h3>
              {result.results.map((r, idx) => (
                <div
                  key={r.question_id}
                  className={`rounded-2xl border p-4 text-sm space-y-1 ${r.is_correct ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
                >
                  <div className="flex items-start gap-2">
                    {r.is_correct ? (
                      <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                    )}
                    <p className="font-semibold text-[#00172e]">Soal {idx + 1}</p>
                  </div>
                  <p className="pl-6 text-xs text-slate-600">
                    Jawaban Anda: <span className="font-bold">{r.your_answer}</span>
                    {!r.is_correct && (
                      <> · Jawaban benar: <span className="font-bold text-green-600">{r.correct_answer}</span></>
                    )}
                  </p>
                  {r.explanation && (
                    <p className="pl-6 text-xs text-slate-400 italic">{r.explanation}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-3 pb-6">
              {completedAttempts.length < exam.max_attempts && (
                <button
                  onClick={() => { setPhase("info"); setResult(null); setError(""); }}
                  className="rounded-full border border-[#008be3] px-5 py-2.5 text-sm font-bold text-[#008be3] hover:bg-blue-50"
                >
                  Coba Lagi
                </button>
              )}
              <Link
                href={resultReturnHref}
                className="rounded-full bg-[#008be3] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0078c8]"
              >
                Kembali ke Lesson
              </Link>
            </div>
          </section>
        )}
      </main>
      <PageToast toast={toast} onClose={hideToast} />
    </DashboardLayout>
  );
}
