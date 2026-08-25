"use client";

import WelcomeBanner from "@/components/dashboardAdmin/WelcomeBanner";
import StatsGrid from "@/components/dashboardAdmin/StatsGrid";
import RegistrationLog from "@/components/dashboardAdmin/RegistrationLog";
import { useAdmin } from "@/components/dashboardAdmin/AdminContext";

export default function AdminRegistrationPage() {
  const { registrations, courses, searchGlobal } = useAdmin();

  return (
    <>
      <WelcomeBanner />

      <StatsGrid totalCourses={courses.length} />

      <div className="flex-1 min-h-0">
        <RegistrationLog
          registrations={registrations}
          searchGlobal={searchGlobal}
        />
      </div>
    </>
  );
}
