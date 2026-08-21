import React from "react";
import type { Metadata } from "next";
import AuthGuard from "@/components/auth/AuthGuard";

export const metadata: Metadata = {
  title: "Dashboard Pelajar",
  description: "Dashboard pelajar EduWave",
};

export default function PelajarLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={["student"]}>
      {children}
    </AuthGuard>
  );
}
