"use client";

import { useState } from "react";
import { Play, Bell, Calendar, Clock, Wifi } from "lucide-react";
import DashboardLayout from "@/components/dashboardPelajar/DashboardLayout";

const UPCOMING_CLASSES = [
  {
    id: 1,
    title: "Dasar-Dasar Pemrograman Web Bawah Laut",
    instructor: "Kak Ariel",
    date: "Sabtu, 24 Agustus 2026",
    time: "09:00 - 11:00 WIB",
    topic: "HTML & CSS: Membangun Pondasi",
    avatar: "A",
    color: "bg-[#008be3]",
  },
  {
    id: 2,
    title: "React & Next.js: Selami Framework Modern",
    instructor: "Kak Dina",
    date: "Minggu, 25 Agustus 2026",
    time: "13:00 - 15:00 WIB",
    topic: "useState & useEffect Deep Dive",
    avatar: "D",
    color: "bg-purple-400",
  },
  {
    id: 3,
    title: "Desain UI/UX: Arus Kreativitas Digital",
    instructor: "Kak Sekar",
    date: "Senin, 26 Agustus 2026",
    time: "16:00 - 17:30 WIB",
    topic: "Figma Auto Layout & Komponen",
    avatar: "S",
    color: "bg-emerald-400",
  },
];

export default function LiveClassComponent() {
  const [reminded, setReminded] = useState(false);
  return (
    <DashboardLayout searchPlaceholder="Cari live class...">
      <main className="px-4 md:px-8 py-4 md:py-6 flex flex-col gap-6 max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Play className="w-5 h-5 text-white fill-white" />
            <h1 className="text-xl md:text-2xl font-extrabold text-white">Live Class</h1>
          </div>
          <p className="text-sm text-white/70">Belajar langsung bersama instruktur terbaik</p>
        </div>

        {/* Coming Soon Card */}
        <div className="relative bg-white rounded-3xl overflow-hidden shadow-xl px-6 py-10 flex flex-col items-center text-center">

          {/* Decorative dot grid */}
          <div className="absolute top-4 right-4 opacity-[0.06] pointer-events-none"
            style={{ width: 100, height: 80, backgroundImage: "radial-gradient(circle, #008be3 1.5px, transparent 1.5px)", backgroundSize: "12px 12px" }} />
          <div className="absolute bottom-4 left-4 opacity-[0.06] pointer-events-none"
            style={{ width: 80, height: 60, backgroundImage: "radial-gradient(circle, #008be3 1.5px, transparent 1.5px)", backgroundSize: "12px 12px" }} />

          {/* Live badge */}
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            <span className="text-xs font-bold text-red-500 uppercase tracking-wider">Segera Hadir</span>
          </div>

          {/* Icon */}
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#42AEED] to-[#0063A7] flex items-center justify-center mb-5 shadow-lg shadow-[#008be3]/30">
            <Wifi className="w-9 h-9 text-white" />
          </div>

          <h2 className="text-2xl font-extrabold text-[#00172e] mb-2">Live Class Akan Segera Hadir!</h2>
          <p className="text-sm text-slate-500 max-w-sm leading-relaxed mb-6">
            Fitur Live Class sedang dalam pengembangan. Kamu akan bisa belajar langsung bersama instruktur, tanya jawab real-time, dan berinteraksi dengan sesama penyelam.
          </p>

          {/* Feature chips */}
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {["Sesi Interaktif", "Tanya Jawab Live", "Rekaman Tersedia", "Sertifikat Kehadiran"].map((f) => (
              <span key={f} className="text-xs font-semibold bg-[#f0f7ff] text-[#008be3] px-3 py-1 rounded-full border border-[#008be3]/20">{f}</span>
            ))}
          </div>

          {/* Notify button */}
          <button onClick={() => setReminded(true)} className={`inline-flex items-center gap-2 ${reminded ? "bg-green-500" : "bg-[#008be3] hover:bg-[#0078c8]"} text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-colors shadow-md`}>
            <Bell className="w-4 h-4" />
            {reminded ? "Pengingat Aktif" : "Ingatkan Saya"}
          </button>
        </div>

        {/* Upcoming schedule preview */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-white" />
            <h2 className="text-sm font-bold text-white">Jadwal Yang Akan Datang</h2>
          </div>
          <div className="flex flex-col gap-3">
            {UPCOMING_CLASSES.map((cls) => (
              <div key={cls.id} className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl px-4 py-3.5 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl ${cls.color} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                  {cls.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{cls.title}</p>
                  <p className="text-[10px] text-white/60 mt-0.5">{cls.topic}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="flex items-center gap-1 text-[10px] text-white/70 font-medium">
                      <Calendar className="w-3 h-3" />{cls.date}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-white/70 font-medium">
                      <Clock className="w-3 h-3" />{cls.time}
                    </span>
                  </div>
                </div>
                <div className="shrink-0">
                  <span className="text-[10px] font-bold bg-white/20 text-white px-2.5 py-1 rounded-full">
                    Segera
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </DashboardLayout>
  );
}
