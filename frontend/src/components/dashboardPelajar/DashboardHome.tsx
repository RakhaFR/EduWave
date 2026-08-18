"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronRight, Trash2, Trophy,
  Flame, Target, Calendar, BookOpen
} from "lucide-react";
import DashboardLayout from "@/components/dashboardPelajar/DashboardLayout";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { courseService, Course } from "@/services/courseService";

const LEADERBOARD = [
  { rank: 4, name: "Rasya Raya Agung", xp: 3200, me: true  },
  { rank: 5, name: "Dina Fitriani",    xp: 3100, me: false },
  { rank: 6, name: "Ariel Saputra",    xp: 2900, me: false },
  { rank: 7, name: "Sekar Ayu",        xp: 2750, me: false },
];

const TOP3 = [
  { rank: 2, name: "Budi S",  color: "bg-slate-300",  textColor: "text-slate-600", h: "h-10" },
  { rank: 1, name: "Citra M", color: "bg-amber-300",  textColor: "text-amber-800", h: "h-16" },
  { rank: 3, name: "Doni A",  color: "bg-orange-200", textColor: "text-orange-700", h: "h-8"  },
];

const formatNumber = (num: number) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export default function DashboardHome() {
  const { user } = useCurrentUser();
  const displayName = user?.full_name || user?.username || "Penyelam EduWave";

  const [myCourses, setMyCourses] = useState<(Course & { progress_pct: number })[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  // Dynamic XP progress percentage (target level 1000 XP)
  const xpVal = user?.xp ?? 0;
  const xpPct = Math.min(100, Math.max(0, Math.round((xpVal % 1000) / 10)));

  useEffect(() => {
    async function loadMyCourses() {
      setLoadingCourses(true);
      try {
        const res = await courseService.getAllCourses();
        if (res.success && res.data) {
          const list: (Course & { progress_pct: number })[] = [];
          for (const c of res.data) {
            try {
              const p = await courseService.getCourseProgress(c.id);
              if (p.success && p.data?.enrollment) {
                list.push({ ...c, progress_pct: p.data.enrollment.progress_pct || 0 });
              }
            } catch (e) {
              // Not enrolled
            }
          }
          setMyCourses(list);
        }
      } catch (err) {
        console.error("Gagal memuat kursus pengguna:", err);
      } finally {
        setLoadingCourses(false);
      }
    }
    loadMyCourses();
  }, []);

  const completedCount = myCourses.filter((c) => c.progress_pct >= 100).length;

  return (
    <DashboardLayout searchPlaceholder="Search...">
      <main className="px-4 md:px-8 py-4 md:py-6 flex flex-col gap-6">

        {/* Welcome banner */}
        <div className="relative rounded-3xl bg-white overflow-hidden px-6 md:px-8 py-6 md:py-8 flex items-center justify-between w-full shadow-lg">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-3xl bg-gradient-to-b from-[#42AEED] to-[#0063A7]" />
          <div className="absolute top-4 right-48 opacity-[0.07] pointer-events-none select-none hidden md:block"
            style={{ width: 120, height: 80, backgroundImage: "radial-gradient(circle, #008be3 1.5px, transparent 1.5px)", backgroundSize: "14px 14px" }} />
          <div className="flex-1 pl-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-[#008be3] animate-pulse" />
              <p className="text-xs font-semibold tracking-widest text-[#008be3] uppercase">Selamat Datang</p>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#00172e] mb-4 md:mb-5">
              Halo, <span className="text-[#008be3]">{displayName}</span>
            </h1>
            <Link href="/pelajar/all-course"
              className="inline-flex items-center gap-2 rounded-xl bg-[#008be3] px-5 py-2 md:px-6 md:py-2.5 text-sm font-bold text-white hover:bg-[#0078c8] transition-colors shadow-md shadow-[#008be3]/30">
              Mulai Belajar <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 shrink-0 ml-4">
            <Image src="/quli-maskot.webp" alt="Quli" fill className="object-contain drop-shadow-lg" sizes="160px" />
          </div>
        </div>

        {/* Baris bawah */}
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Kursus saya */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white">Kursus Saya</h2>
              <Link href="/pelajar/my-courses" className="text-xs text-white/80 font-semibold hover:underline flex items-center gap-1">
                Lihat Semua <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {loadingCourses ? (
              <div className="bg-white rounded-2xl p-8 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-[#008be3] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : myCourses.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
                <BookOpen className="w-10 h-10 text-[#008be3] mx-auto mb-2 opacity-50" />
                <p className="text-xs font-semibold text-slate-600 mb-3">Anda belum mengikuti kursus apapun.</p>
                <Link
                  href="/pelajar/all-course"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#008be3] px-4 py-2 rounded-xl hover:bg-[#0078c8] transition-colors"
                >
                  Jelajahi All Course <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {myCourses.map((course) => (
                  <Link key={course.id} href={`/course/${course.id}`}
                    className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col">
                    <div className="relative h-32 md:h-36 bg-[#c9e8ff]">
                      <img
                        src={course.thumbnail_url || "/ocean-bg.jpg"}
                        alt={course.title}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = "/ocean-bg.jpg"; }}
                      />
                    </div>
                    <div className="p-3 flex flex-col flex-1">
                      <p className="text-xs font-bold text-[#00172e] line-clamp-2 mb-0.5 min-h-[2.5rem]">{course.title}</p>
                      <p className="text-[10px] text-slate-400 mb-2">{course.instructor?.full_name || "Instruktur EduWave"}</p>
                      <div className="mt-auto">
                        <div className="h-1.5 rounded-full bg-slate-100 mb-1">
                          <div className="h-1.5 rounded-full bg-green-400" style={{ width: `${course.progress_pct}%` }} />
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[10px] text-green-500 font-semibold">Progres {Math.round(course.progress_pct)}%</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right widget */}
          <div className="w-full lg:w-64 shrink-0 flex flex-col gap-4">

            {/* XP Card */}
            <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">XP Kamu</p>
                <span className="text-[10px] font-bold bg-[#008be3]/10 text-[#008be3] px-2 py-0.5 rounded-full">
                  Lv.{user?.level ?? 1} · Penyelam
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 shrink-0 flex items-center justify-center">
                  <img src="/pearl.webp" alt="Mutiara" className="w-full h-full object-contain drop-shadow-md" />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-[#008be3] leading-none">{formatNumber(user?.pearls ?? 0)}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Mutiara terkumpul</p>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-slate-400">XP Selesai</span>
                  <span className="text-[10px] font-semibold text-[#008be3]">{formatNumber(xpVal)} XP</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-[#008be3] to-cyan-400 transition-all duration-500"
                    style={{ width: `${xpPct}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-orange-50 border border-orange-100 px-3 py-2">
                <Flame className="w-4 h-4 text-orange-500 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-orange-500">{user?.streak_days ?? 0} Hari Berturut-turut</p>
                  <p className="text-[10px] text-orange-400">Pertahankan streak belajarmu!</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 rounded-xl bg-[#f0f7ff] px-3 py-2">
                  <Target className="w-4 h-4 text-[#008be3] shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400">Kursus Selesai</p>
                    <p className="text-xs font-extrabold text-[#00172e]">{completedCount} / {myCourses.length}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-[#f0f7ff] px-3 py-2">
                  <Calendar className="w-4 h-4 text-[#008be3] shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400">Jam Belajar</p>
                    <p className="text-xs font-extrabold text-[#00172e]">24 Jam</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Leaderboard */}
            <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col">
              <div className="flex items-center gap-1 mb-3">
                <Trophy className="w-4 h-4 text-amber-400" />
                <p className="text-xs font-bold text-[#00172e]">Top Penyelam</p>
              </div>
              <div className="flex items-end justify-center gap-3 mb-4 h-20">
                {TOP3.map((t) => (
                  <div key={t.rank} className="flex flex-col items-center gap-1">
                    <div className={`w-8 h-8 rounded-full ${t.color} flex items-center justify-center text-xs font-bold ${t.textColor}`}>{t.name[0]}</div>
                    <div className={`w-14 ${t.h} rounded-t-lg ${t.color} flex items-center justify-center`}>
                      <span className={`text-xs font-bold ${t.textColor}`}>{t.rank}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-1.5">
                {LEADERBOARD.map((item) => (
                  <div key={item.rank}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs ${item.me ? "bg-[#f0f7ff]" : "text-slate-600"}`}>
                    <span className="w-4 text-center font-semibold">{item.rank}.</span>
                    <span className="flex-1 truncate">{item.name}</span>
                    <span className="text-[10px] text-slate-400">{formatNumber(item.xp)} XP</span>
                  </div>
                ))}
              </div>
              <Link href="/pelajar/leaderboard" className="mt-3 flex items-center justify-center gap-1 text-xs text-[#008be3] font-semibold hover:underline">
                Lihat semua <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
}
