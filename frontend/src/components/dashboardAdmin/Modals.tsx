"use client";

import { X } from "lucide-react";
import { UserType, Category } from "./types";
import { AdminCourseForm } from "@/services/adminService";

interface ModalsProps {
  isCourseModalOpen: boolean;
  setIsCourseModalOpen: (open: boolean) => void;
  editingCourseId: string | null;
  courseForm: AdminCourseForm;
  setCourseForm: (form: AdminCourseForm) => void;
  handleSaveCourse: (e: React.FormEvent) => void;
  courseLoading?: boolean;

  isUserModalOpen: boolean;
  setIsUserModalOpen: (open: boolean) => void;
  editingUser: UserType | null;
  userForm: { name: string; email: string; role: string; status: string };
  setUserForm: (form: { name: string; email: string; role: string; status: string }) => void;
  handleSaveUser: (e: React.FormEvent) => void;

  isCategoryModalOpen: boolean;
  setIsCategoryModalOpen: (open: boolean) => void;
  editingCategory: Category | null;
  categoryForm: { name: string; description: string; icon: string };
  setCategoryForm: (form: { name: string; description: string; icon: string }) => void;
  handleSaveCategory: (e: React.FormEvent) => void;

  deleteConfirm: { type: "kursus" | "pengguna" | "kategori"; id: string } | null;
  setDeleteConfirm: (val: { type: "kursus" | "pengguna" | "kategori"; id: string } | null) => void;
  handleConfirmDelete: () => void;
}

