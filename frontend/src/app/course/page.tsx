"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Home, Users, GraduationCap, BookOpen, Library,
  BarChart2, Bell, Search, ChevronRight, ChevronLeft,
  Play, Star, Clock, LogOut, ChevronDown,
} from "lucide-react";
import FloatingBubbles from "@/components/ui/FloatingBubbles";

const SIDEBAR_ITEMS = [
  { icon: <Home className="w-5 h-5" />,          label: "Home",       href: "/dashboard" },
  { icon: <Users className="w-5 h-5" />,         label: "Students",   href: "#" },
  { icon: <GraduationCap className="w-5 h-5" />, label: "Teacher",    href: "#" },
  { icon: <BookOpen className="w-5 h-5" />,      label: "Course",     href: "/course", active: true },
  { icon: <Play className="w-5 h-5" />,          label: "Live Class", href: "#" },
  { icon: <Library className="w-5 h-5" />,       label: "Library",    href: "#" },
  { icon: <BarChart2 className="w-5 h-5" />,     label: "Reports",    href: "#" },
];

const ALL_COURSES = [
  { id: 1,  title: "Dasar-Dasar Pemrograman Web Bawah Laut",   instructor: "Kak Ariel", rating: 4.9, students: "2.3K", duration: "12 Jam", category: "Teknologi & Koding", img: "/ocean-bg.jpg",   progress: 75, enrolled: true  },
  { id: 2,  title: "React & Next.js: Selami Framework Modern",  instructor: "Kak Dina",  rating: 4.8, students: "1.8K", duration: "18 Jam", category: "Teknologi & Koding", img: "/ocean-bg2.webp", progress: 40, enrolled: true  },
  { id: 3,  title: "Desain UI/UX: Arus Kreativitas Digital",    instructor: "Kak Sekar", rating: 4.9, students: "3.1K", duration: "10 Jam", category: "UI/UX",              img: "/ocean-bg3.webp", progress: 20, enrolled: true  },
  { id: 4,  title: "Bahasa Inggris Intensif: Level Penyelam",   instructor: "Kak Mira",  rating: 4.8, students: "4.2K", duration: "20 Jam", category: "Bahasa",             img: "/ocean-bg.jpg",   progress: 60, enrolled: true  },
  { id: 5,  title: "Ekosistem Laut & Biodiversitas Indonesia",  instructor: "Kak Bayu",  rating: 4.7, students: "980",  duration: "8 Jam",  category: "Sains Laut",         img: "/ocean-bg2.webp", progress: 0,  enrolled: false },
  { id: 6,  title: "Python untuk Data Science Samudra",         instructor: "Kak Reza",  rating: 4.8, students: "1.5K", duration: "15 Jam", category: "Teknologi & Koding", img: "/ocean-bg3.webp", progress: 0,  enrolled: false },
  { id: 7,  title: "Algoritma & Struktur Data Laut Dalam",      instructor: "Kak Ariel", rating: 4.7, students: "1.1K", duration: "16 Jam", category: "Teknologi & Koding", img: "/ocean-bg.jpg",   progress: 0,  enrolled: false },
  { id: 8,  title: "Fisika Laut: Gelombang & Arus",             instructor: "Kak Bayu",  rating: 4.6, students: "760",  duration: "10 Jam", category: "Sains Laut",         img: "/ocean-bg2.webp", progress: 0,  enrolled: false },
  { id: 9,  title: "Ilustrasi Digital: Menggambar Bawah Laut",  instructor: "Kak Sekar", rating: 4.8, students: "2.1K", duration: "12 Jam", category: "UI/UX",              img: "/ocean-bg3.webp", progress: 0,  enrolled: false },
  { id: 10, title: "Bahasa Jepang: Kosakata Laut",              instructor: "Kak Mira",  rating: 4.7, students: "1.3K", duration: "14 Jam", category: "Bahasa",             img: "/ocean-bg.jpg",   progress: 0,  enrolled: false },
  { id: 11, title: "TypeScript untuk Developer Modern",         instructor: "Kak Dina",  rating: 4.9, students: "2.8K", duration: "20 Jam", category: "Teknologi & Koding", img: "/ocean-bg2.webp", progress: 0,  enrolled: false },
  { id: 12, title: "Konservasi Laut & Lingkungan Hidup",        instructor: "Kak Bayu",  rating: 4.6, students: "540",  duration: "6 Jam",  category: "Sains Laut",         img: "/ocean-bg3.webp", progress: 0,  enrolled: false },
];

const PER_PAGE = 6;

