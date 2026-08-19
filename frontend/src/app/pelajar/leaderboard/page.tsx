"use client";

import { useEffect, useState } from "react";
import { Trophy, Medal, Crown, Flame, Star, ChevronUp, ChevronDown, Minus } from "lucide-react";
import DashboardLayout from "@/components/dashboardPelajar/DashboardLayout";
import { courseService } from "@/services/courseService";

type Period = "minggu" | "semua";

interface LeaderboardUser {
  rank: number;
  name: string;
  xp: number;
  streak: number;
  courses: number;
  avatar: string;
  change: number;
  me: boolean;
}

const AVATAR_COLORS = ["bg-[#008be3]","bg-purple-400","bg-emerald-400","bg-amber-400","bg-pink-400","bg-indigo-400"];

const PODIUM = [
  { pos: 1, h: "h-20 md:h-28", crown: false, ring: "ring-2 ring-slate-300",  bg: "bg-slate-300",  text: "text-slate-600",  bar: "bg-slate-200"  },
  { pos: 0, h: "h-28 md:h-36", crown: true,  ring: "ring-2 ring-amber-300",  bg: "bg-amber-300",  text: "text-amber-800",  bar: "bg-amber-200"  },
  { pos: 2, h: "h-16 md:h-20", crown: false, ring: "ring-2 ring-orange-300", bg: "bg-orange-200", text: "text-orange-700", bar: "bg-orange-100" },
];

function ChangeIcon({ change }: { change: number }) {
  if (change > 0) return <span className="flex items-center gap-0.5 text-green-500 text-[10px] font-bold"><ChevronUp className="w-3 h-3" />{change}</span>;
  if (change < 0) return <span className="flex items-center gap-0.5 text-red-400 text-[10px] font-bold"><ChevronDown className="w-3 h-3" />{Math.abs(change)}</span>;
  return <Minus className="w-3 h-3 text-slate-300" />;
}

