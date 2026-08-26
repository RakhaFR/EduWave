"use client";

import { FormEvent, useState } from "react";
import { Bot, Loader2, Send, Sparkles, X } from "lucide-react";
import { AiChatResponse, courseService } from "@/services/courseService";

type ChatItem = { role: "user" | "assistant"; content: string };

export default function AiChat({ courseId, lessonId }: { courseId?: string; lessonId?: string }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatItem[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sendMessage = async (event: FormEvent) => {
    event.preventDefault();
    const message = draft.trim();
    if (!message || loading) return;
    if (message.length > 4000) {
      setError("Pertanyaan maksimal 4.000 karakter.");
      return;
    }
    setError("");
    setDraft("");
    setMessages((current) => [...current, { role: "user", content: message }]);
    setLoading(true);
    try {
      const response = await courseService.sendAiChat({
        message,
        course_context_id: courseId,
        lesson_context_id: lessonId,
        conversation_id: conversationId,
      });
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || "AI tidak tersedia.");
      }
      const data: AiChatResponse = response.data;
      setConversationId(data.conversation_id || conversationId);
      setMessages((current) => [...current, { role: "assistant", content: data.message }]);
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { error?: { code?: string; message?: string } } } };
      const apiMessage = apiError.response?.data?.error?.message;
      setError(apiError.response?.data?.error?.code === "AI_SERVICE_UNAVAILABLE"
        ? "AI sedang tidak tersedia. Coba lagi nanti."
        : apiMessage || (err instanceof Error ? err.message : "AI tidak tersedia. Coba lagi nanti."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!open && (
        <button type="button" onClick={() => setOpen(true)} className="fixed bottom-6 right-5 z-30 flex items-center gap-2 rounded-full bg-[#008be3] px-4 py-3 text-xs font-extrabold text-white shadow-xl shadow-blue-900/20 hover:bg-[#0078c8]">
          <Sparkles className="h-4 w-4" /> Tanya AI
        </button>
      )}
      {open && (
        <section className="fixed bottom-5 right-5 z-40 flex h-[min(620px,calc(100vh-2rem))] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200">
          <header className="flex items-center justify-between bg-[#00172e] p-4 text-white">
            <div className="flex items-center gap-3"><div className="rounded-xl bg-[#008be3] p-2"><Bot className="h-5 w-5" /></div><div><p className="font-extrabold">Asisten AI EduWave</p><p className="text-[10px] text-white/60">Konteks lesson aktif</p></div></div>
            <button type="button" onClick={() => setOpen(false)} className="rounded-full p-1.5 text-white/60 hover:bg-white/10 hover:text-white" aria-label="Tutup AI Chat"><X className="h-4 w-4" /></button>
          </header>
          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4">
            {messages.length === 0 && <div className="rounded-2xl bg-white p-4 text-sm text-slate-500 shadow-sm"><p className="font-bold text-[#00172e]">Butuh bantuan memahami materi?</p><p className="mt-1 text-xs leading-relaxed">Tanyakan ringkasan, contoh, atau penjelasan dengan bahasa yang lebih sederhana.</p></div>}
            {messages.map((item, index) => <div key={`${item.role}-${index}`} className={`flex ${item.role === "user" ? "justify-end" : "justify-start"}`}><div className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-3 py-2.5 text-sm leading-relaxed ${item.role === "user" ? "bg-[#008be3] text-white" : "bg-white text-slate-700 shadow-sm"}`}>{item.content}</div></div>)}
            {loading && <div className="flex items-center gap-2 text-xs text-slate-400"><Loader2 className="h-4 w-4 animate-spin" /> AI sedang berpikir...</div>}
          </div>
          {error && <p className="border-t border-red-100 bg-red-50 px-4 py-2 text-xs text-red-600">{error}</p>}
          <form onSubmit={sendMessage} className="border-t border-slate-100 bg-white p-3">
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  if (draft.trim() && !loading) {
                    event.currentTarget.form?.requestSubmit();
                  }
                }
              }}
              maxLength={4000}
              rows={2}
              placeholder="Tanyakan sesuatu..."
              className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#008be3]"
            />
            <div className="mt-2 flex items-center justify-between"><span className="text-[10px] text-slate-400">{draft.length}/4000</span><button type="submit" disabled={!draft.trim() || loading} className="flex items-center gap-1.5 rounded-xl bg-[#008be3] px-4 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"><Send className="h-3.5 w-3.5" /> Kirim</button></div>
          </form>
        </section>
      )}
    </>
  );
}
