"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

type TutorialStep = { title: string; text: string; target?: string; href?: string; requiresClick?: boolean };

const STEPS: TutorialStep[] = [
  { title: "Kenalan dulu dengan Quli", text: "Hai! Aku Quli, teman belajar kamu. Ikuti aku berkeliling EduWave. Klik Home untuk kembali ke dashboard utama.", target: "home", href: "/pelajar" },
  { title: "Cari kursus baru", text: "Klik All Course. Di sana kamu bisa melihat daftar kursus yang tersedia.", target: "all-course", href: "/pelajar/all-course" },
  { title: "Pilih kartu course", text: "Pilih kartu course untuk melihat detail, materi, dan cara mendaftarnya.", target: "course-card", href: "/course/" },
  { title: "Daftar course", text: "Di halaman ini kamu bisa membaca isi course lalu klik Enroll Kursus Ini untuk mulai belajar.", target: "course-overview", href: "/course/" },
  { title: "Lihat daftar lesson", text: "Ini daftar lesson dalam course. Klik lesson pertama untuk mulai belajar.", target: "lesson-list", href: "/course/" },
  { title: "Mulai belajar", text: "Baca materi sampai selesai. Ada timer belajar agar materi tidak bisa diselesaikan secara sembarangan.", target: "lesson-content", href: "/pelajar/lesson/" },
  { title: "Kembali ke My Courses", text: "Setelah memahami cara belajar, klik My Courses untuk melihat course yang sudah kamu daftar.", target: "my-courses", href: "/pelajar/my-courses" },
  { title: "Course kamu sudah tersimpan", text: "Course yang sudah kamu daftar akan muncul di sini. Perhatikan kartu course yang disorot. Kalau sudah paham, klik tombol Berikutnya untuk lanjut.", target: "my-course-card", href: "/pelajar/my-courses", requiresClick: false },
  { title: "Dapatkan XP dari lesson", text: "XP kamu bertambah setelah menyelesaikan materi atau lesson detail. XP berguna untuk menaikkan level dan membuatmu tampil keren di Leaderboard. Klik Berikutnya untuk melanjutkan.", target: "leaderboard", href: "/pelajar/leaderboard", requiresClick: false },
  { title: "Kumpulkan Pearls", text: "Pearls atau mutiara didapatkan dengan menyelesaikan keseluruhan course dan achievement. Gunakan Pearls untuk membeli dan mengustomisasi mascot Quli. Klik Berikutnya untuk melanjutkan.", target: "mascot", href: "/pelajar/mascot-customize", requiresClick: false },
  { title: "Ikuti Live Class", text: "Klik Live Class untuk melihat dan mengikuti kelas langsung bersama pembimbing.", target: "live-class", href: "/pelajar/liveClass" },
  { title: "Berdiskusi di Study Forum", text: "Klik Study Forum untuk bertanya, berdiskusi, dan berbagi pengetahuan dengan teman-teman.", target: "study-forum", href: "/pelajar/study-room" },
  { title: "Temukan Pembimbing", text: "Klik Pembimbing untuk melihat informasi pembimbing dan mendapatkan dukungan belajar.", target: "pembimbing", href: "/pelajar/pembimbing" },
  { title: "Pantau perkembanganmu", text: "Klik Report untuk melihat progress belajar, XP, dan achievement. Kamu sudah siap menjelajah EduWave!", target: "report", href: "/pelajar/report" },
  { title: "Tur selesai!", text: "Hebat! Sekarang kamu sudah mengenal fitur utama EduWave. Selamat belajar bersama Quli!" },
];

