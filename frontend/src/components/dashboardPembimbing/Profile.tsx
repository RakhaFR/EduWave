"use client";

import { useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { User, Mail, Shield, Award, Zap, Loader2 } from "lucide-react";
import EditProfileForm from "@/components/ui/EditProfileForm";

export default function PembimbingProfileComponent() {
  const { user, loading } = useCurrentUser();
  const [imgError, setImgError] = useState(false);

  const initial = (user?.full_name || user?.username || "P").charAt(0).toUpperCase();

  return (
    <main className="px-4 md:px-8 py-4 md:py-6 max-w-lg mx-auto">
      <h1 className="text-xl md:text-2xl font-extrabold mb-4 text-center text-white">Profil Pembimbing (Pengajar)</h1>
      
      <div className="bg-white rounded-3xl p-6 shadow-xl text-[#00172e] space-y-6">
        {loading && !user ? (
          <div className="flex flex-col items-center justify-center py-10">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
            <p className="text-sm text-slate-500">Memuat profil dari server...</p>
          </div>
        ) : (
          <>
            {/* Header Avatar & Name */}
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-3 bg-gradient-to-tr from-[#003d7a] to-[#0073e6] text-white text-3xl font-extrabold rounded-full flex items-center justify-center shadow-lg border-4 border-white overflow-hidden">
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
              <h2 className="font-bold text-xl text-slate-800">{user?.full_name || "Pembimbing EduWave"}</h2>
              <p className="text-xs text-blue-600 font-semibold">@{user?.username || "instructor"}</p>
              <div className="inline-block mt-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-xs font-medium text-blue-700">
                Peran: Pembimbing (Pengajar)
              </div>
            </div>

            <EditProfileForm />

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
                  <p className="text-slate-400 font-medium">Bio Pengajar</p>
                  <p className="font-semibold text-slate-700">{user?.bio || "Belum ada bio pengajar."}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
