"use client";

import { useState, useEffect } from "react";
import {
  BarChart2, Trophy, Flame, Target, BookOpen,
  Star, Award, CheckCircle2, Loader2,
} from "lucide-react";
import DashboardLayout from "@/components/dashboardPelajar/DashboardLayout";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { achievementService, Achievement } from "@/services/achievementService";
import { courseService } from "@/services/courseService";

type Tab = "ringkasan" | "kalkulasi" | "pencapaian";

const XP_RULES = [
  { icon: <CheckCircle2 className="w-4 h-4 text-green-500" />, label: "Menyelesaikan Kursus", xp: 500, desc: "Per kursus yang diselesaikan 100%" },
  { icon: <Star className="w-4 h-4 text-amber-400 fill-amber-400" />, label: "Lulus Ujian (≥80%)", xp: 200, desc: "Per ujian dengan nilai minimal 80" },
  { icon: <Flame className="w-4 h-4 text-orange-500" />, label: "Streak Harian", xp: 50, desc: "Per hari belajar berturut-turut" },
  { icon: <BookOpen className="w-4 h-4 text-[#008be3]" />, label: "Menonton Materi Video", xp: 20, desc: "Per video yang ditonton tuntas" },
  { icon: <Award className="w-4 h-4 text-rose-500" />, label: "Bonus Rank Naik", xp: 100, desc: "Setiap kali posisi leaderboard naik" },
];

