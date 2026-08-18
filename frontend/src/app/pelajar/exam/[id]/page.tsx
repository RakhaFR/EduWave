import DashboardLayout from "@/components/dashboardPelajar/DashboardLayout";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PelajarExamPage({ params }: Props) {
  const { id } = await params;
  return (
    <DashboardLayout searchPlaceholder="Cari ujian...">
      <main className="px-4 md:px-8 py-4 md:py-6 max-w-3xl mx-auto text-white text-center">
        <h1 className="text-xl md:text-2xl font-extrabold mb-4">Ujian</h1>
        <div className="bg-white rounded-3xl p-8 shadow-lg text-[#00172e]">
          <p className="text-sm text-slate-500">Exam ID: {id} — Halaman ujian sedang dikembangkan.</p>
        </div>
      </main>
    </DashboardLayout>
  );
}
