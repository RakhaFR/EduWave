"use client";

import { useState, useMemo } from "react";
import { Search, Plus, Edit, Trash, X } from "lucide-react";
import { UserType } from "./types";
import SmartPagination from "@/components/common/SmartPagination";
import { Badge } from "@/components/ui/badge";

interface UserTableProps {
  users: UserType[];
  onAddClick: () => void;
  onEditClick: (user: UserType) => void;
  onDeleteClick: (id: string) => void;
  searchGlobal: string;
}

const ITEMS_PER_PAGE = 10;

export default function UserTable({
  users,
  onAddClick,
  onEditClick,
  onDeleteClick,
  searchGlobal
}: UserTableProps) {
  const [searchLocal, setSearchLocal] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [prevSearchLocal, setPrevSearchLocal] = useState(searchLocal);
  const [prevSearchGlobal, setPrevSearchGlobal] = useState(searchGlobal);

  if (searchLocal !== prevSearchLocal || searchGlobal !== prevSearchGlobal) {
    setPrevSearchLocal(searchLocal);
    setPrevSearchGlobal(searchGlobal);
    setCurrentPage(1);
  }

  // Filter users based on local search & global search
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchQuery =
        u.name.toLowerCase().includes(searchLocal.toLowerCase()) ||
        u.email.toLowerCase().includes(searchLocal.toLowerCase()) ||
        u.role.toLowerCase().includes(searchLocal.toLowerCase()) ||
        u.id.toLowerCase().includes(searchLocal.toLowerCase());

      const matchGlobal = searchGlobal
        ? u.name.toLowerCase().includes(searchGlobal.toLowerCase()) ||
          u.email.toLowerCase().includes(searchGlobal.toLowerCase()) ||
          u.role.toLowerCase().includes(searchGlobal.toLowerCase())
        : true;

      return matchQuery && matchGlobal;
    });
  }, [users, searchLocal, searchGlobal]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  return (
    <div className="flex flex-col gap-4">
      {/* Subbar Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari pengguna, email, atau peran..."
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
          <span>Tambah Pengguna Baru</span>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-slate-100 rounded-2xl shadow-sm">
        <table className="w-full min-w-[700px] border-collapse text-left text-xs sm:text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 font-semibold text-slate-500">
              <th className="py-4 px-5 w-20">ID</th>
              <th className="py-4 px-5">Nama Pengguna</th>
              <th className="py-4 px-5">Email</th>
              <th className="py-4 px-5">Peran</th>
              <th className="py-4 px-5 w-28 text-center">Status</th>
              <th className="py-4 px-5 w-32 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-5 font-mono text-muted-foreground">{u.id}</td>
                  <td className="py-3.5 px-5 font-bold text-foreground">{u.name}</td>
                  <td className="py-3.5 px-5 text-muted-foreground">{u.email}</td>
                  <td className="py-3.5 px-5">
                    <Badge variant={u.role === "Admin" ? "destructive" : "outline"} className="text-[10px]">
                      {u.role}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-5 text-center">
                    <Badge variant={u.status === "Aktif" ? "default" : "secondary"} className="text-[10px]">
                      {u.status}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-5">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onEditClick(u)}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold text-primary hover:bg-accent transition-all flex items-center gap-1 border border-transparent hover:border-border cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => onDeleteClick(u.id)}
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
                <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                  Tidak ada data pengguna yang sesuai.
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
            Menampilkan <span className="font-bold text-slate-700">{Math.min(filteredUsers.length, (currentPage - 1) * ITEMS_PER_PAGE + 1)}-{Math.min(filteredUsers.length, currentPage * ITEMS_PER_PAGE)}</span> dari <span className="font-bold text-slate-700">{filteredUsers.length}</span> pengguna
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
