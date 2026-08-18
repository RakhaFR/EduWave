"use client";

import WelcomeBanner from "@/components/dashboardPembimbing/WelcomeBanner";
import DashboardOverview from "@/components/dashboardPembimbing/DashboardOverview";
import { usePembimbing } from "@/components/dashboardPembimbing/PembimbingContext";

export default function PembimbingDashboardPage() {
  const { courses, exams } = usePembimbing();
  return (
    <>
      <WelcomeBanner />
      <div className="flex-1 min-h-0">
        <DashboardOverview courses={courses} exams={exams} />
      </div>
    </>
  );
}
