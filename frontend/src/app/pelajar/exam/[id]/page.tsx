"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Clock, Trophy } from "lucide-react";
import DashboardLayout from "@/components/dashboardPelajar/DashboardLayout";
import { courseService, Exam } from "@/services/courseService";

export default function PelajarExamPage() {
  const { id } = useParams<{ id: string }>();
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadExam() {
      try {
        const response = await courseService.getExamById(id);
        setExam(response.data || null);
      } catch {
        setMessage("Ujian tidak dapat dimuat.");
      } finally {
        setLoading(false);
      }
    }

    if (id) loadExam();
  }, [id]);

  const startExam = async () => {
    setStarting(true);
    setMessage("");
    try {
      await courseService.startExamAttempt(id);
      setMessage("Ujian berhasil dimulai. Fitur pengerjaan soal akan tersedia di halaman ini.");
    } catch {
      setMessage("Ujian tidak dapat dimulai. Periksa batas percobaan dan akses kursus Anda.");
    } finally {
      setStarting(false);
    }
  };

  return (
    <DashboardLayout searchPlaceholder="Cari ujian...">
      <main className="mx-auto max-w-3xl px-4 py-4 md:px-8 md:py-6">
        <Link href="/pelajar/my-courses" className="mb-5 inline-flex items-center gap-1 text-sm font-bold text-white/90 hover:text-white"><ArrowLeft className="w-4 h-4" />Kembali ke My Courses</Link>
        {loading ? (
          <div className="flex justify-center py-20"><div className="h-10 w-10 animate-spin rounded-full border-4 border-white border-t-transparent" /></div>
        ) : exam ? (
          <section className="rounded-3xl bg-white p-6 shadow-lg md:p-8">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50"><Trophy className="h-6 w-6 text-amber-500" /></div>
            <h1 className="text-xl font-extrabold text-[#00172e] md:text-2xl">{exam.title}</h1>
            <p className="mt-2 text-sm text-slate-500">Selesaikan lesson terkait terlebih dahulu, kemudian mulai ujian ini.</p>
            <div className="my-6 grid grid-cols-2 gap-3 text-sm"><div className="rounded-2xl bg-slate-50 p-4"><Clock className="mb-2 h-4 w-4 text-[#008be3]" /><p className="text-xs text-slate-400">Batas Waktu</p><p className="font-extrabold text-[#00172e]">{Math.ceil(exam.time_limit_sec / 60)} menit</p></div><div className="rounded-2xl bg-slate-50 p-4"><Trophy className="mb-2 h-4 w-4 text-amber-500" /><p className="text-xs text-slate-400">Nilai Kelulusan</p><p className="font-extrabold text-[#00172e]">{exam.passing_score}%</p></div></div>
            <p className="mb-5 text-xs text-slate-400">Maksimal {exam.max_attempts} percobaan · Hadiah {exam.pearls_reward} mutiara</p>
            <button onClick={startExam} disabled={starting} className="rounded-full bg-[#008be3] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#0078c8] disabled:bg-slate-300">{starting ? "Memulai..." : "Mulai Ujian"}</button>
            {message && <p className="mt-4 rounded-xl bg-[#f0f7ff] p-3 text-xs text-[#008be3]">{message}</p>}
          </section>
        ) : <div className="rounded-3xl bg-white p-8 text-center text-sm text-slate-500">{message || "Ujian tidak ditemukan."}</div>}
      </main>
    </DashboardLayout>
  );
}
