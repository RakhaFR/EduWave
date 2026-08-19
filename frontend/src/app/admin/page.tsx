"use client";

import WelcomeBanner from "@/components/dashboardAdmin/WelcomeBanner";
import DashboardOverview from "@/components/dashboardAdmin/DashboardOverview";
import { useAdmin } from "@/components/dashboardAdmin/AdminContext";

export default function AdminDashboardPage() {
  const { courses, coursesLoading, users, registrations, searchGlobal } = useAdmin();

  return (
    <>
      <WelcomeBanner />

      <div className="flex-1 min-h-0">
        <DashboardOverview
          courses={courses}
          coursesLoading={coursesLoading}
          users={users}
          registrations={registrations}
          searchGlobal={searchGlobal}
        />
      </div>
    </>
  );
}
