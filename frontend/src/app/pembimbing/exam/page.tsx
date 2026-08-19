"use client";

import { useState } from "react";
import WelcomeBanner from "@/components/dashboardPembimbing/WelcomeBanner";
import ExamTable from "@/components/dashboardPembimbing/ExamTable";
import Modals from "@/components/dashboardPembimbing/Modals";
import { usePembimbing } from "@/components/dashboardPembimbing/PembimbingContext";
import { Exam } from "@/components/dashboardPembimbing/types";
import { pembimbingService, PembimbingCourseForm, PembimbingExamForm } from "@/services/pembimbingService";

const DEFAULT_COURSE_FORM: PembimbingCourseForm = {
  title: "",
  description: "",
  category: "technology",
  difficulty: "beginner",
  status: "draft",
  pearls_reward: 0,
  duration_minutes: 0,
  thumbnail_url: "",
};

const DEFAULT_EXAM_FORM: PembimbingExamForm = {
  course_id: "",
  title: "",
  time_limit_sec: 3600,
  passing_score: 70,
  max_attempts: 3,
  pearls_reward: 0,
};

export default function PembimbingExamPage() {
  const { courses, exams, setExams, showToast, searchGlobal } = usePembimbing();

  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [editingExamId, setEditingExamId] = useState<string | null>(null);
  const [examForm, setExamForm] = useState<PembimbingExamForm>({
    ...DEFAULT_EXAM_FORM,
    course_id: courses[0]?.id ?? "",
  });
  const [examLoading, setExamLoading] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState<{ type: "kursus" | "ujian"; id: string } | null>(null);

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
          setExams(exams.map((ex) =>
            ex.id === editingExamId
              ? { ...ex, ...examForm, course_title: course?.title ?? ex.course_title }
              : ex
          ));
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

      <div className="flex-1 min-h-0">
        <ExamTable
          exams={exams}
          onAddClick={handleOpenExamAdd}
          onEditClick={handleOpenExamEdit}
          onDeleteClick={handleDeleteExamClick}
          searchGlobal={searchGlobal}
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
        availableCourses={courses}
        deleteConfirm={deleteConfirm}
        setDeleteConfirm={setDeleteConfirm}
        handleConfirmDelete={handleConfirmDelete}
      />
    </>
  );
}
