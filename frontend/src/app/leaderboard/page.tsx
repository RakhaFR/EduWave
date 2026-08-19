"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trophy, Medal, Crown, ChevronUp, ChevronDown, Minus, Lock, LogIn, ChevronRight } from "lucide-react";
import PublicLayout from "@/components/home/PublicLayout";
import { courseService } from "@/services/courseService";

interface LeaderboardUser {
  rank: number;
  name: string;
  xp: number;
  avatar: string;
  change: number;
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

export default function LeaderboardPublicPage() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const res = await courseService.getLeaderboard(10);
        const rawList = res?.data?.rankings || res?.data || res || [];
        const formatted: LeaderboardUser[] = (Array.isArray(rawList) ? rawList : []).map((item: any, idx: number) => ({
          rank: item.rank || idx + 1,
          name: item.user?.full_name || item.user?.username || item.full_name || item.name || "Penyelam",
          xp: item.xp !== undefined ? item.xp : item.total_xp || 0,
          avatar: (item.user?.full_name || item.user?.username || item.full_name || item.name || "P")[0].toUpperCase(),
          change: item.rank_change || 0,
        }));
        setUsers(formatted);
      } catch (err) {
        console.error("Gagal memuat leaderboard public:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, []);

  const top3 = users.slice(0, 3);
  const preview = users.slice(3, 7);

  return (
    <PublicLayout>
      <main className="px-4 md:px-8 py-4 md:py-6 pb-8 max-w-4xl mx-auto">
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Trophy className="w-5 h-5 text-amber-300" />
            <h1 className="text-xl md:text-2xl font-extrabold text-white">Leaderboard</h1>
            <Trophy className="w-5 h-5 text-amber-300" />
          </div>
          <p className="text-sm text-white/70">Top penyelam terbaik EduWave — masuk untuk melihat posisimu!</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center text-slate-500 mb-6">
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

            {preview.length > 0 && (
              <div className="bg-white rounded-3xl shadow-lg overflow-hidden mb-4">
                <div className="grid grid-cols-12 px-4 py-3 bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <div className="col-span-1 text-center">#</div>
                  <div className="col-span-7 sm:col-span-6">Penyelam</div>
                  <div className="col-span-4 sm:col-span-3 text-right">XP</div>
                  <div className="col-span-2 text-center hidden sm:block">Tren</div>
                </div>

                {preview.map((user, idx) => {
                  const blurred = idx >= 2;
                  return (
                    <div key={user.rank} className="relative">
                      <div
                        className={`grid grid-cols-12 px-4 py-3.5 items-center border-b border-slate-50 last:border-0 transition-colors ${
                          blurred ? "select-none pointer-events-none" : "hover:bg-slate-50"
                        }`}
                        style={blurred ? { filter: "blur(4px)" } : {}}
                      >
                        <div className="col-span-1 text-center">
                          <span className="text-sm font-extrabold text-slate-400">{user.rank}</span>
                        </div>
                        <div className="col-span-7 sm:col-span-6 flex items-center gap-2 min-w-0">
                          <div className={`w-8 h-8 rounded-full ${AVATAR_COLORS[user.rank % AVATAR_COLORS.length]} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                            {user.avatar}
                          </div>
                          <p className="text-xs md:text-sm font-semibold text-[#00172e] truncate">{user.name}</p>
                        </div>
                        <div className="col-span-4 sm:col-span-3 text-right">
                          <span className="text-xs md:text-sm font-extrabold text-[#00172e]">{formatNumber(user.xp)}</span>
                          <span className="text-[10px] text-slate-400 ml-0.5">XP</span>
                        </div>
                        <div className="col-span-2 hidden sm:flex justify-center">
                          <ChangeIcon change={user.change} />
                        </div>
                      </div>
                      {blurred && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1 shadow border border-slate-100">
                            <Lock className="w-3 h-3 text-slate-400" />
                            <span className="text-[10px] font-bold text-slate-500">Masuk untuk melihat</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        <div className="bg-white/15 backdrop-blur-sm border border-white/25 rounded-3xl px-6 py-8 text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
            <Trophy className="w-6 h-6 text-amber-300" />
          </div>
          <p className="text-white font-extrabold text-lg mb-1">Lihat Posisi Kamu!</p>
          <p className="text-white/70 text-sm mb-5">Masuk untuk melihat ranking lengkap, posisi kamu, dan bersaing dengan penyelam lain.</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 bg-white text-[#008be3] font-bold text-sm px-6 py-2.5 rounded-xl shadow-lg hover:bg-[#f0f7ff] transition-all"
            >
              <LogIn className="w-4 h-4" /> Masuk Sekarang
            </Link>
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 bg-[#008be3] text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-lg hover:bg-[#0078c8] transition-all"
            >
              Daftar Gratis <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>
    </PublicLayout>
  );
}