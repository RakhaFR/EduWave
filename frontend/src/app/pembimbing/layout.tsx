import React from "react";
import { PembimbingProvider } from "@/components/dashboardPembimbing/PembimbingContext";
import DashboardLayout from "@/components/dashboardPembimbing/DashboardLayout";
import AuthGuard from "@/components/auth/AuthGuard";

export default function PembimbingLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={["instructor", "admin"]}>
      <PembimbingProvider>
        <DashboardLayout>{children}</DashboardLayout>
      </PembimbingProvider>
    </AuthGuard>
  );
}
