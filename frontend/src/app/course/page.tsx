"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, ChevronLeft, Star, Clock, Users, Lock, LogIn } from "lucide-react";
import PublicLayout from "@/components/home/PublicLayout";

const ALL_COURSES = [
  { id: 1,  title: "Dasar-Dasar Pemrograman Web Bawah Laut",   instructor: "Kak Ariel", rating: 4.9, students: "2.3K", duration: "12 Jam", category: "Teknologi & Koding", img: "/ocean-bg.jpg"   },
  { id: 2,  title: "React & Next.js: Selami Framework Modern",  instructor: "Kak Dina",  rating: 4.8, students: "1.8K", duration: "18 Jam", category: "Teknologi & Koding", img: "/ocean-bg2.webp" },
  { id: 3,  title: "Desain UI/UX: Arus Kreativitas Digital",    instructor: "Kak Sekar", rating: 4.9, students: "3.1K", duration: "10 Jam", category: "UI/UX",              img: "/ocean-bg3.webp" },
  { id: 4,  title: "Bahasa Inggris Intensif: Level Penyelam",   instructor: "Kak Mira",  rating: 4.8, students: "4.2K", duration: "20 Jam", category: "Bahasa",             img: "/ocean-bg.jpg"   },
  { id: 5,  title: "Ekosistem Laut & Biodiversitas Indonesia",  instructor: "Kak Bayu",  rating: 4.7, students: "980",  duration: "8 Jam",  category: "Sains Laut",         img: "/ocean-bg2.webp" },
  { id: 6,  title: "Python untuk Data Science Samudra",         instructor: "Kak Reza",  rating: 4.8, students: "1.5K", duration: "15 Jam", category: "Teknologi & Koding", img: "/ocean-bg3.webp" },
  { id: 7,  title: "Algoritma & Struktur Data Laut Dalam",      instructor: "Kak Ariel", rating: 4.7, students: "1.1K", duration: "16 Jam", category: "Teknologi & Koding", img: "/ocean-bg.jpg"   },
  { id: 8,  title: "Fisika Laut: Gelombang & Arus",             instructor: "Kak Bayu",  rating: 4.6, students: "760",  duration: "10 Jam", category: "Sains Laut",         img: "/ocean-bg2.webp" },
  { id: 9,  title: "Ilustrasi Digital: Menggambar Bawah Laut",  instructor: "Kak Sekar", rating: 4.8, students: "2.1K", duration: "12 Jam", category: "UI/UX",              img: "/ocean-bg3.webp" },
  { id: 10, title: "Bahasa Jepang: Kosakata Laut",              instructor: "Kak Mira",  rating: 4.7, students: "1.3K", duration: "14 Jam", category: "Bahasa",             img: "/ocean-bg.jpg"   },
  { id: 11, title: "TypeScript untuk Developer Modern",         instructor: "Kak Dina",  rating: 4.9, students: "2.8K", duration: "20 Jam", category: "Teknologi & Koding", img: "/ocean-bg2.webp" },
  { id: 12, title: "Konservasi Laut & Lingkungan Hidup",        instructor: "Kak Bayu",  rating: 4.6, students: "540",  duration: "6 Jam",  category: "Sains Laut",         img: "/ocean-bg3.webp" },
];

// Public preview: only show first 6 courses
const PREVIEW_COURSES = ALL_COURSES.slice(0, 6);

export default function CoursePublicPage() {
  return (
    <PublicLayout>
      <main className="px-4 md:px-8 py-4 md:py-6 pb-8">
        <div className="mb-5 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-white mb-1">Jelajahi Kursus</h1>
            <p className="text-sm text-white/70">Preview kursus tersedia — masuk untuk akses penuh.</p>
          </div>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 bg-white text-[#008be3] font-bold text-xs px-4 py-2 rounded-full shadow hover:shadow-md transition-all hover:bg-[#f0f7ff]"
          >
            <LogIn className="w-3.5 h-3.5" /> Masuk untuk Akses Penuh
          </Link>
        </div>

        {/* Grid preview — 6 kursus pertama */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5 mb-6">
          {PREVIEW_COURSES.map((course) => (
            /* Klik card → redirect ke login */
            <Link key={course.id} href="/auth/login"
              className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-black/20 hover:-translate-y-1 transition-all duration-300 flex flex-col">
              <div className="relative h-40 md:h-44 bg-[#c9e8ff] shrink-0">
                <Image src={course.img} alt={course.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw" className="object-cover" />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1">
                  <span className="text-[10px] font-semibold text-[#008be3]">{course.category}</span>
                </div>
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
                <div className="mt-auto pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-sm font-extrabold text-[#008be3]">Gratis</span>
                  <span className="flex items-center gap-1 rounded-full bg-[#008be3] px-4 py-1.5 text-[11px] font-bold text-white group-hover:bg-[#0078c8] transition-colors">
                    Daftar<ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA — lihat lebih → login */}
        <div className="bg-white/15 backdrop-blur-sm border border-white/25 rounded-3xl px-6 py-8 text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <p className="text-white font-extrabold text-lg mb-1">+{ALL_COURSES.length - PREVIEW_COURSES.length} Kursus Lainnya</p>
          <p className="text-white/70 text-sm mb-5">Masuk untuk mengakses semua kursus, melacak progress, dan mendapatkan sertifikat.</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/auth/login"
              className="inline-flex items-center gap-2 bg-white text-[#008be3] font-bold text-sm px-6 py-2.5 rounded-xl shadow-lg hover:bg-[#f0f7ff] transition-all">
              <LogIn className="w-4 h-4" /> Masuk Sekarang
            </Link>
            <Link href="/auth/register"
              className="inline-flex items-center gap-2 bg-[#008be3] text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-lg hover:bg-[#0078c8] transition-all">
              Daftar Gratis <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>
    </PublicLayout>
  );
}