"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home,
  BookOpen,
  ClipboardList,
  Settings,
  X,
  Check
} from "lucide-react";
import FloatingBubbles from "@/components/ui/FloatingBubbles";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { usePembimbing } from "./PembimbingContext";
import DashboardSkeleton from "@/components/ui/DashboardSkeleton";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { searchGlobal, setSearchGlobal, toast, showToast, dataLoading } = usePembimbing();

  const isActive = (href: string) => {
    if (href === "/pembimbing") return pathname === "/pembimbing";
    return pathname.startsWith(href);
  };

  if (dataLoading) return <DashboardSkeleton />;

  return (
    <div className="min-h-screen font-sans flex flex-col md:flex-row bg-[#0073e6] text-[#00172e] relative overflow-x-hidden select-none items-stretch">
      <FloatingBubbles count={15} className="z-0 opacity-40 animate-float-bubble" />

      <aside className="hidden lg:block w-72 shrink-0 p-4 z-20 fixed top-0 left-0 h-screen overflow-hidden">
        <Sidebar showToast={(msg) => showToast(msg)} />
      </aside>

      <div className="flex-1 flex flex-col p-4 z-10 min-w-0 lg:pl-72 relative">
        <Topbar
          searchGlobal={searchGlobal}
          setSearchGlobal={setSearchGlobal}
          setMobileMenuOpen={setMobileMenuOpen}
          showToast={(msg) => showToast(msg)}
        />

        <main className="bg-white rounded-[24px] md:rounded-[32px] shadow-2xl flex-1 p-4 sm:p-6 md:p-8 flex flex-col gap-6 overflow-y-auto">
          {children}
        </main>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
          />

          <div className="relative w-72 bg-white flex flex-col p-6 shadow-2xl h-full transform transition-transform animate-slide-in">
            <div className="flex items-center justify-between mb-6 shrink-0">
              <Link
                href="/pembimbing"
                className="flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Image
                  src="/logo-eduwave.webp"
                  alt="EduWave Logo"
                  width={34}
                  height={34}
                  className="h-8 w-auto shrink-0 drop-shadow-md"
                />
                <span className="text-xl font-black tracking-tight text-[#00172e]">
                  Edu<span className="text-[#0073e6]">Wave</span>
                </span>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="border-b border-slate-100 mb-5 shrink-0" />

            <div className="flex-1 flex flex-col gap-6 overflow-y-auto">
              <div>
                <p className="text-[9px] font-bold text-slate-400 tracking-widest uppercase mb-3 px-3">
                  Menu Utama
                </p>
                <nav className="flex flex-col gap-1">
                  <Link
                    href="/pembimbing"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all text-left w-full cursor-pointer ${
                      isActive("/pembimbing") && pathname === "/pembimbing"
                        ? "bg-[#e6f3ff] text-[#0073e6]"
                        : "text-slate-500 hover:bg-slate-50 hover:text-[#0073e6]"
                    }`}
                  >
                    <Home className="w-5 h-5 shrink-0" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    href="/pembimbing/course"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all text-left w-full cursor-pointer ${
                      isActive("/pembimbing/course")
                        ? "bg-[#e6f3ff] text-[#0073e6] font-semibold"
                        : "text-slate-500 hover:bg-slate-50 hover:text-[#0073e6]"
                    }`}
                  >
                    <BookOpen className="w-5 h-5 shrink-0" />
                    <span>Kursus Saya</span>
                  </Link>
                  <Link
                    href="/pembimbing/exam"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all text-left w-full cursor-pointer ${
                      isActive("/pembimbing/exam")
                        ? "bg-[#e6f3ff] text-[#0073e6] font-semibold"
                        : "text-slate-500 hover:bg-slate-50 hover:text-[#0073e6]"
                    }`}
                  >
                    <ClipboardList className="w-5 h-5 shrink-0" />
                    <span>Ujian</span>
                  </Link>
                </nav>
              </div>

              <div>
                <p className="text-[9px] font-bold text-slate-400 tracking-widest uppercase mb-3 px-3">
                  Pengaturan
                </p>
                <nav className="flex flex-col gap-1">
                  <Link
                    href="/pembimbing/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all text-left w-full cursor-pointer ${isActive("/pembimbing/profile") ? "bg-[#e6f3ff] text-[#0073e6] font-semibold" : "text-slate-500 hover:bg-slate-50 hover:text-[#0073e6]"}`}
                  >
                    <Settings className="w-5 h-5 shrink-0" />
                    <span>Pengaturan</span>
                  </Link>
                </nav>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 mt-auto shrink-0">
              <Link
                href="/auth/login"
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
              >
                <X className="w-5 h-5" />
                <span>Keluar</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-white border border-slate-100 rounded-2xl shadow-2xl px-4 py-3 flex items-center gap-3 animate-fade-in text-sm font-semibold max-w-xs sm:max-w-sm">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs shrink-0 ${
              toast.type === "error" ? "bg-red-500" : "bg-green-500"
            }`}
          >
            <Check className="w-4 h-4 text-white" />
          </div>
          <span className="text-slate-700 flex-1">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
