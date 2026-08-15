"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Home, Users, GraduationCap, BookOpen, Library,
  BarChart2, Bell, Search, ChevronRight, LogOut,
  Play, Trash2, Trophy, Flame, Target, Calendar, ChevronDown,
} from "lucide-react";
import FloatingBubbles from "@/components/ui/FloatingBubbles";

const SIDEBAR_ITEMS = [
  { icon: <Home className="w-5 h-5" />,          label: "Home",       href: "/dashboard", active: true },
  { icon: <Users className="w-5 h-5" />,         label: "Students",   href: "#" },
  { icon: <GraduationCap className="w-5 h-5" />, label: "Teacher",    href: "#" },
  { icon: <BookOpen className="w-5 h-5" />,      label: "Course",     href: "/course" },
  { icon: <Play className="w-5 h-5" />,          label: "Live Class", href: "#" },
  { icon: <Library className="w-5 h-5" />,       label: "Library",    href: "#" },
  { icon: <BarChart2 className="w-5 h-5" />,     label: "Reports",    href: "#" },
];

const MY_COURSES = [
  { id: 1, title: "Dasar-Dasar Pemrograman Web Bawah Laut", instructor: "Kak Ariel", progress: 75,  img: "/ocean-bg.jpg"   },
  { id: 2, title: "React & Next.js: Selami Framework Modern",  instructor: "Kak Dina",  progress: 40,  img: "/ocean-bg2.webp" },
  { id: 3, title: "Desain UI/UX: Arus Kreativitas Digital",    instructor: "Kak Sekar", progress: 20,  img: "/ocean-bg3.webp" },
  { id: 4, title: "Bahasa Inggris Intensif: Level Penyelam",   instructor: "Kak Mira",  progress: 60,  img: "/ocean-bg.jpg"   },
];

const LEADERBOARD = [
  { rank: 4, name: "Rasya Raya Agung", xp: 3200, me: true  },
  { rank: 5, name: "Dina Fitriani",    xp: 3100, me: false },
  { rank: 6, name: "Ariel Saputra",    xp: 2900, me: false },
  { rank: 7, name: "Sekar Ayu",        xp: 2750, me: false },
];

const TOP3 = [
  { rank: 2, name: "Budi S",  color: "bg-slate-300",  textColor: "text-slate-600", h: "h-10" },
  { rank: 1, name: "Citra M", color: "bg-amber-300",  textColor: "text-amber-800", h: "h-16" },
  { rank: 3, name: "Doni A",  color: "bg-orange-200", textColor: "text-orange-700", h: "h-8"  },
];

