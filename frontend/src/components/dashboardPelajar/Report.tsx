"use client";

import { useState, useEffect } from "react";
import {
  BarChart2, Trophy, Flame, Target, Clock, BookOpen,
  Star, TrendingUp, Award, ChevronUp, CheckCircle2, Minus, Loader2,
} from "lucide-react";
import DashboardLayout from "@/components/dashboardPelajar/DashboardLayout";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { achievementService, Achievement } from "@/services/achievementService";

type Tab = "ringkasan" | "kalkulasi" | "riwayat" | "pencapaian";

// XP calculation constants (sama persis seperti leaderboard)
const XP_RULES = [
  { icon: <CheckCircle2 className="w-4 h-4 text-green-500" />, label: "Menyelesaikan Kursus", xp: 500, desc: "Per kursus yang diselesaikan 100%" },
  { icon: <Star className="w-4 h-4 text-amber-400 fill-amber-400" />, label: "Lulus Ujian (≥80%)", xp: 200, desc: "Per ujian dengan nilai minimal 80" },
  { icon: <Flame className="w-4 h-4 text-orange-500" />, label: "Streak Harian", xp: 50, desc: "Per hari belajar berturut-turut" },
  { icon: <BookOpen className="w-4 h-4 text-[#008be3]" />, label: "Menonton Materi Video", xp: 20, desc: "Per video yang ditonton tuntas" },
  { icon: <Clock className="w-4 h-4 text-purple-500" />, label: "Jam Belajar Aktif", xp: 10, desc: "Per jam sesi belajar aktif" },
  { icon: <Award className="w-4 h-4 text-rose-500" />, label: "Bonus Rank Naik", xp: 100, desc: "Setiap kali posisi leaderboard naik" },
];

const ACTIVITIES = [
  { date: "Hari ini", type: "video", label: "Tonton: Pengenalan React Hooks", xp: 20, icon: <BookOpen className="w-3.5 h-3.5" />, color: "text-[#008be3]" },
  { date: "Hari ini", type: "streak", label: "Streak hari ke-5 🔥", xp: 50, icon: <Flame className="w-3.5 h-3.5" />, color: "text-orange-500" },
  { date: "Kemarin", type: "exam", label: "Ujian: HTML & CSS Dasar — 85/100", xp: 200, icon: <Star className="w-3.5 h-3.5" />, color: "text-amber-500" },
  { date: "Kemarin", type: "video", label: "Tonton: Flexbox Deep Dive", xp: 20, icon: <BookOpen className="w-3.5 h-3.5" />, color: "text-[#008be3]" },
  { date: "2 hari lalu", type: "streak", label: "Streak hari ke-4", xp: 50, icon: <Flame className="w-3.5 h-3.5" />, color: "text-orange-500" },
  { date: "2 hari lalu", type: "video", label: "Tonton: JavaScript ES6 Lanjutan", xp: 20, icon: <BookOpen className="w-3.5 h-3.5" />, color: "text-[#008be3]" },
  { date: "3 hari lalu", type: "rank", label: "Naik ke Rank #4 ⬆️", xp: 100, icon: <TrendingUp className="w-3.5 h-3.5" />, color: "text-emerald-500" },
  { date: "3 hari lalu", type: "course", label: "Selesaikan: Dasar Web Bawah Laut", xp: 500, icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: "text-green-500" },
];

// User stats
const STATS = {
  totalXP: 3200,
  rank: 4,
  prevRank: 6,
  streak: 5,
  coursesCompleted: 2,
  coursesTotal: 4,
  videosWatched: 48,
  studyHours: 24,
  examsPassedCount: 3,
  level: 12,
  levelTitle: "Penyelam Mahir",
  nextLevelXP: 5000,
  weeklyXP: 840,
};

