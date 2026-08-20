"use client";

import { useState, useEffect } from "react";
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
import { publicService } from "@/services/publicService";

// ── Types ──────────────────────────────────────────────────────────────────
type Category = "Semua" | "Teknologi & Koding" | "UI/UX" | "Sains Laut" | "Bahasa";

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration_minutes: number;
  enrolled_count: number;
  thumbnail_url: string | null;
  instructor: {
    id: string;
    full_name: string;
  } | null;
  status: string;
}

const TABS: Category[] = ["Semua", "Teknologi & Koding", "UI/UX", "Sains Laut", "Bahasa"];

const TAB_ICONS: Record<Category, React.ReactNode> = {
  Semua:              <Waves className="w-3.5 h-3.5" />,
  "Teknologi & Koding": <Code2 className="w-3.5 h-3.5" />,
  "UI/UX":            <Palette className="w-3.5 h-3.5" />,
  "Sains Laut":       <FlaskConical className="w-3.5 h-3.5" />,
  Bahasa:             <Languages className="w-3.5 h-3.5" />,
};

// Mapping frontend tab label ke backend category value
const CATEGORY_MAP: Record<Category, string[]> = {
  "Semua": [],
  "Teknologi & Koding": ["technology"],
  "UI/UX": ["design"],
  "Sains Laut": ["marine", "science"],
  "Bahasa": ["language"],
};

// ── Component ──────────────────────────────────────────────────────────────
export default function CoursesSection() {
  const [active, setActive] = useState<Category>("Semua");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCourses() {
      setLoading(true);
      try {
        const res = await publicService.getCourses();
        if (res.success && res.data) {
          setCourses(res.data);
        }
      } catch (err) {
        console.error("Gagal memuat courses:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCourses();
  }, []);

  const filtered =
    active === "Semua"
      ? courses.slice(0, 6)
      : courses.filter((c) => {
          const allowedCategories = CATEGORY_MAP[active] || [];
          return allowedCategories.includes(c.category);
        }).slice(0, 6);

  return (
    <section className="relative bg-[#f0f7ff] text-[#00172e]">

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

        {/* ── Course Grid / Loading ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm animate-pulse"
              >
                <div className="h-44 bg-gradient-to-br from-slate-200 to-slate-300" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-full" />
                  <div className="h-3 bg-slate-200 rounded w-5/6" />
                  <div className="flex gap-3 pt-2">
                    <div className="h-3 bg-slate-200 rounded w-12" />
                    <div className="h-3 bg-slate-200 rounded w-12" />
                    <div className="h-3 bg-slate-200 rounded w-12" />
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="h-4 bg-slate-200 rounded w-16" />
                    <div className="h-7 bg-slate-200 rounded-full w-28" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.length > 0 ? (
              filtered.map((course, i) => (
                <div
                  key={course.id}
                  data-aos="fade-up"
                  data-aos-delay={String((i % 3) * 80)}
                  className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg hover:shadow-blue-100/60 hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Thumbnail */}
                  <div className="relative h-44 bg-gradient-to-br from-[#c9e8ff] to-[#a8d8f0] overflow-hidden">
                    {course.thumbnail_url ? (
                      <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 opacity-20">
                        <svg viewBox="0 0 400 180" className="w-full h-full" preserveAspectRatio="none">
                          <path d="M0,90 C100,60 200,120 300,80 C350,60 380,100 400,90 L400,180 L0,180 Z" fill="#008be3" />
                          <path d="M0,120 C80,100 160,140 280,110 C340,95 380,125 400,115 L400,180 L0,180 Z" fill="#0062a7" opacity="0.6"/>
                        </svg>
                      </div>
                    )}
                    {/* Category chip */}
                    <div className="absolute top-3 left-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1">
                      <BookOpen className="w-3 h-3 text-[#008be3]" />
                      <span className="text-[10px] font-semibold text-[#008be3]">{course.category}</span>
                    </div>
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
                        {course.description}
                      </p>
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="font-semibold text-slate-600">4.8</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {course.enrolled_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {Math.floor(course.duration_minutes / 60)}j {course.duration_minutes % 60}m
                      </span>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <span className="text-sm font-extrabold text-[#008be3]">
                        Gratis
                      </span>
                      <Link
                        href="/auth/login"
                        className="flex items-center gap-1 rounded-full bg-[#008be3] px-4 py-1.5 text-[11px] font-bold text-white transition-all hover:bg-[#0078c8] hover:gap-2 group-hover:shadow-md"
                      >
                        Selami Kursus
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-slate-400 text-sm">Belum ada kursus tersedia untuk kategori ini.</p>
              </div>
            )}
          </div>
        )}

        {/* ── CTA lihat semua ── */}
        <div data-aos="fade-up" className="mt-12 text-center">
          <Link
            href="/auth/login"
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