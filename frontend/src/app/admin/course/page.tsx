"use client";

import { useState } from "react";
import WelcomeBanner from "@/components/dashboardAdmin/WelcomeBanner";
import StatsGrid from "@/components/dashboardAdmin/StatsGrid";
import CourseTable from "@/components/dashboardAdmin/CourseTable";
import Modals from "@/components/dashboardAdmin/Modals";
import { useAdmin } from "@/components/dashboardAdmin/AdminContext";
import { Course } from "@/components/dashboardAdmin/types";
import { adminService, AdminCourseForm } from "@/services/adminService";

const DEFAULT_FORM: AdminCourseForm = {
  title: "",
  description: "",
  category: "technology",
  difficulty: "beginner",
  status: "draft",
  pearls_reward: 0,
  duration_minutes: 0,
  thumbnail_url: "",
};

export default function AdminCoursePage() {
  const { courses, coursesLoading, refreshCourses, showToast, searchGlobal } = useAdmin();

  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [courseForm, setCourseForm] = useState<AdminCourseForm>(DEFAULT_FORM);
  const [courseLoading, setCourseLoading] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState<{ type: "kursus" | "pengguna" | "kategori"; id: string } | null>(null);

  const handleOpenCourseAdd = () => {
    setEditingCourseId(null);
    setCourseForm(DEFAULT_FORM);
    setIsCourseModalOpen(true);
  };

  const handleOpenCourseEdit = (course: Course) => {
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
    if (!courseForm.title || !courseForm.description || !courseForm.category) {
      showToast("Judul, Deskripsi, dan Kategori tidak boleh kosong!", "error");
      return;
    }

    setCourseLoading(true);
    try {
      const payload = {
        ...courseForm,
        thumbnail_url: courseForm.thumbnail_url || undefined,
      };

      if (editingCourseId) {
        const res = await adminService.updateCourse(editingCourseId, payload);
        if (res.success) {
          showToast("Kursus berhasil diperbarui!");
        } else {
          showToast(res.error?.message ?? "Gagal memperbarui kursus.", "error");
        }
      } else {
        const res = await adminService.createCourse(payload);
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
      const res = await adminService.deleteCourse(deleteConfirm.id);
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

      <StatsGrid totalCourses={courses.length} />

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
        isUserModalOpen={false}
        setIsUserModalOpen={() => {}}
        editingUser={null}
        userForm={{ name: "", email: "", role: "Siswa", status: "Aktif" }}
        setUserForm={() => {}}
        handleSaveUser={() => {}}
        isCategoryModalOpen={false}
        setIsCategoryModalOpen={() => {}}
        editingCategory={null}
        categoryForm={{ name: "", description: "", icon: "📁" }}
        setCategoryForm={() => {}}
        handleSaveCategory={() => {}}
        deleteConfirm={deleteConfirm}
        setDeleteConfirm={setDeleteConfirm}
        handleConfirmDelete={handleConfirmDelete}
      />
    </>
  );
}
