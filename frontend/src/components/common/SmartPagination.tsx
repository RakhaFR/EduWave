import { ChevronLeft, ChevronRight } from "lucide-react";

interface SmartPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxVisible?: number;
}

export default function SmartPagination({
  currentPage,
  totalPages,
  onPageChange,
  maxVisible = 5,
}: SmartPaginationProps) {
  if (totalPages <= 1) return null;

  const getPageNumbers = (): (number | string)[] => {
    if (totalPages <= maxVisible + 2) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [];
    const halfVisible = Math.floor(maxVisible / 2);

    if (currentPage <= halfVisible + 1) {
      for (let i = 1; i <= maxVisible; i++) {
        pages.push(i);
      }
      pages.push("ellipsis-end");
      pages.push(totalPages);
    } else if (currentPage >= totalPages - halfVisible) {
      pages.push(1);
      pages.push("ellipsis-start");
      for (let i = totalPages - maxVisible + 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      pages.push("ellipsis-start");
      for (let i = currentPage - halfVisible + 1; i <= currentPage + halfVisible - 1; i++) {
        pages.push(i);
      }
      pages.push("ellipsis-end");
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className={`p-1.5 rounded-lg border text-slate-500 transition-all flex items-center justify-center ${
          currentPage === 1
            ? "opacity-40 cursor-not-allowed border-slate-100"
            : "hover:bg-slate-50 border-slate-200 active:scale-95 cursor-pointer"
        }`}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pageNumbers.map((page, idx) => {
        if (typeof page === "string") {
          return (
            <span
              key={`${page}-${idx}`}
              className="w-8 h-8 flex items-center justify-center text-slate-400 text-xs font-bold"
            >
              ...
            </span>
          );
        }

        return (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-8 h-8 rounded-lg border text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
              currentPage === page
                ? "bg-[#0073e6] border-[#0073e6] text-white shadow-sm shadow-blue-100"
                : "border-slate-200 text-slate-500 hover:bg-slate-50"
            }`}
          >
            {page}
          </button>
        );
      })}

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className={`p-1.5 rounded-lg border text-slate-500 transition-all flex items-center justify-center ${
          currentPage === totalPages
            ? "opacity-40 cursor-not-allowed border-slate-100"
            : "hover:bg-slate-50 border-slate-200 active:scale-95 cursor-pointer"
        }`}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
