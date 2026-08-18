"use client";

import WelcomeBanner from "@/components/dashboardAdmin/WelcomeBanner";
import RegistrationLog from "@/components/dashboardAdmin/RegistrationLog";
import { useAdmin } from "@/components/dashboardAdmin/AdminContext";

export default function AdminRegistrationPage() {
  const { registrations, searchGlobal } = useAdmin();

  return (
    <>
      <WelcomeBanner />

      <div className="flex-1 min-h-0">
        <RegistrationLog
          registrations={registrations}
          searchGlobal={searchGlobal}
        />
      </div>
    </>
  );
}
