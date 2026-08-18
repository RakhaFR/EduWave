"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, ChevronLeft, Star, Clock, Users } from "lucide-react";
import PublicLayout from "@/components/home/PublicLayout";


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
  const totalPages = Math.ceil(ALL_COURSES.length / PER_PAGE);
  const courses = ALL_COURSES.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const goTo = (p: number) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); };

  return (
    <PublicLayout>
      <main className="px-4 md:px-8 py-4 md:py-6 pb-8">
        <div className="mb-5">
          <h1 className="text-xl md:text-2xl font-extrabold text-white mb-1">Kursus Saya</h1>
          <p className="text-sm text-white/70">Pilih kursus dan lanjutkan petualangan belajarmu.</p>
        </div>

        {/* Grid — 1 col mobile, 2 col sm, 3 col xl */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5 mb-8">
          {courses.map((course) => (
            <Link key={course.id} href={`/course/${course.id}`}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-black/20 hover:-translate-y-1 transition-all duration-300 flex flex-col">
              <div className="relative h-40 md:h-44 bg-[#c9e8ff] shrink-0">
                <Image src={course.img} alt={course.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw" className="object-cover" />
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
                      <div className="h-1.5 rounded-full bg-green-400" style={{ width: `${course.progress}%` }} />
                    </div>
                  </div>
                )}
                <div className="mt-auto pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-sm font-extrabold text-[#008be3]">Gratis</span>
                  <span className="flex items-center gap-1 rounded-full bg-[#008be3] px-4 py-1.5 text-[11px] font-bold text-white group-hover:bg-[#0078c8] transition-colors">
                    {course.enrolled ? "Lanjutkan" : "Daftar"}<ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => goTo(page - 1)} disabled={page === 1}
            className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white disabled:opacity-30 hover:bg-white/30 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: totalPages }).map((_, i) => {
            const p = i + 1;
            return (
              <button key={p} onClick={() => goTo(p)}
                className={`w-9 h-9 rounded-full text-sm font-bold transition-all ${p === page ? "bg-white text-[#008be3] shadow-md" : "bg-white/20 backdrop-blur-sm border border-white/20 text-white hover:bg-white/30"}`}>
                {p}
              </button>
            );
          })}
          <button onClick={() => goTo(page + 1)} disabled={page === totalPages}
            className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white disabled:opacity-30 hover:bg-white/30 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <p className="text-center text-xs text-white/60 mt-3">
          Halaman {page} dari {totalPages} · {ALL_COURSES.length} kursus tersedia
        </p>
      </main>
    </PublicLayout>
  );
}