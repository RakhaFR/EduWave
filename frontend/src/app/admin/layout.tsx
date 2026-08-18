import React from "react";
import { AdminProvider } from "@/components/dashboardAdmin/AdminContext";
import DashboardLayout from "@/components/dashboardAdmin/DashboardLayout";
import AuthGuard from "@/components/auth/AuthGuard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={["admin"]}>
      <AdminProvider>
        <DashboardLayout>{children}</DashboardLayout>
      </AdminProvider>
    </AuthGuard>
  );
}
