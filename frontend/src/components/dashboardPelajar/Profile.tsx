"use client";

import DashboardLayout from "@/components/dashboardPelajar/DashboardLayout";

export default function ProfileComponent() {
  return (
    <DashboardLayout searchPlaceholder="Cari riwayat...">
      <main className="px-4 md:px-8 py-4 md:py-6 text-white text-center max-w-md mx-auto">
        <h1 className="text-xl md:text-2xl font-extrabold mb-4">Profil</h1>
        <div className="bg-white rounded-3xl p-8 shadow-lg text-[#00172e]">
          <p className="text-sm text-slate-500 mb-6">Fitur profil penyelam akan segera hadir!</p>
          <div className="w-24 h-24 mx-auto mb-4 bg-[#008be3] text-white text-3xl font-bold rounded-full flex items-center justify-center shadow-lg">
            R
          </div>
          <p className="font-bold text-lg mb-1">Rasya Raya Agung</p>
          <p className="text-xs text-slate-400 mb-6">Penyelam Mahir · Level 12</p>
          <span className="text-xs font-semibold bg-[#f0f7ff] text-[#008be3] px-3 py-1 rounded-full border border-[#008be3]/20">Coming Soon</span>
        </div>
      </main>
    </DashboardLayout>
  );
}
