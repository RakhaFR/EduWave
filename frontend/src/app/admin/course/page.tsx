"use client";

import { useState } from "react";
import WelcomeBanner from "@/components/dashboardAdmin/WelcomeBanner";
import StatsGrid from "@/components/dashboardAdmin/StatsGrid";
import CourseTable from "@/components/dashboardAdmin/CourseTable";
import Modals from "@/components/dashboardAdmin/Modals";
import { useAdmin } from "@/components/dashboardAdmin/AdminContext";
import { Course } from "@/components/dashboardAdmin/types";

export default function AdminCoursePage() {
  const { courses, setCourses, showToast, searchGlobal } = useAdmin();

  // Modals state
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseForm, setCourseForm] = useState({
    title: "",
    category: "Teknologi",
    instructor: "",
    students: 0,
    status: "Terbit",
  });

  const [deleteConfirm, setDeleteConfirm] = useState<{ type: "kursus" | "pengguna" | "kategori"; id: string } | null>(null);

  // Operations
  const handleOpenCourseAdd = () => {
    setEditingCourse(null);
    setCourseForm({ title: "", category: "Teknologi", instructor: "", students: 0, status: "Terbit" });
    setIsCourseModalOpen(true);
  };

  const handleOpenCourseEdit = (course: Course) => {
    setEditingCourse(course);
    setCourseForm({
      title: course.title,
      category: course.category,
      instructor: course.instructor,
      students: course.students,
      status: course.status,
    });
    setIsCourseModalOpen(true);
  };

  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseForm.title || !courseForm.instructor) {
      showToast("Judul dan Pengajar tidak boleh kosong!", "error");
      return;
    }

    if (editingCourse) {
      setCourses(
        courses.map((c) =>
          c.id === editingCourse.id ? { ...c, ...courseForm } : c
        )
      );
      showToast("Kursus berhasil diperbarui!");
    } else {
      const newId = `C-0${courses.length + 1}`;
      const newCourse: Course = {
        id: newId,
        ...courseForm,
      };
      setCourses([...courses, newCourse]);
      showToast("Kursus baru berhasil ditambahkan!");
    }
    setIsCourseModalOpen(false);
  };

  const handleDeleteCourseClick = (id: string) => {
    setDeleteConfirm({ type: "kursus", id });
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirm) return;
    setCourses(courses.filter((c) => c.id !== deleteConfirm.id));
    showToast("Kursus berhasil dihapus!");
    setDeleteConfirm(null);
  };

  return (
    <>
      <WelcomeBanner />

      <StatsGrid totalCourses={courses.length} />

      <div className="flex-1 min-h-0">
        <CourseTable
          courses={courses}
          onAddClick={handleOpenCourseAdd}
          onEditClick={handleOpenCourseEdit}
          onDeleteClick={handleDeleteCourseClick}
          searchGlobal={searchGlobal}
        />
      </div>

      <Modals
        isCourseModalOpen={isCourseModalOpen}
        setIsCourseModalOpen={setIsCourseModalOpen}
        editingCourse={editingCourse}
        courseForm={courseForm}
        setCourseForm={setCourseForm}
        handleSaveCourse={handleSaveCourse}
        // Dummy/Unused properties for other page modals
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
