"use client";

import Link from "next/link";
import Image from "next/image";
import { GraduationCap, Trophy, Rocket, ArrowRight } from "lucide-react";
import TextAnimation from "@/components/uilayouts/scroll-text";

export default function TextAnimationSection() {
  return (
    <section
      id="text-animation-section"
      className="bg-gradient-to-b from-[#00172e] via-[#001529] to-[#00172e] text-white overflow-hidden"
    >
      {/* ── Slide 1 — tagline utama, center ── */}
      <div className="h-[90vh] flex flex-col justify-center items-center text-center px-6 relative">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[500px] h-[500px] bg-cyan-500/10 blur-[120px] rounded-full" />
        </div>
        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="w-70 h-60 flex items-center justify-center">
            <Image
              src="/logo-eduwave.webp"
              alt="EduWave Logo"
              width={2448}
              height={1632}
              className="h-50 w-auto transition-transform group-hover:scale-105"
              priority
            />
          </div>
          <TextAnimation
            text="Selami ilmu tanpa batas."
            variants={{
              hidden: { filter: "blur(10px)", opacity: 0, y: 24 },
              visible: {
                filter: "blur(0px)",
                opacity: 1,
                y: 0,
                transition: { ease: "easeOut", duration: 0.7 },
              },
            }}
            classname="text-5xl sm:text-6xl xl:text-7xl font-extrabold text-white max-w-xl mx-auto leading-tight"
          />
          <p className="text-cyan-300/70 text-base font-medium tracking-wide">
            EduWave — Platform Belajar Interaktif
          </p>
        </div>
      </div>

      {/* ── Slide 2 — letter by letter, left ── */}
      <div className="h-[90vh] flex items-center px-8 md:px-20 relative">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-cyan-400/8 blur-[100px] rounded-full pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-6">
            <GraduationCap className="w-5 h-5 text-cyan-400" />
            <span className="text-xs font-semibold tracking-widest text-cyan-400 uppercase">
              Belajar Bersama
            </span>
          </div>
          <TextAnimation
            as="p"
            letterAnime={true}
            text="Bersama Quli, belajar jadi petualangan."
            classname="text-4xl sm:text-5xl xl:text-6xl font-extrabold text-white leading-snug"
            variants={{
              hidden: { filter: "blur(4px)", opacity: 0, y: 16 },
              visible: {
                filter: "blur(0px)",
                opacity: 1,
                y: 0,
                transition: { duration: 0.18 },
              },
            }}
          />
          <p className="mt-6 text-cyan-100/50 text-sm leading-relaxed max-w-md">
            AI Study Assistant kami siap menemanimu kapan saja, di mana saja.
          </p>
        </div>
      </div>

      {/* ── Slide 3 — word by word, right ── */}
      <div className="h-[90vh] flex justify-end items-center px-8 md:px-20 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-500/8 blur-[100px] rounded-full pointer-events-none" />
        <div className="relative z-10 max-w-2xl text-right">
          <div className="flex items-center justify-end gap-2 mb-6">
            <span className="text-xs font-semibold tracking-widest text-cyan-400 uppercase">
              Gamifikasi
            </span>
            <Trophy className="w-5 h-5 text-cyan-400" />
          </div>
          <TextAnimation
            text="Kumpulkan mutiara. Taklukkan leaderboard."
            direction="right"
            classname="text-4xl sm:text-5xl xl:text-6xl font-extrabold text-white leading-snug"
          />
          <p className="mt-6 text-cyan-100/50 text-sm leading-relaxed ml-auto max-w-md">
            Setiap pencapaian memberimu poin mutiara untuk naik peringkat.
          </p>
        </div>
      </div>

      {/* ── Slide 4 — line by line, center + CTA ── */}
      <div className="h-[90vh] flex flex-col justify-center items-center text-center px-6 relative">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[300px] bg-cyan-400/8 blur-[100px] rounded-full" />
        </div>
        <div className="relative z-10 flex flex-col items-center gap-8">
          <div className="flex items-center gap-2 mb-2">
            <Rocket className="w-5 h-5 text-cyan-400" />
            <span className="text-xs font-semibold tracking-widest text-cyan-400 uppercase">
              Mulai Sekarang
            </span>
          </div>
          <TextAnimation
            text="Jadilah penyelam ilmu terbaik. Mulai perjalananmu hari ini."
            direction="down"
            lineAnime={true}
            classname="text-4xl sm:text-5xl xl:text-6xl font-extrabold text-white leading-tight max-w-2xl mx-auto"
          />
          <Link
            href="/auth/register"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-cyan-400 px-10 py-4 text-sm font-bold text-[#00172e] shadow-lg shadow-cyan-950/30 transition-all hover:bg-cyan-300 hover:scale-105 active:scale-95"
          >
            Mulai Menyelam
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}