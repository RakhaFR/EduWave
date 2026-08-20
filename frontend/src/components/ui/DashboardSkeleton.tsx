export default function DashboardSkeleton() {
  return (
    <div className="flex min-h-screen animate-pulse bg-[#0073e6] p-4">
      <aside className="hidden lg:block w-72 shrink-0 p-4">
        <div className="h-full min-h-[calc(100vh-2rem)] rounded-3xl bg-white/40" />
      </aside>
      <div className="flex-1 min-w-0 space-y-4">
        <div className="h-14 rounded-2xl bg-white/30" />
        <main className="min-h-[calc(100vh-6rem)] rounded-[32px] bg-white p-6 md:p-8 space-y-6">
          <div className="h-8 w-1/3 rounded-xl bg-slate-200" />
          <div className="h-32 rounded-2xl bg-slate-100" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => <div key={item} className="h-28 rounded-2xl bg-slate-100" />)}
          </div>
        </main>
      </div>
    </div>
  );
}
