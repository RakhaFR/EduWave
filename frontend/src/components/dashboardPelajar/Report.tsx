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
import { CardSkeleton, ListSkeleton } from "@/components/ui/PageSkeleton";

type Tab = "ringkasan" | "kalkulasi" | "pencapaian";

function AchievementIcon({ iconUrl, name, isEarned = true }: { iconUrl?: string | null; name: string; isEarned?: boolean }) {
  const [failed, setFailed] = useState(false);

  if (iconUrl && !failed) {
    return (
      <img
        src={iconUrl}
        alt={name}
        className={`w-7 h-7 object-contain ${!isEarned ? "grayscale opacity-60" : ""}`}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isEarned ? "bg-amber-100 text-amber-600" : "bg-slate-200 text-slate-400"}`}>
      <Trophy className="w-4 h-4" />
    </div>
  );
}

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
  const { user, refetch: refreshUser } = useCurrentUser();
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([]);
  const [myAchievements, setMyAchievements] = useState<Achievement[]>([]);
  const [achLoading, setAchLoading] = useState(true);
  const [totalPearlsFromAch, setTotalPearlsFromAch] = useState(0);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [claimToast, setClaimToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const userXP = user?.xp || 0;
  const userLevel = user?.level || 1;
  const streakDays = user?.streak_days || 0;
  const pearls = user?.pearls || 0;

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
      const allAch = allRes?.success && allRes.data ? allRes.data.achievements : [];
      setAllAchievements(allAch);

      if (myRes?.success && myRes.data) {
        const earned = myRes.data.achievements;
        setMyAchievements(earned);
        setTotalPearlsFromAch(myRes.data.total_pearls_earned ?? 0);
      } else {
        // Fallback: use is_earned flag from catalog
        const earnedFromCatalog = allAch.filter((a) => a.is_earned);
        setMyAchievements(earnedFromCatalog);
        setTotalPearlsFromAch(earnedFromCatalog.reduce((sum, a) => sum + (a.pearls_reward ?? 0), 0));
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

  const handleClaim = async (achievement: Achievement) => {
    setClaimingId(achievement.id);
    try {
      const res = await achievementService.claimAchievement(achievement.id);
      if (res.success && res.data) {
        setClaimToast({ msg: `Berhasil mengklaim "${achievement.name}"! +${res.data.pearls_earned} mutiara`, type: "success" });
        setMyAchievements((prev) => [...prev, res.data!.achievement || achievement]);
        setTotalPearlsFromAch((prev) => prev + (res.data!.pearls_earned || achievement.pearls_reward));
        if (refreshUser) refreshUser();
      } else {
        setClaimToast({ msg: res.error?.message || "Gagal mengklaim pencapaian.", type: "error" });
      }
    } catch (err: any) {
      setClaimToast({ msg: err?.response?.data?.error?.message || "Persyaratan achievement belum terpenuhi.", type: "error" });
    } finally {
      setClaimingId(null);
      setTimeout(() => setClaimToast(null), 3500);
    }
  };

  const nextLevelXP = userLevel * 1000;
  const currentLevelBaseXP = (userLevel - 1) * 1000;
  const xpInCurrentLevel = Math.max(0, userXP - currentLevelBaseXP);
  const progressToNext = Math.min(100, Math.max(0, Math.round((xpInCurrentLevel / 1000) * 100)));

  return (
    <DashboardLayout searchPlaceholder="Cari laporan...">
      {claimToast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-2xl text-sm font-semibold shadow-2xl transition-all animate-bounce ${claimToast.type === "success" ? "bg-emerald-500 text-white ring-4 ring-emerald-300/40" : "bg-red-500 text-white ring-4 ring-red-300/40"}`}>
          {claimToast.msg}
        </div>
      )}
      <main className="w-full max-w-4xl mx-auto px-3 sm:px-5 md:px-8 py-4 md:py-6 flex flex-col gap-4 sm:gap-5">

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

        {achLoading ? (
          <div className="space-y-4"><CardSkeleton className="h-44 bg-white/80" /><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <CardSkeleton key={index} className="h-28 bg-white/80" />)}</div><ListSkeleton count={4} /></div>
        ) : (
          <>
        {/* ── TAB: RINGKASAN ── */}
        {tab === "ringkasan" && (
          <div className="flex flex-col gap-4">

            {/* XP Hero Card */}
            <div className="bg-white rounded-3xl p-5 shadow-lg">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total XP Kamu</p>
                  <p className="text-4xl font-extrabold text-[#008be3] leading-none">{formatNumber(userXP)}</p>
                  <p className="text-xs text-slate-400 mt-1.5 font-medium flex items-center gap-1">
                    <span>{pearls} Mutiara terkumpul</span>
                    <img src="/pearl.webp" alt="Mutiara" className="w-4 h-4 object-contain inline-block" />
                  </p>
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
            <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
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
                <div className="flex items-center justify-end gap-1.5 mt-0.5">
                  <span className="text-lg font-extrabold text-amber-500">+{totalPearlsFromAch}</span>
                  <img src="/pearl.webp" alt="Mutiara" className="w-5 h-5 object-contain inline-block" />
                </div>
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
                          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0 border border-amber-100">
                            <AchievementIcon iconUrl={ach.icon_url} name={ach.name} isEarned={true} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-[#00172e] truncate">{ach.name}</p>
                            <p className="text-[11px] text-slate-500 truncate">{ach.description}</p>
                            {ach.earned_at && (
                              <p className="text-[10px] text-slate-400 mt-0.5">{new Date(ach.earned_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-xs font-bold text-amber-500 inline-flex items-center gap-1">
                              +{ach.pearls_reward}
                              <img src="/pearl.webp" alt="Mutiara" className="w-3.5 h-3.5 object-contain inline-block" />
                            </span>
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
                        {notEarned.map((ach) => {
                          const currentVal = ach.progress?.current ?? 0;
                          const targetVal = ach.progress?.target ?? ach.condition_value ?? 1;
                          const pct = Math.min(100, Math.max(0, Math.round((currentVal / targetVal) * 100)));

                          return (
                            <div key={ach.id} className="flex flex-col gap-2 p-3 bg-slate-50 border border-slate-100 rounded-2xl transition-all hover:bg-slate-100/60">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-200/60 flex items-center justify-center shrink-0">
                                  <AchievementIcon iconUrl={ach.icon_url} name={ach.name} isEarned={false} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold text-slate-700 truncate">{ach.name}</p>
                                  <p className="text-[11px] text-slate-400 truncate">{ach.description}</p>
                                </div>
                                <div className="text-right shrink-0 flex flex-col items-end gap-1">
                                  <span className="text-xs font-bold text-amber-500 inline-flex items-center gap-1">
                                    +{ach.pearls_reward}
                                    <img src="/pearl.webp" alt="Mutiara" className="w-3.5 h-3.5 object-contain inline-block" />
                                  </span>
                                  <button
                                    onClick={() => handleClaim(ach)}
                                    disabled={claimingId === ach.id}
                                    className="px-3 py-1 rounded-full text-xs font-bold bg-[#008be3] text-white hover:bg-[#0078c8] disabled:opacity-50 shadow-sm cursor-pointer transition-all active:scale-95 hover:shadow-md"
                                  >
                                    {claimingId === ach.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Klaim"}
                                  </button>
                                </div>
                              </div>

                              {/* Progress Bar & Value 0/10 */}
                              <div className="mt-1">
                                <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold mb-1">
                                  <span>Progres</span>
                                  <span>{currentVal} / {targetVal}</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-cyan-400 to-[#008be3] rounded-full transition-all duration-500"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}
          </>
        )}

      </main>
    </DashboardLayout>
  );
}