"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Plus, Pencil, Trash2, Loader2, HelpCircle, FileUp, FileText, Download, Eye, X } from "lucide-react";
import { adminService, ExamQuestion, ExamQuestionForm } from "@/services/adminService";
import { usePageToast, PageToast } from "@/components/ui/PageToast";

const DEFAULT_QUESTION_FORM: ExamQuestionForm = {
  question_text: "",
  type: "multiple_choice",
  options: ["", "", "", ""],
  correct_answer: "",
  explanation: "",
  points: 10,
  order: 1,
};

export default function AdminExamQuestionsPage() {
  const params = useParams();
  const router = useRouter();
  const examId = (params?.id as string) || "";

  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast, showToast, hideToast } = usePageToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<ExamQuestion | null>(null);
  const [formData, setFormData] = useState<ExamQuestionForm>(DEFAULT_QUESTION_FORM);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".pdf") && file.type !== "application/pdf") {
      showToast("File harus berformat PDF!", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast("Ukuran file maksimal 5 MB!", "error");
      return;
    }

    setImportLoading(true);
    try {
      const res = await adminService.importExamPdf(examId, file);
      if (res.success) {
        showToast(`Berhasil mengimpor ${res.data?.imported_count || "beberapa"} soal dari PDF!`);
        await loadQuestions();
      } else {
        showToast(res.error?.message || "Gagal mengimpor soal dari PDF.", "error");
      }
    } catch (err: any) {
      showToast(err?.response?.data?.error?.message || "Format PDF tidak sesuai template.", "error");
    } finally {
      setImportLoading(false);
      e.target.value = "";
    }
  };

  useEffect(() => {
    loadQuestions();
  }, [examId]);

  async function loadQuestions() {
    setLoading(true);
    try {
      const res = await adminService.getExamQuestions(examId);
      if (res.success && Array.isArray(res.data)) {
        setQuestions(res.data);
      } else {
        setQuestions([]);
      }
    } catch {
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }

  function handleOpenAdd() {
    setEditingQuestion(null);
    setFormData({
      ...DEFAULT_QUESTION_FORM,
      options: ["", "", "", ""],
      order: questions.length + 1,
    });
    setIsModalOpen(true);
  }

  function handleOpenEdit(q: ExamQuestion) {
    setEditingQuestion(q);
    const opts = Array.isArray(q.options) && q.options.length > 0 ? [...q.options] : ["", "", "", ""];
    setFormData({
      question_text: q.question_text,
      type: "multiple_choice",
      options: opts,
      correct_answer: q.correct_answer,
      explanation: q.explanation || "",
      points: q.points || 10,
      order: q.order || 1,
    });
    setIsModalOpen(true);
  }

  function handleOptionChange(index: number, val: string) {
    const nextOpts = [...(formData.options || ["", "", "", ""])];
    nextOpts[index] = val;
    setFormData({ ...formData, options: nextOpts });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.question_text.trim()) {
      showToast("Pertanyaan tidak boleh kosong!", "error");
      return;
    }
    const cleanOptions = (formData.options || []).map((o) => o.trim()).filter(Boolean);
    if (cleanOptions.length < 2) {
      showToast("Minimal 2 pilihan jawaban!", "error");
      return;
    }
    if (!formData.correct_answer.trim()) {
      showToast("Jawaban benar tidak boleh kosong!", "error");
      return;
    }

    setSaveLoading(true);
    try {
      const payload: ExamQuestionForm = {
        question_text: formData.question_text,
        type: "multiple_choice",
        options: cleanOptions,
        correct_answer: formData.correct_answer,
        explanation: formData.explanation || undefined,
        points: Number(formData.points) || 10,
        order: Number(formData.order) || 1,
      };

      if (editingQuestion) {
        const res = await adminService.updateExamQuestion(examId, editingQuestion.id, payload);
        if (res.success) {
          await loadQuestions();
          setIsModalOpen(false);
          showToast("Soal berhasil diperbarui!");
        } else {
          showToast("Gagal memperbarui soal.", "error");
        }
      } else {
        const res = await adminService.createExamQuestion(examId, payload);
        if (res.success) {
          await loadQuestions();
          setIsModalOpen(false);
          showToast("Soal baru berhasil ditambahkan!");
        } else {
          showToast("Gagal menambahkan soal.", "error");
        }
      }
    } catch {
      showToast("Terjadi kesalahan.", "error");
    } finally {
      setSaveLoading(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteConfirm) return;
    try {
      await adminService.deleteExamQuestion(examId, deleteConfirm);
      await loadQuestions();
      showToast("Soal berhasil dihapus!");
    } catch {
      showToast("Gagal menghapus soal.", "error");
    } finally {
      setDeleteConfirm(null);
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto flex flex-col gap-5 sm:gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-800 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#0073e6] shrink-0" />
              <span>Kelola Soal Ujian (Admin Management)</span>
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 font-mono mt-0.5 break-all">ID: {examId}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={() => setShowTemplateModal(true)}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer shadow-sm"
          >
            <FileText className="w-4 h-4 text-[#0073e6]" />
            <span>Format PDF</span>
          </button>

          <label className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-[#0073e6] text-xs font-bold transition-all cursor-pointer shadow-sm ${importLoading ? "opacity-50 cursor-not-allowed" : ""}`}>
            {importLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileUp className="w-4 h-4" />}
            <span>{importLoading ? "Mengimpor..." : "Import PDF"}</span>
            <input
              type="file"
              accept=".pdf,application/pdf"
              disabled={importLoading}
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-[#0073e6] hover:bg-[#0052cc] text-white text-xs font-bold shadow-md shadow-blue-200 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Soal</span>
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <Loader2 className="w-6 h-6 animate-spin text-[#0073e6]" />
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-slate-400 text-sm font-medium">Belum ada soal pada ujian ini.</p>
          <button
            onClick={handleOpenAdd}
            className="mt-3 text-xs font-bold text-[#0073e6] hover:underline cursor-pointer"
          >
            + Tambah Soal Pertama
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {questions.map((q, idx) => (
            <div
              key={q.id}
              className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-lg bg-blue-50 text-[#0073e6] font-bold text-xs flex items-center justify-center shrink-0">
                    {q.order || idx + 1}
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm sm:text-base">{q.question_text}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Poin: {q.points} | Tipe: Pilihan Ganda</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleOpenEdit(q)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-[#0073e6] hover:bg-blue-50 transition-colors cursor-pointer"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(q.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Options */}
              {Array.isArray(q.options) && q.options.length > 0 && (
                <div className="grid sm:grid-cols-2 gap-2 mt-1">
                  {q.options.map((optItem, oIdx) => {
                    let optKey = String.fromCharCode(65 + oIdx);
                    let optVal = "";
                    
                    if (typeof optItem === "string") {
                      optVal = optItem;
                    } else if (typeof optItem === "object" && optItem !== null) {
                      optKey = (optItem as any).key || optKey;
                      optVal = (optItem as any).value || (optItem as any).option_text || (optItem as any).text || "";
                    }

                    const isCorrectKey = q.correct_answer && q.correct_answer.trim().toUpperCase() === optKey.toUpperCase();
                    const isCorrectVal = q.correct_answer && optVal && q.correct_answer.trim().toLowerCase() === optVal.trim().toLowerCase();
                    const isCorrect = isCorrectKey || isCorrectVal || (typeof optItem === "object" && Boolean((optItem as any)?.is_correct));

                    return (
                      <div
                        key={oIdx}
                        className={`p-2.5 rounded-xl border text-xs font-medium ${
                          isCorrect
                            ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-bold"
                            : "bg-slate-50 border-slate-100 text-slate-600"
                        }`}
                      >
                        <span className="mr-2 font-mono text-slate-400">{optKey}.</span>
                        {optVal}
                        {isCorrect && <span className="ml-2 text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded">Jawaban Benar</span>}
                      </div>
                    );
                  })}
                </div>
              )}

              {q.explanation && (
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-600">
                  <span className="font-bold text-slate-700">Pembahasan:</span> {q.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white border border-slate-100 rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-slate-800 mb-4">
              {editingQuestion ? "Edit Soal Ujian" : "Tambah Soal Ujian"}
            </h2>

            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pertanyaan</label>
                <textarea
                  required
                  rows={3}
                  value={formData.question_text}
                  onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                  placeholder="Masukkan pertanyaan pilihan ganda..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none focus:border-[#0073e6]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pilihan Jawaban</label>
                <div className="flex flex-col gap-2">
                  {(formData.options || ["", "", "", ""]).map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-6 text-center text-xs font-mono font-bold text-slate-400">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        placeholder={`Pilihan ${String.fromCharCode(65 + idx)}`}
                        className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#0073e6]"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, correct_answer: opt })}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border cursor-pointer ${
                          formData.correct_answer === opt && opt !== ""
                            ? "bg-emerald-500 text-white border-emerald-500"
                            : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                        }`}
                      >
                        {formData.correct_answer === opt && opt !== "" ? "Kunci" : "Pilih Kunci"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kunci Jawaban Teks (Persis)</label>
                <input
                  type="text"
                  required
                  value={formData.correct_answer}
                  onChange={(e) => setFormData({ ...formData, correct_answer: e.target.value })}
                  placeholder="Kunci jawaban persis sama dengan salah satu opsi"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#0073e6]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pembahasan (Opsional)</label>
                <textarea
                  rows={2}
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                  placeholder="Penjelasan/pembahasan jawaban..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#0073e6]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Poin</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.points}
                    onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value, 10) || 10 })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#0073e6]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Urutan</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value, 10) || 1 })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#0073e6]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="px-4 py-2 rounded-xl bg-[#0073e6] hover:bg-[#0052cc] text-white text-xs font-bold transition-all shadow-md shadow-blue-200 cursor-pointer disabled:opacity-50"
                >
                  {saveLoading ? "Menyimpan..." : "Simpan Soal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Format PDF / Template */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowTemplateModal(false)} />
          <div className="relative bg-white border border-slate-100 rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-[#0073e6]">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-800">Panduan & Template Soal PDF</h2>
                  <p className="text-xs text-slate-400">Gunakan format teks berikut di dokumen PDF Anda.</p>
                </div>
              </div>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed select-all mb-4">
              {`1. Apa zona laut terdalam di bumi?
A. Zona Pelagis
B. Zona Mesopelagis
C. Zona Hadapelagis
D. Zona Abisal
Kunci: C
Pembahasan: Zona Hadapelagis adalah wilayah palung laut terdalam.
Poin: 15

2. Berapa persentase wilayah perairan laut di permukaan bumi?
A. 50 persen
B. 60 persen
C. 71 persen
D. 85 persen
Kunci: C
Pembahasan: Lautan mencakup sekitar 71 persen dari permukaan bumi.
Poin: 10`}
            </div>

            <div className="space-y-2 text-xs text-slate-600 mb-6 bg-blue-50/60 p-3.5 rounded-xl border border-blue-100">
              <p className="font-bold text-slate-800">Aturan Penulisan Dokumen:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-600">
                <li>Awali setiap nomor soal dengan angka (contoh: <code className="text-[#0073e6] font-mono font-bold">1.</code>, <code className="text-[#0073e6] font-mono font-bold">2.</code>).</li>
                <li>Pilihan jawaban menggunakan huruf abjad kapital <code className="text-[#0073e6] font-mono font-bold">A.</code>, <code className="text-[#0073e6] font-mono font-bold">B.</code>, <code className="text-[#0073e6] font-mono font-bold">C.</code>, <code className="text-[#0073e6] font-mono font-bold">D.</code>.</li>
                <li>Baris kunci jawaban diawali kata <code className="text-[#0073e6] font-mono font-bold">Kunci:</code> diikuti abjad jawaban (contoh: <code className="text-[#0073e6] font-mono font-bold">Kunci: C</code>).</li>
                <li>Baris pembahasan bersifat opsional, diawali <code className="text-[#0073e6] font-mono font-bold">Pembahasan:</code>.</li>
                <li>Baris poin bersifat opsional, diawali <code className="text-[#0073e6] font-mono font-bold">Poin:</code> (default: 10 poin).</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-2">
              <a
                href="/template-soal-ujian.pdf"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-slate-500" />
                <span>Buka PDF Contoh</span>
              </a>
              <a
                href="/template-soal-ujian.pdf"
                download="template-soal-ujian.pdf"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0073e6] hover:bg-[#0052cc] text-white text-xs font-bold transition-all shadow-md shadow-blue-200 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Template PDF</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white border border-slate-100 rounded-2xl shadow-xl p-6 w-full max-w-sm text-center">
            <h3 className="text-sm font-bold text-slate-800 mb-2">Hapus Soal Ujian?</h3>
            <p className="text-xs text-slate-500 mb-4">Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold cursor-pointer"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
      <PageToast toast={toast} onClose={hideToast} />
    </div>
  );
}