"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Trophy,
  Users,
  Smile,
  ArrowRight,
  BookOpen,
  Menu,
  X,
} from "lucide-react";

interface NavbarProps {
  theme: "light" | "dark";
}

const NAV_ITEMS = [
  { href: "/auth/login",           icon: <BookOpen className="h-4 w-4" />, label: "Kursus" },
  { href: "/auth/login",      icon: <Trophy className="h-4 w-4" />,   label: "Leaderboard" },
  { href: "/auth/login",       icon: <Users className="h-4 w-4" />,    label: "Study Room" },
  { href: "/auth/login", icon: <Smile className="h-4 w-4" />,    label: "Mascot" },
];

export default function Navbar({ theme }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isLight = theme === "light";

  return (
    <header className="fixed top-0 z-50 w-full px-4 pt-4 md:px-8">
      {/* ── Pill Navbar ── */}
      <div
        className={[
          "relative mx-auto flex w-full max-w-7xl items-center justify-between rounded-full px-5 py-3 transition-all duration-500",
          isLight
            ? "bg-white/90 backdrop-blur-xl border border-slate-200/80 shadow-[0_4px_24px_0_rgba(0,23,46,0.10)]"
            : "bg-[#00172e]/60 backdrop-blur-xl border border-white/15 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]",
        ].join(" ")}
      >
        {/* Specular highlight */}
        <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-r from-white/10 via-transparent to-transparent opacity-30" />

        {/* Logo */}
        <Link href="/" className="relative z-10 flex items-center gap-2 group shrink-0">
          <Image
            src="/logo-eduwave.webp"
            alt="EduWave Logo"
            width={36}
            height={36}
            className="h-8 w-auto transition-transform group-hover:scale-105"
            priority
          />
          <span
            className={[
              "text-xl font-bold tracking-tight transition-colors duration-300",
              isLight ? "text-[#00172e]" : "text-white drop-shadow-sm",
            ].join(" ")}
          >
            Edu<span className="text-[#008be3]">Wave</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav
          className={[
            "relative z-10 hidden items-center gap-7 text-sm font-medium md:flex transition-colors duration-300",
            isLight ? "text-slate-600" : "text-slate-200",
          ].join(" ")}
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={[
                "flex items-center gap-1.5 transition-all hover:scale-105",
                isLight ? "hover:text-[#008be3]" : "hover:text-cyan-300",
              ].join(" ")}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="relative z-10 hidden md:flex items-center gap-3">
          <Link
            href="/auth/login"
            className={[
              "rounded-full px-5 py-2 text-xs font-semibold transition-all",
              isLight
                ? "border border-slate-200 text-[#00172e] hover:bg-slate-50"
                : "border border-white/20 bg-white/10 text-white hover:bg-white/20",
            ].join(" ")}
          >
            Masuk
          </Link>
          <Link
            href="/auth/register"
            className="flex items-center gap-1.5 rounded-full bg-[#008be3] px-5 py-2 text-xs font-semibold text-white shadow-md transition-all hover:bg-[#0078c8] hover:scale-105"
          >
            Mulai Penyelam
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          className={[
            "relative z-10 flex md:hidden items-center justify-center w-9 h-9 rounded-full transition-colors",
            isLight
              ? "text-[#00172e] hover:bg-slate-100"
              : "text-white hover:bg-white/10",
          ].join(" ")}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      <div
        className={[
          "mx-auto mt-2 w-full max-w-7xl rounded-2xl overflow-hidden transition-all duration-300 origin-top",
          mobileOpen
            ? "opacity-100 scale-y-100 max-h-[400px]"
            : "opacity-0 scale-y-95 max-h-0 pointer-events-none",
        ].join(" ")}
      >
        <div
          className={[
            "flex flex-col px-4 py-4 gap-1 backdrop-blur-xl border rounded-2xl shadow-xl",
            isLight
              ? "bg-white/95 border-slate-200"
              : "bg-[#00172e]/90 border-white/10",
          ].join(" ")}
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={[
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                isLight
                  ? "text-slate-700 hover:bg-slate-50 hover:text-[#008be3]"
                  : "text-slate-200 hover:bg-white/5 hover:text-cyan-300",
              ].join(" ")}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}

          <div className="border-t mt-2 pt-3 flex flex-col gap-2 border-slate-200/20">
            <Link
              href="/auth/login"
              onClick={() => setMobileOpen(false)}
              className={[
                "w-full text-center rounded-xl px-4 py-2.5 text-sm font-semibold border transition-colors",
                isLight
                  ? "border-slate-200 text-[#00172e] hover:bg-slate-50"
                  : "border-white/15 text-white hover:bg-white/10",
              ].join(" ")}
            >
              Masuk
            </Link>
            <Link
              href="/auth/register"
              onClick={() => setMobileOpen(false)}
              className="w-full text-center rounded-xl bg-[#008be3] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0078c8] transition-colors"
            >
              Mulai Penyelam →
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}