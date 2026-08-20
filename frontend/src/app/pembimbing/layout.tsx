import React from "react";
import type { Metadata } from "next";
import { PembimbingProvider } from "@/components/dashboardPembimbing/PembimbingContext";
import DashboardLayout from "@/components/dashboardPembimbing/DashboardLayout";
import AuthGuard from "@/components/auth/AuthGuard";

export const metadata: Metadata = {
  title: "Dashboard Pembimbing",
  description: "Dashboard pembimbing EduWave",
};

export default function PembimbingLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={["instructor", "admin"]}>
      <PembimbingProvider>
        <DashboardLayout>{children}</DashboardLayout>
      </PembimbingProvider>
    </AuthGuard>
  );
}