const formatNumber = (num: number) => {
  return (num || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export default function ReportComponent() {
  const [tab, setTab] = useState<Tab>("ringkasan");
  const { user } = useCurrentUser();
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([]);
  const [myAchievements, setMyAchievements] = useState<Achievement[]>([]);
  const [achLoading, setAchLoading] = useState(true);
  const [totalPearlsFromAch, setTotalPearlsFromAch] = useState(0);

  // Real DB state
  const [myRank, setMyRank] = useState<number | string>("-");
  const [coursesEnrolled, setCoursesEnrolled] = useState(0);
  const [coursesCompleted, setCoursesCompleted] = useState(0);

  useEffect(() => {
    Promise.all([
      achievementService.getAll().catch(() => null),
      achievementService.getMyAchievements().catch(() => null),
      courseService.getMyRank().catch(() => null),
      courseService.getUserCourseProgress().catch(() => null),
    ]).then(([allRes, myRes, rankRes, progressRes]) => {
      if (allRes?.success && allRes.data) setAllAchievements(allRes.data.achievements);
      if (myRes?.success && myRes.data) {
        setMyAchievements(myRes.data.achievements);
        setTotalPearlsFromAch(myRes.data.total_pearls_earned);
      }
      if (rankRes?.data?.user_rank) {
        setMyRank(rankRes.data.user_rank);
      }
      if (progressRes?.success && progressRes.data?.enrollments) {
        const enrollments = progressRes.data.enrollments;
        setCoursesEnrolled(enrollments.length);
        const completed = enrollments.filter((e: any) => (e.progress_pct || 0) >= 100).length;
        setCoursesCompleted(completed);
      }
    }).finally(() => setAchLoading(false));
  }, []);

  const userXP = user?.xp || 0;
  const userLevel = user?.level || 1;
  const streakDays = user?.streak_days || 0;
  const pearls = user?.pearls || 0;

  const nextLevelXP = userLevel * 1000;
  const currentLevelBaseXP = (userLevel - 1) * 1000;
  const xpInCurrentLevel = Math.max(0, userXP - currentLevelBaseXP);
  const progressToNext = Math.min(100, Math.max(0, Math.round((xpInCurrentLevel / 1000) * 100)));

  return (
    <DashboardLayout searchPlaceholder="Cari laporan...">
      <main className="px-4 md:px-8 py-4 md:py-6 max-w-4xl mx-auto flex flex-col gap-5">

        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <BarChart2 className="w-5 h-5 text-white" />
            <h1 className="text-xl md:text-2xl font-extrabold text-white">Laporan Belajar</h1>
          </div>
          <p className="text-sm text-white/70">Pantau progres real dan pencapaianmu di EduWave</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 justify-center flex-wrap">
          {(["ringkasan", "kalkulasi", "pencapaian"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all capitalize ${
                tab === t
                  ? "bg-white text-[#008be3] shadow-md"
                  : "bg-white/20 backdrop-blur-sm border border-white/20 text-white hover:bg-white/30"
              }`}
            >
              {t === "ringkasan" ? "Ringkasan" : t === "kalkulasi" ? "Kalkulasi XP" : "Pencapaian"}
            </button>
          ))}
        </div>

        {/* ── TAB: RINGKASAN ── */}
        {tab === "ringkasan" && (
          <div className="flex flex-col gap-4">

            {/* XP Hero Card */}
            <div className="bg-white rounded-3xl p-5 shadow-lg">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total XP Kamu</p>
                  <p className="text-4xl font-extrabold text-[#008be3] leading-none">{formatNumber(userXP)}</p>
                  <p className="text-xs text-slate-400 mt-1.5 font-medium">{pearls} Mutiara terkumpul 🪙</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-1.5 bg-[#f0f7ff] rounded-xl px-3.5 py-2 border border-[#008be3]/20">
                    <Trophy className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="text-sm font-extrabold text-[#00172e]">Rank #{myRank}</span>
                  </div>
                </div>
              </div>

              {/* Level progress */}
              <div className="mb-2">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-[#00172e]">Level {userLevel} · Penyelam</span>
                  <span className="text-xs font-semibold text-[#008be3]">{formatNumber(userXP)} / {formatNumber(nextLevelXP)} XP</span>
                </div>
                <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-[#42AEED] to-[#008be3] transition-all duration-700"
                    style={{ width: `${progressToNext}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1 text-right">Butuh {formatNumber(Math.max(0, nextLevelXP - userXP))} XP lagi ke Level {userLevel + 1}</p>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: <Flame className="w-5 h-5 text-orange-500" />, label: "Streak Belajar", value: `${streakDays} Hari`, sub: "Aktif berturut-turut", bg: "bg-orange-50" },
                { icon: <BookOpen className="w-5 h-5 text-[#008be3]" />, label: "Kursus Diikuti", value: `${coursesCompleted}/${coursesEnrolled}`, sub: "Kursus selesai", bg: "bg-[#f0f7ff]" },
                { icon: <Trophy className="w-5 h-5 text-amber-500" />, label: "Pencapaian", value: `${myAchievements.length}`, sub: `Dari ${allAchievements.length} total`, bg: "bg-amber-50" },
                { icon: <Star className="w-5 h-5 text-purple-500" />, label: "Mutiara Bonus", value: `${totalPearlsFromAch}`, sub: "Dari pencapaian", bg: "bg-purple-50" },
              ].map((s) => (
                <div key={s.label} className={`${s.bg} rounded-2xl p-3.5 flex flex-col gap-1`}>
                  {s.icon}
                  <p className="text-xl font-extrabold text-[#00172e] leading-none mt-1">{s.value}</p>
                  <p className="text-[10px] text-slate-600 font-bold">{s.label}</p>
                  <p className="text-[10px] text-slate-400">{s.sub}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB: KALKULASI XP ── */}
        {tab === "kalkulasi" && (
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-3xl p-5 shadow-lg">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-[#008be3]" />
                <p className="text-sm font-bold text-[#00172e]">Aturan Perhitungan XP Leaderboard</p>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                XP ditentukan secara dinamis dari aktivitas belajar kamu di platform.
              </p>

              {/* Rules */}
              <div className="flex flex-col gap-3">
                {XP_RULES.map((rule) => (
                  <div key={rule.label} className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:border-[#008be3]/20 hover:bg-[#f0f7ff]/50 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                      {rule.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#00172e]">{rule.label}</p>
                      <p className="text-[11px] text-slate-400">{rule.desc}</p>
                    </div>
                    <div className="shrink-0">
                      <span className="text-sm font-extrabold text-[#008be3]">+{rule.xp}</span>
                      <span className="text-[10px] text-slate-400 ml-0.5">XP</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: PENCAPAIAN ── */}
        {tab === "pencapaian" && (
          <div className="flex flex-col gap-4">
            {/* Summary card */}
            <div className="bg-white rounded-3xl p-5 shadow-lg flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shrink-0 shadow-md shadow-amber-200">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wide">Total Pencapaian</p>
                <p className="text-2xl font-extrabold text-[#00172e]">
                  {myAchievements.length}
                  <span className="text-sm font-semibold text-slate-400 ml-1">/ {allAchievements.length}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 font-medium">Mutiara dari pencapaian</p>
                <p className="text-lg font-extrabold text-amber-500">+{totalPearlsFromAch} 🪙</p>
              </div>
            </div>

            {achLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-7 h-7 animate-spin text-white/60" />
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {/* Earned */}
                {myAchievements.length > 0 && (
                  <div className="bg-white rounded-3xl p-5 shadow-lg">
                    <p className="text-sm font-bold text-[#00172e] mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Sudah Diraih ({myAchievements.length})
                    </p>
                    <div className="flex flex-col gap-2">
                      {myAchievements.map((ach) => (
                        <div key={ach.id} className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-100 rounded-2xl">
                          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                            {ach.icon_url ? (
                              <img src={ach.icon_url} alt={ach.name} className="w-7 h-7 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                            ) : (
                              <Trophy className="w-5 h-5 text-amber-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-[#00172e] truncate">{ach.name}</p>
                            <p className="text-[11px] text-slate-500 truncate">{ach.description}</p>
                            {ach.earned_at && (
                              <p className="text-[10px] text-slate-400 mt-0.5">{new Date(ach.earned_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-xs font-bold text-amber-500">+{ach.pearls_reward} 🪙</span>
                            <p className="text-[10px] text-emerald-600 font-bold mt-0.5">✓ Diraih</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Not yet earned */}
                {(() => {
                  const earnedIds = new Set(myAchievements.map((a) => a.id));
                  const notEarned = allAchievements.filter((a) => !earnedIds.has(a.id));
                  if (notEarned.length === 0) return null;
                  return (
                    <div className="bg-white rounded-3xl p-5 shadow-lg">
                      <p className="text-sm font-bold text-[#00172e] mb-3 flex items-center gap-2">
                        <Award className="w-4 h-4 text-slate-400" />
                        Belum Diraih ({notEarned.length})
                      </p>
                      <div className="flex flex-col gap-2">
                        {notEarned.map((ach) => (
                          <div key={ach.id} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 grayscale opacity-50">
                              {ach.icon_url ? (
                                <img src={ach.icon_url} alt={ach.name} className="w-7 h-7 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                              ) : (
                                <Trophy className="w-5 h-5 text-slate-400" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-500 truncate">{ach.name}</p>
                              <p className="text-[11px] text-slate-400 truncate">{ach.description}</p>
                              <p className="text-[10px] text-slate-300 mt-0.5">Target: {ach.condition_value} {ach.condition_type.replace(/_/g, " ")}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-xs font-semibold text-slate-400">+{ach.pearls_reward} 🪙</span>
                              <p className="text-[10px] text-slate-300 font-medium mt-0.5">Belum</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

      </main>
    </DashboardLayout>
  );
}