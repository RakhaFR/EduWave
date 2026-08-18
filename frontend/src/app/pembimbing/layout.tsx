import React from "react";
import { PembimbingProvider } from "@/components/dashboardPembimbing/PembimbingContext";
import DashboardLayout from "@/components/dashboardPembimbing/DashboardLayout";

export default function PembimbingLayout({ children }: { children: React.ReactNode }) {
  return (
    <PembimbingProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </PembimbingProvider>
  );
}
