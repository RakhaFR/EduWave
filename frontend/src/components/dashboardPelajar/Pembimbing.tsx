"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, GraduationCap, Search, Users } from "lucide-react";
import DashboardLayout from "@/components/dashboardPelajar/DashboardLayout";
import { InstructorDirectoryEntry, publicService } from "@/services/publicService";

const formatNumber = (value: number) => value.toLocaleString("id-ID");

export default function PembimbingComponent() {
  const [instructors, setInstructors] = useState<InstructorDirectoryEntry[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("semua");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInstructors() {
      setLoading(true);
      try {
        const response = await publicService.getInstructors();
        setInstructors(Array.isArray(response?.data) ? response.data : []);
      } catch {
        setInstructors([]);
      } finally {
        setLoading(false);
      }
    }

    loadInstructors();
  }, []);

  const categories = useMemo(
    () => ["semua", ...Array.from(new Set(instructors.flatMap((instructor) => instructor.categories)))],
    [instructors],
  );

  const filtered = useMemo(() => instructors.filter((instructor) => {
    const query = search.trim().toLowerCase();
    const matchesCategory = category === "semua" || instructor.categories.includes(category);
    const matchesSearch = !query || [instructor.full_name, instructor.username, instructor.bio || "", ...instructor.categories]
      .some((value) => value.toLowerCase().includes(query));
    return matchesCategory && matchesSearch;
  }), [category, instructors, search]);

  return (
    <DashboardLayout searchPlaceholder="Cari pembimbing...">
      <main className="px-4 md:px-8 py-4 md:py-6 max-w-5xl mx-auto">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-1">
            <GraduationCap className="w-5 h-5 text-white" />
            <h1 className="text-xl md:text-2xl font-extrabold text-white">Pembimbing</h1>
          </div>
          <p className="text-sm text-white/70">Belajar dari pembimbing yang memiliki kursus aktif di EduWave</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Cari nama, bio, atau kategori..." value={search} onChange={(event) => setSearch(event.target.value)} className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white text-sm text-slate-700 placeholder-slate-400 outline-none shadow-sm focus:ring-2 focus:ring-[#008be3]/30" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((item) => (
              <button key={item} onClick={() => setCategory(item)} className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${category === item ? "bg-white text-[#008be3] shadow-md" : "bg-white/20 border border-white/20 text-white hover:bg-white/30"}`}>
                {item === "semua" ? "Semua" : item}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><div className="w-9 h-9 border-4 border-white border-t-transparent rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16"><GraduationCap className="w-10 h-10 text-white/40 mx-auto mb-3" /><p className="text-white/70 text-sm">Belum ada pembimbing yang sesuai.</p></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((instructor) => {
              const initial = (instructor.full_name || instructor.username).charAt(0).toUpperCase();
              return <article key={instructor.id} className="bg-white rounded-3xl overflow-hidden shadow-lg flex flex-col">
                <div className="relative h-28 bg-gradient-to-br from-[#008be3] to-[#0063A7] flex items-center justify-center">
                  {instructor.avatar_url ? <img src={instructor.avatar_url} alt={instructor.full_name} className="w-16 h-16 rounded-2xl object-cover border-2 border-white/40 shadow-lg" /> : <div className="w-16 h-16 rounded-2xl bg-white/25 flex items-center justify-center border-2 border-white/40 shadow-lg text-3xl font-extrabold text-white">{initial}</div>}
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="text-sm font-extrabold text-[#00172e] leading-tight">{instructor.full_name || instructor.username}</h3>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">Pembimbing EduWave</p>
                  <div className="flex items-center gap-3 my-3 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{formatNumber(instructor.enrolled_students_count)} pendaftaran</span>
                    <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{instructor.courses_count} kursus</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed mb-3 line-clamp-3 flex-1">{instructor.bio || "Belum ada bio dari pembimbing ini."}</p>
                  {instructor.categories.length > 0 && <div className="flex flex-wrap gap-1.5">{instructor.categories.map((item) => <span key={item} className="text-[10px] font-semibold bg-[#f0f7ff] text-[#008be3] px-2 py-0.5 rounded-full border border-[#008be3]/20">{item}</span>)}</div>}
                </div>
              </article>;
            })}
          </div>
        )}
      </main>
    </DashboardLayout>
  );
}
