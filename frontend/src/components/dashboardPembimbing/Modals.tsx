"use client";

import { X } from "lucide-react";
import { PembimbingCourse, Exam } from "./types";
import { PembimbingCourseForm, PembimbingExamForm } from "@/services/pembimbingService";

interface ModalsProps {
  isCourseModalOpen: boolean;
  setIsCourseModalOpen: (open: boolean) => void;
  editingCourseId: string | null;
  courseForm: PembimbingCourseForm;
  setCourseForm: (form: PembimbingCourseForm) => void;
  handleSaveCourse: (e: React.FormEvent) => void;
  courseLoading?: boolean;

  isExamModalOpen: boolean;
  setIsExamModalOpen: (open: boolean) => void;
  editingExamId: string | null;
  examForm: PembimbingExamForm;
  setExamForm: (form: PembimbingExamForm) => void;
  handleSaveExam: (e: React.FormEvent) => void;
  examLoading?: boolean;
  availableCourses: PembimbingCourse[];

  deleteConfirm: { type: "kursus" | "ujian"; id: string } | null;
  setDeleteConfirm: (val: { type: "kursus" | "ujian"; id: string } | null) => void;
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

  isExamModalOpen,
  setIsExamModalOpen,
  editingExamId,
  examForm,
  setExamForm,
  handleSaveExam,
  examLoading = false,
  availableCourses,

  deleteConfirm,
  setDeleteConfirm,
  handleConfirmDelete,
}: ModalsProps) {
  return (
    <>
      {isCourseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCourseModalOpen(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md z-10 flex flex-col gap-4 text-sm transform transition-all animate-scale-in">
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
                <input type="text" required placeholder="Contoh: Web Dev Dasar" value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-400 transition-all text-slate-700 placeholder-slate-300" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-500">Deskripsi</label>
                <textarea rows={2} placeholder="Deskripsi singkat kursus ini..." value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-400 transition-all text-slate-700 placeholder-slate-300 resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-500">Kategori</label>
                  <select value={courseForm.category} onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-400 bg-white text-slate-700">
                    <option value="technology">Teknologi</option>
                    <option value="design">Desain</option>
                    <option value="marine">Kelautan</option>
                    <option value="language">Bahasa</option>
                    <option value="science">Sains</option>
                    <option value="business">Bisnis</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-500">Tingkat</label>
                  <select value={courseForm.difficulty} onChange={(e) => setCourseForm({ ...courseForm, difficulty: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-400 bg-white text-slate-700">
                    <option value="beginner">Pemula</option>
                    <option value="intermediate">Menengah</option>
                    <option value="advanced">Mahir</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-500">Status</label>
                  <select value={courseForm.status} onChange={(e) => setCourseForm({ ...courseForm, status: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-400 bg-white text-slate-700">
                    <option value="draft">Draft</option>
                    <option value="published">Terbit</option>
                    <option value="archived">Arsip</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-500">Durasi (menit)</label>
                  <input type="number" min={0} value={courseForm.duration_minutes}
                    onChange={(e) => setCourseForm({ ...courseForm, duration_minutes: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-400 transition-all text-slate-700" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-500">Hadiah Mutiara</label>
                <input type="number" min={0} value={courseForm.pearls_reward}
                  onChange={(e) => setCourseForm({ ...courseForm, pearls_reward: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-400 transition-all text-slate-700" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-500">URL Thumbnail (opsional)</label>
                <input type="url" placeholder="https://..." value={courseForm.thumbnail_url ?? ""}
                  onChange={(e) => setCourseForm({ ...courseForm, thumbnail_url: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-400 transition-all text-slate-700 placeholder-slate-300" />
              </div>

              <div className="flex items-center justify-end gap-2.5 mt-2">
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

      {isExamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsExamModalOpen(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md z-10 flex flex-col gap-4 text-sm transform transition-all animate-scale-in">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-[#00172e]">
                {editingExamId ? "Edit Ujian" : "Buat Ujian Baru"}
              </h3>
              <button onClick={() => setIsExamModalOpen(false)} className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExam} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-500">Judul Ujian</label>
                <input type="text" required placeholder="Contoh: UTS Web Dev Dasar" value={examForm.title}
                  onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-400 transition-all text-slate-700 placeholder-slate-300" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-500">Kursus</label>
                <select value={examForm.course_id}
                  onChange={(e) => setExamForm({ ...examForm, course_id: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-400 bg-white text-slate-700">
                  <option value="">-- Pilih Kursus --</option>
                  {availableCourses.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-500">Durasi (detik)</label>
                  <input type="number" min={60} required value={examForm.time_limit_sec}
                    onChange={(e) => setExamForm({ ...examForm, time_limit_sec: parseInt(e.target.value) || 3600 })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-400 transition-all text-slate-700" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-500">Nilai Lulus (%)</label>
                  <input type="number" min={0} max={100} required value={examForm.passing_score}
                    onChange={(e) => setExamForm({ ...examForm, passing_score: parseInt(e.target.value) || 70 })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-400 transition-all text-slate-700" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-500">Maks. Percobaan</label>
                  <input type="number" min={1} required value={examForm.max_attempts}
                    onChange={(e) => setExamForm({ ...examForm, max_attempts: parseInt(e.target.value) || 3 })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-400 transition-all text-slate-700" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-500">Hadiah Mutiara</label>
                  <input type="number" min={0} value={examForm.pearls_reward}
                    onChange={(e) => setExamForm({ ...examForm, pearls_reward: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-400 transition-all text-slate-700" />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 mt-2">
                <button type="button" onClick={() => setIsExamModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 font-bold transition-all cursor-pointer">Batal</button>
                <button type="submit" disabled={examLoading}
                  className="px-5 py-2.5 rounded-xl bg-[#0073e6] hover:bg-[#0052cc] text-white font-bold transition-all shadow-md cursor-pointer disabled:opacity-60">
                  {examLoading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm z-10 flex flex-col gap-4 text-sm transform transition-all animate-scale-in text-center">
            <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-2 text-2xl font-bold">!</div>
            <div>
              <h3 className="text-base font-extrabold text-[#00172e]">Konfirmasi Hapus</h3>
              <p className="text-slate-400 mt-2 font-medium">
                Apakah Anda yakin ingin menghapus {deleteConfirm.type} ini? Tindakan ini tidak dapat dibatalkan.
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
