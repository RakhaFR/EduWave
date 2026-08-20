export function CardSkeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-200/80 ${className}`} />;
}

export function GridSkeleton({ count = 6 }: { count?: number }) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: count }, (_, index) => <CardSkeleton key={index} className="h-32" />)}</div>;
}

export function ListSkeleton({ count = 5 }: { count?: number }) {
  return <div className="space-y-3">{Array.from({ length: count }, (_, index) => <CardSkeleton key={index} className="h-16" />)}</div>;
}

export function DashboardContentSkeleton() {
  return <div className="animate-pulse space-y-6"><CardSkeleton className="h-28 w-full" /><div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <CardSkeleton key={index} className="h-24" />)}</div><GridSkeleton /></div>;
}
