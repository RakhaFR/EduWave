import React from "react";
import { AdminProvider } from "@/components/dashboardAdmin/AdminContext";
import DashboardLayout from "@/components/dashboardAdmin/DashboardLayout";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </AdminProvider>
  );
}
