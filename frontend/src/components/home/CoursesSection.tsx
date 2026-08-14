"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Code2,
  Palette,
  FlaskConical,
  Languages,
  Users,
  Star,
  Clock,
  BookOpen,
  ArrowRight,
  Waves,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────
type Category = "Semua" | "Teknologi & Koding" | "UI/UX" | "Sains Laut" | "Bahasa";

interface Course {
  id: number;
  category: Exclude<Category, "Semua">;
  title: string;
  desc: string;
  instructor: string;
  rating: number;
  students: string;
  duration: string;
  price: "Gratis" | string;
  badge?: string;
}

// ── Data ───────────────────────────────────────────────────────────────────
const COURSES: Course[] = [
  {
    id: 1,
    category: "Teknologi & Koding",
    title: "Dasar–Dasar Pemrograman Web Bawah Laut",
    desc: "Kuasai HTML, CSS, dan JavaScript dari nol. Mulai perjalananmu sebagai web developer dengan fondasi yang kuat dan menyenangkan.",
    instructor: "Kak Ariel",
    rating: 4.9,
    students: "2.3K",
    duration: "12 Jam",
    price: "Gratis",
    badge: "Populer",
  },
  {
    id: 2,
    category: "Teknologi & Koding",
    title: "React & Next.js: Selami Framework Modern",
    desc: "Bangun aplikasi web modern dengan React dan Next.js. Pelajari komponen, routing, SSR, dan deploy ke produksi.",
    instructor: "Kak Dina",
    rating: 4.8,
    students: "1.8K",
    duration: "18 Jam",
    price: "Gratis",
  },
  {
    id: 3,
    category: "UI/UX",
    title: "Desain UI/UX: Arus Kreativitas Digital",
    desc: "Pelajari prinsip desain antarmuka, riset pengguna, wireframing, dan prototyping menggunakan Figma dari dasar hingga mahir.",
    instructor: "Kak Sekar",
    rating: 4.9,
    students: "3.1K",
    duration: "10 Jam",
    price: "Gratis",
    badge: "Terlaris",
  },
  {
    id: 4,
    category: "Sains Laut",
    title: "Ekosistem Laut & Biodiversitas Indonesia",
    desc: "Jelajahi kekayaan laut Nusantara — dari terumbu karang, biota laut, hingga upaya konservasi yang bisa kamu ikuti.",
    instructor: "Kak Bayu",
    rating: 4.7,
    students: "980",
    duration: "8 Jam",
    price: "Gratis",
  },
  {
    id: 5,
    category: "Bahasa",
    title: "Bahasa Inggris Intensif: Level Penyelam",
    desc: "Tingkatkan kemampuan speaking, writing, dan grammar-mu dengan metode immersive bertema petualangan laut yang seru.",
    instructor: "Kak Mira",
    rating: 4.8,
    students: "4.2K",
    duration: "20 Jam",
    price: "Gratis",
    badge: "Baru",
  },
  {
    id: 6,
    category: "Teknologi & Koding",
    title: "Python untuk Data Science Samudra",
    desc: "Analisis data kelautan menggunakan Python, Pandas, dan Matplotlib. Cocok untuk pemula yang ingin masuk dunia data.",
    instructor: "Kak Reza",
    rating: 4.8,
    students: "1.5K",
    duration: "15 Jam",
    price: "Gratis",
  },
];

const TABS: Category[] = ["Semua", "Teknologi & Koding", "UI/UX", "Sains Laut", "Bahasa"];

const TAB_ICONS: Record<Category, React.ReactNode> = {
  Semua:              <Waves className="w-3.5 h-3.5" />,
  "Teknologi & Koding": <Code2 className="w-3.5 h-3.5" />,
  "UI/UX":            <Palette className="w-3.5 h-3.5" />,
  "Sains Laut":       <FlaskConical className="w-3.5 h-3.5" />,
  Bahasa:             <Languages className="w-3.5 h-3.5" />,
};

const BADGE_COLOR: Record<string, string> = {
  Populer:  "bg-[#008be3]/15 text-[#008be3]",
  Terlaris: "bg-amber-100 text-amber-600",
  Baru:     "bg-emerald-100 text-emerald-600",
};

