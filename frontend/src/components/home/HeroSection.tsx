"use client";

import Image from "next/image";
import Link from "next/link";
import { FaInstagram, FaWhatsapp, FaTiktok } from "react-icons/fa";

interface Bubble {
  id: number;
  size: number;
  left: number;
  duration: number;
  delay: number;
}

interface HeroSectionProps {
  bubbles: Bubble[];
}

export default function HeroSection({ bubbles }: HeroSectionProps) {
  return (
    <div className="relative flex min-h-screen flex-col justify-between bg-[#004e8a] text-white font-sans overflow-hidden">

      {/* ── Animasi Gelembung ── */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {bubbles.map((b) => (
          <span
            key={b.id}
            className="absolute bottom-[-50px] rounded-full bg-white/20 border border-white/40 backdrop-blur-[1px] animate-float-bubble"
            style={{
              width: `${b.size}px`,
              height: `${b.size}px`,
              left: `${b.left}%`,
              animationDuration: `${b.duration}s`,
              animationDelay: `${b.delay}s`,
            }}
          />
        ))}
      </div>

      {/* ── Background SVG Waves ── */}
      <div className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[52%] bg-[#008be3]" />

        <div className="absolute inset-0 w-full h-full">
          <svg
            className="w-full h-full"
            viewBox="0 0 1440 900"
            fill="none"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="wave1" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#007ccb" />
                <stop offset="100%" stopColor="#006eb8" />
              </linearGradient>
              <linearGradient id="wave2" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0062a7" />
                <stop offset="100%" stopColor="#005493" />
              </linearGradient>
              <linearGradient id="wave3" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#004881" />
                <stop offset="100%" stopColor="#003c6e" />
              </linearGradient>
            </defs>
            <path
              d="M0 410 C 380 340, 760 480, 1080 380 C 1260 330, 1380 400, 1440 380 L 1440 900 L 0 900 Z"
              fill="url(#wave1)"
            />
            <path
              d="M0 550 C 340 480, 720 620, 1080 540 C 1280 490, 1380 570, 1440 550 L 1440 900 L 0 900 Z"
              fill="url(#wave2)"
            />
            <path
              d="M0 700 C 380 640, 720 760, 1080 680 C 1280 640, 1380 710, 1440 690 L 1440 900 L 0 900 Z"
              fill="url(#wave3)"
            />
          </svg>
        </div>

        {/* Ambient glow */}
        <div className="absolute top-28 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-cyan-200/25 blur-[90px] rounded-full pointer-events-none" />

        {/* Water splash kiri */}
        <div
          data-aos="fade-right"
          data-aos-delay="200"
          className="absolute bottom-0 left-0 w-64 md:w-[440px] h-64 md:h-[440px] z-10 pointer-events-none"
        >
          <Image
            src="/water-splash.webp"
            alt="Water Splash Left"
            fill
            sizes="(max-width: 768px) 256px, 440px"
            className="object-contain object-bottom-left opacity-95"
            priority
          />
        </div>

        {/* Water splash kanan */}
        <div
          data-aos="fade-right"
          data-aos-delay="200"
          className="absolute bottom-0 right-0 w-64 md:w-[440px] h-64 md:h-[440px] scale-x-[-1] z-10 pointer-events-none"
        >
          <Image
            src="/water-splash.webp"
            alt="Water Splash Right"
            fill
            sizes="(max-width: 768px) 256px, 440px"
            className="object-contain object-bottom-right opacity-95"
            priority
          />
        </div>
      </div>

      {/* ── Hero Content ── */}
      <main className="relative z-20 flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-6 pt-24 md:pt-28 pb-6 mx-auto text-center min-h-screen">

        {/* Maskot */}
        <div
          data-aos="zoom-in"
          data-aos-delay="100"
          className="relative z-[60] flex flex-col items-center justify-center mb-4 group"
        >
          <div className="relative w-44 h-44 sm:w-52 sm:h-52 lg:w-60 lg:h-60 transition-transform duration-500 hover:scale-105">
            <Image
              src="/quli-maskot.webp"
              alt="EduWave Jellyfish Mascot"
              fill
              sizes="(max-width: 640px) 176px, (max-width: 1024px) 208px, 240px"
              className="object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.25)] animate-bounce-slow"
              priority
            />
          </div>
        </div>

        {/* Heading */}
        <h1
          data-aos="fade-up"
          data-aos-delay="200"
          className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl lg:leading-tight max-w-3xl drop-shadow-md"
        >
          Selami Ilmu Tanpa Batas Bersama EduWave.
        </h1>

        {/* Subtitle */}
        <p
          data-aos="fade-up"
          data-aos-delay="300"
          className="mt-4 max-w-xl text-sm sm:text-base text-cyan-50 font-normal leading-relaxed opacity-95 drop-shadow-sm"
        >
          Platform belajar interaktif bertema bawah laut dengan AI Study
          Assistant dan sistem gamifikasi mutiara.
        </p>

        {/* CTA */}
        <div data-aos="zoom-in" data-aos-delay="400" className="mt-8">
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center rounded-full bg-[#70c9fb] px-12 py-3.5 text-base font-bold text-[#003865] shadow-lg shadow-cyan-950/20 transition-all hover:bg-[#8fd5fc] hover:scale-105 active:scale-95"
          >
            masuk
          </Link>
        </div>

        {/* Social Media */}
        <div
          data-aos="fade-up"
          data-aos-delay="500"
          className="mt-12 flex flex-col items-center gap-3"
        >
          <span className="text-xs font-semibold tracking-wider text-cyan-100/90 lowercase">
            follow us:
          </span>
          <div className="flex items-center gap-5 text-cyan-100/90">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="transition-colors hover:text-white hover:scale-110">
              <FaInstagram className="h-5 w-5" />
            </a>
            <a href="https://wa.me" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="transition-colors hover:text-white hover:scale-110">
              <FaWhatsapp className="h-5 w-5" />
            </a>
            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="transition-colors hover:text-white hover:scale-110">
              <FaTiktok className="h-5 w-5" />
            </a>
          </div>
        </div>
      </main>

      {/* ── Wave ke About (putih) ── */}
      <div className="relative z-20 -mb-1 pointer-events-none" style={{ lineHeight: 0 }}>
        <svg viewBox="0 0 1440 90" xmlns="http://www.w3.org/2000/svg" className="w-full block">
          <path d="M0,45 C240,85 480,10 720,50 C960,88 1200,15 1440,45 L1440,90 L0,90 Z" fill="#ffffff" />
        </svg>
      </div>
    </div>
  );
}