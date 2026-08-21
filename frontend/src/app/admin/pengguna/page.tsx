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
  const { courses, users, setUsers, showToast, searchGlobal, refreshCourses } = useAdmin();

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
        const isActive = userForm.status === "Aktif";
        await adminService.updateUser(editingUser.id, {
          full_name: userForm.name,
          email: userForm.email,
          is_active: isActive,
        });
        const previousRole = editingUser.role === "Admin" ? "admin" : editingUser.role === "Pengajar" ? "instructor" : "student";
        let roleResponse = null;
        if (previousRole !== backendRole) {
          roleResponse = await adminService.updateUserRole(editingUser.id, backendRole);
        }

        // Sync state lokal
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
        const gamificationAction = roleResponse?.data?.gamification_action;
        const gamification = backendRole === "student" ? await adminService.getUserGamification(editingUser.id).catch(() => null) : null;
        const actionMessage = gamificationAction === "destroyed"
          ? " Data gamifikasi lama telah dibersihkan."
          : gamificationAction === "initialized"
          ? ` Data gamifikasi baru telah dibuat${gamification?.data ? ` (${gamification.data.xp} XP, ${gamification.data.pearls} Pearls).` : "."}`
          : "";
        showToast(`Pengguna berhasil diperbarui di database server!${actionMessage}`);
        refreshCourses();
      } catch (err: any) {
        showToast(err?.response?.data?.error?.message || "Gagal memperbarui pengguna di server.", "error");
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