export default function CoursePage() {
  const [page, setPage] = useState(1);
  const [avatarOpen, setAvatarOpen] = useState(false);

  const totalPages = Math.ceil(ALL_COURSES.length / PER_PAGE);
  const courses = ALL_COURSES.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const goTo = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      className="flex min-h-screen font-sans relative"
      style={{ background: "linear-gradient(180deg, #42AEED 0%, #0063A7 100%)" }}
    >
      <FloatingBubbles count={20} />

      {/* Ornamen karang */}
      <div className="fixed bottom-0 left-0 right-0 pointer-events-none" style={{ zIndex: 1 }}>
        <img src="/ocean-ornament.svg" alt="" className="w-full"
          style={{ display: "block", height: "240px", objectFit: "cover", objectPosition: "top" }} />
      </div>

      {/* Sidebar */}
      <div className="w-64 shrink-0 p-3 relative" style={{ zIndex: 20 }}>
        <aside className="relative h-full rounded-3xl bg-white flex flex-col px-5 py-6 shadow-xl">
          <Link href="/dashboard" className="flex items-center gap-2 mb-2">
            <Image src="/logo-eduwave.webp" alt="EduWave" width={32} height={32} className="h-8 w-auto" />
            <span className="text-lg font-bold text-[#00172e]">Edu<span className="text-[#008be3]">Wave</span></span>
            <ChevronRight className="w-4 h-4 text-slate-300 ml-auto" />
          </Link>
          <div className="border-b border-slate-100 mb-5" />
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
            <input type="text" placeholder="Cari kursus..."
              className="w-full pl-9 pr-4 py-2.5 rounded-full bg-white text-sm text-slate-700 placeholder-slate-400 outline-none shadow-sm focus:ring-2 focus:ring-[#008be3]/30" />
          </div>

          <div className="flex items-center gap-4">
            <button className="relative w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20 hover:bg-white/30">
              <Bell className="w-4 h-4 text-white" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-400" />
            </button>

            {/* Avatar dropdown — Keluar di sini */}
            <div className="relative">
              <button
                onClick={() => setAvatarOpen(!avatarOpen)}
                className="flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/20 pl-1 pr-3 py-1 hover:bg-white/30 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-[#008be3] flex items-center justify-center text-white text-xs font-bold">R</div>
                <span className="text-sm font-semibold text-white">Rasya Raya Agung</span>
                <ChevronDown className={`w-3.5 h-3.5 text-white/70 transition-transform ${avatarOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown */}
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

        <main className="flex-1 px-8 py-6 pb-40">
          <div className="mb-6">
            <h1 className="text-2xl font-extrabold text-white mb-1">Kursus Saya</h1>
            <p className="text-sm text-white/70">Pilih kursus dan lanjutkan petualangan belajarmu.</p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
            {courses.map((course) => (
              <Link key={course.id} href={`/course/${course.id}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-black/20 hover:-translate-y-1 transition-all duration-300 flex flex-col">
                <div className="relative h-44 bg-[#c9e8ff] shrink-0">
                  <Image src={course.img} alt={course.title} fill sizes="(max-width: 1280px) 50vw, 33vw" className="object-cover" />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1">
                    <span className="text-[10px] font-semibold text-[#008be3]">{course.category}</span>
                  </div>
                  {course.enrolled && (
                    <div className="absolute top-3 right-3 bg-green-400 rounded-full px-2.5 py-1">
                      <span className="text-[10px] font-semibold text-white">Terdaftar</span>
                    </div>
                  )}
                </div>

                <div className="p-4 flex flex-col gap-3 flex-1">
                  <div>
                    <h3 className="font-bold text-[#00172e] text-sm leading-snug mb-1 line-clamp-2 min-h-[2.5rem]">{course.title}</h3>
                    <p className="text-xs text-slate-400">{course.instructor}</p>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span className="font-semibold text-slate-600">{course.rating}</span>
                    </span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{course.students}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{course.duration}</span>
                  </div>
                  {course.enrolled && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-slate-400">Progress</span>
                        <span className="text-[10px] font-semibold text-green-500">{course.progress}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-100">
                        <div className="h-1.5 rounded-full bg-green-400 transition-all" style={{ width: `${course.progress}%` }} />
                      </div>
                    </div>
                  )}
                  <div className="mt-auto pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-sm font-extrabold text-[#008be3]">Gratis</span>
                    <span className="flex items-center gap-1 rounded-full bg-[#008be3] px-4 py-1.5 text-[11px] font-bold text-white group-hover:bg-[#0078c8] transition-colors">
                      {course.enrolled ? "Lanjutkan" : "Daftar"}
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => goTo(page - 1)}
              disabled={page === 1}
              className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white disabled:opacity-30 hover:bg-white/30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }).map((_, i) => {
              const p = i + 1;
              return (
                <button
                  key={p}
                  onClick={() => goTo(p)}
                  className={`w-9 h-9 rounded-full text-sm font-bold transition-all ${
                    p === page
                      ? "bg-white text-[#008be3] shadow-md"
                      : "bg-white/20 backdrop-blur-sm border border-white/20 text-white hover:bg-white/30"
                  }`}
                >
                  {p}
                </button>
              );
            })}

            <button
              onClick={() => goTo(page + 1)}
              disabled={page === totalPages}
              className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white disabled:opacity-30 hover:bg-white/30 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Info halaman */}
          <p className="text-center text-xs text-white/60 mt-3">
            Halaman {page} dari {totalPages} · {ALL_COURSES.length} kursus tersedia
          </p>
        </main>
      </div>
    </div>
  );
}