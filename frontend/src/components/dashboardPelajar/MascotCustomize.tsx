"use client";

import DashboardLayout from "@/components/dashboardPelajar/DashboardLayout";

export default function MascotCustomizeComponent() {
  return (
    <DashboardLayout searchPlaceholder="Cari aksesoris...">
      <main className="px-4 md:px-8 py-4 md:py-6 text-white text-center max-w-md mx-auto">
        <h1 className="text-xl md:text-2xl font-extrabold mb-4">Kustomisasi Maskot</h1>
        <div className="bg-white rounded-3xl p-8 shadow-lg text-[#00172e]">
          <p className="text-sm text-slate-500 mb-6">Fitur Kustomisasi Maskot Quli akan segera hadir!</p>
          <div className="w-32 h-32 mx-auto mb-6 relative bg-slate-100 rounded-full flex items-center justify-center border-4 border-[#008be3]/20 shadow-inner">
            <span className="text-5xl">🧜‍♂️</span>
          </div>
          <span className="text-xs font-semibold bg-[#f0f7ff] text-[#008be3] px-3 py-1 rounded-full border border-[#008be3]/20">Coming Soon</span>
        </div>
      </main>
    </DashboardLayout>
  );
}
