"use client";

import { Users, Bell, BookOpen, Clock, MessageSquare, Headphones } from "lucide-react";
import DashboardLayout from "@/components/dashboardPelajar/DashboardLayout";

const FEATURES = [
  { icon: <Headphones className="w-5 h-5 text-purple-500" />, label: "Lo-fi Musik", desc: "Ambient musik belajar bersama", bg: "bg-purple-50" },
  { icon: <MessageSquare className="w-5 h-5 text-[#008be3]" />, label: "Group Chat", desc: "Diskusi dengan sesama penyelam", bg: "bg-[#f0f7ff]" },
  { icon: <Clock className="w-5 h-5 text-orange-500" />, label: "Pomodoro Timer", desc: "Timer fokus belajar bersama", bg: "bg-orange-50" },
  { icon: <BookOpen className="w-5 h-5 text-emerald-500" />, label: "Materi Bersama", desc: "Buka dan bahas materi bareng", bg: "bg-emerald-50" },
];

export default function StudyRoomComponent() {
  return (
    <DashboardLayout searchPlaceholder="Cari study room...">
      <main className="px-4 md:px-8 py-4 md:py-6 flex flex-col gap-6 max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Users className="w-5 h-5 text-white" />
            <h1 className="text-xl md:text-2xl font-extrabold text-white">Study Room</h1>
          </div>
          <p className="text-sm text-white/70">Belajar lebih seru bersama teman satu kapal</p>
        </div>

        {/* Coming Soon Card */}
        <div className="relative bg-white rounded-3xl overflow-hidden shadow-xl px-6 py-10 flex flex-col items-center text-center">

          {/* Decorative dots */}
          <div className="absolute top-4 right-4 opacity-[0.06] pointer-events-none"
            style={{ width: 100, height: 80, backgroundImage: "radial-gradient(circle, #008be3 1.5px, transparent 1.5px)", backgroundSize: "12px 12px" }} />
          <div className="absolute bottom-4 left-4 opacity-[0.06] pointer-events-none"
            style={{ width: 80, height: 60, backgroundImage: "radial-gradient(circle, #008be3 1.5px, transparent 1.5px)", backgroundSize: "12px 12px" }} />

          {/* Badge */}
          <div className="flex items-center gap-2 bg-purple-50 border border-purple-100 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-xs font-bold text-purple-500 uppercase tracking-wider">Segera Hadir</span>
          </div>

          {/* Icon */}
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center mb-5 shadow-lg shadow-purple-400/30">
            <Users className="w-9 h-9 text-white" />
          </div>

          <h2 className="text-2xl font-extrabold text-[#00172e] mb-2">Study Room Akan Segera Hadir!</h2>
          <p className="text-sm text-slate-500 max-w-sm leading-relaxed mb-6">
            Ruang belajar virtual bareng sesama penyelam. Belajar lebih produktif dengan teman, timer bersama, dan musik lo-fi untuk fokus maksimal.
          </p>

          {/* Feature grid */}
          <div className="grid grid-cols-2 gap-3 w-full max-w-sm mb-6">
            {FEATURES.map((f) => (
              <div key={f.label} className={`${f.bg} rounded-2xl px-4 py-3 text-left flex flex-col gap-2`}>
                {f.icon}
                <p className="text-xs font-bold text-[#00172e]">{f.label}</p>
                <p className="text-[11px] text-slate-500">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Notify button */}
          <button className="inline-flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-colors shadow-md shadow-purple-400/30">
            <Bell className="w-4 h-4" />
            Ingatkan Saya
          </button>
        </div>

        {/* Active rooms preview (locked) */}
        <div>
          <p className="text-sm font-bold text-white mb-3">Preview Ruang Tersedia</p>
          <div className="flex flex-col gap-3">
            {[
              { name: "🔵 Ruang Fokus Pemrograman", members: 12, topic: "Belajar React bareng", status: "Aktif" },
              { name: "🟣 Study Hall Desain", members: 8, topic: "Figma Session", status: "Aktif" },
              { name: "🟢 Bahasa Inggris Bareng", members: 5, topic: "Latihan Speaking", status: "Aktif" },
            ].map((room) => (
              <div key={room.name} className="relative bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl px-4 py-3.5 flex items-center gap-3 overflow-hidden">
                {/* Lock overlay */}
                <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px] flex items-center justify-center">
                  <span className="text-xs font-bold text-white bg-black/20 px-3 py-1 rounded-full">🔒 Belum Tersedia</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white">{room.name}</p>
                  <p className="text-[10px] text-white/60 mt-0.5">{room.topic}</p>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <span className="flex items-center gap-1 text-[10px] text-white/70">
                    <Users className="w-3 h-3" />{room.members}
                  </span>
                  <span className="text-[10px] font-bold bg-green-400/30 text-green-100 px-2 py-0.5 rounded-full">{room.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </DashboardLayout>
  );
}
