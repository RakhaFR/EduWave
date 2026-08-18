"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PelajarCourseRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/pelajar/all-course");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0063A7] text-white">
      <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
