import React from "react";
import AuthGuard from "@/components/auth/AuthGuard";

export default function PelajarLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={["student", "instructor", "admin"]}>
      {children}
    </AuthGuard>
  );
}
