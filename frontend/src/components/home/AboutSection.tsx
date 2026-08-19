"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Trophy,
  Users,
  LayoutDashboard,
  BotMessageSquare,
  PenLine,
  Smartphone,
} from "lucide-react";
import { publicService } from "@/services/publicService";

const FEATURES = [
  {
    icon: <LayoutDashboard className="w-6 h-6 text-[#008be3]" />,
    title: "Multi-Role Dashboard",
    desc: "Dashboard terpadu untuk Pelajar, Pengajar, dan Orang Tua. Setiap peran punya tampilan dan fitur khusus sesuai kebutuhan.",
    delay: "0",
  },
  {
    icon: <BotMessageSquare className="w-6 h-6 text-[#008be3]" />,
    title: "Quli AI Study Assistant",
    desc: "Asisten belajar berbasis AI yang siap menjawab pertanyaan seputar materi kursus kapan pun kamu butuh, 24/7.",
    delay: "80",
  },
  {
    icon: <Trophy className="w-6 h-6 text-[#008be3]" />,
    title: "Gamifikasi & Mutiara XP",
    desc: "Sistem XP dinamis, Level, Leaderboard, dan kumpulkan Mutiara dari setiap aktivitas pembelajaran yang kamu selesaikan.",
    delay: "160",
  },
  {
    icon: <Users className="w-6 h-6 text-[#008be3]" />,
    title: "Virtual Study Room",
    desc: "Ruang belajar virtual dengan timer Pomodoro bersama, pemutar musik fokus, dan forum diskusi antarsiswa.",
    delay: "0",
  },
  {
    icon: <PenLine className="w-6 h-6 text-[#008be3]" />,
    title: "Adaptive Assessment",
    desc: "Sistem ujian cerdas dengan Practice Mode, Exam Mode, dan mekanisme Spaced Repetition untuk materi yang belum dikuasai.",
    delay: "80",
  },
  {
    icon: <Smartphone className="w-6 h-6 text-[#008be3]" />,
    title: "Accessibility & PWA",
    desc: "Tampilan mobile-friendly dan dukungan Progressive Web App agar kamu tetap bisa belajar di mana saja, bahkan offline.",
    delay: "160",
  },
];

function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let current = 0;
    const steps = Math.max(10, target * 3);
    const intervalTime = 1200 / steps;

    const timer = setInterval(() => {
      current += target / steps;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [target]);

  return <span>{count.toLocaleString()}{suffix}</span>;
}

