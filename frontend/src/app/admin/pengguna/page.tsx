"use client";

import { useState } from "react";
import WelcomeBanner from "@/components/dashboardAdmin/WelcomeBanner";
import StatsGrid from "@/components/dashboardAdmin/StatsGrid";
import UserTable from "@/components/dashboardAdmin/UserTable";
import Modals from "@/components/dashboardAdmin/Modals";
import { useAdmin } from "@/components/dashboardAdmin/AdminContext";
import { UserType } from "@/components/dashboardAdmin/types";

export default function AdminUsersPage() {
  const { courses, users, setUsers, showToast, searchGlobal } = useAdmin();

  // Modals state
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    role: "Siswa",
    status: "Aktif",
  });

  const [deleteConfirm, setDeleteConfirm] = useState<{ type: "kursus" | "pengguna" | "kategori"; id: string } | null>(null);

  // Operations
  const handleOpenUserAdd = () => {
    setEditingUser(null);
    setUserForm({ name: "", email: "", role: "Siswa", status: "Aktif" });
    setIsUserModalOpen(true);
  };

  const handleOpenUserEdit = (user: UserType) => {
    setEditingUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    });
    setIsUserModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.name || !userForm.email) {
      showToast("Nama dan Email tidak boleh kosong!", "error");
      return;
    }

    if (editingUser) {
      setUsers(
        users.map((u) =>
          u.id === editingUser.id ? { ...u, ...userForm } : u
        )
      );
      showToast("Pengguna berhasil diperbarui!");
    } else {
      const newId = `U-0${users.length + 1}`;
      const newUser: UserType = {
        id: newId,
        ...userForm,
      };
      setUsers([...users, newUser]);
      showToast("Pengguna baru berhasil ditambahkan!");
    }
    setIsUserModalOpen(false);
  };

  const handleDeleteUserClick = (id: string) => {
    setDeleteConfirm({ type: "pengguna", id });
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirm) return;
    setUsers(users.filter((u) => u.id !== deleteConfirm.id));
    showToast("Pengguna berhasil dihapus!");
    setDeleteConfirm(null);
  };

  return (
    <>
      <WelcomeBanner />

      <StatsGrid totalCourses={courses.length} />

      <div className="flex-1 min-h-0">
        <UserTable
          users={users}
          onAddClick={handleOpenUserAdd}
          onEditClick={handleOpenUserEdit}
          onDeleteClick={handleDeleteUserClick}
          searchGlobal={searchGlobal}
        />
      </div>

      <Modals
        isCourseModalOpen={false}
        setIsCourseModalOpen={() => {}}
        editingCourse={null}
        courseForm={{ title: "", category: "Teknologi", instructor: "", students: 0, status: "Terbit" }}
        setCourseForm={() => {}}
        handleSaveCourse={() => {}}
        isUserModalOpen={isUserModalOpen}
        setIsUserModalOpen={setIsUserModalOpen}
        editingUser={editingUser}
        userForm={userForm}
        setUserForm={setUserForm}
        handleSaveUser={handleSaveUser}
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
