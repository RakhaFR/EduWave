"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { courseService } from "@/services/courseService";

type TutorialStep = {
  title: string;
  text: string;
  target?: string;
  href?: string;
  requiresClick?: boolean;
  arrowPos?: "left" | "right" | "top" | "bottom";
};

const STEPS: TutorialStep[] = [
  { title: "Kenalan dulu dengan Quli", text: "Hai! Aku Quli, teman belajar kamu. Ikuti aku berkeliling EduWave. Klik Home untuk kembali ke dashboard utama.", target: "home", href: "/pelajar", arrowPos: "left" },
  { title: "Cari kursus baru", text: "Klik All Course. Di sana kamu bisa melihat daftar kursus yang tersedia.", target: "all-course", href: "/pelajar/all-course", arrowPos: "left" },
  { title: "Pilih kartu course", text: "Lihat daftar kursus yang tersedia di sini. Klik salah satu kartu kursus untuk melihat materi detailnya.", target: "course-card", href: "/pelajar/all-course", arrowPos: "left" },
  { title: "Daftar course", text: "Di halaman ini kamu bisa membaca isi course lalu klik Enroll Kursus Ini untuk mulai belajar.", target: "course-overview", href: "/course/", arrowPos: "top" },
  { title: "Lihat daftar lesson", text: "Ini daftar lesson dalam course. Klik lesson pertama untuk mulai belajar.", target: "lesson-list", href: "/course/", arrowPos: "top" },
  { title: "Mulai belajar", text: "Baca materi sampai selesai. Ada timer belajar agar materi tidak bisa diselesaikan secara sembarangan.", target: "lesson-content", href: "/pelajar/lesson/", arrowPos: "bottom" },
  { title: "Kembali ke My Courses", text: "Setelah memahami cara belajar, klik My Courses untuk melihat course yang sudah kamu daftar.", target: "my-courses", href: "/pelajar/my-courses", arrowPos: "left" },
  { title: "Course kamu sudah tersimpan", text: "Course yang sudah kamu daftar akan muncul di sini. Perhatikan kartu course yang disorot. Kalau sudah paham, klik tombol Berikutnya untuk lanjut.", target: "my-course-card", href: "/pelajar/my-courses", requiresClick: false, arrowPos: "left" },
  { title: "Dapatkan XP dari lesson", text: "XP kamu bertambah setelah menyelesaikan materi atau lesson detail. XP berguna untuk menaikkan level dan membuatmu tampil keren di Leaderboard. Klik Berikutnya untuk melanjutkan.", target: "leaderboard", href: "/pelajar/leaderboard", requiresClick: false, arrowPos: "left" },
  { title: "Kumpulkan Pearls", text: "Pearls atau mutiara didapatkan dengan menyelesaikan keseluruhan course dan achievement. Gunakan Pearls untuk membeli dan mengustomisasi mascot Quli. Klik Berikutnya untuk melanjutkan.", target: "mascot, pearls-display", href: "/pelajar/mascot-customize", requiresClick: false, arrowPos: "top" },
  { title: "Ikuti Live Class", text: "Klik Live Class untuk melihat dan mengikuti kelas langsung bersama pembimbing.", target: "live-class", href: "/pelajar/liveClass", arrowPos: "left" },
  { title: "Berdiskusi di Study Forum", text: "Klik Study Forum untuk bertanya, berdiskusi, dan berbagi pengetahuan dengan teman-teman.", target: "study-forum", href: "/pelajar/study-room", arrowPos: "left" },
  { title: "Temukan Pembimbing", text: "Klik Pembimbing untuk melihat informasi pembimbing dan mendapatkan dukungan belajar.", target: "pembimbing", href: "/pelajar/pembimbing", arrowPos: "left" },
  { title: "Pantau perkembanganmu", text: "Klik Report untuk melihat progress belajar, XP, dan achievement. Kamu sudah siap menjelajah EduWave!", target: "report", href: "/pelajar/report", arrowPos: "left" },
  { title: "Tur selesai!", text: "Hebat! Sekarang kamu sudah mengenal fitur utama EduWave. Selamat belajar bersama Quli!" },
];

