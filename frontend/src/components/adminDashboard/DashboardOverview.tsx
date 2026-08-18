"use client";

import { useMemo } from "react";
import {
  BookOpen,
  Users,
  GraduationCap,
  ClipboardList,
  Sparkles
} from "lucide-react";
import { Course, UserType, Registration } from "./types";
import RegistrationLog from "./RegistrationLog";

interface DashboardOverviewProps {
  courses: Course[];
  users: UserType[];
  registrations: Registration[];
  searchGlobal: string;
}

const formatNumber = (num: number) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export default function DashboardOverview({
  courses,
  users,
  registrations,
  searchGlobal
}: DashboardOverviewProps) {
  // Aggregate Course statistics
  const courseStats = useMemo(() => {
    const total = courses.length;
    const published = courses.filter((c) => c.status === "Terbit").length;
    const draft = courses.filter((c) => c.status === "Draft").length;
    const totalStudents = courses.reduce((acc, c) => acc + c.students, 0);
    return { total, published, draft, totalStudents };
  }, [courses]);

  // Aggregate User statistics
  const userStats = useMemo(() => {
    const total = users.length;
    const teachers = users.filter((u) => u.role === "Pengajar").length;
    const students = users.filter((u) => u.role === "Siswa").length;
    const active = users.filter((u) => u.status === "Aktif").length;
    return { total, teachers, students, active };
  }, [users]);

  // Aggregate Registration / Activity statistics
  const regStats = useMemo(() => {
    const total = registrations.length;
    const suspicious = registrations.filter((r) => r.isSuspicious).length;
    const normal = total - suspicious;
    return { total, normal, suspicious };
  }, [registrations]);

  return (
    <div className="flex flex-col gap-6">
      {/* Overview Cards Section Header */}
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-[#0073e6]" />
        <h2 className="text-base font-extrabold text-[#00172e]">Ringkasan Statistik Utama</h2>
      </div>

      {/* Grid of Extended Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Statistik Kursus */}
        <div className="bg-gradient-to-br from-[#f0f7ff] to-white border border-blue-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#0073e6] text-white flex items-center justify-center shadow-md shadow-blue-200 group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold bg-blue-50 text-[#0073e6] px-2.5 py-1 rounded-full">
              Kursus
            </span>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-black text-[#00172e]">{courseStats.total}</p>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">Total Kursus Aktif</p>
          </div>
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 pt-3 mt-3 border-t border-blue-50">
            <span>Terbit: <strong className="text-green-600 font-bold">{courseStats.published}</strong></span>
            <span>Draft: <strong className="text-slate-600 font-bold">{courseStats.draft}</strong></span>
          </div>
        </div>

        {/* Card 2: Statistik Pengguna */}
        <div className="bg-gradient-to-br from-[#f5f3ff] to-white border border-purple-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-200 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold bg-purple-50 text-purple-600 px-2.5 py-1 rounded-full">
              Pengguna
            </span>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-black text-[#00172e]">{userStats.total}</p>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">Total Pengguna Terdaftar</p>
          </div>
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 pt-3 mt-3 border-t border-purple-50">
            <span>Pengajar: <strong className="text-purple-600 font-bold">{userStats.teachers}</strong></span>
            <span>Siswa: <strong className="text-blue-600 font-bold">{userStats.students}</strong></span>
          </div>
        </div>

        {/* Card 3: Statistik Siswa di Kursus */}
        <div className="bg-gradient-to-br from-[#ecfdf5] to-white border border-emerald-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-200 group-hover:scale-110 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full">
              Keterlibatan
            </span>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-black text-[#00172e]">{formatNumber(courseStats.totalStudents)}</p>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">Total Siswa Terdaftar</p>
          </div>
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 pt-3 mt-3 border-t border-emerald-50">
            <span>Pengguna Aktif: <strong className="text-emerald-600 font-bold">{userStats.active}</strong></span>
          </div>
        </div>

        {/* Card 4: Statistik Pendaftaran / Aktivitas */}
        <div className="bg-gradient-to-br from-[#fff7ed] to-white border border-amber-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-200 group-hover:scale-110 transition-transform">
              <ClipboardList className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold bg-amber-50 text-amber-600 px-2.5 py-1 rounded-full">
              Keamanan Log
            </span>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-black text-[#00172e]">{regStats.total}</p>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">Total Aktivitas Sistem</p>
          </div>
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 pt-3 mt-3 border-t border-amber-50">
            <span>Normal: <strong className="text-emerald-600 font-bold">{regStats.normal}</strong></span>
            <span>Mencurigakan: <strong className="text-rose-600 font-bold">{regStats.suspicious}</strong></span>
          </div>
        </div>
      </div>

      {/* Embedded Registration Log Table (Only table shown on Dashboard) */}
      <div className="mt-2">
        <div className="flex items-center gap-2 mb-3">
          <ClipboardList className="w-5 h-5 text-[#0073e6]" />
          <h3 className="text-base font-extrabold text-[#00172e]">Log Pendaftaran Terbaru</h3>
        </div>
        <RegistrationLog registrations={registrations} searchGlobal={searchGlobal} />
      </div>
    </div>
  );
}