// XP breakdown for pie/bar data
const XP_BREAKDOWN = [
  { label: "Kursus Selesai", xp: 1000, color: "bg-green-400", pct: 31 },
  { label: "Ujian Lulus", xp: 600, color: "bg-amber-400", pct: 19 },
  { label: "Streak Harian", xp: 700, color: "bg-orange-400", pct: 22 },
  { label: "Video Ditonton", xp: 560, color: "bg-[#008be3]", pct: 18 },
  { label: "Bonus Rank", xp: 200, color: "bg-rose-400", pct: 6 },
  { label: "Jam Belajar", xp: 140, color: "bg-purple-400", pct: 4 },
];

const formatNumber = (num: number) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export default function ReportComponent() {
  const [tab, setTab] = useState<Tab>("ringkasan");
  const { user } = useCurrentUser();
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([]);
  const [myAchievements, setMyAchievements] = useState<Achievement[]>([]);
  const [achLoading, setAchLoading] = useState(true);
  const [totalPearlsFromAch, setTotalPearlsFromAch] = useState(0);

  useEffect(() => {
    Promise.all([
      achievementService.getAll(),
      achievementService.getMyAchievements(),
    ]).then(([allRes, myRes]) => {
      if (allRes.success && allRes.data) setAllAchievements(allRes.data.achievements);
      if (myRes.success && myRes.data) {
        setMyAchievements(myRes.data.achievements);
        setTotalPearlsFromAch(myRes.data.total_pearls_earned);
      }
    }).catch(() => {}).finally(() => setAchLoading(false));
  }, []);

  const userXP = user?.xp || 0;
  const userLevel = user?.level || 1;
  const nextLevelXP = userLevel * 1000;
  const currentLevelBaseXP = (userLevel - 1) * 1000;
  const xpInCurrentLevel = userXP - currentLevelBaseXP;
  const progressToNext = Math.min(100, Math.max(0, Math.round((xpInCurrentLevel / 1000) * 100)));
  const rankChange = STATS.prevRank - STATS.rank;

  return (
    <DashboardLayout searchPlaceholder="Cari laporan...">
      <main className="px-4 md:px-8 py-4 md:py-6 max-w-4xl mx-auto flex flex-col gap-5">

        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <BarChart2 className="w-5 h-5 text-white" />
            <h1 className="text-xl md:text-2xl font-extrabold text-white">Laporan Belajar</h1>
          </div>
          <p className="text-sm text-white/70">Pantau progres dan kalkulasi XP leaderboard-mu</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 justify-center flex-wrap">
          {(["ringkasan", "kalkulasi", "riwayat", "pencapaian"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all capitalize ${
                tab === t
                  ? "bg-white text-[#008be3] shadow-md"
                  : "bg-white/20 backdrop-blur-sm border border-white/20 text-white hover:bg-white/30"
              }`}
            >
              {t === "ringkasan" ? "Ringkasan" : t === "kalkulasi" ? "Kalkulasi XP" : t === "riwayat" ? "Riwayat" : "Pencapaian"}
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
                  <p className="text-xs text-slate-400 mt-1">{user?.pearls ?? 0} Mutiara terkumpul</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-1.5 bg-[#f0f7ff] rounded-xl px-3 py-1.5">
                    <Trophy className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="text-sm font-extrabold text-[#00172e]">Rank #{STATS.rank}</span>
                  </div>
                  {rankChange !== 0 && (
                    <div className={`flex items-center gap-1 text-xs font-bold ${rankChange > 0 ? "text-green-500" : "text-red-400"}`}>
                      {rankChange > 0
                        ? <><ChevronUp className="w-3.5 h-3.5" />Naik {rankChange} posisi</>
                        : <><Minus className="w-3.5 h-3.5" />Turun {Math.abs(rankChange)} posisi</>}
                    </div>
                  )}
                </div>
              </div>

              {/* Level progress */}
              <div className="mb-2">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-[#00172e]">Lv.{userLevel} · Penyelam</span>
                  <span className="text-xs font-semibold text-[#008be3]">{formatNumber(userXP)} / {formatNumber(nextLevelXP)} XP</span>
                </div>
                <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-[#42AEED] to-[#008be3] transition-all duration-700"
                    style={{ width: `${progressToNext}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1 text-right">Butuh {formatNumber(Math.max(0, nextLevelXP - userXP))} XP lagi ke Lv.{userLevel + 1}</p>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: <Flame className="w-5 h-5 text-orange-500" />, label: "Streak", value: `${STATS.streak} Hari`, sub: "Berturut-turut", bg: "bg-orange-50" },
                { icon: <BookOpen className="w-5 h-5 text-[#008be3]" />, label: "Kursus", value: `${STATS.coursesCompleted}/${STATS.coursesTotal}`, sub: "Diselesaikan", bg: "bg-[#f0f7ff]" },
                { icon: <Clock className="w-5 h-5 text-purple-500" />, label: "Jam Belajar", value: `${STATS.studyHours}j`, sub: "Total aktif", bg: "bg-purple-50" },
                { icon: <Star className="w-5 h-5 text-amber-400 fill-amber-400" />, label: "Ujian Lulus", value: `${STATS.examsPassedCount}`, sub: "Dengan nilai ≥80", bg: "bg-amber-50" },
              ].map((s) => (
                <div key={s.label} className={`${s.bg} rounded-2xl p-3.5 flex flex-col gap-1`}>
                  {s.icon}
                  <p className="text-xl font-extrabold text-[#00172e] leading-none mt-1">{s.value}</p>
                  <p className="text-[10px] text-slate-500">{s.label}</p>
                  <p className="text-[10px] text-slate-400">{s.sub}</p>
                </div>
              ))}
            </div>

            {/* XP Breakdown Bar */}
            <div className="bg-white rounded-3xl p-5 shadow-lg">
              <p className="text-sm font-bold text-[#00172e] mb-4">Sumber XP</p>
              <div className="flex flex-col gap-3">
                {XP_BREAKDOWN.map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <p className="text-[11px] text-slate-500 w-28 shrink-0">{item.label}</p>
                    <div className="flex-1 h-2.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-2.5 rounded-full ${item.color} transition-all duration-700`}
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-2 w-24 justify-end">
                      <span className="text-[11px] font-bold text-[#00172e]">{formatNumber(item.xp)} XP</span>
                      <span className="text-[10px] text-slate-400">({item.pct}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly XP card */}
            <div className="bg-white rounded-3xl p-5 shadow-lg flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#42AEED] to-[#0063A7] flex items-center justify-center shrink-0">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wide">XP Minggu Ini</p>
                <p className="text-2xl font-extrabold text-[#008be3]">{formatNumber(STATS.weeklyXP)} <span className="text-sm font-semibold text-slate-400">XP</span></p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold bg-green-50 text-green-600 border border-green-100 px-2.5 py-1 rounded-full">
                  +840 minggu ini
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: KALKULASI XP ── */}
        {tab === "kalkulasi" && (
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-3xl p-5 shadow-lg">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-[#008be3]" />
                <p className="text-sm font-bold text-[#00172e]">Cara Kerja Kalkulasi XP Leaderboard</p>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                XP kamu ditentukan dari berbagai aktivitas belajar. Semakin konsisten dan aktif belajar,
                semakin tinggi posisimu di leaderboard.
              </p>

              {/* Formula card */}
              <div className="bg-[#f0f7ff] border border-[#008be3]/20 rounded-2xl px-4 py-3 mb-4">
                <p className="text-[11px] font-bold text-[#008be3] uppercase tracking-wide mb-2">Formula XP</p>
                <p className="text-sm font-mono text-[#00172e] font-bold leading-relaxed">
                  Total XP = (Kursus × 500) + (Ujian × 200)<br />
                  + (Streak × 50) + (Video × 20)<br />
                  + (Jam × 10) + (Bonus Rank × 100)
                </p>
              </div>

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

            {/* My XP Calculator */}
            <div className="bg-white rounded-3xl p-5 shadow-lg">
              <p className="text-sm font-bold text-[#00172e] mb-4">Kalkulasi XP-mu Saat Ini</p>
              <div className="flex flex-col gap-2 mb-4">
                {[
                  { label: "2 Kursus Selesai", calc: "2 × 500", result: 1000, icon: <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> },
                  { label: "3 Ujian Lulus", calc: "3 × 200", result: 600, icon: <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> },
                  { label: "5 Hari Streak", calc: "Akumulasi streak", result: 700, icon: <Flame className="w-3.5 h-3.5 text-orange-500" /> },
                  { label: "28 Video Ditonton", calc: "28 × 20", result: 560, icon: <BookOpen className="w-3.5 h-3.5 text-[#008be3]" /> },
                  { label: "Bonus Rank Naik", calc: "2 × 100", result: 200, icon: <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> },
                  { label: "14 Jam Belajar", calc: "14 × 10", result: 140, icon: <Clock className="w-3.5 h-3.5 text-purple-500" /> },
                ].map((row) => (
                  <div key={row.label} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50">
                    {row.icon}
                    <span className="text-xs text-slate-600 flex-1">{row.label}</span>
                    <span className="text-[11px] text-slate-400 font-mono">{row.calc}</span>
                    <span className="text-xs font-bold text-[#008be3] w-16 text-right">+{formatNumber(row.result)} XP</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                <p className="text-sm font-bold text-[#00172e]">Total XP</p>
                <p className="text-xl font-extrabold text-[#008be3]">{formatNumber(STATS.totalXP)} XP</p>
              </div>
            </div>

            {/* Tips to climb */}
            <div className="bg-white rounded-3xl p-5 shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-[#008be3]" />
                <p className="text-sm font-bold text-[#00172e]">Tips Naik Peringkat</p>
              </div>
              <div className="flex flex-col gap-2.5">
                {[
                  { tip: "Jaga streak harianmu — 30 hari berturut = 1.500 XP bonus!", color: "border-l-orange-400 bg-orange-50" },
                  { tip: "Selesaikan kursus yang belum tuntas — tiap kursus bernilai 500 XP.", color: "border-l-green-400 bg-green-50" },
                  { tip: "Ikuti ujian dan raih nilai ≥80 untuk poin ekstra 200 XP per ujian.", color: "border-l-amber-400 bg-amber-50" },
                  { tip: "Naikkan posisi leaderboard tiap minggu dan kumpulkan bonus 100 XP.", color: "border-l-[#008be3] bg-[#f0f7ff]" },
                ].map((t, i) => (
                  <div key={i} className={`border-l-4 rounded-r-xl px-3 py-2 text-xs text-slate-600 ${t.color}`}>
                    {t.tip}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: RIWAYAT ── */}
        {tab === "riwayat" && (
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <p className="text-sm font-bold text-[#00172e]">Riwayat Aktivitas</p>
              <span className="text-[11px] text-slate-400">{ACTIVITIES.length} aktivitas terakhir</span>
            </div>

            {/* Group by date */}
            {["Hari ini", "Kemarin", "2 hari lalu", "3 hari lalu"].map((date) => {
              const items = ACTIVITIES.filter((a) => a.date === date);
              if (!items.length) return null;
              const dayXP = items.reduce((s, a) => s + a.xp, 0);
              return (
                <div key={date} className="border-b border-slate-50 last:border-0">
                  <div className="flex items-center justify-between px-5 py-2 bg-slate-50">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">{date}</span>
                    <span className="text-[11px] font-bold text-[#008be3]">+{dayXP} XP</span>
                  </div>
                  {items.map((act, idx) => (
                    <div key={idx} className="flex items-center gap-3 px-5 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                      <div className={`w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 ${act.color}`}>
                        {act.icon}
                      </div>
                      <p className="text-xs text-slate-600 flex-1">{act.label}</p>
                      <span className="text-xs font-extrabold text-[#008be3] shrink-0">+{act.xp} XP</span>
                    </div>
                  ))}
                </div>
              );
            })}
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
