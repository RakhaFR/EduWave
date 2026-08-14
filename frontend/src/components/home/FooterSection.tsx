"use client";

import Link from "next/link";
import Image from "next/image";
import { FaInstagram, FaWhatsapp, FaTiktok, FaGithub } from "react-icons/fa";
import { Mail, MapPin, Phone } from "lucide-react";

const NAV_LINKS = {
  Eksplorasi: [
    { label: "Semua Kursus",     href: "/course" },
    { label: "Leaderboard",      href: "/leaderboard" },
    { label: "Study Room",       href: "/study-room" },
    { label: "Kustomisasi Maskot", href: "/mascot-customize" },
  ],
  Akun: [
    { label: "Masuk",     href: "/login" },
    { label: "Daftar",    href: "/register" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Profil",    href: "/profile" },
  ],
  Lainnya: [
    { label: "Tentang Kami",       href: "/#about" },
    { label: "Admin Panel",        href: "/admin" },
    { label: "Kebijakan Privasi",  href: "/privacy" },
    { label: "Syarat & Ketentuan", href: "/terms" },
  ],
};

const SOCIALS = [
  { icon: <FaInstagram className="w-4 h-4" />, href: "https://instagram.com", label: "Instagram" },
  { icon: <FaWhatsapp  className="w-4 h-4" />, href: "https://wa.me",         label: "WhatsApp" },
  { icon: <FaTiktok    className="w-4 h-4" />, href: "https://tiktok.com",    label: "TikTok" },
  { icon: <FaGithub    className="w-4 h-4" />, href: "https://github.com",    label: "GitHub" },
];

export default function Footer() {
  return (
    <footer className="relative bg-[#00172e] text-white overflow-hidden">

      {/* Ambient glow dekoratif */}
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[300px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-[300px] h-[200px] bg-blue-500/5 blur-[80px] rounded-full pointer-events-none" />

      {/* ── Main Footer Content ── */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Brand col — lebar 2 kolom */}
          <div className="lg:col-span-2">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 mb-4 w-fit">
              <Image
                src="/logo-eduwave.webp"
                alt="EduWave Logo"
                width={36}
                height={36}
                className="h-8 w-auto"
              />
              <span className="text-xl font-bold tracking-tight">
                Edu<span className="text-cyan-300">Wave</span>
              </span>
            </Link>

            <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-xs">
              Platform belajar interaktif bertema bawah laut dengan AI Study
              Assistant Quli, gamifikasi mutiara, dan Virtual Study Room
              kolaboratif.
            </p>

            {/* Kontak */}
            <ul className="flex flex-col gap-2.5 text-sm text-slate-400 mb-6">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                <a href="mailto:hello@eduwave.id" className="hover:text-cyan-300 transition-colors">
                  hello@eduwave.id
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-cyan-400 shrink-0" />
                <a href="tel:+6281289432976" className="hover:text-cyan-300 transition-colors">
                  +62 812-8943-2976
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Bogor, Jawa Barat, Indonesia</span>
              </li>
            </ul>

            {/* Sosmed */}
            <div className="flex items-center gap-3">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-9 h-9 rounded-full bg-white/8 border border-white/10 flex items-center justify-center text-slate-400 hover:text-cyan-300 hover:border-cyan-400/40 hover:bg-white/12 transition-all duration-200"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Nav cols */}
          {Object.entries(NAV_LINKS).map(([group, links]) => (
            <div key={group}>
              <h4 className="text-xs font-bold tracking-widest text-white/90 uppercase mb-4">
                {group}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 hover:text-cyan-300 transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div className="relative z-10 border-t border-white/8">
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>© {new Date().getFullYear()} EduWave. Selami Samudra Pengetahuan.</span>
          <div className="flex items-center gap-1">
            <span>Dibuat dengan</span>
            <span className="text-cyan-400 mx-0.5">♥</span>
            <span>di Bogor, Indonesia</span>
          </div>
        </div>
      </div>
    </footer>
  );
}