export default function Modals({
  isCourseModalOpen,
  setIsCourseModalOpen,
  editingCourseId,
  courseForm,
  setCourseForm,
  handleSaveCourse,
  courseLoading = false,

  isUserModalOpen,
  setIsUserModalOpen,
  editingUser,
  userForm,
  setUserForm,
  handleSaveUser,

  isCategoryModalOpen,
  setIsCategoryModalOpen,
  editingCategory,
  categoryForm,
  setCategoryForm,
  handleSaveCategory,

  deleteConfirm,
  setDeleteConfirm,
  handleConfirmDelete
}: ModalsProps) {
  return (
    <>
      {/* --- MODAL: KURSUS --- */}
      {isCourseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCourseModalOpen(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl p-6 w-full max-w-lg z-10 flex flex-col gap-4 text-sm transform transition-all animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-[#00172e]">
                {editingCourseId ? "Edit Kursus" : "Buat Kursus Baru"}
              </h3>
              <button onClick={() => setIsCourseModalOpen(false)} className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-500">Judul Kursus</label>
                <input type="text" required placeholder="Contoh: Web Development Dasar" value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-400 transition-all text-slate-700 placeholder-slate-300" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-500">Deskripsi</label>
                <textarea rows={3} required placeholder="Deskripsi singkat tentang kursus ini..." value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-400 transition-all text-slate-700 placeholder-slate-300 resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-500">Kategori</label>
                  <input type="text" required placeholder="Contoh: Programming" value={courseForm.category}
                    onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-400 transition-all text-slate-700 placeholder-slate-300" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-500">Kesulitan</label>
                  <select value={courseForm.difficulty} onChange={(e) => setCourseForm({ ...courseForm, difficulty: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-400 bg-white text-slate-700">
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-500">Status</label>
                  <select value={courseForm.status} onChange={(e) => setCourseForm({ ...courseForm, status: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-400 bg-white text-slate-700">
                    <option value="published">Terbit</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-500">Durasi (menit)</label>
                  <input type="number" min={0} value={courseForm.duration_minutes}
                    onChange={(e) => setCourseForm({ ...courseForm, duration_minutes: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-400 transition-all text-slate-700" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-500">Hadiah Mutiara</label>
                  <input type="number" min={0} value={courseForm.pearls_reward}
                    onChange={(e) => setCourseForm({ ...courseForm, pearls_reward: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-400 transition-all text-slate-700" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-500">URL Thumbnail</label>
                  <input type="url" placeholder="https://..." value={courseForm.thumbnail_url ?? ""}
                    onChange={(e) => setCourseForm({ ...courseForm, thumbnail_url: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-400 transition-all text-slate-700 placeholder-slate-300" />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 mt-4">
                <button type="button" onClick={() => setIsCourseModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 font-bold transition-all cursor-pointer">Batal</button>
                <button type="submit" disabled={courseLoading}
                  className="px-5 py-2.5 rounded-xl bg-[#0073e6] hover:bg-[#0052cc] text-white font-bold transition-all shadow-md cursor-pointer disabled:opacity-60">
                  {courseLoading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: PENGGUNA --- */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsUserModalOpen(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md z-10 flex flex-col gap-4 text-sm transform transition-all animate-scale-in">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-[#00172e]">
                {editingUser ? "Edit Pengguna" : "Tambah Pengguna Baru"}
              </h3>
              <button onClick={() => setIsUserModalOpen(false)} className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-500">Nama Pengguna</label>
                <input type="text" required placeholder="Rasya Raya" value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-400 transition-all text-slate-700 placeholder-slate-300" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-500">Email</label>
                <input type="email" required placeholder="rasya@eduwave.id" value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-400 transition-all text-slate-700 placeholder-slate-300" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-500">Peran</label>
                  <select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-400 bg-white text-slate-700">
                    <option value="Siswa">Siswa</option>
                    <option value="Pengajar">Pengajar</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-500">Status</label>
                  <select value={userForm.status} onChange={(e) => setUserForm({ ...userForm, status: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-400 bg-white text-slate-700">
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 mt-4">
                <button type="button" onClick={() => setIsUserModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 font-bold transition-all cursor-pointer">Batal</button>
                <button type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#0073e6] hover:bg-[#0052cc] text-white font-bold transition-all shadow-md cursor-pointer">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: KATEGORI --- */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCategoryModalOpen(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md z-10 flex flex-col gap-4 text-sm transform transition-all animate-scale-in">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-[#00172e]">
                {editingCategory ? "Edit Kategori" : "Buat Kategori Baru"}
              </h3>
              <button onClick={() => setIsCategoryModalOpen(false)} className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="flex flex-col gap-4">
              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-1 flex flex-col gap-1.5">
                  <label className="font-bold text-slate-500">Ikon</label>
                  <input type="text" required placeholder="💻" value={categoryForm.icon}
                    onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-400 text-center text-lg" />
                </div>
                <div className="col-span-3 flex flex-col gap-1.5">
                  <label className="font-bold text-slate-500">Nama Kategori</label>
                  <input type="text" required placeholder="Contoh: Teknologi" value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-400 transition-all text-slate-700 placeholder-slate-300" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-500">Deskripsi</label>
                <textarea rows={3} required placeholder="Deskripsi singkat seputar kategori kursus ini..." value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-400 transition-all text-slate-700 placeholder-slate-300 resize-none" />
              </div>

              <div className="flex items-center justify-end gap-2.5 mt-4">
                <button type="button" onClick={() => setIsCategoryModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 font-bold transition-all cursor-pointer">Batal</button>
                <button type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#0073e6] hover:bg-[#0052cc] text-white font-bold transition-all shadow-md cursor-pointer">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- CONFIRM DELETE MODAL --- */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm z-10 flex flex-col gap-4 text-sm transform transition-all animate-scale-in text-center">
            <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-2 text-2xl font-bold">!</div>
            <div>
              <h3 className="text-base font-extrabold text-[#00172e]">Konfirmasi Hapus</h3>
              <p className="text-slate-400 mt-2 font-medium">
                Apakah Anda yakin ingin menghapus {deleteConfirm.type === "kursus" ? "kursus" : deleteConfirm.type === "kategori" ? "kategori" : "pengguna"} ini? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3.5 mt-4">
              <button type="button" onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 font-bold transition-all cursor-pointer">Batal</button>
              <button type="button" onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-all shadow-md cursor-pointer">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