export default function StudentTutorial() {
  const pathname = usePathname();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [open, setOpen] = useState(false);
  const [bubblePosition, setBubblePosition] = useState({ top: 0, left: 0, arrow: "left" as "left" | "right" | "top" | "bottom" });

  useEffect(() => {
    if (localStorage.getItem("eduwave_student_tutorial_completed") === "true") return;
    const savedStep = Number(localStorage.getItem("eduwave_student_tutorial_step"));
    setStep(Number.isFinite(savedStep) && savedStep >= 0 && savedStep < STEPS.length ? savedStep : 0);
    setOpen(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    // Otomatis hilangkan guard paksa agar user bebas bernavigasi sesuai rute langkah tutorial
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
      
      const stepObj = STEPS[step];
      const targets = stepObj?.target ? stepObj.target.split(",").map((t) => t.trim()) : [];
      let primaryElement: HTMLElement | null = null;

      targets.forEach((targetName, idx) => {
        const el = document.querySelector(`[data-tour="${targetName}"]`) as HTMLElement | null;
        if (el) {
          el.classList.add("tour-current-target");
          if (idx === 0) primaryElement = el;
        }
      });
      
      const isMobile = window.innerWidth < 640;
      const bubbleWidth = isMobile ? Math.min(300, window.innerWidth - 32) : 380;

      if (!primaryElement) {
        // Jika target tidak ditemukan di halaman ini, letakkan bubble di posisi kanan tengah yang nyaman
        const left = isMobile ? Math.max(16, (window.innerWidth - bubbleWidth) / 2) : Math.max(16, window.innerWidth - bubbleWidth - 24);
        const top = Math.max(16, Math.min(window.innerHeight - 220, 180));
        setBubblePosition({ top, left, arrow: "bottom" });
        return;
      }

      const rect = (primaryElement as HTMLElement).getBoundingClientRect();

      let left = rect.right + 20;
      let top = Math.max(16, rect.top);
      let arrow: "left" | "right" | "top" | "bottom" = stepObj?.arrowPos || "left";

      // Jika target di sebelah kiri atau di kartu/sidebar
      if (rect.left < 300) {
        left = Math.min(rect.right + 20, window.innerWidth - bubbleWidth - 16);
        top = Math.max(16, Math.min(rect.top, window.innerHeight - 250));
        arrow = "left";
      } else {
        if (isMobile) {
          left = Math.max(16, (window.innerWidth - bubbleWidth) / 2);
          top = rect.bottom + 16 < window.innerHeight - 200 ? rect.bottom + 16 : Math.max(16, rect.top - 200);
          arrow = rect.bottom + 16 < window.innerHeight - 200 ? "top" : "bottom";
        } else {
          if (left + bubbleWidth > window.innerWidth - 16) {
            left = Math.max(16, rect.left - bubbleWidth - 20);
            arrow = "right";
          }
        }
      }

      setBubblePosition({ top, left, arrow });
    };

    const timer = window.setTimeout(updatePosition, 300);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", updatePosition);
    };
  }, [step, pathname]);

  if (!open) return null;
  const current = STEPS[step];
  const finish = () => {
    localStorage.setItem("eduwave_student_tutorial_completed", "true");
    localStorage.removeItem("eduwave_student_tutorial_step");
    document.querySelectorAll("[data-tour].tour-current-target").forEach((element) => element.classList.remove("tour-current-target"));
    setOpen(false);
  };
  const changeStep = async (next: number) => {
    localStorage.setItem("eduwave_student_tutorial_step", String(next));
    setStep(next);

    const nextStepObj = STEPS[next];
    if (nextStepObj) {
      if (nextStepObj.target === "course-card") {
        if (pathname !== "/pelajar/all-course") {
          router.push("/pelajar/all-course");
        }
      } else if (nextStepObj.target === "course-overview" || nextStepObj.target === "lesson-list") {
        if (!pathname.startsWith("/course/")) {
          try {
            const res = await courseService.getAllCourses();
            const firstId = res?.data?.[0]?.id;
            if (firstId) {
              router.push(`/course/${firstId}`);
              return;
            }
          } catch {
            // fallback
          }
          router.push("/pelajar/all-course");
        }
      } else if (nextStepObj.target === "lesson-content") {
        if (!pathname.startsWith("/pelajar/lesson/")) {
          try {
            const res = await courseService.getUserCourseProgress();
            const enrolled = res?.data?.enrollments?.[0];
            if (enrolled?.course_id) {
              const cRes = await courseService.getCourseById(enrolled.course_id);
              const firstLessonId = cRes?.data?.lessons?.[0]?.id;
              if (firstLessonId) {
                router.push(`/pelajar/lesson/${firstLessonId}`);
                return;
              }
            }
          } catch {
            // fallback
          }
          router.push("/pelajar/my-courses");
        }
      } else if (nextStepObj.href && pathname !== nextStepObj.href && !pathname.startsWith(nextStepObj.href)) {
        router.push(nextStepObj.href);
      }
    }
  };

  const content = (
    <div className="pointer-events-none fixed inset-0 z-[2147483647]">
      <div
        className="pointer-events-auto fixed z-[2147483647] flex w-[calc(100%-2rem)] max-w-[270px] sm:max-w-[340px] flex-col items-end gap-1.5 transition-all duration-300 ease-out"
        style={{ top: bubblePosition.top, left: bubblePosition.left }}
      >
        <div className="relative z-0 w-full rounded-2xl sm:rounded-3xl border-2 sm:border-4 border-cyan-200 bg-white p-3 sm:p-4 shadow-2xl">
          {/* Panah pointer dinamis berdasarkan posisi */}
          {bubblePosition.arrow === "left" && (
            <div className="absolute -left-2.5 top-5 h-3.5 w-3.5 rotate-45 border-b-2 sm:border-b-4 border-l-2 sm:border-l-4 border-cyan-200 bg-white" />
          )}
          {bubblePosition.arrow === "right" && (
            <div className="absolute -right-2.5 top-5 h-3.5 w-3.5 rotate-45 border-t-2 sm:border-t-4 border-r-2 sm:border-r-4 border-cyan-200 bg-white" />
          )}
          {bubblePosition.arrow === "top" && (
            <div className="absolute -top-2.5 left-6 h-3.5 w-3.5 rotate-45 border-t-2 sm:border-t-4 border-l-2 sm:border-l-4 border-cyan-200 bg-white" />
          )}
          {bubblePosition.arrow === "bottom" && (
            <div className="absolute -bottom-2.5 left-6 h-3.5 w-3.5 rotate-45 border-b-2 sm:border-b-4 border-r-2 sm:border-r-4 border-cyan-200 bg-white" />
          )}

          <Image
            src="/quli-maskot.webp"
            alt="Quli"
            width={65}
            height={80}
            className="absolute -top-9 -right-5 sm:-top-11 sm:-right-7 z-[2147483647] h-auto w-14 sm:w-18 object-contain drop-shadow-xl"
          />
          <button onClick={finish} aria-label="Tutup tutorial" className="absolute right-2.5 top-2.5 rounded-full p-1 text-slate-400 hover:bg-slate-100"><X className="h-3.5 w-3.5" /></button>
          <p className="mb-0.5 text-[9px] font-bold uppercase tracking-widest text-cyan-600">Quli • {step + 1}/{STEPS.length}</p>
          <h2 className="pr-4 text-xs sm:text-sm font-extrabold text-[#00172e] leading-snug">{current.title}</h2>
          <p className="mt-1 text-[11px] sm:text-xs leading-relaxed text-slate-600">{current.text}</p>
          <div className="mt-3 flex items-center justify-between gap-1.5">
            <button onClick={finish} className="text-[11px] font-bold text-slate-400 hover:text-slate-600">Lewati</button>
            <div className="flex gap-1.5">
              <button disabled={step === 0} onClick={() => changeStep(step - 1)} className="rounded-full border border-slate-200 p-1.5 text-slate-500 disabled:opacity-30"><ChevronLeft className="h-3.5 w-3.5" /></button>
              {step < STEPS.length - 1 ? <button onClick={() => changeStep(step + 1)} className="flex items-center gap-1 rounded-full bg-[#008be3] px-3 py-1 text-[11px] font-bold text-white shadow-md active:scale-95 transition-all">Berikutnya <ChevronRight className="h-3.5 w-3.5" /></button> : <button onClick={finish} className="rounded-full bg-[#008be3] px-4 py-1 text-[11px] font-bold text-white">Selesai</button>}
            </div>
          </div>
        </div>
      </div>
      <style jsx global>{`
        [data-tour].tour-current-target {
          position: relative !important;
          z-index: 10000 !important;
          pointer-events: auto !important;
          border-radius: 0.75rem;
          outline: 3px solid #22d3ee !important;
          outline-offset: 4px;
          box-shadow: 0 0 0 6px rgba(34, 211, 238, 0.4), 0 0 30px 8px rgba(34, 211, 238, 0.6) !important;
          animation: tour-pulse 1.7s ease-in-out infinite;
        }
        @keyframes tour-pulse {
          0%, 100% {
            outline-color: #22d3ee;
            box-shadow: 0 0 0 6px rgba(34, 211, 238, 0.4), 0 0 20px 5px rgba(34, 211, 238, 0.5);
          }
          50% {
            outline-color: #06b6d4;
            box-shadow: 0 0 0 10px rgba(34, 211, 238, 0.7), 0 0 35px 12px rgba(34, 211, 238, 0.8);
          }
        }
      `}</style>
    </div>
  );

  return createPortal(content, document.body);
}
