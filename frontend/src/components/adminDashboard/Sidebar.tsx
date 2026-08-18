"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Home,
  BookOpen,
  Users,
  ClipboardList,
  FolderOpen,
  Settings
} from "lucide-react";
import { TabType } from "./types";

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  showToast: (msg: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab, showToast }: SidebarProps) {
  return (
    <div className="bg-white rounded-[24px] shadow-2xl flex flex-col p-6 h-full min-h-full">
      {/* Logo Brand */}
      <Link href="/admin" className="flex items-center gap-3 mb-6 px-1 shrink-0">
        <Image
          src="/logo-eduwave.webp"
          alt="EduWave Logo"
          width={38}
          height={38}
          className="h-9 w-auto shrink-0 drop-shadow-md"
        />
        <span className="text-2xl font-black tracking-tight text-[#00172e] flex items-center">
          Edu<span className="text-[#0073e6]">Wave</span>
        </span>
      </Link>

      {/* Menu Sections */}
      <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-1">
        {/* Menu Utama */}
        <div>
          <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-3 px-3">
            Menu Utama
          </p>
          <nav className="flex flex-col gap-1">
            <button
              onClick={() => {
                setActiveTab("dashboard");
                showToast("Kembali ke Dashboard Overview");
              }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left w-full cursor-pointer ${
                activeTab === "dashboard"
                  ? "bg-[#e6f3ff] text-[#0073e6]"
                  : "text-slate-500 hover:bg-slate-50 hover:text-[#0073e6]"
              }`}
            >
              <Home className="w-5 h-5 shrink-0" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("kursus");
                showToast("Navigasi ke Manajemen Kursus");
              }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left w-full cursor-pointer ${
                activeTab === "kursus"
                  ? "bg-[#e6f3ff] text-[#0073e6] font-semibold"
                  : "text-slate-500 hover:bg-slate-50 hover:text-[#0073e6]"
              }`}
            >
              <BookOpen className="w-5 h-5 shrink-0" />
              <span>Kursus</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("pengguna");
                showToast("Navigasi ke Manajemen Pengguna");
              }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left w-full cursor-pointer ${
                activeTab === "pengguna"
                  ? "bg-[#e6f3ff] text-[#0073e6] font-semibold"
                  : "text-slate-500 hover:bg-slate-50 hover:text-[#0073e6]"
              }`}
            >
              <Users className="w-5 h-5 shrink-0" />
              <span>Pengguna</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("pendaftaran");
                showToast("Navigasi ke Log Pendaftaran");
              }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left w-full cursor-pointer ${
                activeTab === "pendaftaran"
                  ? "bg-[#e6f3ff] text-[#0073e6] font-semibold"
                  : "text-slate-500 hover:bg-slate-50 hover:text-[#0073e6]"
              }`}
            >
              <ClipboardList className="w-5 h-5 shrink-0" />
              <span>Pendaftaran</span>
            </button>
          </nav>
        </div>

        {/* Manajemen */}
        <div>
          <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-3 px-3">
            Manajemen
          </p>
          <nav className="flex flex-col gap-1">
            <button
              onClick={() => {
                setActiveTab("kategori");
                showToast("Navigasi ke Manajemen Kategori");
              }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left w-full cursor-pointer ${
                activeTab === "kategori"
                  ? "bg-[#e6f3ff] text-[#0073e6] font-semibold"
                  : "text-slate-500 hover:bg-slate-50 hover:text-[#0073e6]"
              }`}
            >
              <FolderOpen className="w-5 h-5 shrink-0" />
              <span>Kategori</span>
            </button>

            <button
              onClick={() => showToast("Pengaturan sistem segera hadir!")}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-[#0073e6] transition-all text-left w-full cursor-pointer"
            >
              <Settings className="w-5 h-5 shrink-0" />
              <span>Pengaturan</span>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}