export default function DashboardPage() {
  const [avatarOpen, setAvatarOpen] = useState(false);

  return (
    <div className="flex min-h-screen font-sans relative" style={{ background: "linear-gradient(180deg, #42AEED 0%, #0063A7 100%)" }}>

      {/* Bubble animasi naik */}
      <FloatingBubbles count={20} />

      {/* Ornamen karang SVG — fixed di bawah */}
      <div className="fixed bottom-0 left-0 right-0 pointer-events-none" style={{ zIndex: 1 }}>
        <img
          src="/ocean-ornament.svg"
          alt=""
          className="w-full"
          style={{ display: "block", height: "240px", objectFit: "cover", objectPosition: "top" }}
        />
      </div>

      {/* Sidebar — card putih dengan border radius, padding dari tepi */}
      <div className="w-64 shrink-0 p-3 relative" style={{ zIndex: 20 }}>
        <aside className="relative h-full rounded-3xl bg-white flex flex-col px-5 py-6 shadow-xl">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-2">
            <Image src="/logo-eduwave.webp" alt="EduWave" width={32} height={32} className="h-8 w-auto" />
            <span className="text-lg font-bold text-[#00172e]">Edu<span className="text-[#008be3]">Wave</span></span>
            <ChevronRight className="w-4 h-4 text-slate-300 ml-auto" />
          </Link>

          <div className="border-b border-slate-100 mb-5" />

          {/* Nav */}
          <nav className="flex flex-col gap-0.5 flex-1">
            {SIDEBAR_ITEMS.map((item) => (
              <Link key={item.label} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${item.active
                    ? "bg-[#008be3]/10 text-[#008be3] border-l-4 border-[#008be3]"
                    : "text-slate-500 hover:bg-slate-50 hover:text-[#008be3]"}`}>
                {item.icon}{item.label}
              </Link>
            ))}
          </nav>


        </aside>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 relative" style={{ zIndex: 10 }}>

        {/* Topbar */}
        <header className="flex items-center justify-between px-8 py-4 bg-transparent">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search..."
              className="w-full pl-9 pr-4 py-2.5 rounded-full bg-white text-sm text-slate-700 placeholder-slate-400 outline-none shadow-sm focus:ring-2 focus:ring-[#008be3]/30" />
          </div>
          <div className="flex items-center gap-4">
            <button className="relative w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20 hover:bg-white/30 transition-colors">
              <Bell className="w-4 h-4 text-white" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-400" />
            </button>
            <div className="relative">
              <button
                onClick={() => setAvatarOpen(!avatarOpen)}
                className="flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/20 pl-1 pr-3 py-1 hover:bg-white/30 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-[#008be3] flex items-center justify-center text-white text-xs font-bold">R</div>
                <span className="text-sm font-semibold text-white">Rasya Raya Agung</span>
                <ChevronDown className={`w-3.5 h-3.5 text-white/70 transition-transform ${avatarOpen ? "rotate-180" : ""}`} />
              </button>
              {avatarOpen && (
                <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50">
                  <Link href="/profile"
                    onClick={() => setAvatarOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                    <Users className="w-4 h-4" />Profil
                  </Link>
                  <div className="border-t border-slate-100" />
                  <Link href="/auth/login"
                    onClick={() => setAvatarOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-50 transition-colors">
                    <LogOut className="w-4 h-4" />Keluar
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 px-8 py-6 flex flex-col gap-6">

          {/* Welcome banner — putih dengan border kiri aksen + dot pattern */}
          <div className="relative rounded-3xl bg-white overflow-hidden px-8 py-8 flex items-center justify-between w-full shadow-lg">

            {/* Border kiri aksen tebal */}
            <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-3xl bg-gradient-to-b from-[#42AEED] to-[#0063A7]" />

            {/* Dot pattern dekoratif pojok kanan atas */}
            <div className="absolute top-4 right-48 opacity-[0.07] pointer-events-none select-none"
              style={{
                width: 120, height: 80,
                backgroundImage: "radial-gradient(circle, #008be3 1.5px, transparent 1.5px)",
                backgroundSize: "14px 14px",
              }}
            />

            <div className="flex-1 pl-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-[#008be3] animate-pulse" />
                <p className="text-xs font-semibold tracking-widest text-[#008be3] uppercase">Selamat Datang</p>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#00172e] mb-5">
                Halo, <span className="text-[#008be3]">Rasya Raya Agung</span>
              </h1>
              <Link href="/course"
                className="inline-flex items-center gap-2 rounded-xl bg-[#008be3] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#0078c8] transition-colors shadow-md shadow-[#008be3]/30">
                Mulai Belajar <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="relative w-40 h-40 shrink-0 ml-4">
              <Image src="/quli-maskot.webp" alt="Quli" fill className="object-contain drop-shadow-lg" sizes="160px" />
            </div>
          </div>

          {/* Baris bawah — kursus kiri + widget kanan */}
          <div className="flex gap-6">

          {/* Left */}
          <div className="flex-1 min-w-0 flex flex-col gap-6">

            {/* Kursus saya */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-white">Kursus Saya</h2>
                <Link href="/course" className="text-xs text-white/80 font-semibold hover:underline flex items-center gap-1">
                  Lihat Semua <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="grid grid-cols-2 grid-rows-2 gap-4">
                {MY_COURSES.map((course) => (
                  <Link key={course.id} href={`/course/${course.id}`}
                    className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col">
                    {/* Thumbnail — fixed height */}
                    <div className="relative h-40 bg-[#c9e8ff] shrink-0">
                      <Image src={course.img} alt={course.title} fill sizes="300px" className="object-cover" />
                    </div>
                    {/* Content — flex-1 biar rata bawah */}
                    <div className="p-3 flex flex-col flex-1">
                      <p className="text-xs font-bold text-[#00172e] line-clamp-2 mb-0.5 min-h-[2.5rem]">{course.title}</p>
                      <p className="text-[10px] text-slate-400 mb-2">{course.instructor} &bull; 2 jam yang lalu</p>
                      <div className="mt-auto">
                        <div className="h-1.5 rounded-full bg-slate-100 mb-1">
                          <div className="h-1.5 rounded-full bg-green-400" style={{ width: `${course.progress}%` }} />
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[10px] text-green-500 font-semibold">Progres {course.progress}%</span>
                          <button onClick={(e) => e.preventDefault()} className="text-red-400 hover:text-red-500 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right widget — h-full biar sejajar sama grid kursus kiri */}
          <div className="w-64 shrink-0 flex flex-col gap-4 self-stretch">

            {/* XP Card */}
            <div className="bg-white rounded-2xl p-4 shadow-sm flex-1 flex flex-col gap-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">XP Kamu</p>
                {/* Level badge */}
                <span className="text-[10px] font-bold bg-[#008be3]/10 text-[#008be3] px-2 py-0.5 rounded-full">
                  Lv.12 · Penyelam Mahir
                </span>
              </div>

              {/* XP + mutiara */}
              <div className="flex items-center gap-3">
                {/* Mutiara image */}
                <div className="w-12 h-12 shrink-0 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/pearl.webp"
                    alt="Mutiara"
                    className="w-full h-full object-contain drop-shadow-md"
                  />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-[#008be3] leading-none">3.200</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Mutiara terkumpul</p>
                </div>
              </div>

              {/* Progress ke rank berikutnya */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-slate-400">Menuju Lv.13</span>
                  <span className="text-[10px] font-semibold text-[#008be3]">3.200 / 5.000 XP</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-gradient-to-r from-[#008be3] to-cyan-400 w-[64%] transition-all duration-500" />
                </div>
              </div>

              {/* Streak */}
              <div className="flex items-center gap-2 rounded-xl bg-orange-50 border border-orange-100 px-3 py-2">
                <Flame className="w-4 h-4 text-orange-500 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-orange-500">5 Hari Berturut-turut</p>
                  <p className="text-[10px] text-orange-400">Pertahankan streak belajarmu!</p>
                </div>
              </div>

              {/* Stats bawah — 2 kolom */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 rounded-xl bg-[#f0f7ff] px-3 py-2">
                  <Target className="w-4 h-4 text-[#008be3] shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400">Kursus Selesai</p>
                    <p className="text-xs font-extrabold text-[#00172e]">2 / 4</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-[#f0f7ff] px-3 py-2">
                  <Calendar className="w-4 h-4 text-[#008be3] shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400">Jam Belajar</p>
                    <p className="text-xs font-extrabold text-[#00172e]">24 Jam</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Leaderboard widget */}
            <div className="bg-white rounded-2xl p-4 shadow-sm flex-1 flex flex-col">
              <div className="flex items-center gap-1 mb-3">
                <Trophy className="w-4 h-4 text-amber-400" />
                <p className="text-xs font-bold text-[#00172e]">Top Penyelam</p>
              </div>

              {/* Podium */}
              <div className="flex items-end justify-center gap-3 mb-4 h-20">
                {TOP3.map((t) => (
                  <div key={t.rank} className="flex flex-col items-center gap-1">
                    <div className={`w-8 h-8 rounded-full ${t.color} flex items-center justify-center text-xs font-bold ${t.textColor}`}>
                      {t.name[0]}
                    </div>
                    <div className={`w-14 ${t.h} rounded-t-lg ${t.color} flex items-center justify-center`}>
                      <span className={`text-xs font-bold ${t.textColor}`}>{t.rank}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-1.5">
                {LEADERBOARD.map((item) => (
                  <div key={item.rank}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs ${item.me ? "bg-[#f0f7ff] font-bold text-[#008be3]" : "text-slate-600"}`}>
                    <span className="w-4 text-center font-semibold">{item.rank}.</span>
                    <span className="flex-1 truncate">{item.name}</span>
                    <span className="text-[10px] text-slate-400">{item.xp.toLocaleString()} XP</span>
                  </div>
                ))}
              </div>

              <Link href="/leaderboard" className="mt-3 flex items-center justify-center gap-1 text-xs text-[#008be3] font-semibold hover:underline">
                Lihat semua <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          </div>{/* end baris bawah */}
        </main>
      </div>
    </div>
  );
}