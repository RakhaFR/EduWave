"use client";

import { useMemo } from "react";
import {
  BookOpen,
  Users,
  GraduationCap,
  ClipboardList,
  Sparkles,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  ArrowUpRight,
  TrendingUp,
  Activity
} from "lucide-react";
import { Course, UserType, Registration } from "./types";
import { AdminAnalytics } from "@/services/adminService";
import RegistrationLog from "./RegistrationLog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DashboardOverviewProps {
  courses: Course[];
  coursesLoading?: boolean;
  users: UserType[];
  registrations: Registration[];
  analytics?: AdminAnalytics | null;
  searchGlobal: string;
}

const formatNumber = (num: number) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export default function DashboardOverview({
  courses,
  coursesLoading = false,
  users,
  registrations,
  analytics,
  searchGlobal
}: DashboardOverviewProps) {
  const courseStats = useMemo(() => {
    const total = analytics?.courses.total ?? courses.length;
    const published = analytics?.courses.published ?? courses.filter((c) => c.status === "published").length;
    const draft = analytics?.courses.draft ?? courses.filter((c) => c.status === "draft").length;
    const totalEnrolled = analytics?.enrollments.total ?? courses.reduce((acc, c) => acc + (c.enrolled_count ?? 0), 0);
    return { total, published, draft, totalEnrolled };
  }, [courses, analytics]);

  const userStats = useMemo(() => {
    const total = analytics?.users.total ?? users.length;
    const teachers = analytics?.users.instructors ?? users.filter((u) => u.role === "Pengajar").length;
    const students = analytics?.users.students ?? users.filter((u) => u.role === "Siswa").length;
    const active = analytics?.users.active ?? users.filter((u) => u.status === "Aktif").length;
    return { total, teachers, students, active };
  }, [users, analytics]);

  const regStats = useMemo(() => {
    const total = registrations.length;
    const suspicious = registrations.filter((r) => r.isSuspicious).length;
    const normal = total - suspicious;
    return { total, normal, suspicious };
  }, [registrations]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0073e6] flex items-center justify-center border border-blue-100/80">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#00172e] tracking-tight">Ringkasan Statistik</h2>
            <p className="text-xs text-slate-500 font-medium">Metrik dan performa sistem terkini</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Kursus */}
        <Card className="bg-white border-slate-200/80 p-5 rounded-2xl shadow-sm hover:border-blue-200 transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Total Kursus</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0073e6] border border-blue-100 flex items-center justify-center group-hover:bg-[#0073e6] group-hover:text-white transition-all">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              {coursesLoading ? (
                <Loader2 className="w-6 h-6 animate-spin text-slate-300 my-1" />
              ) : (
                <p className="text-3xl font-extrabold text-[#00172e] tracking-tight">{courseStats.total}</p>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between text-xs font-medium text-slate-600 pt-3 mt-4 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Terbit: <strong className="text-slate-800 font-semibold">{courseStats.published}</strong></span>
            </div>
            <span className="text-slate-400">|</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-300"></span>
              <span>Draft: <strong className="text-slate-800 font-semibold">{courseStats.draft}</strong></span>
            </div>
          </div>
        </Card>

        {/* Card 2: Total Pengguna */}
        <Card className="bg-white border-slate-200/80 p-5 rounded-2xl shadow-sm hover:border-blue-200 transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Total Pengguna</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0073e6] border border-blue-100 flex items-center justify-center group-hover:bg-[#0073e6] group-hover:text-white transition-all">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-3xl font-extrabold text-[#00172e] tracking-tight">{userStats.total}</p>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs font-medium text-slate-600 pt-3 mt-4 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span>Pengajar: <strong className="text-slate-800 font-semibold">{userStats.teachers}</strong></span>
            </div>
            <span className="text-slate-400">|</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-400"></span>
              <span>Siswa: <strong className="text-slate-800 font-semibold">{userStats.students}</strong></span>
            </div>
          </div>
        </Card>

        {/* Card 3: Pendaftaran */}
        <Card className="bg-white border-slate-200/80 p-5 rounded-2xl shadow-sm hover:border-blue-200 transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Total Pendaftaran</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0073e6] border border-blue-100 flex items-center justify-center group-hover:bg-[#0073e6] group-hover:text-white transition-all">
                <GraduationCap className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              {coursesLoading ? (
                <Loader2 className="w-6 h-6 animate-spin text-slate-300 my-1" />
              ) : (
                <p className="text-3xl font-extrabold text-[#00172e] tracking-tight">{formatNumber(courseStats.totalEnrolled)}</p>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between text-xs font-medium text-slate-600 pt-3 mt-4 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Pengguna Aktif: <strong className="text-slate-800 font-semibold">{userStats.active}</strong></span>
            </div>
          </div>
        </Card>

        {/* Card 4: Log Aktivitas */}
        <Card className="bg-white border-slate-200/80 p-5 rounded-2xl shadow-sm hover:border-blue-200 transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Log Aktivitas Sistem</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0073e6] border border-blue-100 flex items-center justify-center group-hover:bg-[#0073e6] group-hover:text-white transition-all">
                <ClipboardList className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-3xl font-extrabold text-[#00172e] tracking-tight">{regStats.total}</p>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs font-medium text-slate-600 pt-3 mt-4 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Wajar: <strong className="text-slate-800 font-semibold">{regStats.normal}</strong></span>
            </div>
            <span className="text-slate-400">|</span>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${regStats.suspicious > 0 ? "bg-rose-500" : "bg-slate-300"}`}></span>
              <span>Anomali: <strong className={regStats.suspicious > 0 ? "text-rose-600 font-semibold" : "text-slate-800 font-semibold"}>{regStats.suspicious}</strong></span>
            </div>
          </div>
        </Card>
      </div>

      {/* Embedded Registration Log Table */}
      <div className="mt-2">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-md bg-blue-50 text-[#0073e6] flex items-center justify-center">
            <ClipboardList className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-base font-bold text-[#00172e]">Log Pendaftaran Terbaru</h3>
        </div>
        <RegistrationLog registrations={registrations} searchGlobal={searchGlobal} />
      </div>
    </div>
  );
}
