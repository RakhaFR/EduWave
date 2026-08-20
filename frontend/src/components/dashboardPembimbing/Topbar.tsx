"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  User,
  Settings,
  X
} from "lucide-react";
import { clearUserCache, useCurrentUser } from "@/hooks/useCurrentUser";

interface TopbarProps {
  searchGlobal: string;
  setSearchGlobal: (val: string) => void;
  setMobileMenuOpen: (open: boolean) => void;
  showToast: (msg: string) => void;
}

export default function Topbar({
  searchGlobal,
  setSearchGlobal,
  setMobileMenuOpen,
  showToast
}: TopbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const { user } = useCurrentUser();

  const handleLogout = () => {
    clearUserCache();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchGlobal.trim()) {
      if (pathname !== "/pembimbing/course" && pathname !== "/pembimbing/exam" && pathname !== "/pembimbing") {
        router.push("/pembimbing/course");
      }
    }
  };

  const initial = (user?.full_name || user?.username || "P").charAt(0).toUpperCase();

  return (
    <header className="flex items-center justify-between gap-4 mb-4 px-2">
      <button
        onClick={() => setMobileMenuOpen(true)}
        className="lg:hidden p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all focus:outline-none cursor-pointer"
      >
        <Menu className="w-6 h-6" />
      </button>

      <div className="relative w-64 md:w-80">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
        <input
          type="text"
          placeholder="Cari kursus atau ujian..."
          value={searchGlobal}
          onChange={(e) => setSearchGlobal(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          className="w-full pl-11 pr-4 py-2.5 bg-white rounded-full text-sm text-slate-700 placeholder-slate-400 outline-none shadow-md focus:ring-2 focus:ring-blue-300 transition-all border-none"
        />
        {searchGlobal && (
          <button
            onClick={() => setSearchGlobal("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <button onClick={() => setNotificationsOpen((open) => !open)} className="relative w-10 h-10 rounded-full bg-white/15 border border-white/25 flex items-center justify-center text-white hover:bg-white/25 transition-all shadow-md cursor-pointer">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-red-400 border border-[#0073e6]" />
          </button>
          {notificationsOpen && <div className="absolute right-0 top-full mt-2 z-50 w-64 rounded-2xl bg-white p-4 shadow-xl text-slate-700"><p className="text-sm font-bold">Notifikasi Pembimbing</p><p className="mt-2 text-xs text-slate-500">Data kursus dan ujian telah dimuat.</p><Link href="/pembimbing" onClick={() => setNotificationsOpen(false)} className="mt-3 block text-xs font-bold text-[#0073e6]">Buka dashboard</Link></div>}
        </div>

        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2.5 pl-1.5 pr-3 py-1 bg-white/15 border border-white/25 rounded-full text-white hover:bg-white/25 transition-all shadow-md focus:outline-none cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full overflow-hidden border border-white/50 bg-[#e6f3ff] flex items-center justify-center text-[#0073e6] font-bold text-sm shrink-0">
              {user?.avatar_url && !imgError ? (
                <img
                  src={user.avatar_url}
                  alt="Profile"
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                initial
              )}
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-bold leading-tight">{user?.full_name || "Pembimbing"}</span>
              <span className="text-[9px] text-white/70 leading-none">Pengajar</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-white/70 transition-transform duration-200 ${profileDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 overflow-hidden text-sm">
              <div className="px-4 py-2 border-b border-slate-100 lg:hidden">
                <p className="font-bold text-slate-700">{user?.full_name || "Pembimbing"}</p>
                <p className="text-[10px] text-slate-400">Pengajar</p>
              </div>
              <Link
                href="/pembimbing/profile"
                onClick={() => setProfileDropdownOpen(false)}
                className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-600 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <User className="w-4 h-4" /> Profil Saya
              </Link>
              <div className="border-t border-slate-100 my-1" />
              <Link
                href="/auth/login"
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-500 transition-colors flex items-center gap-2 font-medium"
              >
                <X className="w-4 h-4" /> Keluar
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
