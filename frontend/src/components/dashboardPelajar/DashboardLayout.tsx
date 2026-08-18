"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home, BookOpen, Users, Users2, Trophy, BarChart2, GraduationCap,
  Play, Bell, Search, ChevronRight,
  LogOut, ChevronDown, Menu, X,
} from "lucide-react";
import FloatingBubbles from "@/components/ui/FloatingBubbles";

const NAV_ITEMS = [
  { icon: <Home className="w-5 h-5" />,           label: "Home",        href: "/pelajar" },
  { icon: <BookOpen className="w-5 h-5" />,       label: "Course",      href: "/pelajar/course" },
  { icon: <Play className="w-5 h-5" />,           label: "Live Class",  href: "/pelajar/liveClass" },
  { icon: <Users2 className="w-5 h-5" />,         label: "Study Room",  href: "/pelajar/study-room" },
  { icon: <Trophy className="w-5 h-5" />,         label: "Leaderboard", href: "/pelajar/leaderboard" },
  { icon: <GraduationCap className="w-5 h-5" />,  label: "Pembimbing",  href: "/pelajar/pembimbing" },
  { icon: <BarChart2 className="w-5 h-5" />,      label: "Report",      href: "/pelajar/report" },
];

// Bottom nav mobile — item utama (tanpa admin items)
const BOTTOM_NAV = [
  { icon: <Home className="w-5 h-5" />,          label: "Home",   href: "/pelajar" },
  { icon: <BookOpen className="w-5 h-5" />,      label: "Course", href: "/pelajar/course" },
  { icon: <Trophy className="w-5 h-5" />,        label: "Rank",   href: "/pelajar/leaderboard" },
  { icon: <Users2 className="w-5 h-5" />,        label: "Room",   href: "/pelajar/study-room" },
  { icon: <BarChart2 className="w-5 h-5" />,     label: "Report", href: "/pelajar/report" },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
  searchPlaceholder?: string;
}

export default function DashboardLayout({ children, searchPlaceholder = "Search..." }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div
      className="flex min-h-screen font-sans relative"
      style={{ background: "linear-gradient(180deg, #42AEED 0%, #0063A7 100%)" }}
    >
      <FloatingBubbles count={20} />

      {/* Ornamen karang */}
      <div className="fixed bottom-0 left-0 right-0 pointer-events-none" style={{ zIndex: 1 }}>
        <img src="/ocean-ornament.svg" alt="" className="w-full"
          style={{ display: "block", height: "240px", objectFit: "cover", objectPosition: "top" }} />
      </div>

      {/* ── SIDEBAR DESKTOP (md+) ── */}
      <div className="hidden md:block w-16 lg:w-64 shrink-0 p-3 relative" style={{ zIndex: 20 }}>
        <aside className="relative h-full rounded-3xl bg-white flex flex-col px-2 lg:px-5 py-6 shadow-xl">

          {/* Logo */}
          <Link href="/pelajar" className="flex items-center gap-2 mb-2 justify-center lg:justify-start">
            <Image src="/logo-eduwave.webp" alt="EduWave" width={32} height={32} className="h-8 w-auto shrink-0" />
            <span className="hidden lg:block text-lg font-bold text-[#00172e]">
              Edu<span className="text-[#008be3]">Wave</span>
            </span>
            <ChevronRight className="hidden lg:block w-4 h-4 text-slate-300 ml-auto" />
          </Link>

          <div className="border-b border-slate-100 mb-5" />

          {/* Nav */}
          <nav className="flex flex-col gap-0.5 flex-1">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href || (item.href !== "#" && pathname.startsWith(item.href) && item.href !== "/pelajar") || pathname === item.href;
              return (
                <Link key={item.label} href={item.href}
                  title={item.label}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                    ${active
                      ? "bg-[#008be3]/10 text-[#008be3] border-l-4 border-[#008be3]"
                      : "text-slate-500 hover:bg-slate-50 hover:text-[#008be3]"}`}>
                  <span className="shrink-0">{item.icon}</span>
                  <span className="hidden lg:block">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col min-w-0 relative" style={{ zIndex: 10 }}>

        {/* Topbar */}
        <header className="flex items-center justify-between px-4 md:px-8 py-3 md:py-4 bg-transparent">

          {/* Mobile: hamburger */}
          <button
            className="md:hidden w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search */}
          <div className="relative hidden sm:block w-48 md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder={searchPlaceholder}
              className="w-full pl-9 pr-4 py-2 md:py-2.5 rounded-full bg-white text-sm text-slate-700 placeholder-slate-400 outline-none shadow-sm focus:ring-2 focus:ring-[#008be3]/30" />
          </div>

          {/* Right */}
          <div className="flex items-center gap-2 md:gap-4 ml-auto">
            <button className="relative w-8 h-8 md:w-9 md:h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20 hover:bg-white/30 transition-colors">
              <Bell className="w-4 h-4 text-white" />
              <span className="absolute top-1 right-1 md:top-1.5 md:right-1.5 w-2 h-2 rounded-full bg-red-400" />
            </button>

            {/* Avatar dropdown */}
            <div className="relative">
              <button
                onClick={() => setAvatarOpen(!avatarOpen)}
                className="flex items-center gap-1.5 md:gap-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/20 pl-1 pr-2 md:pr-3 py-1 hover:bg-white/30 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-[#008be3] flex items-center justify-center text-white text-xs font-bold shrink-0">R</div>
                <span className="hidden md:block text-sm font-semibold text-white">Rasya Raya Agung</span>
                <ChevronDown className={`w-3.5 h-3.5 text-white/70 transition-transform ${avatarOpen ? "rotate-180" : ""}`} />
              </button>

              {avatarOpen && (
                <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50">
                  <Link href="/pelajar/profile" onClick={() => setAvatarOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                    <Users className="w-4 h-4" />Profil
                  </Link>
                  <div className="border-t border-slate-100" />
                  <Link href="/auth/login" onClick={() => setAvatarOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-50 transition-colors">
                    <LogOut className="w-4 h-4" />Keluar
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 pb-20 md:pb-8">
          {children}
        </div>
      </div>

      {/* ── MOBILE SIDEBAR DRAWER ── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />

          {/* Drawer */}
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-2xl flex flex-col p-6">
            <div className="flex items-center justify-between mb-6">
              <Link href="/pelajar" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                <Image src="/logo-eduwave.webp" alt="EduWave" width={32} height={32} className="h-8 w-auto" />
                <span className="text-lg font-bold text-[#00172e]">Edu<span className="text-[#008be3]">Wave</span></span>
              </Link>
              <button onClick={() => setMobileMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="border-b border-slate-100 mb-4" />

            <nav className="flex flex-col gap-1 flex-1">
              {NAV_ITEMS.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link key={item.label} href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                      ${active
                        ? "bg-[#008be3]/10 text-[#008be3] border-l-4 border-[#008be3]"
                        : "text-slate-500 hover:bg-slate-50 hover:text-[#008be3]"}`}>
                    {item.icon}{item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-slate-100 pt-4">
              <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-50 transition-colors">
                <LogOut className="w-4 h-4" />Keluar
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── BOTTOM NAV MOBILE ── */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden z-40">
        <div className="mx-3 mb-3 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 px-2 py-2 flex items-center justify-around">
          {BOTTOM_NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.label} href={item.href}
                className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all
                  ${active ? "text-[#008be3]" : "text-slate-400 hover:text-[#008be3]"}`}>
                {item.icon}
                <span className="text-[9px] font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
