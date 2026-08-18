"use client";

import Image from "next/image";

export default function WelcomeBanner() {
  return (
    <div className="relative rounded-2xl bg-gradient-to-r from-[#eef7ff] to-[#f4f9ff] px-6 py-6 md:py-8 flex items-center justify-between border border-[#e1efff] overflow-hidden min-h-[140px] shrink-0">
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_bottom_left,#0073e6_0%,transparent_50%)]" />

      <div className="flex-1 z-10 pr-4">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#00172e] flex items-center gap-2">
          Selamat datang, Pembimbing! <span className="animate-bounce">👋</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 font-medium leading-relaxed max-w-[50ch]">
          Kelola kursus dan ujian Anda dengan mudah di sini.
        </p>
      </div>

      <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 shrink-0 z-10 flex items-center justify-center">
        <Image
          src="/quli-maskot.webp"
          alt="EduWave Mascot"
          fill
          className="object-contain drop-shadow-xl animate-bounce-slow"
          sizes="128px"
          priority
        />
      </div>
    </div>
  );
}
