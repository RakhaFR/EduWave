"use client";

import { User, BookOpen, GraduationCap, UserPlus } from "lucide-react";

interface StatsGridProps {
  totalCourses: number;
}

export default function StatsGrid({ totalCourses }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 shrink-0">
      {/* Card 1: Siswa Aktif */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[140px] group">
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-xl bg-[#e6f3ff] text-[#0073e6] flex items-center justify-center group-hover:scale-110 transition-transform">
            <User className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-black text-[#00172e] tracking-tight leading-tight">1,240</p>
          <p className="text-xs font-semibold text-slate-400 mt-0.5">Siswa Aktif</p>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-bold text-green-500 mt-2 bg-green-50 px-2 py-0.5 rounded-full w-max">
          <span>↗ 12.5%</span>
          <span className="text-slate-400 font-medium">dari bulan lalu</span>
        </div>
      </div>

      {/* Card 2: Total Kursus */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[140px] group">
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-xl bg-[#e6f3ff] text-[#0073e6] flex items-center justify-center group-hover:scale-110 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-black text-[#00172e] tracking-tight leading-tight">{totalCourses}</p>
          <p className="text-xs font-semibold text-slate-400 mt-0.5">Total Kursus</p>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-bold text-green-500 mt-2 bg-green-50 px-2 py-0.5 rounded-full w-max">
          <span>↗ 8.3%</span>
          <span className="text-slate-400 font-medium">dari bulan lalu</span>
        </div>
      </div>

      {/* Card 3: Pengajar */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[140px] group">
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-xl bg-[#e6f3ff] text-[#0073e6] flex items-center justify-center group-hover:scale-110 transition-transform">
            <GraduationCap className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-black text-[#00172e] tracking-tight leading-tight">8</p>
          <p className="text-xs font-semibold text-slate-400 mt-0.5">Pengajar</p>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-bold text-green-500 mt-2 bg-green-50 px-2 py-0.5 rounded-full w-max">
          <span>↗ 5.1%</span>
          <span className="text-slate-400 font-medium">dari bulan lalu</span>
        </div>
      </div>

      {/* Card 4: Pendaftar Baru */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[140px] group">
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-xl bg-[#f3e6ff] text-[#9c27b0] flex items-center justify-center group-hover:scale-110 transition-transform">
            <UserPlus className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-black text-[#00172e] tracking-tight leading-tight">+45</p>
          <p className="text-xs font-semibold text-slate-400 mt-0.5">Pendaftar Baru</p>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-bold text-green-500 mt-2 bg-green-50 px-2 py-0.5 rounded-full w-max">
          <span>↗ 20.4%</span>
          <span className="text-slate-400 font-medium">dari bulan lalu</span>
        </div>
      </div>
    </div>
  );
}
