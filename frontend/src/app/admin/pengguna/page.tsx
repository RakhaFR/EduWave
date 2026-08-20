"use client";

import { useState } from "react";
import WelcomeBanner from "@/components/dashboardAdmin/WelcomeBanner";
import StatsGrid from "@/components/dashboardAdmin/StatsGrid";
import UserTable from "@/components/dashboardAdmin/UserTable";
import Modals from "@/components/dashboardAdmin/Modals";
import { useAdmin } from "@/components/dashboardAdmin/AdminContext";
import { adminService } from "@/services/adminService";
import { authService } from "@/services/authService";
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

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.name || !userForm.email) {
      showToast("Nama dan Email tidak boleh kosong!", "error");
      return;
    }

    const backendRole = userForm.role === "Admin" ? "admin" : userForm.role === "Pengajar" ? "instructor" : "student";

    if (editingUser) {
      try {
        await adminService.updateUserRole(editingUser.id, backendRole);
        
        // Save local edits persistent
        const storedEditsStr = localStorage.getItem("admin_edited_users");
        let storedEdits: Record<string, { name?: string; email?: string }> = {};
        if (storedEditsStr) {
          try { storedEdits = JSON.parse(storedEditsStr); } catch { storedEdits = {}; }
        }
        storedEdits[editingUser.id] = { name: userForm.name, email: userForm.email };
        localStorage.setItem("admin_edited_users", JSON.stringify(storedEdits));

        setUsers(
          users.map((u) =>
            u.id === editingUser.id
              ? {
                  ...u,
                  name: userForm.name,
                  email: userForm.email,
                  role: userForm.role,
                  status: userForm.status,
                }
              : u
          )
        );
        showToast("Pengguna berhasil diperbarui di database!");
      } catch {
        showToast("Gagal mengupdate role pengguna di server.", "error");
      }
    } else {
      try {
        const usernameGenerated = userForm.email.split("@")[0] + "_" + Math.floor(Math.random() * 1000);
        const res = await authService.register({
          username: usernameGenerated,
          email: userForm.email,
          password: "password123",
          password_confirmation: "password123",
          full_name: userForm.name,
          role: backendRole,
        });

        if (res.success && res.data?.user) {
          const newUser: UserType = {
            id: res.data.user.id,
            name: res.data.user.full_name || userForm.name,
            email: res.data.user.email || userForm.email,
            role: userForm.role,
            status: userForm.status,
          };
          setUsers([newUser, ...users]);
          showToast(`Pengguna baru ${userForm.name} berhasil dibuat! (Password default: password123)`);
        } else {
          showToast(res.error?.message || "Gagal membuat pengguna baru.", "error");
        }
      } catch (err: any) {
        showToast(err?.response?.data?.error?.message || "Gagal membuat pengguna baru.", "error");
      }
    }
    setIsUserModalOpen(false);
  };

  const handleDeleteUserClick = (id: string) => {
    setDeleteConfirm({ type: "pengguna", id });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await adminService.deleteUser(deleteConfirm.id);
      setUsers(users.filter((u) => u.id !== deleteConfirm.id));
      showToast("Pengguna berhasil dihapus!");
    } catch {
      showToast("Gagal menghapus pengguna (Admin tidak dapat dihapus).", "error");
    } finally {
      setDeleteConfirm(null);
    }
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
        editingCourseId={null}
        courseForm={{ title: "", description: "", category: "Teknologi", difficulty: "beginner", status: "draft", pearls_reward: 0, duration_minutes: 0 }}
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
