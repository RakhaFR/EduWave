"use client";

import { useState, useMemo } from "react";
import { Search, Plus, Edit, Trash, X, ChevronLeft, ChevronRight, HelpCircle } from "lucide-react";
import Link from "next/link";
import { Exam } from "./types";

interface ExamTableProps {
  exams: Exam[];
  onAddClick: () => void;
  onEditClick: (exam: Exam) => void;
  onDeleteClick: (id: string) => void;
  searchGlobal: string;
  basePath?: string;
}

const ITEMS_PER_PAGE = 5;

export default function ExamTable({
  exams,
  onAddClick,
  onEditClick,
  onDeleteClick,
  searchGlobal,
  basePath = "/pembimbing",
}: ExamTableProps) {
  const [searchLocal, setSearchLocal] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [prevSearchLocal, setPrevSearchLocal] = useState(searchLocal);
  const [prevSearchGlobal, setPrevSearchGlobal] = useState(searchGlobal);

  if (searchLocal !== prevSearchLocal || searchGlobal !== prevSearchGlobal) {
    setPrevSearchLocal(searchLocal);
    setPrevSearchGlobal(searchGlobal);
    setCurrentPage(1);
  }

  const filteredExams = useMemo(() => {
    return exams.filter((e) => {
      const matchQuery =
        e.title.toLowerCase().includes(searchLocal.toLowerCase()) ||
        e.course_title.toLowerCase().includes(searchLocal.toLowerCase()) ||
        e.id.toLowerCase().includes(searchLocal.toLowerCase());

      const matchGlobal = searchGlobal
        ? e.title.toLowerCase().includes(searchGlobal.toLowerCase()) ||
          e.course_title.toLowerCase().includes(searchGlobal.toLowerCase())
        : true;

      return matchQuery && matchGlobal;
    });
  }, [exams, searchLocal, searchGlobal]);

  const totalPages = Math.ceil(filteredExams.length / ITEMS_PER_PAGE);

  const paginatedExams = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredExams.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredExams, currentPage]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari ujian atau kursus..."
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
          <span>Buat Ujian Baru</span>
        </button>
      </div>

      <div className="overflow-x-auto border border-slate-100 rounded-2xl shadow-sm">
        <table className="w-full min-w-[700px] border-collapse text-left text-xs sm:text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 font-semibold text-slate-500">
              <th className="py-4 px-5">Judul Ujian</th>
              <th className="py-4 px-5">Kursus</th>
              <th className="py-4 px-5 w-28 text-center">Durasi</th>
              <th className="py-4 px-5 w-24 text-center">Nilai Lulus</th>
              <th className="py-4 px-5 w-24 text-center">Maks. Coba</th>
              <th className="py-4 px-5 w-28 text-center">Soal</th>
              <th className="py-4 px-5 w-32 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedExams.length > 0 ? (
              paginatedExams.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-5">
                    <p className="font-bold text-[#00172e]">{e.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-mono">{e.pearls_reward} mutiara</p>
                  </td>
                  <td className="py-3.5 px-5 text-slate-600 font-medium">{e.course_title}</td>
                  <td className="py-3.5 px-5 text-center font-semibold text-[#00172e]">
                    {Math.round(e.time_limit_sec / 60)} mnt
                  </td>
                  <td className="py-3.5 px-5 text-center font-semibold text-[#00172e]">{e.passing_score}%</td>
                  <td className="py-3.5 px-5 text-center font-semibold text-[#00172e]">{e.max_attempts}x</td>
                  <td className="py-3.5 px-5 text-center">
                    <Link
                      href={`${basePath}/exam/${e.id}/questions`}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-[#0073e6] hover:bg-blue-100 transition-all border border-blue-200"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Kelola Soal</span>
                    </Link>
                  </td>
                  <td className="py-3.5 px-5">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onEditClick(e)}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold text-[#0073e6] hover:bg-blue-50 transition-all flex items-center gap-1 border border-transparent hover:border-blue-100 cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => onDeleteClick(e.id)}
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
                  Tidak ada data ujian. Buat ujian baru di atas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-2">
          <p className="text-xs text-slate-400 font-medium">
            Menampilkan <span className="font-bold text-slate-700">{Math.min(filteredExams.length, (currentPage - 1) * ITEMS_PER_PAGE + 1)}-{Math.min(filteredExams.length, currentPage * ITEMS_PER_PAGE)}</span> dari <span className="font-bold text-slate-700">{filteredExams.length}</span> ujian
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`p-1.5 rounded-lg border text-slate-500 transition-all flex items-center justify-center ${currentPage === 1 ? "opacity-40 cursor-not-allowed border-slate-100" : "hover:bg-slate-50 border-slate-200 active:scale-95 cursor-pointer"}`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-lg border text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${currentPage === pageNum ? "bg-[#0073e6] border-[#0073e6] text-white shadow-sm shadow-blue-100" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`p-1.5 rounded-lg border text-slate-500 transition-all flex items-center justify-center ${currentPage === totalPages ? "opacity-40 cursor-not-allowed border-slate-100" : "hover:bg-slate-50 border-slate-200 active:scale-95 cursor-pointer"}`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
