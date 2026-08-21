"use client";

import { useState, useCallback } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";

type ToastType = "success" | "error";

interface Toast {
  message: string;
  type: ToastType;
}

export function usePageToast() {
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const hideToast = useCallback(() => setToast(null), []);

  return { toast, showToast, hideToast };
}

export function PageToast({ toast, onClose }: { toast: { message: string; type: "success" | "error" } | null; onClose: () => void }) {
  if (!toast) return null;

  const isSuccess = toast.type === "success";

  return (
    <div
      className={`fixed bottom-6 right-6 z-[9999] flex items-start gap-3 rounded-2xl border shadow-2xl px-4 py-3.5 max-w-xs sm:max-w-sm
        transition-all duration-300 animate-fade-in
        ${isSuccess
          ? "bg-white border-emerald-100"
          : "bg-white border-red-100"
        }`}
    >
      <div className={`shrink-0 mt-0.5 rounded-full p-1 ${isSuccess ? "bg-emerald-100" : "bg-red-100"}`}>
        {isSuccess
          ? <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          : <XCircle className="w-4 h-4 text-red-500" />
        }
      </div>
      <p className={`flex-1 text-sm font-semibold leading-snug ${isSuccess ? "text-slate-700" : "text-red-600"}`}>
        {toast.message}
      </p>
      <button onClick={onClose} className="shrink-0 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
