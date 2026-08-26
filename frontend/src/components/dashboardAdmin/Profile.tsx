"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BarChart3, BookOpen, ClipboardList, FolderTree, LogOut, Shield, UserRound, Users } from "lucide-react";
import { useCurrentUser, clearUserCache } from "@/hooks/useCurrentUser";
import { useAdmin } from "./AdminContext";
import EditProfileForm from "@/components/ui/EditProfileForm";

export default function AdminProfileComponent() {
  const { user, loading } = useCurrentUser();
  const { courses, users, registrations, analytics } = useAdmin();
  const router = useRouter();
  const [imgError, setImgError] = useState(false);
  const logout = () => { clearUserCache(); localStorage.removeItem("token"); localStorage.removeItem("user"); router.replace("/auth/login"); };
  const initial = (user?.full_name || user?.username || "A").charAt(0).toUpperCase();
  const systemStats = [
    ["Total Pengguna", analytics?.users.total ?? users.length, Users],
    ["Pengguna Aktif", analytics?.users.active ?? users.filter((item) => item.status === "Aktif").length, Shield],
    ["Total Student", analytics?.users.students ?? 0, UserRound],
    ["Total Instructor", analytics?.users.instructors ?? 0, UserRound],
    ["Total Course", analytics?.courses.total ?? courses.length, BookOpen],
    ["Course Terbit", analytics?.courses.published ?? courses.filter((item) => item.status === "published").length, ClipboardList],
    ["Course Draft", analytics?.courses.draft ?? courses.filter((item) => item.status === "draft").length, FolderTree],
    ["Pendaftaran", analytics?.enrollments.total ?? registrations.length, BarChart3],
    ["Percobaan Ujian", analytics?.exams.total_attempts ?? 0, ClipboardList],
  ] as const;
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-4 md:px-8 md:py-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-white"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-white/60">Account center</p><h1 className="text-2xl font-extrabold">Pengaturan Admin</h1></div><Link href="/admin" className="rounded-full bg-white/15 px-4 py-2 text-xs font-bold hover:bg-white/25">Kembali ke Profil</Link></div>
      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <section className="rounded-3xl bg-white p-5 shadow-xl md:p-7">{loading && !user ? <p className="py-10 text-center text-sm text-slate-500">Memuat profil...</p> : <><div className="flex flex-wrap items-center gap-4 border-b border-slate-100 pb-5"><div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-tr from-slate-800 to-blue-600 text-3xl font-extrabold text-white">{user?.avatar_url && !imgError ? <img src={user.avatar_url} alt={user.full_name} onError={() => setImgError(true)} className="h-full w-full object-cover" /> : initial}</div><div><h2 className="text-xl font-extrabold text-[#00172e]">{user?.full_name || "Admin EduWave"}</h2><p className="text-sm text-blue-600">@{user?.username || "admin"}</p><div className="mt-2 flex gap-2 text-[11px] font-bold"><span className="rounded-full bg-indigo-50 px-3 py-1 text-indigo-700">Role: Administrator</span><span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">{user?.is_active === false ? "Nonaktif" : "Aktif"}</span></div></div></div><div className="mt-4 flex items-center gap-2 text-xs text-slate-500"><UserRound className="h-4 w-4" /> Bergabung {user?.created_at ? new Date(user.created_at).toLocaleDateString("id-ID") : "-"}</div><div className="mt-4"><EditProfileForm /></div></>}</section>
        <section className="rounded-3xl bg-white p-5 shadow-xl md:p-6"><div className="mb-4 flex items-center gap-2"><Shield className="h-5 w-5 text-blue-600" /><h2 className="font-extrabold text-[#00172e]">Keamanan Akun</h2></div><p className="text-xs leading-relaxed text-slate-500">Akun admin hanya memiliki satu sesi aktif. Perubahan password akan mengakhiri sesi login sebelumnya.</p><button onClick={logout} className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-red-50 px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-100"><LogOut className="h-4 w-4" /> Keluar</button><div className="mt-6 rounded-2xl bg-slate-50 p-4 text-xs text-slate-500"><p className="font-bold text-slate-700">Informasi Sistem</p><p className="mt-2">Aplikasi: EduWave</p><p>Role akun: Administrator</p><p>Status sistem: Aktif</p><p>Versi: {process.env.NEXT_PUBLIC_APP_VERSION || "Web"}</p></div></section>
      </div>
      <section className="mt-6 rounded-3xl bg-white p-5 shadow-xl md:p-7"><h2 className="mb-4 text-lg font-extrabold text-[#00172e]">Ringkasan Sistem</h2><div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">{systemStats.map(([label, value, Icon]) => <div key={label} className="rounded-2xl bg-slate-50 p-4"><Icon className="mb-3 h-5 w-5 text-blue-600" /><p className="text-xs text-slate-400">{label}</p><p className="mt-1 text-2xl font-black text-[#00172e]">{value}</p></div>)}</div></section>
      <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><Link href="/admin/pengguna" className="rounded-2xl bg-white p-4 font-bold text-[#00172e] shadow-lg"><Users className="mb-3 text-blue-600" />Kelola Pengguna</Link><Link href="/admin/course" className="rounded-2xl bg-white p-4 font-bold text-[#00172e] shadow-lg"><BookOpen className="mb-3 text-blue-600" />Kelola Kursus</Link><Link href="/admin/exam" className="rounded-2xl bg-white p-4 font-bold text-[#00172e] shadow-lg"><ClipboardList className="mb-3 text-amber-500" />Kelola Ujian</Link><Link href="/admin/kategori" className="rounded-2xl bg-white p-4 font-bold text-[#00172e] shadow-lg"><FolderTree className="mb-3 text-emerald-600" />Kelola Kategori</Link><Link href="/admin/pendaftaran" className="rounded-2xl bg-white p-4 font-bold text-[#00172e] shadow-lg"><BarChart3 className="mb-3 text-blue-600" />Lihat Pendaftaran</Link><Link href="/admin" className="rounded-2xl bg-white p-4 font-bold text-[#00172e] shadow-lg"><BarChart3 className="mb-3 text-indigo-600" />Dashboard Analytics</Link></section>
    </main>
  );
}
