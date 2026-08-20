"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboardPelajar/DashboardLayout";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { User, Mail, Shield, Award, Zap, Flame, Loader2, Trophy } from "lucide-react";
import { achievementService, Achievement } from "@/services/achievementService";
import EditProfileForm from "@/components/ui/EditProfileForm";

export default function ProfileComponent() {
  const { user, loading } = useCurrentUser();
  const [imgError, setImgError] = useState(false);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [achLoading, setAchLoading] = useState(true);

  useEffect(() => {
    achievementService.getMyAchievements().then((res) => {
      if (res.success && res.data) setAchievements(res.data.achievements);
    }).catch(() => {}).finally(() => setAchLoading(false));
  }, []);

  const initial = (user?.full_name || user?.username || "P").charAt(0).toUpperCase();

  return (
    <DashboardLayout searchPlaceholder="Cari riwayat...">
      <main className="px-4 md:px-8 py-4 md:py-6 text-white max-w-lg mx-auto">
        <h1 className="text-xl md:text-2xl font-extrabold mb-4 text-center">Profil Penyelam (Pelajar)</h1>
        
        <div className="bg-white rounded-3xl p-6 shadow-xl text-[#00172e] space-y-6">
          {loading && !user ? (
            <div className="flex flex-col items-center justify-center py-10">
              <Loader2 className="w-8 h-8 text-cyan-600 animate-spin mb-2" />
              <p className="text-sm text-slate-500">Memuat profil dari server...</p>
            </div>
          ) : (
            <>
              {/* Header Avatar & Name */}
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-3 bg-gradient-to-tr from-[#0052a3] to-[#008be3] text-white text-3xl font-extrabold rounded-full flex items-center justify-center shadow-lg border-4 border-white overflow-hidden">
                  {user?.avatar_url && !imgError ? (
                    <img
                      src={user.avatar_url}
                      alt={user.full_name}
                      onError={() => setImgError(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    initial
                  )}
                </div>
                <h2 className="font-bold text-xl text-slate-800">{user?.full_name || "Pelajar EduWave"}</h2>
                <p className="text-xs text-cyan-600 font-semibold">@{user?.username || "student"}</p>
                <div className="inline-block mt-2 px-3 py-1 bg-cyan-50 border border-cyan-200 rounded-full text-xs font-medium text-cyan-700">
                  Peran: Penjelajah (Pelajar)
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                <div className="bg-blue-50/80 p-3 rounded-2xl text-center border border-blue-100">
                  <Award className="w-5 h-5 mx-auto text-blue-600 mb-1" />
                  <p className="text-[10px] text-slate-500 font-medium">Level</p>
                  <p className="text-base font-extrabold text-blue-900">{user?.level ?? 1}</p>
                </div>

                <div className="bg-amber-50/80 p-3 rounded-2xl text-center border border-amber-100">
                  <Zap className="w-5 h-5 mx-auto text-amber-500 mb-1" />
                  <p className="text-[10px] text-slate-500 font-medium">XP</p>
                  <p className="text-base font-extrabold text-amber-800">{user?.xp ?? 0}</p>
                </div>

                <div className="bg-teal-50/80 p-3 rounded-2xl text-center border border-teal-100">
                  <Shield className="w-5 h-5 mx-auto text-teal-600 mb-1" />
                  <p className="text-[10px] text-slate-500 font-medium">Mutiara</p>
                  <p className="text-base font-extrabold text-teal-900">{user?.pearls ?? 0}</p>
                </div>

                <div className="bg-orange-50/80 p-3 rounded-2xl text-center border border-orange-100">
                  <Flame className="w-5 h-5 mx-auto text-orange-500 mb-1" />
                  <p className="text-[10px] text-slate-500 font-medium">Streak</p>
                  <p className="text-base font-extrabold text-orange-900">{user?.streak_days ?? 0} hari</p>
                </div>
              </div>

              {/* Account details */}
              <div className="bg-slate-50 rounded-2xl p-4 space-y-3 text-xs border border-slate-100">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <div className="overflow-hidden">
                    <p className="text-slate-400 font-medium">Email</p>
                    <p className="font-semibold text-slate-700 truncate">{user?.email || "-"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-slate-400 font-medium">Bio</p>
                    <p className="font-semibold text-slate-700">{user?.bio || "Belum ada bio."}</p>
                  </div>
                </div>
              </div>

              <EditProfileForm />

              {/* Achievements */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <p className="text-sm font-bold text-slate-700">Pencapaian</p>
                  {!achLoading && (
                    <span className="text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-100 px-2 py-0.5 rounded-full">
                      {achievements.length} diraih
                    </span>
                  )}
                </div>
                {achLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="w-5 h-5 animate-spin text-slate-300" />
                  </div>
                ) : achievements.length === 0 ? (
                  <div className="text-center py-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-xs text-slate-400 font-medium">Belum ada pencapaian.</p>
                    <p className="text-[11px] text-slate-300 mt-0.5">Selesaikan kursus & ujian untuk meraihnya!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {achievements.map((ach) => (
                      <div key={ach.id} className="flex items-center gap-2.5 bg-amber-50 border border-amber-100 rounded-2xl p-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 text-lg">
                          {ach.icon_url ? (
                            <img src={ach.icon_url} alt={ach.name} className="w-6 h-6 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                          ) : (
                            <Trophy className="w-4 h-4 text-amber-500" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-[#00172e] leading-tight truncate">{ach.name}</p>
                          <p className="text-[10px] text-slate-400 leading-tight truncate">{ach.description}</p>
                          <p className="text-[10px] font-bold text-amber-600 mt-0.5">+{ach.pearls_reward} 🪙</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
}
