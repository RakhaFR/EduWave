"use client";

import { useState, useEffect } from "react";
import WelcomeBanner from "@/components/dashboardAdmin/WelcomeBanner";
import StatsGrid from "@/components/dashboardAdmin/StatsGrid";
import ExamTable from "@/components/dashboardPembimbing/ExamTable";
import Modals from "@/components/dashboardPembimbing/Modals";
import { useAdmin } from "@/components/dashboardAdmin/AdminContext";
import { Exam } from "@/components/dashboardPembimbing/types";
import { adminService } from "@/services/adminService";
import { pembimbingService, PembimbingCourseForm, PembimbingExamForm } from "@/services/pembimbingService";

const DEFAULT_COURSE_FORM: PembimbingCourseForm = {
  title: "",
  description: "",
  category: "technology",
  difficulty: "beginner",
  status: "draft",
  pearls_reward: 0,
  duration_minutes: 5,
  thumbnail_url: "",
};

const DEFAULT_EXAM_FORM: PembimbingExamForm = {
  course_id: "",
  title: "",
  time_limit_sec: 3600,
  passing_score: 70,
  max_attempts: 3,
  pearls_reward: 0,
  lesson_id: "",
};

export default function AdminExamPage() {
  const { courses, showToast, searchGlobal } = useAdmin();

  const [exams, setExams] = useState<Exam[]>([]);
  const [loadingExams, setLoadingExams] = useState(true);

  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [editingExamId, setEditingExamId] = useState<string | null>(null);
  const [examForm, setExamForm] = useState<PembimbingExamForm>({
    ...DEFAULT_EXAM_FORM,
    course_id: courses[0]?.id ?? "",
  });
  const [examLoading, setExamLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: "kursus" | "ujian"; id: string } | null>(null);

  useEffect(() => {
    loadExams();
  }, []);

  async function loadExams() {
    setLoadingExams(true);
    try {
      const res = await adminService.getExams();
      if (res.success && Array.isArray(res.data)) {
        setExams(res.data);
      }
    } catch {
      showToast("Gagal memuat daftar ujian.", "error");
    } finally {
      setLoadingExams(false);
    }
  }

  const handleOpenExamAdd = () => {
    setEditingExamId(null);
    setExamForm({ ...DEFAULT_EXAM_FORM, course_id: courses[0]?.id ?? "" });
    setIsExamModalOpen(true);
  };

  const handleOpenExamEdit = (exam: Exam) => {
    setEditingExamId(exam.id);
    setExamForm({
      course_id: exam.course_id,
      title: exam.title,
      time_limit_sec: exam.time_limit_sec,
      passing_score: exam.passing_score,
      max_attempts: exam.max_attempts,
      pearls_reward: exam.pearls_reward,
      lesson_id: (exam as any).lesson_id || "",
    });
    setIsExamModalOpen(true);
  };

  const handleSaveExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examForm.title || !examForm.course_id) {
      showToast("Judul dan kursus ujian tidak boleh kosong!", "error");
      return;
    }

    setExamLoading(true);
    try {
      if (editingExamId) {
        const res = await pembimbingService.updateExam(editingExamId, examForm);
        if (res.success) {
          const course = courses.find((c) => c.id === examForm.course_id);
          setExams(
            exams.map((ex) =>
              ex.id === editingExamId
                ? { ...ex, ...examForm, course_title: course?.title ?? ex.course_title }
                : ex
            )
          );
          showToast("Ujian berhasil diperbarui!");
        } else {
          showToast(res.error?.message ?? "Gagal memperbarui ujian.", "error");
        }
      } else {
        const res = await pembimbingService.createExam(examForm);
        if (res.success && res.data) {
          const course = courses.find((c) => c.id === examForm.course_id);
          const newExam: Exam = {
            id: res.data.id,
            title: res.data.title,
            course_id: res.data.course_id,
            course_title: course?.title ?? "",
            time_limit_sec: res.data.time_limit_sec,
            passing_score: res.data.passing_score,
            max_attempts: res.data.max_attempts,
            pearls_reward: res.data.pearls_reward,
            mode: res.data.mode ?? "locked",
            requires_fullscreen: res.data.requires_fullscreen ?? true,
          };
          setExams([...exams, newExam]);
          showToast("Ujian baru berhasil ditambahkan!");
        } else {
          showToast(res.error?.message ?? "Gagal membuat ujian.", "error");
        }
      }
      setIsExamModalOpen(false);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      showToast(msg ?? "Terjadi kesalahan. Coba lagi.", "error");
    } finally {
      setExamLoading(false);
    }
  };

  const handleDeleteExamClick = (id: string) => {
    setDeleteConfirm({ type: "ujian", id });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      const res = await pembimbingService.deleteExam(deleteConfirm.id);
      if (res.success !== false) {
        setExams(exams.filter((ex) => ex.id !== deleteConfirm.id));
        showToast("Ujian berhasil dihapus!");
      } else {
        showToast(res.error?.message ?? "Gagal menghapus ujian.", "error");
      }
    } catch {
      showToast("Terjadi kesalahan saat menghapus ujian.", "error");
    } finally {
      setDeleteConfirm(null);
    }
  };

  return (
    <>
      <WelcomeBanner />

      <StatsGrid totalCourses={courses.length} />

      <div className="flex-1 min-h-0">
        <ExamTable
          exams={exams}
          onAddClick={handleOpenExamAdd}
          onEditClick={handleOpenExamEdit}
          onDeleteClick={handleDeleteExamClick}
          searchGlobal={searchGlobal}
          basePath="/admin"
        />
      </div>

      <Modals
        isCourseModalOpen={false}
        setIsCourseModalOpen={() => {}}
        editingCourseId={null}
        courseForm={DEFAULT_COURSE_FORM}
        setCourseForm={() => {}}
        handleSaveCourse={() => {}}
        isExamModalOpen={isExamModalOpen}
        setIsExamModalOpen={setIsExamModalOpen}
        editingExamId={editingExamId}
        examForm={examForm}
        setExamForm={setExamForm}
        handleSaveExam={handleSaveExam}
        examLoading={examLoading}
        availableCourses={courses as any}
        deleteConfirm={deleteConfirm}
        setDeleteConfirm={setDeleteConfirm}
        handleConfirmDelete={handleConfirmDelete}
      />
    </>
  );
}
