"use client";

import { useState } from "react";
import WelcomeBanner from "@/components/dashboardPembimbing/WelcomeBanner";
import CourseTable from "@/components/dashboardPembimbing/CourseTable";
import Modals from "@/components/dashboardPembimbing/Modals";
import { usePembimbing } from "@/components/dashboardPembimbing/PembimbingContext";
import { PembimbingCourse } from "@/components/dashboardPembimbing/types";

export default function PembimbingCoursePage() {
  const { courses, setCourses, showToast, searchGlobal } = usePembimbing();

  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<PembimbingCourse | null>(null);
  const [courseForm, setCourseForm] = useState({
    title: "",
    category: "Teknologi",
    students: 0,
    status: "Terbit",
    description: "",
  });

  const [deleteConfirm, setDeleteConfirm] = useState<{ type: "kursus" | "ujian"; id: string } | null>(null);

  const handleOpenCourseAdd = () => {
    setEditingCourse(null);
    setCourseForm({ title: "", category: "Teknologi", students: 0, status: "Terbit", description: "" });
    setIsCourseModalOpen(true);
  };

  const handleOpenCourseEdit = (course: PembimbingCourse) => {
    setEditingCourse(course);
    setCourseForm({
      title: course.title,
      category: course.category,
      students: course.students,
      status: course.status,
      description: course.description,
    });
    setIsCourseModalOpen(true);
  };

  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseForm.title) {
      showToast("Judul kursus tidak boleh kosong!", "error");
      return;
    }

    if (editingCourse) {
      setCourses(courses.map((c) => (c.id === editingCourse.id ? { ...c, ...courseForm } : c)));
      showToast("Kursus berhasil diperbarui!");
    } else {
      const newId = `PC-0${courses.length + 1}`;
      const newCourse: PembimbingCourse = { id: newId, ...courseForm };
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
        isExamModalOpen={false}
        setIsExamModalOpen={() => {}}
        editingExam={null}
        examForm={{ title: "", courseId: "", courseTitle: "", duration: 60, totalQuestions: 10, status: "Aktif", deadline: "" }}
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
