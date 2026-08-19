"use client";

import { useState } from "react";
import WelcomeBanner from "@/components/dashboardAdmin/WelcomeBanner";
import StatsGrid from "@/components/dashboardAdmin/StatsGrid";
import CategoryManagement from "@/components/dashboardAdmin/CategoryManagement";
import Modals from "@/components/dashboardAdmin/Modals";
import { useAdmin } from "@/components/dashboardAdmin/AdminContext";
import { Category } from "@/components/dashboardAdmin/types";

export default function AdminCategoryPage() {
  const { courses, categories, setCategories, showToast, searchGlobal } = useAdmin();

  // Modals state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    icon: "📁",
  });

  const [deleteConfirm, setDeleteConfirm] = useState<{ type: "kursus" | "pengguna" | "kategori"; id: string } | null>(null);

  // Operations
  const handleOpenCategoryAdd = () => {
    setEditingCategory(null);
    setCategoryForm({ name: "", description: "", icon: "📁" });
    setIsCategoryModalOpen(true);
  };

  const handleOpenCategoryEdit = (cat: Category) => {
    setEditingCategory(cat);
    setCategoryForm({
      name: cat.name,
      description: cat.description,
      icon: cat.icon,
    });
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name || !categoryForm.description) {
      showToast("Nama dan Deskripsi Kategori tidak boleh kosong!", "error");
      return;
    }

    if (editingCategory) {
      setCategories(
        categories.map((c) =>
          c.id === editingCategory.id ? { ...c, ...categoryForm } : c
        )
      );
      showToast("Kategori berhasil diperbarui!");
    } else {
      const newId = `KAT-0${categories.length + 1}`;
      const newCat: Category = {
        id: newId,
        ...categoryForm,
        courseCount: 0,
      };
      setCategories([...categories, newCat]);
      showToast("Kategori baru berhasil ditambahkan!");
    }
    setIsCategoryModalOpen(false);
  };

  const handleDeleteCategoryClick = (id: string) => {
    setDeleteConfirm({ type: "kategori", id });
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirm) return;
    setCategories(categories.filter((c) => c.id !== deleteConfirm.id));
    showToast("Kategori berhasil dihapus!");
    setDeleteConfirm(null);
  };

  return (
    <>
      <WelcomeBanner />

      <StatsGrid totalCourses={courses.length} />

      <div className="flex-1 min-h-0">
        <CategoryManagement
          categories={categories}
          onAddClick={handleOpenCategoryAdd}
          onEditClick={handleOpenCategoryEdit}
          onDeleteClick={handleDeleteCategoryClick}
          searchGlobal={searchGlobal}
        />
      </div>

      <Modals
        isCourseModalOpen={false}
        setIsCourseModalOpen={() => {}}
        editingCourseId={null}
        courseForm={{ title: "", description: "", category: "Teknologi", difficulty: "beginner", status: "draft", pearls_reward: 0, duration_minutes: 0 }}
        setCourseForm={() => {}}
        handleSaveCourse={() => {}}
        isUserModalOpen={false}
        setIsUserModalOpen={() => {}}
        editingUser={null}
        userForm={{ name: "", email: "", role: "Siswa", status: "Aktif" }}
        setUserForm={() => {}}
        handleSaveUser={() => {}}
        isCategoryModalOpen={isCategoryModalOpen}
        setIsCategoryModalOpen={setIsCategoryModalOpen}
        editingCategory={editingCategory}
        categoryForm={categoryForm}
        setCategoryForm={setCategoryForm}
        handleSaveCategory={handleSaveCategory}
        deleteConfirm={deleteConfirm}
        setDeleteConfirm={setDeleteConfirm}
        handleConfirmDelete={handleConfirmDelete}
      />
    </>
  );
}
