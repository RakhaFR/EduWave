import React from "react";
import type { Metadata } from "next";
import { AdminProvider } from "@/components/dashboardAdmin/AdminContext";
import DashboardLayout from "@/components/dashboardAdmin/DashboardLayout";
import AuthGuard from "@/components/auth/AuthGuard";

export const metadata: Metadata = {
  title: "Dashboard Admin",
  description: "Dashboard administrasi EduWave",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={["admin"]}>
      <AdminProvider>
        <DashboardLayout>{children}</DashboardLayout>
      </AdminProvider>
    </AuthGuard>
  );
}
