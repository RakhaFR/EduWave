"use client";

import { useState } from "react";
import WelcomeBanner from "@/components/dashboardPembimbing/WelcomeBanner";
import ExamTable from "@/components/dashboardPembimbing/ExamTable";
import Modals from "@/components/dashboardPembimbing/Modals";
import { usePembimbing } from "@/components/dashboardPembimbing/PembimbingContext";
import { Exam } from "@/components/dashboardPembimbing/types";

export default function PembimbingExamPage() {
  const { courses, exams, setExams, showToast, searchGlobal } = usePembimbing();

  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [examForm, setExamForm] = useState({
    title: "",
    courseId: courses[0]?.id ?? "",
    courseTitle: courses[0]?.title ?? "",
    duration: 60,
    totalQuestions: 10,
    status: "Aktif",
    deadline: "",
  });

  const [deleteConfirm, setDeleteConfirm] = useState<{ type: "kursus" | "ujian"; id: string } | null>(null);

  const handleOpenExamAdd = () => {
    setEditingExam(null);
    setExamForm({
      title: "",
      courseId: courses[0]?.id ?? "",
      courseTitle: courses[0]?.title ?? "",
      duration: 60,
      totalQuestions: 10,
      status: "Aktif",
      deadline: "",
    });
    setIsExamModalOpen(true);
  };

  const handleOpenExamEdit = (exam: Exam) => {
    setEditingExam(exam);
    setExamForm({
      title: exam.title,
      courseId: exam.courseId,
      courseTitle: exam.courseTitle,
      duration: exam.duration,
      totalQuestions: exam.totalQuestions,
      status: exam.status,
      deadline: exam.deadline,
    });
    setIsExamModalOpen(true);
  };

  const handleSaveExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examForm.title || !examForm.deadline) {
      showToast("Judul dan deadline ujian tidak boleh kosong!", "error");
      return;
    }

    if (editingExam) {
      setExams(exams.map((ex) => (ex.id === editingExam.id ? { ...ex, ...examForm } : ex)));
      showToast("Ujian berhasil diperbarui!");
    } else {
      const newId = `EX-0${exams.length + 1}`;
      const newExam: Exam = { id: newId, ...examForm };
      setExams([...exams, newExam]);
      showToast("Ujian baru berhasil ditambahkan!");
    }
    setIsExamModalOpen(false);
  };

  const handleDeleteExamClick = (id: string) => {
    setDeleteConfirm({ type: "ujian", id });
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirm) return;
    setExams(exams.filter((ex) => ex.id !== deleteConfirm.id));
    showToast("Ujian berhasil dihapus!");
    setDeleteConfirm(null);
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
        editingCourse={null}
        courseForm={{ title: "", category: "Teknologi", students: 0, status: "Terbit", description: "" }}
        setCourseForm={() => {}}
        handleSaveCourse={() => {}}
        isExamModalOpen={isExamModalOpen}
        setIsExamModalOpen={setIsExamModalOpen}
        editingExam={editingExam}
        examForm={examForm}
        setExamForm={setExamForm}
        handleSaveExam={handleSaveExam}
        availableCourses={courses}
        deleteConfirm={deleteConfirm}
        setDeleteConfirm={setDeleteConfirm}
        handleConfirmDelete={handleConfirmDelete}
      />
    </>
  );
}