// ── Component ──────────────────────────────────────────────────────────────
export default function CoursesSection() {
  const [active, setActive] = useState<Category>("Semua");

  const filtered =
    active === "Semua"
      ? COURSES
      : COURSES.filter((c) => c.category === active);

  return (
    <section className="relative bg-[#f0f7ff] text-[#00172e] overflow-hidden">

      {/* Wave putih → biru muda */}
      <div className="relative -mt-1 pointer-events-none" style={{ lineHeight: 0 }}>
        <svg viewBox="0 0 1440 70" xmlns="http://www.w3.org/2000/svg" className="w-full block">
          <path d="M0,35 C360,0 1080,70 1440,35 L1440,0 L0,0 Z" fill="#ffffff" />
        </svg>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">

        {/* ── Header ── */}
        <div data-aos="fade-up" className="text-center mb-10">
          <div className="flex items-center gap-2 justify-center mb-3">
            <span className="h-px w-8 bg-[#008be3]/40" />
            <span className="text-xs font-semibold tracking-widest text-[#008be3] uppercase">
              Eksplorasi Kursus
            </span>
            <span className="h-px w-8 bg-[#008be3]/40" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#00172e] mb-3">
            Peta Kursus <span className="text-[#008be3]">Penjelajah</span>
          </h2>
          <p className="text-slate-500 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Pilih misi pembelajaranmu dan mulai petualangan di samudra pengetahuan.
          </p>
        </div>

        {/* ── Filter Tabs ── */}
        <div
          data-aos="fade-up"
          data-aos-delay="100"
          className="flex flex-wrap justify-center gap-2 mb-10"
        >
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActive(tab)}
              className={[
                "flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200",
                active === tab
                  ? "bg-[#008be3] text-white shadow-md shadow-[#008be3]/30 scale-105"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-[#008be3]/40 hover:text-[#008be3]",
              ].join(" ")}
            >
              {TAB_ICONS[tab]}
              {tab}
            </button>
          ))}
        </div>

        {/* ── Course Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((course, i) => (
            <div
              key={course.id}
              data-aos="fade-up"
              data-aos-delay={String((i % 3) * 80)}
              className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg hover:shadow-blue-100/60 hover:-translate-y-1 transition-all duration-300"
            >
              {/* Thumbnail */}
              <div className="relative h-44 bg-gradient-to-br from-[#c9e8ff] to-[#a8d8f0] overflow-hidden">
                {/* Dekoratif wave di thumbnail */}
                <div className="absolute inset-0 opacity-20">
                  <svg viewBox="0 0 400 180" className="w-full h-full" preserveAspectRatio="none">
                    <path d="M0,90 C100,60 200,120 300,80 C350,60 380,100 400,90 L400,180 L0,180 Z" fill="#008be3" />
                    <path d="M0,120 C80,100 160,140 280,110 C340,95 380,125 400,115 L400,180 L0,180 Z" fill="#0062a7" opacity="0.6"/>
                  </svg>
                </div>
                {/* Category chip */}
                <div className="absolute top-3 left-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1">
                  <BookOpen className="w-3 h-3 text-[#008be3]" />
                  <span className="text-[10px] font-semibold text-[#008be3]">{course.category}</span>
                </div>
                {/* Badge */}
                {course.badge && (
                  <div className={`absolute top-3 right-3 rounded-full px-2.5 py-1 text-[10px] font-bold ${BADGE_COLOR[course.badge]}`}>
                    {course.badge}
                  </div>
                )}
                {/* Bottom label kursus */}
                <div className="absolute bottom-0 left-0 right-0 px-4 py-3 bg-gradient-to-t from-[#003c6e]/80 to-transparent">
                  <p className="text-white text-xs font-semibold line-clamp-1">{course.title}</p>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 flex flex-col gap-3">
                <div>
                  <h3 className="font-bold text-[#00172e] text-sm leading-snug mb-1 line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">
                    {course.desc}
                  </p>
                </div>

                {/* Meta */}
                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span className="font-semibold text-slate-600">{course.rating}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {course.students}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {course.duration}
                  </span>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <span className="text-sm font-extrabold text-[#008be3]">
                    {course.price}
                  </span>
                  <Link
                    href={`/course/${course.id}`}
                    className="flex items-center gap-1 rounded-full bg-[#008be3] px-4 py-1.5 text-[11px] font-bold text-white transition-all hover:bg-[#0078c8] hover:gap-2 group-hover:shadow-md"
                  >
                    Selami Kursus
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── CTA lihat semua ── */}
        <div data-aos="fade-up" className="mt-12 text-center">
          <Link
            href="/course"
            className="inline-flex items-center gap-2 rounded-full border-2 border-[#008be3] text-[#008be3] px-8 py-3 text-sm font-bold transition-all hover:bg-[#008be3] hover:text-white hover:scale-105"
          >
            Lihat Semua Kursus
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Bottom wave biru muda → navy */}
      <div className="relative -mb-1 pointer-events-none" style={{ lineHeight: 0 }}>
        <svg viewBox="0 0 1440 70" xmlns="http://www.w3.org/2000/svg" className="w-full block">
          <path d="M0,35 C360,70 1080,0 1440,35 L1440,70 L0,70 Z" fill="#00172e" />
        </svg>
      </div>
    </section>
  );
}