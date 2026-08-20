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
import { mascotService, InventoryMascot } from "@/services/mascotService";
import { DashboardContentSkeleton } from "@/components/ui/PageSkeleton";

const formatNumber = (num: number) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const QULI_VARIANTS = ["/biru/biru1.webp", "/biru/biru2.webp", "/biru/biru3.webp", "/biru/biru4.webp"];

const getMascotImage = (mascot: InventoryMascot, index: number) =>
  mascot.avatar_url || QULI_VARIANTS[index % QULI_VARIANTS.length];

export default function DashboardHome() {
  const { user } = useCurrentUser();
  const displayName = user?.full_name || user?.username || "Penyelam EduWave";

  const [myCourses, setMyCourses] = useState<(Course & { progress_pct: number })[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [topPenyelam, setTopPenyelam] = useState<{ rank: number; name: string; xp: number; me: boolean; avatarUrl?: string | null }[]>([]);
  const [activeMascot, setActiveMascot] = useState<InventoryMascot | null>(null);
  const [activeMascotIndex, setActiveMascotIndex] = useState(0);

  // Dynamic XP progress percentage (target level 1000 XP)
  const xpVal = user?.xp ?? 0;
  const xpPct = Math.min(100, Math.max(0, Math.round((xpVal % 1000) / 10)));

  useEffect(() => {
    // Check cached active mascot from localStorage first
    try {
      const cached = localStorage.getItem("active_mascot");
      if (cached) {
        const parsed = JSON.parse(cached);
        setActiveMascot(parsed);
      }
    } catch {
      // ignore
    }

    const handleMascotUpdate = () => {
      try {
        const cached = localStorage.getItem("active_mascot");
        if (cached) {
          setActiveMascot(JSON.parse(cached));
        }
      } catch {
        // ignore
      }
    };

    window.addEventListener("active_mascot_updated", handleMascotUpdate);

    async function loadDashboardData() {
      setLoadingCourses(true);
      try {
        const [resCourses, resProgress, resLb, resMascots] = await Promise.all([
          courseService.getAllCourses().catch(() => null),
          courseService.getUserCourseProgress().catch(() => null),
          courseService.getLeaderboard(10).catch(() => null),
          mascotService.getInventory().catch(() => null),
        ]);

        if (resMascots?.success && resMascots.data) {
          const mascots = resMascots.data.mascots;
          const index = mascots.findIndex((mascot) => mascot.is_active);
          const currentActive = index >= 0 ? mascots[index] : null;
          setActiveMascot(currentActive);
          setActiveMascotIndex(index >= 0 ? index : 0);
          if (currentActive) {
            localStorage.setItem("active_mascot", JSON.stringify(currentActive));
          }
        }

        if (resCourses?.success && resCourses.data) {
          const allCourses: Course[] = resCourses.data;
          const enrollments: any[] = resProgress?.success && resProgress.data?.enrollments ? resProgress.data.enrollments : [];

          const list: (Course & { progress_pct: number })[] = [];
          for (const c of allCourses) {
            const enr = enrollments.find((e: any) => e.course_id === c.id);
            if (enr) {
              list.push({ ...c, progress_pct: enr.progress_pct || 0 });
            }
          }
          setMyCourses(list.slice(0, 4));
        }

        const rawLb = resLb?.data?.rankings || resLb?.data || [];
        if (Array.isArray(rawLb) && rawLb.length > 0) {
          const formattedLb = rawLb.map((item: any, idx: number) => {
            const u = item.user || item;
            return {
              rank: item.rank || idx + 1,
              name: u.full_name || u.username || item.full_name || item.name || "Penyelam",
              xp: item.xp !== undefined ? item.xp : item.total_xp || 0,
              me: item.is_me || (user?.id && u.id === user.id) || false,
              avatarUrl: u.avatar_url || item.avatar_url || u.profile_photo_path || null,
            };
          });
          setTopPenyelam(formattedLb);
        }
      } catch (err) {
        console.error("Gagal memuat data dashboard:", err);
      } finally {
        setLoadingCourses(false);
      }
    }
    loadDashboardData();

    return () => {
      window.removeEventListener("active_mascot_updated", handleMascotUpdate);
    };
  }, [user]);

  const completedCount = myCourses.filter((c) => c.progress_pct >= 100).length;

  if (loadingCourses) {
    return <DashboardLayout searchPlaceholder="Search..."><main className="px-4 md:px-8 py-4 md:py-6"><DashboardContentSkeleton /></main></DashboardLayout>;
  }

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
             <Image
               src={activeMascot ? getMascotImage(activeMascot, activeMascotIndex) : "/quli-maskot.webp"}
               alt={activeMascot?.name || "Quli"}
               fill
               className="object-contain drop-shadow-lg"
               sizes="160px"
             />
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

             {myCourses.length === 0 ? (
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

              {topPenyelam.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">Belum ada data penyelam.</p>
              ) : (
                <>
                  <div className="flex items-end justify-center gap-3 mb-4 h-20">
                    {[
                      { pos: 1, color: "bg-slate-300", textColor: "text-slate-600", h: "h-10" },
                      { pos: 0, color: "bg-amber-300", textColor: "text-amber-800", h: "h-16" },
                      { pos: 2, color: "bg-orange-200", textColor: "text-orange-700", h: "h-8" },
                    ].map((cfg) => {
                      const item = topPenyelam[cfg.pos];
                      if (!item) return null;
                      return (
                        <div key={cfg.pos} className="flex flex-col items-center gap-1">
                          <div className={`w-8 h-8 rounded-full overflow-hidden border border-white shadow-sm flex items-center justify-center shrink-0 ${cfg.color}`}>
                            {item.avatarUrl ? (
                              <img src={item.avatarUrl} alt={item.name} className="w-full h-full object-cover" onError={(e) => { (e.currentTarget as HTMLElement).style.display = "none"; }} />
                            ) : (
                              <span className={`text-xs font-bold ${cfg.textColor}`}>{(item.name || "P")[0].toUpperCase()}</span>
                            )}
                          </div>
                          <div className={`w-14 ${cfg.h} rounded-t-lg ${cfg.color} flex items-center justify-center shadow-inner`}>
                            <span className={`text-xs font-bold ${cfg.textColor}`}>{item.rank}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {topPenyelam.slice(3, 7).map((item) => (
                      <div
                        key={item.rank}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs ${
                          item.me ? "bg-[#f0f7ff] font-bold text-[#008be3]" : "text-slate-600"
                        }`}
                      >
                        <span className="w-4 text-center font-semibold">{item.rank}.</span>
                        <div className="w-5 h-5 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center shrink-0">
                          {item.avatarUrl ? (
                            <img src={item.avatarUrl} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[9px] font-bold text-slate-500">{(item.name || "P")[0].toUpperCase()}</span>
                          )}
                        </div>
                        <span className="flex-1 truncate">{item.name}</span>
                        <span className="text-[10px] text-slate-400">{formatNumber(item.xp)} XP</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

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
