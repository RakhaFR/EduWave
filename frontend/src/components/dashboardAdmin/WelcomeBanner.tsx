"use client";

import Image from "next/image";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function WelcomeBanner() {
  const { user } = useCurrentUser();
  const name = user?.full_name || user?.username || "Admin";

  return (
    <div className="relative rounded-2xl bg-white px-6 py-6 md:py-8 flex items-center justify-between border border-slate-200/80 shadow-sm overflow-hidden min-h-[140px] shrink-0">
      <div className="flex-1 z-10 pr-4">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#00172e] tracking-tight flex items-center gap-2">
          Selamat datang kembali, {name}! <span>👋</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 font-medium leading-relaxed max-w-[50ch]">
          Kelola platform EduWave dengan mudah dan efisien.
        </p>
      </div>

      {/* Mascot Image */}
      <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 shrink-0 z-10 flex items-center justify-center">
        <Image
          src="/quli-maskot.webp"
          alt="EduWave Mascot"
          fill
          className="object-contain drop-shadow-md"
          sizes="128px"
          priority
        />
      </div>
    </div>
  );
}
