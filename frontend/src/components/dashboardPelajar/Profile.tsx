"use client";

import { useState } from "react";
import DashboardLayout from "@/components/dashboardPelajar/DashboardLayout";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { User, Mail, Shield, Award, Zap, Flame, Loader2 } from "lucide-react";

export default function ProfileComponent() {
  const { user, loading } = useCurrentUser();
  const [imgError, setImgError] = useState(false);

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
                  Role DB: {user?.role || "student"} (Pelajar)
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
            </>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
}
