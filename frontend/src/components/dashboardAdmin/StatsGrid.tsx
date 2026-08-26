"use client";

import { User, BookOpen, GraduationCap, UserPlus } from "lucide-react";
import { useAdmin } from "./AdminContext";
import { Card } from "@/components/ui/card";

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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
      {/* Card 1: Siswa Terdaftar */}
      <Card className="bg-white border-slate-200/80 p-5 rounded-2xl shadow-sm hover:border-blue-200 transition-all flex flex-col justify-between group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Siswa Terdaftar</span>
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0073e6] border border-blue-100 flex items-center justify-center group-hover:bg-[#0073e6] group-hover:text-white transition-all">
            <User className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-3xl font-extrabold text-[#00172e] tracking-tight">{studentsCount}</p>
        </div>
        <div className="flex items-center justify-between text-xs font-medium text-slate-600 pt-3 mt-4 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Data Real Backend</span>
          </div>
        </div>
      </Card>

      {/* Card 2: Total Kursus */}
      <Card className="bg-white border-slate-200/80 p-5 rounded-2xl shadow-sm hover:border-blue-200 transition-all flex flex-col justify-between group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Total Kursus</span>
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0073e6] border border-blue-100 flex items-center justify-center group-hover:bg-[#0073e6] group-hover:text-white transition-all">
            <BookOpen className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-3xl font-extrabold text-[#00172e] tracking-tight">{coursesCount}</p>
        </div>
        <div className="flex items-center justify-between text-xs font-medium text-slate-600 pt-3 mt-4 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Data Real Backend</span>
          </div>
        </div>
      </Card>

      {/* Card 3: Pengajar / Pembimbing */}
      <Card className="bg-white border-slate-200/80 p-5 rounded-2xl shadow-sm hover:border-blue-200 transition-all flex flex-col justify-between group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Pengajar / Pembimbing</span>
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0073e6] border border-blue-100 flex items-center justify-center group-hover:bg-[#0073e6] group-hover:text-white transition-all">
            <GraduationCap className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-3xl font-extrabold text-[#00172e] tracking-tight">{instructorsCount}</p>
        </div>
        <div className="flex items-center justify-between text-xs font-medium text-slate-600 pt-3 mt-4 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Data Real Backend</span>
          </div>
        </div>
      </Card>

      {/* Card 4: Total Pendaftaran */}
      <Card className="bg-white border-slate-200/80 p-5 rounded-2xl shadow-sm hover:border-blue-200 transition-all flex flex-col justify-between group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Total Enrollment</span>
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0073e6] border border-blue-100 flex items-center justify-center group-hover:bg-[#0073e6] group-hover:text-white transition-all">
            <UserPlus className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-3xl font-extrabold text-[#00172e] tracking-tight">{enrollmentsCount}</p>
        </div>
        <div className="flex items-center justify-between text-xs font-medium text-slate-600 pt-3 mt-4 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Data Real Backend</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
