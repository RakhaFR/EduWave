"use client";

import { useState } from "react";
import WelcomeBanner from "@/components/dashboardPembimbing/WelcomeBanner";
import CourseTable from "@/components/dashboardPembimbing/CourseTable";
import Modals from "@/components/dashboardPembimbing/Modals";
import { usePembimbing } from "@/components/dashboardPembimbing/PembimbingContext";
import { PembimbingCourse } from "@/components/dashboardPembimbing/types";
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

export default function PembimbingCoursePage() {
  const { courses, coursesLoading, refreshCourses, showToast, searchGlobal } = usePembimbing();

  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [courseForm, setCourseForm] = useState<PembimbingCourseForm>(DEFAULT_COURSE_FORM);
  const [courseLoading, setCourseLoading] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState<{ type: "kursus" | "ujian"; id: string } | null>(null);

  const handleOpenCourseAdd = () => {
    setEditingCourseId(null);
    setCourseForm(DEFAULT_COURSE_FORM);
    setIsCourseModalOpen(true);
  };

  const handleOpenCourseEdit = (course: PembimbingCourse) => {
    setEditingCourseId(course.id);
    setCourseForm({
      title: course.title,
      description: course.description,
      category: course.category,
      difficulty: course.difficulty,
      status: course.status,
      pearls_reward: course.pearls_reward,
      duration_minutes: course.duration_minutes,
      thumbnail_url: course.thumbnail_url ?? "",
    });
    setIsCourseModalOpen(true);
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseForm.title) {
      showToast("Judul kursus tidak boleh kosong!", "error");
      return;
    }

    setCourseLoading(true);
    try {
      const payload = { ...courseForm, thumbnail_url: courseForm.thumbnail_url || undefined };

      if (editingCourseId) {
        const res = await pembimbingService.updateCourse(editingCourseId, payload);
        if (res.success) {
          showToast("Kursus berhasil diperbarui!");
        } else {
          showToast(res.error?.message ?? "Gagal memperbarui kursus.", "error");
        }
      } else {
        const res = await pembimbingService.createCourse(payload);
        if (res.success) {
          showToast("Kursus baru berhasil ditambahkan!");
        } else {
          showToast(res.error?.message ?? "Gagal membuat kursus.", "error");
        }
      }
      setIsCourseModalOpen(false);
      refreshCourses();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      showToast(msg ?? "Terjadi kesalahan. Coba lagi.", "error");
    } finally {
      setCourseLoading(false);
    }
  };

  const handleDeleteCourseClick = (id: string) => {
    setDeleteConfirm({ type: "kursus", id });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      const res = await pembimbingService.deleteCourse(deleteConfirm.id);
      if (res.success !== false) {
        showToast("Kursus berhasil dihapus!");
        refreshCourses();
      } else {
        showToast(res.error?.message ?? "Gagal menghapus kursus.", "error");
      }
    } catch {
      showToast("Terjadi kesalahan saat menghapus kursus.", "error");
    } finally {
      setDeleteConfirm(null);
    }
  };

  return (
    <>
      <WelcomeBanner />

      <div className="flex-1 min-h-0">
        <CourseTable
          courses={courses}
          loading={coursesLoading}
          onAddClick={handleOpenCourseAdd}
          onEditClick={handleOpenCourseEdit}
          onDeleteClick={handleDeleteCourseClick}
          searchGlobal={searchGlobal}
        />
      </div>

      <Modals
        isCourseModalOpen={isCourseModalOpen}
        setIsCourseModalOpen={setIsCourseModalOpen}
        editingCourseId={editingCourseId}
        courseForm={courseForm}
        setCourseForm={setCourseForm}
        handleSaveCourse={handleSaveCourse}
        courseLoading={courseLoading}
        isExamModalOpen={false}
        setIsExamModalOpen={() => {}}
        editingExamId={null}
        examForm={DEFAULT_EXAM_FORM}
        setExamForm={() => {}}
        handleSaveExam={() => {}}
        availableCourses={courses}
        deleteConfirm={deleteConfirm}
        setDeleteConfirm={setDeleteConfirm}
        handleConfirmDelete={handleConfirmDelete}
      />
    </>
  );
}
