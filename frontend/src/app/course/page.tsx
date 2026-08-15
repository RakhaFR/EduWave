"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Home, Users, GraduationCap, BookOpen, Library,
  BarChart2, Bell, Search, ChevronRight, Play,
  Star, Clock, Trophy, LogOut,
} from "lucide-react";

const SIDEBAR_ITEMS = [
  { icon: <Home className="w-5 h-5" />,          label: "Home",       href: "/dashboard" },
  { icon: <Users className="w-5 h-5" />,         label: "Students",   href: "#" },
  { icon: <GraduationCap className="w-5 h-5" />, label: "Teacher",    href: "#" },
  { icon: <BookOpen className="w-5 h-5" />,      label: "Course",     href: "/course",    active: true },
  { icon: <Play className="w-5 h-5" />,          label: "Live Class", href: "#" },
  { icon: <Library className="w-5 h-5" />,       label: "Library",    href: "#" },
  { icon: <BarChart2 className="w-5 h-5" />,     label: "Reports",    href: "#" },
];

const COURSES = [
  { id: 1, title: "Dasar-Dasar Pemrograman Web Bawah Laut", instructor: "Kak Ariel", rating: 4.9, students: "2.3K", duration: "12 Jam", category: "Teknologi & Koding", img: "/ocean-bg.jpg",   progress: 75,  enrolled: true  },
  { id: 2, title: "React & Next.js: Selami Framework Modern",  instructor: "Kak Dina",  rating: 4.8, students: "1.8K", duration: "18 Jam", category: "Teknologi & Koding", img: "/ocean-bg2.webp", progress: 40,  enrolled: true  },
  { id: 3, title: "Desain UI/UX: Arus Kreativitas Digital",    instructor: "Kak Sekar", rating: 4.9, students: "3.1K", duration: "10 Jam", category: "UI/UX",              img: "/ocean-bg3.webp", progress: 20,  enrolled: true  },
  { id: 4, title: "Bahasa Inggris Intensif: Level Penyelam",   instructor: "Kak Mira",  rating: 4.8, students: "4.2K", duration: "20 Jam", category: "Bahasa",             img: "/ocean-bg.jpg",   progress: 60,  enrolled: true  },
  { id: 5, title: "Ekosistem Laut & Biodiversitas Indonesia",  instructor: "Kak Bayu",  rating: 4.7, students: "980",  duration: "8 Jam",  category: "Sains Laut",         img: "/ocean-bg2.webp", progress: 0,   enrolled: false },
  { id: 6, title: "Python untuk Data Science Samudra",         instructor: "Kak Reza",  rating: 4.8, students: "1.5K", duration: "15 Jam", category: "Teknologi & Koding", img: "/ocean-bg3.webp", progress: 0,   enrolled: false },
];

export default function CoursePage() {
  return (
    <div className="flex min-h-screen bg-[#c9e8ff] font-sans">

      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-white flex flex-col px-5 py-6 shadow-md z-20">
        <Link href="/dashboard" className="flex items-center gap-2 mb-6">
          <Image src="/logo-eduwave.webp" alt="EduWave" width={32} height={32} className="h-8 w-auto" />
          <span className="text-lg font-bold text-[#00172e]">Edu<span className="text-[#008be3]">Wave</span></span>
        </Link>
        <div className="border-b border-slate-100 mb-6" />
        <nav className="flex flex-col gap-1 flex-1">
          {SIDEBAR_ITEMS.map((item) => (
            <Link key={item.label} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                ${item.active
                  ? "bg-[#008be3]/10 text-[#008be3] border-l-4 border-[#008be3]"
                  : "text-slate-500 hover:bg-slate-50 hover:text-[#008be3]"}`}>
              {item.icon}{item.label}
            </Link>
          ))}
        </nav>
        <Link href="/auth/login"
          className="flex items-center justify-center gap-2 mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-red-400 hover:bg-red-50 transition-colors">
          <LogOut className="w-4 h-4" />Keluar
        </Link>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Topbar */}
        <header className="flex items-center justify-between px-8 py-4 bg-[#c9e8ff]">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Cari kursus..."
              className="w-full pl-9 pr-4 py-2.5 rounded-full bg-white text-sm text-slate-700 placeholder-slate-400 outline-none shadow-sm focus:ring-2 focus:ring-[#008be3]/30" />
          </div>
          <div className="flex items-center gap-4">
            <button className="relative w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-sm">
              <Bell className="w-4 h-4 text-slate-500" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-400" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-[#008be3] flex items-center justify-center text-white text-sm font-bold">R</div>
              <span className="text-sm font-semibold text-[#00172e]">Rasya Raya Agung</span>
            </div>
          </div>
        </header>

        <main className="flex-1 px-8 py-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-extrabold text-[#00172e] mb-1">Kursus Saya</h1>
            <p className="text-sm text-slate-500">Pilih kursus dan lanjutkan petualangan belajarmu.</p>
          </div>

          {/* Grid kursus */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {COURSES.map((course) => (
              <Link key={course.id} href={`/course/${course.id}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:shadow-blue-100/60 hover:-translate-y-1 transition-all duration-300 flex flex-col">

                {/* Thumbnail */}
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

                {/* Content */}
                <div className="p-4 flex flex-col gap-3 flex-1">
                  <div>
                    <h3 className="font-bold text-[#00172e] text-sm leading-snug mb-1 line-clamp-2">{course.title}</h3>
                    <p className="text-xs text-slate-400">{course.instructor}</p>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span className="font-semibold text-slate-600">{course.rating}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />{course.students}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />{course.duration}
                    </span>
                  </div>

                  {course.enrolled && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-slate-400">Progress</span>
                        <span className="text-[10px] font-semibold text-green-500">{course.progress}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-100">
                        <div className="h-1.5 rounded-full bg-green-400" style={{ width: `${course.progress}%` }} />
                      </div>
                    </div>
                  )}

                  <div className="mt-auto pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-extrabold text-[#008be3]">Gratis</span>
                      <span className="flex items-center gap-1 rounded-full bg-[#008be3] px-4 py-1.5 text-[11px] font-bold text-white group-hover:bg-[#0078c8] transition-colors">
                        {course.enrolled ? "Lanjutkan" : "Daftar"}
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}