"use client";

import { useState, useMemo } from "react";
import { Search, Plus, Edit, Trash, X, Loader2, BookOpen, Users, Clock, List } from "lucide-react";
import { Course } from "./types";
import Link from "next/link";
import SmartPagination from "@/components/common/SmartPagination";
import { Badge } from "@/components/ui/badge";

interface CourseTableProps {
  courses: Course[];
  loading?: boolean;
  onAddClick: () => void;
  onEditClick: (course: Course) => void;
  onDeleteClick: (id: string) => void;
  searchGlobal: string;
}

const ITEMS_PER_PAGE = 8;

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "bg-green-50 text-green-600",
  intermediate: "bg-amber-50 text-amber-600",
  advanced: "bg-red-50 text-red-600",
};

export default function CourseTable({
  courses,
  loading = false,
  onAddClick,
  onEditClick,
  onDeleteClick,
  searchGlobal
}: CourseTableProps) {
  const [searchLocal, setSearchLocal] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [prevSearchLocal, setPrevSearchLocal] = useState(searchLocal);
  const [prevSearchGlobal, setPrevSearchGlobal] = useState(searchGlobal);

  if (searchLocal !== prevSearchLocal || searchGlobal !== prevSearchGlobal) {
    setPrevSearchLocal(searchLocal);
    setPrevSearchGlobal(searchGlobal);
    setCurrentPage(1);
  }

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const instructorName = c.instructor?.full_name ?? "";
      const matchQuery =
        c.title.toLowerCase().includes(searchLocal.toLowerCase()) ||
        c.category.toLowerCase().includes(searchLocal.toLowerCase()) ||
        instructorName.toLowerCase().includes(searchLocal.toLowerCase()) ||
        c.status.toLowerCase().includes(searchLocal.toLowerCase());

      const matchGlobal = searchGlobal
        ? c.title.toLowerCase().includes(searchGlobal.toLowerCase()) ||
          c.category.toLowerCase().includes(searchGlobal.toLowerCase()) ||
          instructorName.toLowerCase().includes(searchGlobal.toLowerCase())
        : true;

      return matchQuery && matchGlobal;
    });
  }, [courses, searchLocal, searchGlobal]);

  const totalPages = Math.ceil(filteredCourses.length / ITEMS_PER_PAGE);

  const paginatedCourses = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCourses.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredCourses, currentPage]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari kursus, kategori, atau pengajar..."
            value={searchLocal}
            onChange={(e) => setSearchLocal(e.target.value)}
            className="w-full max-w-md pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-xs sm:text-sm text-foreground placeholder-muted-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring transition-all"
          />
          {searchLocal && (
            <button
              onClick={() => setSearchLocal("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          onClick={onAddClick}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm font-bold shadow-md transition-all shrink-0 active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Kursus Baru</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm font-medium">Memuat data kursus...</span>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto border border-slate-100 rounded-2xl shadow-sm">
            <table className="w-full min-w-[800px] border-collapse text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 font-semibold text-slate-500">
                  <th className="py-4 px-5">Judul Kursus</th>
                  <th className="py-4 px-5">Pengajar</th>
                  <th className="py-4 px-5">Kategori</th>
                  <th className="py-4 px-5 w-28 text-center">Kesulitan</th>
                  <th className="py-4 px-5 w-24 text-center">Siswa</th>
                  <th className="py-4 px-5 w-20 text-center">Lesson</th>
                  <th className="py-4 px-5 w-28 text-center">Status</th>
                  <th className="py-4 px-5 w-32 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedCourses.length > 0 ? (
                  paginatedCourses.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          {c.thumbnail_url ? (
                            <img src={c.thumbnail_url} alt={c.title} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-[#e6f3ff] flex items-center justify-center shrink-0">
                              <BookOpen className="w-4 h-4 text-[#0073e6]" />
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-[#00172e] line-clamp-1">{c.title}</p>
                            <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3" /> {c.duration_minutes} menit
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-slate-600">{c.instructor?.full_name ?? "-"}</td>
                      <td className="py-3.5 px-5">
                        <Badge variant="outline" className="text-[10px] font-bold capitalize">
                          {c.category}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <Badge variant="secondary" className="capitalize text-[10px]">
                          {c.difficulty}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <span className="flex items-center justify-center gap-1 text-muted-foreground font-semibold text-xs">
                          <Users className="w-3 h-3" /> {c.enrolled_count}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <Link
                          href={`/admin/course/${c.id}/lessons`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-primary bg-accent hover:bg-accent/80 transition-all border border-border shadow-sm cursor-pointer"
                        >
                          <List className="w-3.5 h-3.5" />
                          <span>{c.lesson_count} Lesson</span>
                        </Link>
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <Badge
                          variant={c.status === "published" ? "default" : "secondary"}
                          className="text-[10px] capitalize"
                        >
                          {c.status === "published" ? "Terbit" : c.status === "draft" ? "Draft" : c.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onEditClick(c)}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold text-[#0073e6] hover:bg-blue-50 transition-all flex items-center gap-1 border border-transparent hover:border-blue-100 cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => onDeleteClick(c.id)}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold text-red-500 hover:bg-red-50 transition-all flex items-center gap-1 border border-transparent hover:border-red-100 cursor-pointer"
                          >
                            <Trash className="w-3.5 h-3.5" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400 font-medium">
                      Tidak ada data kursus yang sesuai.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-2">
              <p className="text-xs text-slate-400 font-medium">
                Menampilkan <span className="font-bold text-slate-700">{Math.min(filteredCourses.length, (currentPage - 1) * ITEMS_PER_PAGE + 1)}-{Math.min(filteredCourses.length, currentPage * ITEMS_PER_PAGE)}</span> dari <span className="font-bold text-slate-700">{filteredCourses.length}</span> kursus
              </p>
              <SmartPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
