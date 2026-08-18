"use client";

import { useState, useMemo } from "react";
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Activity,
  Laptop,
  Globe
} from "lucide-react";
import { Registration } from "./types";

interface RegistrationLogProps {
  registrations: Registration[];
  searchGlobal: string;
}

const ITEMS_PER_PAGE = 4;

export default function RegistrationLog({
  registrations,
  searchGlobal,
}: RegistrationLogProps) {
  const [searchLocal, setSearchLocal] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState<"Semua" | "Normal" | "Mencurigakan">("Semua");

  const [prevSearchLocal, setPrevSearchLocal] = useState(searchLocal);
  const [prevSearchGlobal, setPrevSearchGlobal] = useState(searchGlobal);
  const [prevFilterType, setPrevFilterType] = useState(filterType);

  if (
    searchLocal !== prevSearchLocal ||
    searchGlobal !== prevSearchGlobal ||
    filterType !== prevFilterType
  ) {
    setPrevSearchLocal(searchLocal);
    setPrevSearchGlobal(searchGlobal);
    setPrevFilterType(filterType);
    setCurrentPage(1);
  }

  // --- Statistics ---
  const stats = useMemo(() => {
    const total = registrations.length;
    const suspicious = registrations.filter((r) => r.isSuspicious).length;
    const normal = total - suspicious;
    return { total, normal, suspicious };
  }, [registrations]);

  // --- Filtered Data ---
  const filteredData = useMemo(() => {
    return registrations.filter((r) => {
      const matchLocal =
        r.user.toLowerCase().includes(searchLocal.toLowerCase()) ||
        r.email.toLowerCase().includes(searchLocal.toLowerCase()) ||
        r.action.toLowerCase().includes(searchLocal.toLowerCase()) ||
        r.ip.toLowerCase().includes(searchLocal.toLowerCase()) ||
        r.device.toLowerCase().includes(searchLocal.toLowerCase());

      const matchGlobal = searchGlobal
        ? r.user.toLowerCase().includes(searchGlobal.toLowerCase()) ||
          r.email.toLowerCase().includes(searchGlobal.toLowerCase()) ||
          r.action.toLowerCase().includes(searchGlobal.toLowerCase())
        : true;

      const matchFilter =
        filterType === "Semua"
          ? true
          : filterType === "Mencurigakan"
          ? r.isSuspicious
          : !r.isSuspicious;

      return matchLocal && matchGlobal && matchFilter;
    });
  }, [registrations, searchLocal, searchGlobal, filterType]);

  // --- Pagination ---
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* --- Mini Stats Row --- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Total Aktivitas */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-100 rounded-2xl p-4 flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-[#0073e6] text-white flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-md shadow-blue-200">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-black text-[#00172e] leading-tight">{stats.total}</p>
            <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Total Aktivitas Terdeteksi</p>
          </div>
        </div>

        {/* Akses Normal */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-md shadow-emerald-200">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-black text-[#00172e] leading-tight">{stats.normal}</p>
            <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Aktivitas Wajar / Normal</p>
          </div>
        </div>

        {/* Aktivitas Mencurigakan */}
        <div className="bg-gradient-to-br from-rose-50 to-red-50/50 border border-rose-100 rounded-2xl p-4 flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-rose-500 text-[#fff] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-md shadow-rose-200">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-black text-rose-600 leading-tight">{stats.suspicious}</p>
            <p className="text-[10px] font-semibold text-rose-400 mt-0.5">Aktivitas Mencurigakan</p>
          </div>
        </div>
      </div>

      {/* --- Auto Expire Notice Banner --- */}
      <div className="bg-amber-50/70 border border-amber-200/60 rounded-2xl p-3.5 flex items-center gap-3 text-xs text-amber-800 font-medium">
        <Clock className="w-4 h-4 text-amber-600 shrink-0" />
        <span>
          Log ini melakukan <strong>tracking real-time</strong> aktivitas pendaftaran & akses. Catatan log akan secara otomatis terhapus bertahap setelah kurun waktu 30 hari.
        </span>
      </div>

      {/* --- Controls Row --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari user, IP, perangkat, atau jenis aktivitas..."
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

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 shrink-0">
          {(["Semua", "Normal", "Mencurigakan"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
                filterType === type
                  ? type === "Mencurigakan"
                    ? "bg-rose-500 text-white border-rose-500 shadow-sm"
                    : type === "Normal"
                    ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
                    : "bg-[#0073e6] text-white border-[#0073e6] shadow-sm"
                  : "bg-white text-slate-400 border-slate-200 hover:text-slate-600 hover:border-slate-300"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* --- Table --- */}
      <div className="overflow-x-auto border border-slate-100 rounded-2xl shadow-sm">
        <table className="w-full min-w-[700px] border-collapse text-left text-xs sm:text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 font-semibold text-slate-500">
              <th className="py-4 px-5 w-20">ID</th>
              <th className="py-4 px-5">Pengguna / Email</th>
              <th className="py-4 px-5">Aktivitas</th>
              <th className="py-4 px-5">IP & Perangkat</th>
              <th className="py-4 px-5 w-28 text-center">Waktu</th>
              <th className="py-4 px-5 w-32 text-center">Status Keamanan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedData.length > 0 ? (
              paginatedData.map((r) => (
                <tr
                  key={r.id}
                  className={`transition-colors ${
                    r.isSuspicious ? "bg-rose-50/40 hover:bg-rose-50/70" : "hover:bg-slate-50/50"
                  }`}
                >
                  <td className="py-3.5 px-5 font-mono text-slate-400">{r.id}</td>
                  <td className="py-3.5 px-5">
                    <p className="font-bold text-[#00172e]">{r.user}</p>
                    <p className="text-[11px] text-slate-400">{r.email}</p>
                  </td>
                  <td className="py-3.5 px-5 font-semibold text-slate-700">{r.action}</td>
                  <td className="py-3.5 px-5">
                    <div className="flex flex-col text-[11px] text-slate-500 gap-0.5">
                      <span className="flex items-center gap-1 font-mono text-slate-600">
                        <Globe className="w-3 h-3 text-slate-400" /> {r.ip}
                      </span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <Laptop className="w-3 h-3" /> {r.device}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-5 text-center text-slate-500 font-medium">
                    <span className="inline-flex items-center gap-1 text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono">
                      <Clock className="w-3 h-3 text-slate-400" /> {r.timeAgo}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        r.isSuspicious
                          ? "bg-rose-100 text-rose-600 border border-rose-200"
                          : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                      }`}
                    >
                      {r.isSuspicious ? (
                        <>
                          <ShieldAlert className="w-3 h-3 text-rose-500" /> Mencurigakan
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-3 h-3 text-emerald-500" /> Normal
                        </>
                      )}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                  Tidak ada catatan aktivitas yang sesuai.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- Pagination --- */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-2">
          <p className="text-xs text-slate-400 font-medium">
            Menampilkan{" "}
            <span className="font-bold text-slate-700">
              {Math.min(filteredData.length, (currentPage - 1) * ITEMS_PER_PAGE + 1)}-
              {Math.min(filteredData.length, currentPage * ITEMS_PER_PAGE)}
            </span>{" "}
            dari <span className="font-bold text-slate-700">{filteredData.length}</span> log aktivitas
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
