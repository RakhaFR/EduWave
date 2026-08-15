"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Search,
  Zap,
  Settings,
  User,
  MessageSquare,
  HelpCircle,
  ChevronDown,
  CheckCircle2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// ── Dummy Data ────────────────────────────────────────────────────────────────
const MODULES = [
  { title: "Persiapan Belajar",          total: 1,  done: 1,  complete: true },
  { title: "Pengenalan Linux",           total: 7,  done: 3,  complete: false },
  { title: "Berinteraksi dengan Linux",  total: 6,  done: 0,  complete: false },
  { title: "Filesystem",                 total: 9,  done: 0,  complete: false },
  { title: "Shell Scripting",            total: 8,  done: 0,  complete: false },
  { title: "Proyek Pertama",             total: 1,  done: 0,  complete: false },
];

const CONTENT = `Kita sudah melihat bagaimana seluk-beluk Linux, mulai dari sejarahnya hingga berbagai macam distribusinya. Lantas, memangnya apa saja sih keuntungan menggunakan Linux? Apa yang membuatnya begitu populer?

Para pengamat teknologi beranggapan bahwa kesuksesan Linux disebabkan karena kemandiriannya dari vendor atau perusahaan tertentu. Dengan demikian, apabila ditemukan problem atau bug pada Linux, tidak harus satu pihak yang berkewajiban atau bertanggung jawab untuk memperbaikinya. Setiap orang bisa berkontribusi untuk memperbaiki Linux.

Sebagai contoh, jika ditemukan bug pada Microsoft Windows, yang bertanggung jawab untuk memperbaikinya adalah perusahaan bernama Microsoft. Nah, hal tersebut tidak berlaku pada Linux. Semua orang ataupun vendor berkesempatan untuk memperbaiki, memodifikasi, meningkatkan, atau menambah fitur pada Linux.

Selain manfaat tersebut, Linux juga memiliki keunggulan-keunggulan lain yang membuatnya tenar sampai saat ini:`;

const TOTAL_DONE = MODULES.reduce((acc, m) => acc + m.done, 0);
const TOTAL_ALL  = MODULES.reduce((acc, m) => acc + m.total, 0);
const PROGRESS   = Math.round((TOTAL_DONE / TOTAL_ALL) * 100);

// ── Component ──────────────────────────────────────────────────────────────────
export default function CourseDetailPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white font-sans text-[#00172e]">

      {/* ── Topbar ── */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-slate-100 bg-white sticky top-0 z-30">
        {/* Left */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2 text-sm font-semibold text-[#00172e] hover:text-[#008be3] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Dasar–Dasar Pemrograman Web Bawah Laut
          </Link>
        </div>

        {/* Center search */}
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari modul/konten"
            className="w-full pl-9 pr-16 py-2 rounded-full border border-slate-200 text-sm text-slate-700 placeholder-slate-400 outline-none focus:ring-2 focus:ring-[#008be3]/30 focus:border-[#008be3]"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-mono">CTRL /</span>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="text-xs font-bold text-amber-600">4</span>
          </div>
          <button className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
            <Settings className="w-4 h-4 text-slate-500" />
          </button>
          <button className="w-8 h-8 rounded-full bg-[#008be3] flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left icon bar ── */}
        <div className="w-12 border-r border-slate-100 flex flex-col items-center pt-4 gap-5 bg-white">
          <button className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors" title="Diskusi">
            <MessageSquare className="w-4 h-4 text-slate-500" />
          </button>
          <button className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors" title="FAQ">
            <HelpCircle className="w-4 h-4 text-slate-500" />
          </button>
          <button className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors" title="Pengaturan">
            <Settings className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* ── Main content ── */}
        <main className="flex-1 overflow-y-auto px-10 py-8 max-w-3xl">
          <h1 className="text-2xl font-extrabold text-[#00172e] mb-6">
            Keuntungan Menggunakan Linux
          </h1>

          <div className="prose prose-sm max-w-none text-slate-600 leading-relaxed space-y-4">
            {CONTENT.split("\n\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </main>

        {/* ── Right module list ── */}
        <aside className="w-72 border-l border-slate-100 bg-white flex flex-col overflow-y-auto">
          {/* Toggle button */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <button className="w-7 h-7 rounded-full bg-[#00172e] flex items-center justify-center">
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
            <div className="flex gap-4">
              <button className="text-sm font-bold text-[#008be3] border-b-2 border-[#008be3] pb-1">
                Daftar Modul
              </button>
              <button className="text-sm text-slate-400 hover:text-[#00172e] transition-colors pb-1">
                Catatan Belajar
              </button>
            </div>
          </div>

          {/* Progress */}
          <div className="px-4 py-3 border-b border-slate-100">
            <div className="h-1.5 rounded-full bg-slate-100 mb-1.5">
              <div
                className="h-1.5 rounded-full bg-[#008be3]"
                style={{ width: `${PROGRESS}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 font-medium">{PROGRESS}% Selesai</p>
          </div>

          {/* Module list */}
          <div className="flex flex-col divide-y divide-slate-50">
            {MODULES.map((mod) => (
              <button
                key={mod.title}
                className="flex items-center justify-between px-4 py-3.5 text-left hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#008be3] transition-colors" />
                  <span className={`text-sm font-medium ${mod.complete ? "text-[#008be3]" : "text-[#00172e]"}`}>
                    {mod.title}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {mod.complete
                    ? <CheckCircle2 className="w-4 h-4 text-[#008be3]" />
                    : <span className="text-xs text-slate-400">{mod.done}/{mod.total}</span>
                  }
                </div>
              </button>
            ))}
          </div>
        </aside>
      </div>

      {/* ── Bottom navigation ── */}
      <footer className="flex items-center justify-between px-8 py-3 border-t border-slate-100 bg-white sticky bottom-0 z-30">
        <button className="flex items-center gap-2 text-sm text-slate-400 hover:text-[#00172e] transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Mengenal Linux Lebih Dalam
        </button>
        <span className="text-sm font-semibold text-[#00172e]">Keuntungan Menggunakan Linux</span>
        <button className="flex items-center gap-2 text-sm text-slate-400 hover:text-[#00172e] transition-colors">
          Arsitektur Linux
          <ChevronRight className="w-4 h-4" />
        </button>
      </footer>

      {/* ── Tanya AI FAB ── */}
      <button className="fixed bottom-16 right-8 flex items-center gap-2 rounded-2xl bg-[#00172e] px-5 py-3 text-sm font-bold text-white shadow-xl hover:bg-[#002d5a] transition-all hover:scale-105 z-40">
        <Sparkles className="w-4 h-4 text-cyan-300" />
        Tanya AI
      </button>
    </div>
  );
}