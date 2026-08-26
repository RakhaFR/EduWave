"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BarChart3, BookOpen, CheckCircle2, LogOut, Settings2, Shield, Trophy, UserRound, Users, X } from "lucide-react";
import { useCurrentUser, clearUserCache } from "@/hooks/useCurrentUser";
import { usePembimbing } from "./PembimbingContext";
import EditProfileForm from "@/components/ui/EditProfileForm";

export default function PembimbingProfileComponent() {
  const { user, loading } = useCurrentUser();
  const { courses, exams } = usePembimbing();
  const router = useRouter();
  const [compact, setCompact] = useState(false);
  const [confirmCourseDelete, setConfirmCourseDelete] = useState(true);
  const [confirmQuestionDelete, setConfirmQuestionDelete] = useState(true);
  const [imgError, setImgError] = useState(false);

  const logout = () => {
    clearUserCache();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.replace("/auth/login");
  };
  const initial = (user?.full_name || user?.username || "P").charAt(0).toUpperCase();
  const published = courses.filter((course) => course.status === "published").length;
  const drafts = courses.filter((course) => course.status === "draft").length;
  const students = courses.reduce((total, course) => total + (course.enrolled_count || 0), 0);
  const stats = [
    ["Total Kursus", courses.length, BookOpen],
    ["Kursus Terbit", published, CheckCircle2],
    ["Kursus Draft", drafts, Settings2],
    ["Siswa Terdaftar", students, Users],
    ["Total Ujian", exams.length, Trophy],
  ] as const;

  return (
    <main className={`px-4 md:px-8 py-4 md:py-6 max-w-6xl mx-auto w-full ${compact ? "text-sm" : ""}`}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-white">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/60">Account center</p>
          <h1 className="text-2xl font-extrabold">Pengaturan Instructor</h1>
        </div>
        <Link href="/pembimbing" className="rounded-full bg-white/15 px-4 py-2 text-xs font-bold hover:bg-white/25">Kembali ke Profil</Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <section className="rounded-3xl bg-white p-5 shadow-xl md:p-7">
          {loading && !user ? <p className="py-10 text-center text-sm text-slate-500">Memuat profil...</p> : (
            <>
              <div className="flex flex-wrap items-center gap-4 border-b border-slate-100 pb-5">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-tr from-[#003d7a] to-[#0073e6] text-3xl font-extrabold text-white">
                  {user?.avatar_url && !imgError ? <img src={user.avatar_url} alt={user.full_name} onError={() => setImgError(true)} className="h-full w-full object-cover" /> : initial}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-extrabold text-[#00172e]">{user?.full_name || "Pembimbing EduWave"}</h2>
                  <p className="text-sm text-blue-600">@{user?.username || "instructor"}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-bold">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">Role: Instructor</span>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">Akun Aktif</span>
                  </div>
                </div>
              </div>
              <div className="mt-5 flex items-center gap-2 text-xs text-slate-500"><UserRound className="h-4 w-4" /> Bergabung {user?.created_at ? new Date(user.created_at).toLocaleDateString("id-ID") : "-"}</div>
              <div className="mt-4"><EditProfileForm /></div>
            </>
          )}
        </section>

        <section className="space-y-6">
          <div className="rounded-3xl bg-white p-5 shadow-xl md:p-6">
            <div className="mb-4 flex items-center gap-2"><Shield className="h-5 w-5 text-blue-600" /><h2 className="font-extrabold text-[#00172e]">Keamanan Akun</h2></div>
            <p className="text-xs leading-relaxed text-slate-500">Password minimal 8 karakter. Perubahan password dapat mengakhiri sesi login sebelumnya.</p>
            <button onClick={logout} className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-red-50 px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-100"><LogOut className="h-4 w-4" /> Keluar</button>
          </div>
          <div className="rounded-3xl bg-white p-5 shadow-xl md:p-6">
            <div className="mb-4 flex items-center gap-2"><Settings2 className="h-5 w-5 text-blue-600" /><h2 className="font-extrabold text-[#00172e]">Preferensi Tampilan</h2></div>
            <label className="flex items-center justify-between border-b border-slate-100 py-3 text-xs font-semibold text-slate-600"><span>Tampilan ringkas</span><input type="checkbox" checked={compact} onChange={(event) => setCompact(event.target.checked)} className="h-4 w-4 accent-[#008be3]" /></label>
            <label className="flex items-center justify-between border-b border-slate-100 py-3 text-xs font-semibold text-slate-600"><span>Konfirmasi hapus course</span><input type="checkbox" checked={confirmCourseDelete} onChange={(event) => setConfirmCourseDelete(event.target.checked)} className="h-4 w-4 accent-[#008be3]" /></label>
            <label className="flex items-center justify-between py-3 text-xs font-semibold text-slate-600"><span>Konfirmasi hapus soal</span><input type="checkbox" checked={confirmQuestionDelete} onChange={(event) => setConfirmQuestionDelete(event.target.checked)} className="h-4 w-4 accent-[#008be3]" /></label>
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-3xl bg-white p-5 shadow-xl md:p-7">
        <h2 className="mb-4 text-lg font-extrabold text-[#00172e]">Ringkasan Aktivitas Mengajar</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">{stats.map(([label, value, Icon]) => <div key={label} className="rounded-2xl bg-slate-50 p-4"><Icon className="mb-3 h-5 w-5 text-blue-600" /><p className="text-xs text-slate-400">{label}</p><p className="mt-1 text-2xl font-black text-[#00172e]">{value}</p></div>)}</div>
      </section>

      <section className="mt-6 grid gap-3 sm:grid-cols-3">
        <Link href="/pembimbing/course" className="rounded-2xl bg-white p-4 font-bold text-[#00172e] shadow-lg hover:-translate-y-0.5"><BookOpen className="mb-3 text-blue-600" />Kelola Kursus</Link>
        <Link href="/pembimbing/exam" className="rounded-2xl bg-white p-4 font-bold text-[#00172e] shadow-lg hover:-translate-y-0.5"><Trophy className="mb-3 text-amber-500" />Kelola Ujian</Link>
        <Link href="/pembimbing" className="rounded-2xl bg-white p-4 font-bold text-[#00172e] shadow-lg hover:-translate-y-0.5"><BarChart3 className="mb-3 text-emerald-600" />Lihat Profil Publik</Link>
      </section>
    </main>
  );
}
