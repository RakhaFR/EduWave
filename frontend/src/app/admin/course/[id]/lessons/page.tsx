"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Plus, Pencil, Trash2, Video, FileText, HelpCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { adminService } from "@/services/adminService";
import { courseService } from "@/services/courseService";
import { usePageToast, PageToast } from "@/components/ui/PageToast";

interface Lesson {
  id: string;
  title: string;
  type: string;
  content?: string;
  video_url?: string;
  duration_minutes: number;
  order: number;
  xp_reward: number;
  is_preview: boolean;
}

interface Course {
  id: string;
  title: string;
  category: string;
  status: string;
}

export default function AdminCourseLessonsPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast, showToast, hideToast } = usePageToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    type: "video",
    content: "",
    video_url: "",
    duration_minutes: 5,
    order: 1,
    xp_reward: 30,
    is_preview: false,
  });
  const [saveLoading, setSaveLoading] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [courseId]);

  async function loadData() {
    setLoading(true);
    try {
      const res = await courseService.getCourseById(courseId);
      if (res.success && res.data) {
        setCourse({
          id: res.data.id,
          title: res.data.title,
          category: res.data.category,
          status: res.data.status,
        });
        setLessons(res.data.lessons || []);
      }
    } catch {
      showToast("Gagal memuat data kursus.", "error");
    } finally {
      setLoading(false);
    }
  }

  function handleOpenAdd() {
    setEditingLesson(null);
    setFormData({
      title: "",
      type: "video",
      content: "",
      video_url: "",
      duration_minutes: 5,
      order: lessons.length + 1,
      xp_reward: 30,
      is_preview: false,
    });
    setIsModalOpen(true);
  }

  function handleOpenEdit(lesson: Lesson) {
    setEditingLesson(lesson);
    setFormData({
      title: lesson.title,
      type: lesson.type,
      content: lesson.content || "",
      video_url: lesson.video_url || "",
      duration_minutes: lesson.duration_minutes,
      order: lesson.order,
      xp_reward: lesson.xp_reward,
      is_preview: lesson.is_preview,
    });
    setIsModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast("Judul lesson tidak boleh kosong!", "error");
      return;
    }
    if (formData.type !== "quiz" && (!formData.duration_minutes || formData.duration_minutes < 1)) {
      showToast("Durasi lesson wajib diisi minimal 1 menit!", "error");
      return;
    }

    setSaveLoading(true);
    try {
      const isQuiz = formData.type === "quiz";
      const payload = {
        course_id: courseId,
        title: formData.title,
        type: formData.type,
        content: isQuiz ? undefined : formData.content || undefined,
        video_url: isQuiz ? undefined : formData.video_url || undefined,
        duration_minutes: isQuiz ? 1 : formData.duration_minutes,
        order: formData.order,
        xp_reward: isQuiz ? 0 : formData.xp_reward,
        is_preview: isQuiz ? false : formData.is_preview,
      };

      if (editingLesson) {
        await adminService.updateLesson(editingLesson.id, payload);
        showToast("Lesson berhasil diperbarui!");
      } else {
        await adminService.createLesson(payload);
        showToast("Lesson baru berhasil ditambahkan!");
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err?.response?.data?.error?.message || "Terjadi kesalahan.", "error");
    } finally {
      setSaveLoading(false);
    }
  }

  async function handleDelete(lessonId: string) {
    try {
      await adminService.deleteLesson(lessonId);
      showToast("Lesson berhasil dihapus!");
      setDeleteConfirm(null);
      loadData();
    } catch {
      showToast("Gagal menghapus lesson.", "error");
    }
  }

  return (
    <div className="min-h-screen font-sans flex flex-col lg:flex-row bg-[#0073e6] text-[#00172e] p-4">
      <div className="flex-1 flex flex-col bg-white rounded-[32px] shadow-2xl p-6 md:p-8">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => router.back()} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-extrabold text-[#00172e]">Manajemen Lesson</h1>
            {course && <p className="text-sm text-slate-500 mt-1">{course.title}</p>}
          </div>
          <button onClick={handleOpenAdd} className="flex items-center gap-2 px-4 py-2.5 bg-[#0073e6] text-white text-sm font-bold rounded-xl hover:bg-[#005bb5] transition-colors cursor-pointer">
            <Plus className="w-4 h-4" />
            Tambah Lesson
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#0073e6]" />
          </div>
        ) : lessons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <FileText className="w-12 h-12 mb-3" />
            <p className="text-sm">Belum ada lesson di kursus ini.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {lessons.map((lesson) => (
              <div key={lesson.id} className="flex items-center gap-4 p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-[#0073e6]/10 flex items-center justify-center shrink-0">
                  {lesson.type === "video" ? <Video className="w-5 h-5 text-[#0073e6]" /> : lesson.type === "quiz" ? <HelpCircle className="w-5 h-5 text-[#0073e6]" /> : <FileText className="w-5 h-5 text-[#0073e6]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm text-[#00172e]">{lesson.order}. {lesson.title}</p>
                    {lesson.is_preview && <Eye className="w-3.5 h-3.5 text-emerald-500" />}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{lesson.type} • {lesson.duration_minutes} menit • {lesson.xp_reward} XP</p>
                </div>
                <button onClick={() => handleOpenEdit(lesson)} className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => setDeleteConfirm(lesson.id)} className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors cursor-pointer">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSave} className="p-6">
              <h2 className="text-xl font-extrabold text-[#00172e] mb-4">{editingLesson ? "Edit Lesson" : "Tambah Lesson Baru"}</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Judul Lesson *</label>
                  <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Contoh: Pengenalan HTML Dasar" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-400 transition-all text-slate-700" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tipe Lesson *</label>
                    <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-400 transition-all text-slate-700 cursor-pointer">
                      <option value="video">Video</option>
                      <option value="text">Teks</option>
                      <option value="quiz">Kuis</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Urutan *</label>
                    <input type="number" required min="1" max="10000" value={formData.order} onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-400 transition-all text-slate-700" />
                  </div>
                </div>

                {formData.type === "video" && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">URL Video (Opsional)</label>
                    <input type="url" value={formData.video_url} onChange={(e) => setFormData({ ...formData, video_url: e.target.value })} placeholder="https://example.com/video.mp4" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-400 transition-all text-slate-700" />
                  </div>
                )}

                {formData.type === "text" && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">URL Foto / Gambar (Opsional)</label>
                    <input type="url" value={formData.video_url} onChange={(e) => setFormData({ ...formData, video_url: e.target.value })} placeholder="https://example.com/gambar.jpg (Opsional)" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-400 transition-all text-slate-700" />
                  </div>
                )}

                {formData.type !== "quiz" && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Konten Teks (Opsional)</label>
                      <textarea rows={4} value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} placeholder="Isi konten lesson..." className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-400 transition-all text-slate-700 resize-none" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Durasi (menit) *</label>
                        <input type="number" required min="1" max="10000" value={formData.duration_minutes} onChange={(e) => setFormData({ ...formData, duration_minutes: Math.max(1, parseInt(e.target.value) || 5) })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-400 transition-all text-slate-700" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">XP Reward *</label>
                        <input type="number" required min="0" max="1000000" value={formData.xp_reward} onChange={(e) => setFormData({ ...formData, xp_reward: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-400 transition-all text-slate-700" />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="is_preview" checked={formData.is_preview} onChange={(e) => setFormData({ ...formData, is_preview: e.target.checked })} className="w-4 h-4 cursor-pointer" />
                      <label htmlFor="is_preview" className="text-sm font-semibold text-slate-700 cursor-pointer">Preview (bisa diakses tanpa enroll)</label>
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                  Batal
                </button>
                <button type="submit" disabled={saveLoading} className="flex-1 px-4 py-2.5 bg-[#0073e6] text-white text-sm font-bold rounded-xl hover:bg-[#005bb5] transition-colors disabled:opacity-50 cursor-pointer">
                  {saveLoading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-[#00172e] mb-2">Hapus Lesson?</h3>
            <p className="text-sm text-slate-600 mb-6">Lesson yang dihapus tidak dapat dikembalikan.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                Batal
              </button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-2.5 bg-red-500 text-white text-sm font-bold rounded-xl hover:bg-red-600 transition-colors cursor-pointer">
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
