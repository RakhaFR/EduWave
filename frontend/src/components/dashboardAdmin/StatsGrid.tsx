"use client";

import { User, BookOpen, GraduationCap, UserPlus } from "lucide-react";
import { useAdmin } from "./AdminContext";

interface StatsGridProps {
  totalCourses?: number;
}

export default function StatsGrid({ totalCourses }: StatsGridProps) {
  const { analytics } = useAdmin();

  const studentsCount = analytics?.users?.students ?? 0;
  const coursesCount = analytics?.courses?.total ?? totalCourses ?? 0;
  const instructorsCount = analytics?.users?.instructors ?? 0;
  const enrollmentsCount = analytics?.enrollments?.total ?? 0;

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
          <p className="text-2xl font-black text-[#00172e] tracking-tight leading-tight">{studentsCount}</p>
          <p className="text-xs font-semibold text-slate-400 mt-0.5">Siswa Terdaftar</p>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-bold text-green-500 mt-2 bg-green-50 px-2 py-0.5 rounded-full w-max">
          <span>Data Real Backend</span>
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
          <p className="text-2xl font-black text-[#00172e] tracking-tight leading-tight">{coursesCount}</p>
          <p className="text-xs font-semibold text-slate-400 mt-0.5">Total Kursus</p>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-bold text-green-500 mt-2 bg-green-50 px-2 py-0.5 rounded-full w-max">
          <span>Data Real Backend</span>
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
          <p className="text-2xl font-black text-[#00172e] tracking-tight leading-tight">{instructorsCount}</p>
          <p className="text-xs font-semibold text-slate-400 mt-0.5">Pengajar / Pembimbing</p>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-bold text-green-500 mt-2 bg-green-50 px-2 py-0.5 rounded-full w-max">
          <span>Data Real Backend</span>
        </div>
      </div>

      {/* Card 4: Total Pendaftaran */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[140px] group">
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-xl bg-[#f3e6ff] text-[#9c27b0] flex items-center justify-center group-hover:scale-110 transition-transform">
            <UserPlus className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-black text-[#00172e] tracking-tight leading-tight">{enrollmentsCount}</p>
          <p className="text-xs font-semibold text-slate-400 mt-0.5">Total Enrollment</p>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-bold text-green-500 mt-2 bg-green-50 px-2 py-0.5 rounded-full w-max">
          <span>Data Real Backend</span>
        </div>
      </div>
    </div>
  );
}
