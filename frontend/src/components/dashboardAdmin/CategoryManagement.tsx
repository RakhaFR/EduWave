"use client";

import { useState, useMemo } from "react";
import { Search, Plus, Edit, Trash, X, ChevronLeft, ChevronRight, FolderOpen, Layers, BookOpen } from "lucide-react";
import { Category } from "./types";

interface CategoryManagementProps {
  categories: Category[];
  onAddClick: () => void;
  onEditClick: (category: Category) => void;
  onDeleteClick: (id: string) => void;
  searchGlobal: string;
}

const ITEMS_PER_PAGE = 3;

export default function CategoryManagement({
  categories,
  onAddClick,
  onEditClick,
  onDeleteClick,
  searchGlobal
}: CategoryManagementProps) {
  const [searchLocal, setSearchLocal] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [prevSearchLocal, setPrevSearchLocal] = useState(searchLocal);
  const [prevSearchGlobal, setPrevSearchGlobal] = useState(searchGlobal);

  if (searchLocal !== prevSearchLocal || searchGlobal !== prevSearchGlobal) {
    setPrevSearchLocal(searchLocal);
    setPrevSearchGlobal(searchGlobal);
    setCurrentPage(1);
  }

  // --- Statistics ---
  const stats = useMemo(() => {
    const total = categories.length;
    const totalCourses = categories.reduce((acc, c) => acc + c.courseCount, 0);
    const topCategory = categories.reduce((prev, current) =>
      prev && prev.courseCount > current.courseCount ? prev : current, categories[0]
    );
    return { total, totalCourses, topCategory: topCategory?.name || "-" };
  }, [categories]);

  // --- Filtered Categories ---
  const filteredCategories = useMemo(() => {
    return categories.filter((c) => {
      const matchLocal =
        c.name.toLowerCase().includes(searchLocal.toLowerCase()) ||
        c.description.toLowerCase().includes(searchLocal.toLowerCase()) ||
        c.id.toLowerCase().includes(searchLocal.toLowerCase());

      const matchGlobal = searchGlobal
        ? c.name.toLowerCase().includes(searchGlobal.toLowerCase()) ||
          c.description.toLowerCase().includes(searchGlobal.toLowerCase())
        : true;

      return matchLocal && matchGlobal;
    });
  }, [categories, searchLocal, searchGlobal]);

  // --- Pagination ---
  const totalPages = Math.ceil(filteredCategories.length / ITEMS_PER_PAGE);

  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCategories.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredCategories, currentPage]);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Mini Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-100 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0073e6] text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-200">
            <FolderOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-black text-[#00172e] leading-tight">{stats.total}</p>
            <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Total Kategori</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-indigo-50/50 border border-purple-100 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-purple-200">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-black text-[#00172e] leading-tight">{stats.topCategory}</p>
            <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Kategori Terpopuler</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-200">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-black text-[#00172e] leading-tight">{stats.totalCourses}</p>
            <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Kursus Terkait</p>
          </div>
        </div>
      </div>

      {/* Subbar Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama kategori atau deskripsi..."
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
          <span>Buat Kategori Baru</span>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-slate-100 rounded-2xl shadow-sm">
        <table className="w-full min-w-[700px] border-collapse text-left text-xs sm:text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 font-semibold text-slate-500">
              <th className="py-4 px-5 w-20">ID</th>
              <th className="py-4 px-5">Nama Kategori</th>
              <th className="py-4 px-5">Deskripsi</th>
              <th className="py-4 px-5 w-32 text-center">Jumlah Kursus</th>
              <th className="py-4 px-5 w-32 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedCategories.length > 0 ? (
              paginatedCategories.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-5 font-mono text-slate-400">{c.id}</td>
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-blue-50 text-[#0073e6] font-bold text-xs flex items-center justify-center border border-blue-100">
                        {c.icon || "📁"}
                      </span>
                      <span className="font-bold text-[#00172e]">{c.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-5 text-slate-500 max-w-xs truncate">{c.description}</td>
                  <td className="py-3.5 px-5 text-center">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600">
                      {c.courseCount} Kursus
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
                <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                  Tidak ada data kategori yang sesuai.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-2">
          <p className="text-xs text-slate-400 font-medium">
            Menampilkan{" "}
            <span className="font-bold text-slate-700">
              {Math.min(filteredCategories.length, (currentPage - 1) * ITEMS_PER_PAGE + 1)}-
              {Math.min(filteredCategories.length, currentPage * ITEMS_PER_PAGE)}
            </span>{" "}
            dari <span className="font-bold text-slate-700">{filteredCategories.length}</span> kategori
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`p-1.5 rounded-lg border text-slate-500 transition-all flex items-center justify-center ${
                currentPage === 1
                  ? "opacity-40 cursor-not-allowed border-slate-100"
                  : "hover:bg-slate-50 border-slate-200 active:scale-95 cursor-pointer"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-lg border text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                    currentPage === pageNum
                      ? "bg-[#0073e6] border-[#0073e6] text-white shadow-sm shadow-blue-100"
                      : "border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`p-1.5 rounded-lg border text-slate-500 transition-all flex items-center justify-center ${
                currentPage === totalPages
                  ? "opacity-40 cursor-not-allowed border-slate-100"
                  : "hover:bg-slate-50 border-slate-200 active:scale-95 cursor-pointer"
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
