import Link from "next/link";
import Image from "next/image";
import { 
  Sparkles, 
  Compass, 
  BookOpen, 
  Trophy, 
  Users, 
  Smile, 
  ArrowRight, 
  User, 
  ShieldCheck, 
  GraduationCap 
} from "lucide-react";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col justify-between bg-slate-950 text-white font-sans selection:bg-cyan-500 selection:text-slate-950 overflow-hidden">
      
      {/* HERO IMAGE DENGAN EFEK FADE BLEND DARI KANAN KE KIRI */}
      <div className="absolute inset-0 z-0 flex justify-end pointer-events-none">
        <div className="relative h-full w-full md:w-3/4 lg:w-2/3">
          <Image
            src="/hero-banner.jpg" // File gambar gelombang di public/hero-image.png
            alt="Ocean Wave Background"
            fill
            priority
            className="object-cover object-center"
          />
          {/* Gradient horizontal: Kiri padat slate-950 -> Kanan transparan */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent" />
          {/* Gradient vertikal: Atas & Bawah menyatu ke background */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-transparent to-slate-950" />
        </div>
      </div>

      {/* Navbar */}
      <header className="relative z-10 flex w-full max-w-7xl items-center justify-between px-8 py-6 mx-auto">
        <Link href="/" className="flex items-center gap-2.5 group">
          <svg viewBox="0 0 200 240" className="h-9 w-9 fill-none transition-transform group-hover:scale-105">
            <defs>
              <linearGradient id="navCrestCyanBlue" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38BDF8" />
                <stop offset="100%" stopColor="#0284C7" />
              </linearGradient>
              <linearGradient id="navCrestTealCyan" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2DD4BF" />
                <stop offset="100%" stopColor="#38BDF8" />
              </linearGradient>
            </defs>
            <path d="M20,20 L180,20 C180,20 190,110 100,190 C10,110 20,20 20,20 Z" fill="#0F172A" stroke="url(#navCrestCyanBlue)" strokeWidth="12" strokeLinejoin="round" />
            <path d="M35,95 C60,75 85,115 110,95 C135,75 165,90 165,90 C165,90 170,125 100,168 C38,125 35,95 35,95 Z" fill="url(#navCrestCyanBlue)" opacity="0.6" />
            <path d="M30,115 C55,95 80,135 105,115 C130,95 160,110 160,110 C160,110 165,125 100,172 C35,125 30,115 30,115 Z" fill="url(#navCrestTealCyan)" />
            <polygon points="100,40 155,60 100,80 45,60" fill="#FFFFFF" />
            <polygon points="65,70 65,92 C65,98 80,105 100,105 C120,105 135,98 135,92 L135,70" fill="#E2E8F0" opacity="0.8" />
            <rect x="142" y="60" width="4" height="28" rx="2" fill="#FFFFFF" />
            <circle cx="144" cy="91" r="4" fill="#FFFFFF" />
          </svg>
          <span className="text-xl font-bold tracking-tight text-white">
            Edu<span className="text-cyan-400">Wave</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-300 md:flex">
          <Link href="/dashboard" className="flex items-center gap-2 transition-colors hover:text-cyan-400">
            <Compass className="h-4 w-4" />
            Dashboard
          </Link>
          <Link href="/leaderboard" className="flex items-center gap-2 transition-colors hover:text-cyan-400">
            <Trophy className="h-4 w-4" />
            Leaderboard
          </Link>
          <Link href="/study-room" className="flex items-center gap-2 transition-colors hover:text-cyan-400">
            <Users className="h-4 w-4" />
            Study Room
          </Link>
          <Link href="/mascot-customize" className="flex items-center gap-2 transition-colors hover:text-cyan-400">
            <Smile className="h-4 w-4" />
            Mascot
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="rounded-full px-5 py-2.5 text-sm font-semibold text-slate-200 transition-colors hover:text-white"
          >
            Masuk
          </Link>
          <Link
            href="/register"
            className="flex items-center gap-2 rounded-full bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/25 transition-all hover:bg-cyan-400"
          >
            Mulai Menyelam
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* Hero Section Content (Teks di kiri, berada di atas warna solid) */}
      <main className="relative z-10 flex w-full max-w-7xl flex-1 flex-col items-start justify-center px-8 py-20 mx-auto">
        <div className="flex max-w-2xl flex-col items-start gap-6 text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold text-cyan-400 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Platform Belajar Interaktif #1 Bertema Bawah Laut</span>
          </div>

          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl lg:leading-tight">
            Selami Samudra <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Pengetahuan</span> Tanpa Batas.
          </h1>

          <p className="max-w-xl text-lg text-slate-300 drop-shadow">
            Ratusan kursus interaktif dengan sistem gamifikasi mutiara, AI Study Assistant, dan ruang kolaborasi real-time. Siap taklukkan masa depan digitalmu?
          </p>

          <div className="flex flex-col gap-4 sm:flex-row mt-2">
            <Link
              href="/register"
              className="flex h-12 items-center justify-center gap-2 rounded-full bg-cyan-500 px-8 text-base font-semibold text-slate-950 shadow-lg shadow-cyan-500/30 transition-all hover:bg-cyan-400"
            >
              Mulai Menyelam Sekarang
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/dashboard"
              className="flex h-12 items-center justify-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/60 backdrop-blur-md px-8 text-base font-semibold text-slate-200 transition-all hover:border-slate-500 hover:bg-slate-800"
            >
              <Compass className="h-5 w-5" />
              Lihat Dashboard
            </Link>
          </div>
        </div>
      </main>

      {/* Navigation Footer */}
      <footer className="relative z-10 w-full border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-md py-8 text-center text-xs text-slate-500">
        <div className="flex flex-wrap justify-center gap-6 px-4">
          <Link href="/admin" className="flex items-center gap-1.5 hover:text-slate-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            Admin Panel
          </Link>
          <Link href="/profile" className="flex items-center gap-1.5 hover:text-slate-300">
            <User className="h-3.5 w-3.5" />
            Profile
          </Link>
          <Link href="/course/1" className="flex items-center gap-1.5 hover:text-slate-300">
            <BookOpen className="h-3.5 w-3.5" />
            Sample Course (/course/1)
          </Link>
          <Link href="/exam/1" className="flex items-center gap-1.5 hover:text-slate-300">
            <GraduationCap className="h-3.5 w-3.5" />
            Sample Exam (/exam/1)
          </Link>
        </div>
        <p className="mt-4">© 2026 EduWave. All rights reserved.</p>
      </footer>
    </div>
  );
}