"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import AOS from "aos";
import "aos/dist/aos.css";
import TextAnimation from "@/components/uilayouts/scroll-text";

import {
  Compass,
  Trophy,
  Users,
  Smile,
  ArrowRight,
  BookOpen,
  Sparkles,
  ShieldCheck,
  Waves,
  GraduationCap,
  Rocket,
  LayoutDashboard,
  BotMessageSquare,
  PenLine,
  Smartphone,
} from "lucide-react";
import { FaInstagram, FaWhatsapp, FaTiktok } from "react-icons/fa";

export default function Home() {
  const [bubbles, setBubbles] = useState<
    Array<{ id: number; size: number; left: number; duration: number; delay: number }>
  >([]);

  useEffect(() => {
    // Inisialisasi AOS Animation
    AOS.init({
      duration: 800,
      once: true,
      easing: "ease-out-cubic",
    });

    // Generate gelembung air acak
    const generatedBubbles = Array.from({ length: 18 }).map((_, index) => ({
      id: index,
      size: Math.random() * 24 + 8, // Ukuran 8px - 32px
      left: Math.random() * 100, // Posisi horizontal (%)
      duration: Math.random() * 8 + 6, // Durasi naik 6s - 14s
      delay: Math.random() * 5, // Delay acak
    }));
    setBubbles(generatedBubbles);
  }, []);

  return (
    <>
    <div className="relative flex min-h-screen flex-col justify-between bg-[#004e8a] text-white font-sans overflow-hidden">
      
      {/* ANIMATION WATER BUBBLES */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {bubbles.map((b) => (
          <span
            key={b.id}
            className="absolute bottom-[-50px] rounded-full bg-white/20 border border-white/40 backdrop-blur-[1px] animate-float-bubble"
            style={{
              width: `${b.size}px`,
              height: `${b.size}px`,
              left: `${b.left}%`,
              animationDuration: `${b.duration}s`,
              animationDelay: `${b.delay}s`,
            }}
          />
        ))}
      </div>

      {/* BACKGROUND ORGANIC LAYERED WAVES */}
      <div className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden">
        {/* Top Base Bright Blue */}
        <div className="absolute inset-x-0 top-0 h-[52%] bg-[#008be3]" />

        {/* LAYERED SVG WAVES WITH SMOOTH TRANSITIONS */}
        <div className="absolute inset-0 w-full h-full">
          <svg
            className="w-full h-full"
            viewBox="0 0 1440 900"
            fill="none"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="wave1" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#007ccb" />
                <stop offset="100%" stopColor="#006eb8" />
              </linearGradient>
              <linearGradient id="wave2" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0062a7" />
                <stop offset="100%" stopColor="#005493" />
              </linearGradient>
              <linearGradient id="wave3" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#004881" />
                <stop offset="100%" stopColor="#003c6e" />
              </linearGradient>
            </defs>

            {/* Layer 1: Gelombang Atas */}
            <path
              d="M0 410 C 380 340, 760 480, 1080 380 C 1260 330, 1380 400, 1440 380 L 1440 900 L 0 900 Z"
              fill="url(#wave1)"
            />

            {/* Layer 2: Gelombang Tengah */}
            <path
              d="M0 550 C 340 480, 720 620, 1080 540 C 1280 490, 1380 570, 1440 550 L 1440 900 L 0 900 Z"
              fill="url(#wave2)"
            />

            {/* Layer 3: Gelombang Dasar Bawah */}
            <path
              d="M0 700 C 380 640, 720 760, 1080 680 C 1280 640, 1380 710, 1440 690 L 1440 900 L 0 900 Z"
              fill="url(#wave3)"
            />
          </svg>
        </div>

        {/* Ambient Light Glow di Pusat Maskot */}
        <div className="absolute top-28 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-cyan-200/25 blur-[90px] rounded-full pointer-events-none" />

        {/* WATER SPLASH DECORATION */}
        <div
          data-aos="fade-right"
          data-aos-delay="200"
          className="absolute bottom-0 left-0 w-64 md:w-[440px] h-64 md:h-[440px] z-10 pointer-events-none"
        >
          <Image
            src="/water-splash.webp"
            alt="Water Splash Left"
            fill
            className="object-contain object-bottom-left opacity-95"
            priority
          />
        </div>
        <div
          data-aos="fade-left"
          data-aos-delay="200"
          className="absolute bottom-0 right-0 w-64 md:w-[440px] h-64 md:h-[440px] scale-x-[-1] z-10 pointer-events-none"
        >
          <Image
            src="/water-splash.webp"
            alt="Water Splash Right"
            fill
            className="object-contain object-bottom-right opacity-95"
            priority
          />
        </div>
      </div>

      {/* HEADER WITH DARK LIQUID GLASS NAVBAR */}
      <header
        data-aos="fade-down"
        className="fixed top-0 z-50 w-full px-4 pt-4 md:px-8"
      >
        <div className="relative mx-auto flex w-full max-w-7xl items-center justify-between rounded-full border border-white/15 bg-[#00172e]/60 px-6 py-3.5 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] transition-all duration-300 hover:border-white/25 hover:bg-[#00172e]/70">
          
          {/* Glass Specular Reflection Highlight */}
          <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-r from-white/10 via-transparent to-transparent opacity-40" />

          {/* Logo */}
          <Link href="/" className="relative z-10 flex items-center gap-2 group">
            <Image
              src="/logo-eduwave.webp"
              alt="EduWave Logo"
              width={36}
              height={36}
              className="h-8 w-auto transition-transform group-hover:scale-105"
              priority
            />
            <span className="text-xl font-bold tracking-tight text-white drop-shadow-sm">
              Edu<span className="text-cyan-300">Wave</span>
            </span>
          </Link>

          {/* Navigation Menu */}
          <nav className="relative z-10 hidden items-center gap-8 text-sm font-medium text-slate-200 md:flex">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 transition-all hover:text-cyan-300 hover:scale-105"
            >
              <Compass className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="/leaderboard"
              className="flex items-center gap-2 transition-all hover:text-cyan-300 hover:scale-105"
            >
              <Trophy className="h-4 w-4" />
              Leaderboard
            </Link>
            <Link
              href="/study-room"
              className="flex items-center gap-2 transition-all hover:text-cyan-300 hover:scale-105"
            >
              <Users className="h-4 w-4" />
              Study Room
            </Link>
            <Link
              href="/mascot-customize"
              className="flex items-center gap-2 transition-all hover:text-cyan-300 hover:scale-105"
            >
              <Smile className="h-4 w-4" />
              Mascot
            </Link>
          </nav>

          {/* Right Auth Buttons */}
          <div className="relative z-10 flex items-center gap-3">
            <Link
              href="/auth/login"
              className="rounded-full border border-white/20 bg-white/10 px-5 py-2 text-xs font-semibold text-white backdrop-blur-md transition-all hover:bg-white/20 hover:border-white/35"
            >
              Masuk
            </Link>
            <Link
              href="/auth/register"
              className="flex items-center gap-1.5 rounded-full bg-cyan-400 px-5 py-2 text-xs font-semibold text-[#00172e] backdrop-blur-md shadow-md transition-all hover:bg-cyan-300 hover:scale-105"
            >
              Mulai Penyelam
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

        </div>
      </header>

      {/* HERO CONTENT (CENTERED WITH MASCOT) */}
      <main className="relative z-20 flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-6 pt-24 md:pt-28 pb-6 mx-auto text-center min-h-screen">
        
        {/* MASCOT SECTION */}
        <div
          data-aos="zoom-in"
          data-aos-delay="100"
          className="relative z-[60] flex flex-col items-center justify-center mb-4 group"
        >
          {/* Maskot Image */}
          <div className="relative w-44 h-44 sm:w-52 sm:h-52 lg:w-60 lg:h-60 transition-transform duration-500 hover:scale-105">
            <Image
              src="/quli-maskot.webp"
              alt="EduWave Jellyfish Mascot"
              fill
              className="object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.25)] animate-bounce-slow"
              priority
            />
          </div>
        </div>

        {/* Main Heading */}
        <h1
          data-aos="fade-up"
          data-aos-delay="200"
          className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl lg:leading-tight max-w-3xl drop-shadow-md"
        >
          Selami Ilmu Tanpa Batas Bersama EduWave.
        </h1>

        {/* Subtitle */}
        <p
          data-aos="fade-up"
          data-aos-delay="300"
          className="mt-4 max-w-xl text-sm sm:text-base text-cyan-50 font-normal leading-relaxed opacity-95 drop-shadow-sm"
        >
          Platform belajar interaktif bertema bawah laut dengan AI Study Assistant dan sistem gamifikasi mutiara.
        </p>

        {/* Call To Action Button */}
        <div
          data-aos="zoom-in"
          data-aos-delay="400"
          className="mt-8"
        >
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center rounded-full bg-[#70c9fb] px-12 py-3.5 text-base font-bold text-[#003865] shadow-lg shadow-cyan-950/20 transition-all hover:bg-[#8fd5fc] hover:scale-105 active:scale-95"
          >
            masuk
          </Link>
        </div>

        {/* Social Media Footer Section */}
        <div
          data-aos="fade-up"
          data-aos-delay="500"
          className="mt-12 flex flex-col items-center gap-3"
        >
          <span className="text-xs font-semibold tracking-wider text-cyan-100/90 lowercase">
            follow us:
          </span>
          <div className="flex items-center gap-5 text-cyan-100/90">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="transition-colors hover:text-white hover:scale-110"
            >
              <FaInstagram className="h-5 w-5" />
            </a>
            <a
              href="https://wa.me"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="transition-colors hover:text-white hover:scale-110"
            >
              <FaWhatsapp className="h-5 w-5" />
            </a>
            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="transition-colors hover:text-white hover:scale-110"
            >
              <FaTiktok className="h-5 w-5" />
            </a>
          </div>
        </div>
      </main>

      {/* Smooth wave dari hero ke about — SVG organik, warna hero terbawah */}
      <div className="relative z-20 -mb-1 pointer-events-none" style={{lineHeight: 0}}>
        <svg viewBox="0 0 1440 90" xmlns="http://www.w3.org/2000/svg" className="w-full block">
          <path d="M0,45 C240,85 480,10 720,50 C960,88 1200,15 1440,45 L1440,90 L0,90 Z" fill="#ffffff" />
        </svg>
      </div>
    </div>

    {/* ═══════════════════════════════════════════ */}
    {/* ABOUT SECTION                               */}
    {/* ═══════════════════════════════════════════ */}
    <section className="relative bg-white text-[#00172e] overflow-hidden">

      {/* Subtle blob dekoratif */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-cyan-50 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-50 rounded-full blur-[80px] translate-x-1/3 translate-y-1/3 pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-20 pb-10 md:pt-28 md:pb-12">

        {/* ── HERO ROW: gambar kiri + teks kanan ── */}
        <div
          data-aos="fade-up"
          className="flex flex-col md:flex-row items-center gap-10 md:gap-16 mb-20"
        >
          {/* Gambar / ilustrasi kiri */}
          <div className="w-full md:w-[45%] shrink-0">
            <div className="relative rounded-2xl overflow-hidden shadow-xl shadow-blue-100 aspect-[4/3] bg-[#e8f4ff]">
              <Image
                src="/quli-maskot.webp"
                alt="Tentang EduWave"
                fill
                className="object-contain p-6"
              />
              {/* Floating badge */}
              <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-md">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs font-semibold text-[#00172e]">Platform Aktif 24/7</span>
              </div>
            </div>
          </div>

          {/* Teks kanan */}
          <div className="flex-1">
            {/* Label Tentang Kami */}
            <div className="flex items-center gap-2 mb-4">
              <span className="h-px w-8 bg-[#008be3]/40" />
              <span className="text-xs font-semibold tracking-widest text-[#008be3] uppercase">
                Tentang Kami
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-5 text-[#00172e]">
              Platform Edukasi yang{" "}
              <span className="text-[#008be3]">Mengubah Cara</span>{" "}
              Belajar Generasi Digital
            </h2>

            <p className="text-slate-500 text-sm sm:text-base leading-relaxed mb-6">
              EduWave hadir sebagai solusi atas rendahnya <em>completion rate</em> pada LMS konvensional.
              Kami menggabungkan struktur kurikulum komprehensif dengan mekanik gamifikasi imersif —
              dirancang agar setiap sesi belajar terasa seperti petualangan nyata, bukan kewajiban.
            </p>

            <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
              Dengan dukungan AI Study Assistant <strong className="text-[#00172e]">Quli</strong>,
              Skill Tree non-linear, sistem Pet Evolution, dan Virtual Study Room kolaboratif,
              EduWave adalah ekosistem belajar lengkap berbasis teknologi Next.js, Laravel, dan Gemini AI.
            </p>
          </div>
        </div>

        {/* ── LAYANAN UNGGULAN label ── */}
        <div data-aos="fade-up" className="mb-10">
          <p className="text-xs font-semibold tracking-widest text-[#008be3] uppercase mb-1">Fitur Kami</p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-[#00172e]">
            Layanan Unggulan <span className="text-[#008be3]">Kami untuk anda</span>
          </h3>
        </div>

        {/* ── GRID FITUR 3 kolom — mobile 1 kolom, sm 3 kolom ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-10 mb-20">
          {[
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
          ].map((item) => (
            <div
              key={item.title}
              data-aos="fade-up"
              data-aos-delay={item.delay}
              className="group flex flex-col gap-3"
            >
              {/* Icon */}
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

        {/* ── STATS ROW ── */}
        <div
          data-aos="fade-up"
          className="grid grid-cols-2 sm:grid-cols-4 gap-6 border-t border-slate-100 pt-12"
        >
          {[
            { value: "10K+", label: "Penyelam Aktif" },
            { value: "200+", label: "Materi Kursus" },
            { value: "50+", label: "Ujian Interaktif" },
            { value: "4.9★", label: "Rating Pengguna" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#008be3] mb-1">
                {stat.value}
              </div>
              <div className="text-xs text-slate-400 font-medium tracking-wide">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Bottom wave putih → navy */}
      <div className="relative -mb-1 pointer-events-none" style={{lineHeight: 0}}>
        <svg viewBox="0 0 1440 90" xmlns="http://www.w3.org/2000/svg" className="w-full block">
          <path d="M0,45 C360,5 1080,85 1440,45 L1440,90 L0,90 Z" fill="#00172e" />
        </svg>
      </div>
    </section>



    {/* ─────────────────────────────────────────── */}
    {/* TEXT ANIMATION SECTION                     */}
    {/* ─────────────────────────────────────────── */}
    <section className="bg-gradient-to-b from-[#00172e] via-[#001529] to-[#00172e] text-white overflow-hidden">

      {/* Slide 1 — tagline utama, center */}
      <div className="h-[90vh] flex flex-col justify-center items-center text-center px-6 relative">
        {/* ambient glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[500px] h-[500px] bg-cyan-500/10 blur-[120px] rounded-full" />
        </div>
        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="w-70 h-60 flex items-center justify-center">
            <Image
              src="/logo-eduwave.webp"
              alt="EduWave Logo"
              width={2448}
              height={1632}
              className="h-50 w-auto transition-transform group-hover:scale-105"
              priority
            />
          </div>
          <TextAnimation
            text="Selami ilmu tanpa batas."
            variants={{
              hidden: { filter: "blur(10px)", opacity: 0, y: 24 },
              visible: {
                filter: "blur(0px)",
                opacity: 1,
                y: 0,
                transition: { ease: "easeOut", duration: 0.7 },
              },
            }}
            classname="text-5xl sm:text-6xl xl:text-7xl font-extrabold text-white max-w-xl mx-auto leading-tight"
          />
          <p className="text-cyan-300/70 text-base font-medium tracking-wide">
            EduWave — Platform Belajar Interaktif
          </p>
        </div>
      </div>

      {/* Slide 2 — letter by letter, left align */}
      <div className="h-[90vh] flex items-center px-8 md:px-20 relative">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-cyan-400/8 blur-[100px] rounded-full pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-6">
            <GraduationCap className="w-5 h-5 text-cyan-400" />
            <span className="text-xs font-semibold tracking-widest text-cyan-400 uppercase">Belajar Bersama</span>
          </div>
          <TextAnimation
            as="p"
            letterAnime={true}
            text="Bersama Quli, belajar jadi petualangan."
            classname="text-4xl sm:text-5xl xl:text-6xl font-extrabold text-white leading-snug"
            variants={{
              hidden: { filter: "blur(4px)", opacity: 0, y: 16 },
              visible: {
                filter: "blur(0px)",
                opacity: 1,
                y: 0,
                transition: { duration: 0.18 },
              },
            }}
          />
          <p className="mt-6 text-cyan-100/50 text-sm leading-relaxed max-w-md">
            AI Study Assistant kami siap menemanimu kapan saja, di mana saja.
          </p>
        </div>
      </div>

      {/* Slide 3 — word by word, right align */}
      <div className="h-[90vh] flex justify-end items-center px-8 md:px-20 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-500/8 blur-[100px] rounded-full pointer-events-none" />
        <div className="relative z-10 max-w-2xl text-right">
          <div className="flex items-center justify-end gap-2 mb-6">
            <span className="text-xs font-semibold tracking-widest text-cyan-400 uppercase">Gamifikasi</span>
            <Trophy className="w-5 h-5 text-cyan-400" />
          </div>
          <TextAnimation
            text="Kumpulkan mutiara. Taklukkan leaderboard."
            direction="right"
            classname="text-4xl sm:text-5xl xl:text-6xl font-extrabold text-white leading-snug"
          />
          <p className="mt-6 text-cyan-100/50 text-sm leading-relaxed ml-auto max-w-md">
            Setiap pencapaian memberimu poin mutiara untuk naik peringkat.
          </p>
        </div>
      </div>

      {/* Slide 4 — line by line, center + CTA */}
      <div className="h-[90vh] flex flex-col justify-center items-center text-center px-6 relative">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[300px] bg-cyan-400/8 blur-[100px] rounded-full" />
        </div>
        <div className="relative z-10 flex flex-col items-center gap-8">
          <div className="flex items-center gap-2 mb-2">
            <Rocket className="w-5 h-5 text-cyan-400" />
            <span className="text-xs font-semibold tracking-widest text-cyan-400 uppercase">Mulai Sekarang</span>
          </div>
          <TextAnimation
            text="Jadilah penyelam ilmu terbaik. Mulai perjalananmu hari ini."
            direction="down"
            lineAnime={true}
            classname="text-4xl sm:text-5xl xl:text-6xl font-extrabold text-white leading-tight max-w-2xl mx-auto"
          />
          <Link
            href="/auth/register"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-cyan-400 px-10 py-4 text-sm font-bold text-[#00172e] shadow-lg shadow-cyan-950/30 transition-all hover:bg-cyan-300 hover:scale-105 active:scale-95"
          >
            Mulai Menyelam
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

    </section>
    </>
  );
}