export default function AboutSection() {
  const [statsData, setStatsData] = useState([
    { target: 0, label: "Penyelam Aktif", suffix: "" },
    { target: 0, label: "Materi Khusus", suffix: "" },
    { target: 0, label: "Total Pendaftaran", suffix: "" },
  ]);

  useEffect(() => {
    async function loadStats() {
      try {
        const response = await publicService.getStats();
        const stats = response?.data;

        setStatsData([
          { target: stats?.active_students ?? 0, label: "Penyelam Aktif", suffix: "" },
          { target: stats?.published_courses ?? 0, label: "Materi Khusus", suffix: "" },
          { target: stats?.total_enrollments ?? 0, label: "Total Pendaftaran", suffix: "" },
        ]);
      } catch (err) {
        console.error("Gagal memuat stats about section:", err);
      }
    }

    loadStats();
  }, []);

  return (
    <section className="relative bg-white text-[#00172e] overflow-hidden">
      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-20 pb-10 md:pt-28 md:pb-12">

        {/* ── Gambar kiri + Teks kanan ── */}
        <div
          data-aos="fade-up"
          className="flex flex-col md:flex-row items-center gap-10 md:gap-16 mb-20"
        >
          {/* Grid 3 foto */}
          <div className="w-full md:w-[45%] shrink-0">
            <div className="grid grid-cols-2 grid-rows-2 gap-3 h-[340px] sm:h-[380px]">

              {/* Foto 1 — besar (row-span-2) */}
              <div className="row-span-2 rounded-2xl overflow-hidden bg-[#c9e8ff] relative shadow-md">
                <Image
                  src="/ocean-bg3.webp"
                  alt="EduWave foto 1"
                  fill
                  sizes="(max-width: 768px) 45vw, (max-width: 1280px) 22vw, 270px"
                  className="object-cover"
                />
              </div>

              {/* Foto 2 — kanan atas */}
              <div className="rounded-2xl overflow-hidden bg-[#ddf0ff] relative shadow-md">
                <Image
                  src="/ocean-bg2.webp"
                  alt="EduWave foto 2"
                  fill
                  sizes="(max-width: 768px) 45vw, (max-width: 1280px) 22vw, 270px"
                  className="object-cover"
                />
              </div>

              {/* Foto 3 — kanan bawah + badge */}
              <div className="rounded-2xl overflow-hidden bg-[#b8e0ff] relative shadow-md">
                <Image
                  src="/ocean-bg.jpg"
                  alt="EduWave foto 3"
                  fill
                  sizes="(max-width: 768px) 45vw, (max-width: 1280px) 22vw, 270px"
                  className="object-cover"
                />
              </div>

            </div>
          </div>

          {/* Teks kanan */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="h-px w-8 bg-[#008be3]/40" />
              <span className="text-xs font-semibold tracking-widest text-[#008be3] uppercase">
                Tentang Kami
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-5 text-[#00172e]">
              Platform Edukasi yang{" "}
              <span className="text-[#008be3]">Mengubah Cara</span> Belajar
              Generasi Digital
            </h2>

            <p className="text-slate-500 text-sm sm:text-base leading-relaxed mb-6">
              EduWave hadir sebagai solusi atas rendahnya{" "}
              <em>completion rate</em> pada LMS konvensional. Kami
              menggabungkan struktur kurikulum komprehensif dengan mekanik
              gamifikasi imersif — dirancang agar setiap sesi belajar terasa
              seperti petualangan nyata, bukan kewajiban.
            </p>

            <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
              Dengan dukungan AI Study Assistant{" "}
              <strong className="text-[#00172e]">Quli</strong>, Skill Tree
              non-linear, sistem Pet Evolution, dan Virtual Study Room
              kolaboratif, EduWave adalah ekosistem belajar lengkap berbasis
              teknologi Next.js, Laravel, dan Gemini AI.
            </p>
          </div>
        </div>

        {/* ── Label Layanan Unggulan ── */}
        <div data-aos="fade-up" className="mb-10">
          <p className="text-xs font-semibold tracking-widest text-[#008be3] uppercase mb-1">
            Fitur Kami
          </p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-[#00172e]">
            Layanan Unggulan{" "}
            <span className="text-[#008be3]">Kami untuk anda</span>
          </h3>
        </div>

        {/* ── Grid Fitur — 1 kolom mobile, 3 kolom sm+ ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-10 mb-20">
          {FEATURES.map((item) => (
            <div
              key={item.title}
              data-aos="fade-up"
              data-aos-delay={item.delay}
              className="group flex flex-col gap-3"
            >
              <div className="w-11 h-11 rounded-xl bg-[#008be3]/10 flex items-center justify-center group-hover:bg-[#008be3]/20 transition-colors duration-300 shrink-0">
                {item.icon}
              </div>
              <div>
                <h4 className="font-bold text-[#00172e] text-sm mb-1">{item.title}</h4>
                <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Stats Row (Animated 0 -> target) ── */}
        <div
          data-aos="fade-up"
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-slate-100 pt-12 text-center"
        >
          {statsData.map((stat) => (
            <div key={stat.label} className="p-4 rounded-2xl bg-slate-50/60 border border-slate-100/80">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#008be3] mb-1">
                <CountUp target={stat.target} suffix={stat.suffix} />
              </div>
              <div className="text-xs text-slate-500 font-semibold tracking-wide">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Wave tipis putih → biru muda */}
      <div className="relative -mb-1 pointer-events-none" style={{ lineHeight: 0 }}>
        <svg viewBox="0 0 1440 50" xmlns="http://www.w3.org/2000/svg" className="w-full block">
          <path d="M0,25 C360,50 1080,0 1440,25 L1440,50 L0,50 Z" fill="#f0f7ff" />
        </svg>
      </div>
    </section>
  );
}