export default function StudentTutorial() {
  const pathname = usePathname();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [open, setOpen] = useState(false);
  const [bubblePosition, setBubblePosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (localStorage.getItem("eduwave_student_tutorial_completed") === "true") return;
    const savedStep = Number(localStorage.getItem("eduwave_student_tutorial_step"));
    setStep(Number.isFinite(savedStep) && savedStep >= 0 && savedStep < STEPS.length ? savedStep : 0);
    setOpen(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    if (step === 6 && pathname.startsWith("/pelajar/lesson/")) {
      router.replace("/pelajar");
    } else if (step === 8 && pathname !== "/pelajar/leaderboard") {
      router.replace("/pelajar/leaderboard");
    } else if (step === 9 && pathname !== "/pelajar/mascot-customize") {
      router.replace("/pelajar/mascot-customize");
    }
  }, [open, pathname, router, step]);

  useEffect(() => {
    if (!open) return;
    const handleTargetClick = (event: MouseEvent) => {
      const target = (event.target as HTMLElement).closest("[data-tour]");
      if (STEPS[step]?.requiresClick === false || !target || target.getAttribute("data-tour") !== STEPS[step]?.target) return;
      const next = step + 1;
      if (next < STEPS.length) {
        localStorage.setItem("eduwave_student_tutorial_step", String(next));
        setStep(next);
      }
    };
    document.addEventListener("click", handleTargetClick);
    return () => document.removeEventListener("click", handleTargetClick);
  }, [open, step]);

  useEffect(() => {
    const updatePosition = () => {
      document.querySelectorAll("[data-tour].tour-current-target").forEach((element) => element.classList.remove("tour-current-target"));
      const target = STEPS[step]?.target;
      const element = document.querySelector(`[data-tour="${target}"]`);
      if (!element) return;
      element.classList.add("tour-current-target");
      const rect = element.getBoundingClientRect();
      const bubbleWidth = Math.min(420, window.innerWidth - 32);
      const minimumLeft = rect.left < 280 ? 150 : 16;
      const left = Math.max(minimumLeft, Math.min(window.innerWidth - bubbleWidth - 16, rect.left + rect.width / 2 - bubbleWidth / 2));
      const top = rect.bottom + 18 + 190 < window.innerHeight ? rect.bottom + 18 : Math.max(16, rect.top - 190);
      setBubblePosition({ top, left });
    };
    const timer = window.setTimeout(updatePosition, 350);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => { window.clearTimeout(timer); window.removeEventListener("resize", updatePosition); window.removeEventListener("scroll", updatePosition, true); };
  }, [step]);

  if (!open) return null;
  const current = STEPS[step];
  const finish = () => {
    localStorage.setItem("eduwave_student_tutorial_completed", "true");
    localStorage.removeItem("eduwave_student_tutorial_step");
    setOpen(false);
  };
  const changeStep = (next: number) => {
    localStorage.setItem("eduwave_student_tutorial_step", String(next));
    setStep(next);

    // Auto-navigate / direct ke halaman yang ditutorialkan jika step memiliki href
    const nextStepObj = STEPS[next];
    if (nextStepObj && nextStepObj.href) {
      if (nextStepObj.href === "/course/" || nextStepObj.href === "/pelajar/lesson/") {
        // Jika butuh ID dinamis tapi belum di halaman terkait, arahkan ke all-course / my-courses
        if (!pathname.startsWith(nextStepObj.href)) {
          router.push(nextStepObj.href === "/course/" ? "/pelajar/all-course" : "/pelajar/my-courses");
        }
      } else if (pathname !== nextStepObj.href && !pathname.startsWith(nextStepObj.href)) {
        router.push(nextStepObj.href);
      }
    }
  };

  const content = (
    <div className="pointer-events-none fixed inset-0 z-[2147483647]">
      <div className="pointer-events-auto absolute z-[2147483647] flex w-[calc(100%-2rem)] max-w-[420px] items-end gap-3 transition-all duration-500" style={step === 5 ? { bottom: 24, left: 180, top: "auto" } : { top: bubblePosition.top, left: bubblePosition.left }}>
        <Image src="/quli-maskot.webp" alt="Quli" width={150} height={170} className={`${step === 5 ? "fixed bottom-4 left-6" : "absolute -bottom-4 -left-32"} z-[2147483647] h-auto w-28 object-contain drop-shadow-2xl`} />
        <div className="relative z-0 w-full rounded-3xl border-4 border-cyan-200 bg-white p-5 shadow-2xl sm:p-6">
          <div className="absolute -left-3 bottom-8 hidden h-5 w-5 rotate-45 border-b-4 border-l-4 border-cyan-200 bg-white sm:block" />
          <button onClick={finish} aria-label="Tutup tutorial" className="absolute right-3 top-3 rounded-full p-1 text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-cyan-600">Quli • {step + 1}/{STEPS.length}</p>
          <h2 className="pr-5 text-lg font-extrabold text-[#00172e]">{current.title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{current.text}</p>
          <div className="mt-5 flex items-center justify-between gap-2">
            <button onClick={finish} className="text-xs font-bold text-slate-400 hover:text-slate-600">Lewati</button>
            <div className="flex gap-2">
              <button disabled={step === 0} onClick={() => changeStep(step - 1)} className="rounded-full border border-slate-200 p-2 text-slate-500 disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
              {step < STEPS.length - 1 ? <button onClick={() => changeStep(step + 1)} className="flex items-center gap-1 rounded-full bg-[#008be3] px-4 py-2 text-xs font-bold text-white">Berikutnya <ChevronRight className="h-4 w-4" /></button> : <button onClick={finish} className="rounded-full bg-[#008be3] px-5 py-2 text-xs font-bold text-white">Selesai</button>}
            </div>
          </div>
        </div>
      </div>
      <style jsx global>{`[data-tour].tour-current-target { position: relative; z-index: 10000 !important; pointer-events: auto; border-radius: .75rem; box-shadow: 0 0 0 5px rgba(34,211,238,.95), 0 0 28px 8px rgba(34,211,238,.7); animation: tour-pulse 1.7s ease-in-out infinite; } @keyframes tour-pulse { 0%,100% { box-shadow: 0 0 0 4px rgba(34,211,238,.85),0 0 20px 5px rgba(34,211,238,.5); } 50% { box-shadow: 0 0 0 8px rgba(34,211,238,1),0 0 35px 12px rgba(34,211,238,.8); } }`}</style>
    </div>
  );

  return createPortal(content, document.body);
}