const formatNumber = (num: number) => {
  return (num || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export default function PelajarLeaderboardPage() {
  const [period, setPeriod] = useState<Period>("minggu");
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [myRank, setMyRank] = useState<{ rank: number; total_xp: number; name?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [lbRes, meRes] = await Promise.all([
          period === "minggu"
            ? courseService.getWeeklyLeaderboard(50).catch((err) => {
                console.error("Endpoint /leaderboard/weekly 500 error, fallback ke /leaderboard", err);
                return courseService.getLeaderboard(50);
              })
            : courseService.getLeaderboard(50),
          courseService.getMyRank().catch(() => null),
        ]);

        const rawList = lbRes?.data || lbRes || [];
        const formattedList: LeaderboardUser[] = (Array.isArray(rawList) ? rawList : []).map((item: any, index: number) => ({
          rank: item.rank || index + 1,
          name: item.full_name || item.name || "Penyelam",
          xp: item.total_xp || item.xp || 0,
          streak: item.streak_days || item.streak || 0,
          courses: item.completed_courses || item.courses || 0,
          avatar: (item.full_name || item.name || "P")[0].toUpperCase(),
          change: item.rank_change || 0,
          me: item.is_me || false,
        }));

        setLeaderboard(formattedList);
        if (meRes?.data) {
          setMyRank(meRes.data);
        }
      } catch (err) {
        console.error("Gagal memuat leaderboard:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [period]);

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);
  const me = leaderboard.find((u) => u.me) || {
    rank: myRank?.rank || "-",
    name: "Kamu",
    xp: myRank?.total_xp || 0,
  };

  return (
    <DashboardLayout searchPlaceholder="Cari penyelam...">
      <main className="px-4 md:px-8 py-4 md:py-6 pb-8 max-w-4xl mx-auto">
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Trophy className="w-5 h-5 text-amber-300" />
            <h1 className="text-xl md:text-2xl font-extrabold text-white">Leaderboard</h1>
            <Trophy className="w-5 h-5 text-amber-300" />
          </div>
          <p className="text-sm text-white/70">Bersaing dan tunjukkan kehebatanmu sebagai Penyelam terbaik!</p>
        </div>

        <div className="flex justify-center gap-2 mb-6">
          {(["minggu", "semua"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                period === p
                  ? "bg-white text-[#008be3] shadow-md"
                  : "bg-white/20 backdrop-blur-sm border border-white/20 text-white hover:bg-white/30"
              }`}
            >
              {p === "minggu" ? "Minggu Ini" : "Sepanjang Waktu"}
            </button>
          ))}
        </div>

        <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl px-4 py-3 mb-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#008be3] flex items-center justify-center text-white text-sm font-bold shrink-0">
            {(me.name || "K")[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-white/60 font-medium uppercase tracking-wide">Posisiku</p>
            <p className="text-sm font-bold text-white truncate">{me.name}</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <p className="text-[10px] text-white/60">XP</p>
              <p className="text-sm font-extrabold text-cyan-300">{formatNumber(me.xp)}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md">
              <span className="text-sm font-extrabold text-[#008be3]">#{me.rank}</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center text-slate-500">
            Belum ada data peringkat.
          </div>
        ) : (
          <>
            {top3.length > 0 && (
              <div className="bg-white rounded-3xl p-5 md:p-8 mb-4 shadow-lg">
                <div className="flex items-end justify-center gap-3 md:gap-8 mb-3 h-40 md:h-52">
                  {PODIUM.map((cfg) => {
                    const user = top3[cfg.pos];
                    if (!user) return null;
                    return (
                      <div key={cfg.pos} className="flex flex-col items-center gap-1.5">
                        {cfg.crown ? <Crown className="w-6 h-6 text-amber-400 fill-amber-400 -mb-1" /> : <div className="w-6 h-6" />}
                        <div className={`w-11 h-11 md:w-14 md:h-14 rounded-full ${cfg.bg} ${cfg.ring} flex items-center justify-center text-sm md:text-lg font-extrabold ${cfg.text} shadow-md`}>
                          {user.avatar}
                        </div>
                        <p className={`text-[10px] md:text-xs font-bold ${cfg.text} text-center max-w-[64px] md:max-w-[80px] line-clamp-2 leading-tight`}>
                          {user.name}
                        </p>
                        <div className={`w-14 md:w-20 ${cfg.h} ${cfg.bar} rounded-t-2xl flex flex-col items-center justify-center gap-1 shadow-inner`}>
                          <span className={`text-base md:text-xl font-extrabold ${cfg.text}`}>{user.rank}</span>
                          <span className={`text-[9px] font-semibold ${cfg.text} opacity-70 hidden md:block`}>{formatNumber(user.xp)} XP</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-center gap-3 md:gap-8">
                  <div className="w-14 md:w-20 flex justify-center"><Medal className="w-4 h-4 text-slate-400" /></div>
                  <div className="w-14 md:w-20 flex justify-center"><Medal className="w-4 h-4 text-amber-400 fill-amber-400" /></div>
                  <div className="w-14 md:w-20 flex justify-center"><Medal className="w-4 h-4 text-orange-400 fill-orange-400" /></div>
                </div>
              </div>
            )}

            {rest.length > 0 && (
              <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
                <div className="grid grid-cols-12 px-4 py-3 bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <div className="col-span-1 text-center">#</div>
                  <div className="col-span-6 sm:col-span-5 md:col-span-4">Penyelam</div>
                  <div className="col-span-3 md:col-span-2 text-center hidden sm:block">Streak</div>
                  <div className="col-span-2 text-center hidden md:block">Kursus</div>
                  <div className="col-span-4 sm:col-span-3 md:col-span-2 text-right">XP</div>
                  <div className="col-span-1 text-center">Tren</div>
                </div>

                {rest.map((user) => (
                  <div
                    key={user.rank}
                    className={`grid grid-cols-12 px-4 py-3.5 items-center border-b border-slate-50 last:border-0 transition-colors ${
                      user.me ? "bg-[#f0f7ff]" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="col-span-1 text-center">
                      <span className={`text-sm font-extrabold ${user.me ? "text-[#008be3]" : "text-slate-400"}`}>{user.rank}</span>
                    </div>

                    <div className="col-span-6 sm:col-span-5 md:col-span-4 flex items-center gap-2 min-w-0">
                      <div className={`w-8 h-8 rounded-full ${AVATAR_COLORS[user.rank % AVATAR_COLORS.length]} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                        {user.avatar}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-xs md:text-sm font-semibold truncate ${user.me ? "text-[#008be3]" : "text-[#00172e]"}`}>
                          {user.name}
                        </p>
                        {user.me && (
                          <span className="text-[9px] bg-[#008be3] text-white px-1.5 py-0.5 rounded-full font-bold">Kamu</span>
                        )}
                      </div>
                    </div>

                    <div className="col-span-3 md:col-span-2 text-center hidden sm:flex items-center justify-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                      <span className="text-xs font-semibold text-slate-600">{user.streak}h</span>
                    </div>

                    <div className="col-span-2 text-center hidden md:flex items-center justify-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                      <span className="text-xs font-semibold text-slate-600">{user.courses}</span>
                    </div>

                    <div className="col-span-4 sm:col-span-3 md:col-span-2 text-right">
                      <span className={`text-xs md:text-sm font-extrabold ${user.me ? "text-[#008be3]" : "text-[#00172e]"}`}>
                        {formatNumber(user.xp)}
                      </span>
                      <span className="text-[10px] text-slate-400 ml-0.5">XP</span>
                    </div>

                    <div className="col-span-1 flex justify-center">
                      <ChangeIcon change={user.change} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </DashboardLayout>
  );
}