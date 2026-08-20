"use client";

import { useState, useMemo } from "react";
import { Search, Plus, Edit, Trash, X, Loader2, List } from "lucide-react";
import { PembimbingCourse } from "./types";
import Link from "next/link";
import SmartPagination from "@/components/common/SmartPagination";

interface CourseTableProps {
  courses: PembimbingCourse[];
  loading?: boolean;
  onAddClick: () => void;
  onEditClick: (course: PembimbingCourse) => void;
  onDeleteClick: (id: string) => void;
  searchGlobal: string;
}

const ITEMS_PER_PAGE = 5;

const DIFFICULTY_LABEL: Record<string, string> = {
  beginner: "Pemula",
  intermediate: "Menengah",
  advanced: "Mahir",
};

const DIFFICULTY_COLOR: Record<string, string> = {
  beginner: "bg-emerald-50 text-emerald-600",
  intermediate: "bg-amber-50 text-amber-600",
  advanced: "bg-red-50 text-red-600",
};

export default function CourseTable({
  courses,
  loading = false,
  onAddClick,
  onEditClick,
  onDeleteClick,
  searchGlobal,
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
      const matchQuery =
        c.title.toLowerCase().includes(searchLocal.toLowerCase()) ||
        c.category.toLowerCase().includes(searchLocal.toLowerCase()) ||
        c.id.toLowerCase().includes(searchLocal.toLowerCase());

      const matchGlobal = searchGlobal
        ? c.title.toLowerCase().includes(searchGlobal.toLowerCase()) ||
          c.category.toLowerCase().includes(searchGlobal.toLowerCase())
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
            placeholder="Cari kursus atau kategori..."
            value={searchLocal}
            onChange={(e) => setSearchLocal(e.target.value)}
            className="w-full max-w-md pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all"
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
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0073e6] hover:bg-[#0052cc] text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-200 transition-all shrink-0 active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Kursus Baru</span>
        </button>
      </div>

      <div className="overflow-x-auto border border-slate-100 rounded-2xl shadow-sm">
        <table className="w-full min-w-[700px] border-collapse text-left text-xs sm:text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 font-semibold text-slate-500">
              <th className="py-4 px-5">Judul Kursus</th>
              <th className="py-4 px-5">Kategori</th>
              <th className="py-4 px-5 w-28 text-center">Tingkat</th>
              <th className="py-4 px-5 w-24 text-center">Siswa</th>
              <th className="py-4 px-5 w-28 text-center">Lesson</th>
              <th className="py-4 px-5 w-28 text-center">Status</th>
              <th className="py-4 px-5 w-32 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-10 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-400 mx-auto" />
                </td>
              </tr>
            ) : paginatedCourses.length > 0 ? (
              paginatedCourses.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-5">
                    <p className="font-bold text-[#00172e]">{c.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{c.description}</p>
                  </td>
                  <td className="py-3.5 px-5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600">
                      {c.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${DIFFICULTY_COLOR[c.difficulty] ?? "bg-slate-100 text-slate-500"}`}>
                      {DIFFICULTY_LABEL[c.difficulty] ?? c.difficulty}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-center font-semibold text-[#00172e]">{c.enrolled_count}</td>
                  <td className="py-3.5 px-5 text-center">
                    <Link
                      href={`/pembimbing/course/${c.id}/lessons`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-all border border-emerald-200 shadow-sm cursor-pointer"
                    >
                      <List className="w-3.5 h-3.5" />
                      <span>{c.lesson_count ?? 0} Lesson</span>
                    </Link>
                  </td>
                  <td className="py-3.5 px-5 text-center">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        c.status === "published"
                          ? "bg-green-50 text-green-600"
                          : c.status === "archived"
                          ? "bg-amber-50 text-amber-600"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {c.status === "published" ? "Terbit" : c.status === "archived" ? "Arsip" : "Draft"}
                    </span>
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
                <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
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
    </div>
  );
}
