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
  GraduationCap,
} from "lucide-react";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col justify-between bg-slate-950 text-white font-sans selection:bg-cyan-500 selection:text-slate-950 overflow-hidden">
      <div className="absolute inset-0 z-0 flex justify-end pointer-events-none">
        <div className="relative h-full w-full md:w-3/4 lg:w-2/3">
          <Image
            src="/hero-banner.jpg"
            alt="Ocean Wave Background"
            fill
            priority
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-transparent to-slate-950" />
        </div>
      </div>

      {/* Navbar */}
      <header className="relative z-10 flex w-full max-w-7xl items-center justify-between px-8 py-6 mx-auto">
        <Link href="/" className="flex items-center gap-2.5 group">
          <Image
            src="/logo-eduwave.svg"
            alt="EduWave Logo"
            width={36}
            height={36}
            className="h-9 w-auto transition-transform group-hover:scale-105"
            priority
          />
          <span className="text-xl font-bold tracking-tight text-white">
            Edu<span className="text-cyan-400">Wave</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-300 md:flex">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 transition-colors hover:text-cyan-400"
          >
            <Compass className="h-4 w-4" />
            Dashboard
          </Link>
          <Link
            href="/leaderboard"
            className="flex items-center gap-2 transition-colors hover:text-cyan-400"
          >
            <Trophy className="h-4 w-4" />
            Leaderboard
          </Link>
          <Link
            href="/study-room"
            className="flex items-center gap-2 transition-colors hover:text-cyan-400"
          >
            <Users className="h-4 w-4" />
            Study Room
          </Link>
          <Link
            href="/mascot-customize"
            className="flex items-center gap-2 transition-colors hover:text-cyan-400"
          >
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
            Selami Samudra{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Pengetahuan
            </span>{" "}
            Tanpa Batas.
          </h1>

          <p className="max-w-xl text-lg text-slate-300 drop-shadow">
            Ratusan kursus interaktif dengan sistem gamifikasi mutiara, AI Study
            Assistant, dan ruang kolaborasi real-time. Siap taklukkan masa depan
            digitalmu?
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
          <Link
            href="/admin"
            className="flex items-center gap-1.5 hover:text-slate-300"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Admin Panel
          </Link>
          <Link
            href="/profile"
            className="flex items-center gap-1.5 hover:text-slate-300"
          >
            <User className="h-3.5 w-3.5" />
            Profile
          </Link>
          <Link
            href="/course/1"
            className="flex items-center gap-1.5 hover:text-slate-300"
          >
            <BookOpen className="h-3.5 w-3.5" />
            Sample Course (/course/1)
          </Link>
          <Link
            href="/exam/1"
            className="flex items-center gap-1.5 hover:text-slate-300"
          >
            <GraduationCap className="h-3.5 w-3.5" />
            Sample Exam (/exam/1)
          </Link>
        </div>
        <p className="mt-4">© 2026 EduWave. All rights reserved.</p>
      </footer>
    </div>
  );
}
