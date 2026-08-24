"use client";

import { FormEvent, useEffect, useState } from "react";
import { Users, Plus, MessageSquare, LogOut, X, Send, ArrowLeft } from "lucide-react";
import DashboardLayout from "@/components/dashboardPelajar/DashboardLayout";
import { courseService } from "@/services/courseService";
import { getEcho } from "@/lib/echo";

type Room = { id: string; name: string; topic?: string; max_capacity: number; current_capacity: number; is_public: boolean; status: string; host?: { username?: string; avatar_url?: string | null } };
type Message = { id: string; content: string; sent_at: string; user?: { username?: string; avatar_url?: string | null } };

function formatMessageTime(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export default function StudyRoomComponent() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selected, setSelected] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [realtimeStatus, setRealtimeStatus] = useState<"connecting" | "connected" | "fallback">("connecting");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", topic: "", max_capacity: 20 });

  const loadRooms = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await courseService.getStudyRooms({ status: "active", is_public: true });
      setRooms(response.data?.rooms ?? response.rooms ?? []);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || "Study Room belum dapat dimuat.");
    } finally { setLoading(false); }
  };

  useEffect(() => { loadRooms(); }, []);

  useEffect(() => {
    if (!selected) return;
    const echo = getEcho();
    if (!echo) {
      setRealtimeStatus("fallback");
      return;
    }
    setRealtimeStatus("connecting");
    const channel = echo.private(`study-room.${selected.id}`);
    const pusherChannel = channel as any;
    channel.listen(".message", (event: any) => {
      const incoming = event.message ?? event;
      if (incoming?.id) setMessages((current) => current.some((item) => item.id === incoming.id) ? current : [...current, incoming]);
    });
    const pusher = (echo as any).connector?.pusher;
    const connection = pusher?.connection;
    const handleConnectionState = (states: { current: string }) => {
      setRealtimeStatus(states.current === "connected" ? "connected" : "connecting");
    };
    const handleConnectionError = () => setRealtimeStatus("fallback");
    const handleSubscriptionSuccess = () => setRealtimeStatus("connected");
    const handleSubscriptionError = () => setRealtimeStatus("fallback");
    connection?.bind("state_change", handleConnectionState);
    connection?.bind("error", handleConnectionError);
    pusherChannel.bind("pusher:subscription_succeeded", handleSubscriptionSuccess);
    pusherChannel.bind("pusher:subscription_error", handleSubscriptionError);
    channel.listen(".room_closed", () => {
      setError("Study room telah ditutup oleh host.");
      setSelected(null);
      loadRooms();
    });
    return () => {
      channel.stopListening(".message");
      connection?.unbind("state_change", handleConnectionState);
      connection?.unbind("error", handleConnectionError);
      pusherChannel.unbind("pusher:subscription_succeeded", handleSubscriptionSuccess);
      pusherChannel.unbind("pusher:subscription_error", handleSubscriptionError);
      echo.leave(`study-room.${selected.id}`);
    };
  }, [selected]);

  const openRoom = async (room: Room) => {
    setBusy(true); setError("");
    try {
      try {
        await courseService.joinStudyRoom(room.id);
      } catch (joinError: any) {
        const code = joinError?.response?.data?.error?.code;
        if (code !== "ALREADY_JOINED") throw joinError;
      }
      const detail = await courseService.getStudyRoom(room.id);
      const current = detail.data?.room ?? detail.room ?? room;
      const history = await courseService.getStudyRoomMessages(room.id);
      setSelected(current);
      setMessages(history.data?.messages ?? history.messages ?? []);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || "Kamu tidak dapat bergabung ke room ini.");
    } finally { setBusy(false); }
  };

  const createRoom = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.name.trim()) return;
    setBusy(true); setError("");
    try {
      const response = await courseService.createStudyRoom({ ...form, name: form.name.trim() });
      const room = response.data?.room ?? response.room;
      setShowCreate(false); setForm({ name: "", topic: "", max_capacity: 20 });
      await loadRooms();
      if (room) await openRoom(room);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || "Room gagal dibuat.");
    } finally { setBusy(false); }
  };

  const sendMessage = async (event: FormEvent) => {
    event.preventDefault();
    if (!selected || !message.trim()) return;
    try {
      const response = await courseService.sendStudyRoomMessage(selected.id, message.trim());
      const sent = response.data?.message ?? response.message;
      if (sent) setMessages((current) => [...current, sent]);
      setMessage("");
    } catch (err: any) { setError(err?.response?.data?.error?.message || "Pesan gagal dikirim."); }
  };

  const leaveRoom = async () => {
    if (!selected) return;
    setBusy(true);
    try { await courseService.leaveStudyRoom(selected.id); setSelected(null); setRealtimeStatus("connecting"); await loadRooms(); }
    catch (err: any) { setError(err?.response?.data?.error?.message || "Gagal keluar dari room."); }
    finally { setBusy(false); }
  };

  return (
    <DashboardLayout searchPlaceholder="Cari study room...">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-4 md:px-8 md:py-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div><h1 className="text-xl font-extrabold text-white md:text-2xl">Study Forum</h1><p className="text-sm text-white/70">Belajar dan berdiskusi bersama teman.</p></div>
          <button onClick={() => setShowCreate(true)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-[#008be3]"><Plus className="h-4 w-4" />Buat Study Room</button>
        </div>
        {error && <p className="rounded-xl bg-red-50 p-3 text-xs text-red-600">{error}</p>}
        {selected ? (
          <section className="overflow-hidden rounded-3xl bg-white shadow-xl">
             <div className="flex items-center justify-between border-b border-slate-100 p-4"><div className="flex min-w-0 items-center gap-3"><button onClick={leaveRoom} disabled={busy} className="rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-[#008be3] disabled:opacity-50" aria-label="Keluar dari study room"><ArrowLeft className="h-5 w-5" /></button><div><h2 className="font-extrabold text-[#00172e]">{selected.name}</h2><p className="text-xs text-slate-400">{selected.topic || "Study room"} · {selected.current_capacity}/{selected.max_capacity} peserta</p></div></div><button onClick={leaveRoom} disabled={busy} className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-2 text-xs font-bold text-red-500"><LogOut className="h-3.5 w-3.5" />Keluar</button></div>
             <div className={`border-b px-4 py-2 text-xs ${realtimeStatus === "connected" ? "border-emerald-100 bg-emerald-50 text-emerald-700" : realtimeStatus === "fallback" ? "border-amber-100 bg-amber-50 text-amber-700" : "border-slate-100 bg-slate-50 text-slate-500"}`} role="status">{realtimeStatus === "connected" ? "Realtime aktif" : realtimeStatus === "fallback" ? "Realtime tidak tersedia. Pesan tetap dikirim melalui HTTP, tetapi pesan baru mungkin perlu dimuat ulang." : "Menghubungkan realtime..."}</div>
            <div className="flex min-h-80 flex-col gap-3 bg-slate-50 p-4">{messages.length === 0 ? <p className="m-auto text-sm text-slate-400">Belum ada pesan.</p> : messages.map((item) => <div key={item.id} className="flex items-start gap-2.5"><div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-[#008be3] text-center text-xs font-bold leading-9 text-white">{item.user?.avatar_url ? <img src={item.user.avatar_url} alt={item.user.username || "Peserta"} className="h-full w-full object-cover" /> : (item.user?.username || "P").charAt(0).toUpperCase()}</div><div className="max-w-[85%] rounded-2xl bg-white p-3 shadow-sm"><p className="text-[10px] font-bold text-[#008be3]">{item.user?.username || "Peserta"}</p><p className="text-sm text-slate-700">{item.content}</p><p className="mt-1 text-[10px] text-slate-400">{formatMessageTime(item.sent_at)}</p></div></div>)}</div>
            <form onSubmit={sendMessage} className="flex gap-2 border-t border-slate-100 p-4"><input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Tulis pesan..." maxLength={2000} className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#008be3]" /><button className="rounded-xl bg-[#008be3] px-4 text-white"><Send className="h-4 w-4" /></button></form>
          </section>
        ) : (
          <section className="grid gap-4 md:grid-cols-2">{loading ? <div className="text-sm text-white/70">Memuat room...</div> : rooms.length === 0 ? <div className="rounded-3xl bg-white p-8 text-center text-sm text-slate-500 md:col-span-2">Belum ada study room aktif.</div> : rooms.map((room) => <button key={room.id} onClick={() => openRoom(room)} disabled={busy} className="rounded-3xl bg-white p-5 text-left shadow-lg transition hover:-translate-y-1 hover:shadow-xl disabled:opacity-60"><div className="flex items-start justify-between gap-3"><div><h2 className="font-extrabold text-[#00172e]">{room.name}</h2><p className="mt-1 text-xs text-slate-500">{room.topic || "Belajar bersama"}</p></div><MessageSquare className="h-5 w-5 text-[#008be3]" /></div><p className="mt-5 flex items-center gap-1 text-xs font-semibold text-slate-400"><Users className="h-4 w-4" />{room.current_capacity}/{room.max_capacity} peserta</p></button>)}</section>
        )}
        {showCreate && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"><form onSubmit={createRoom} className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"><div className="mb-5 flex items-center justify-between"><h2 className="font-extrabold text-[#00172e]">Buat Study Room</h2><button type="button" onClick={() => setShowCreate(false)}><X className="h-5 w-5 text-slate-400" /></button></div><div className="space-y-3"><input required maxLength={100} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Nama room" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none" /><input value={form.topic} onChange={(event) => setForm({ ...form, topic: event.target.value })} placeholder="Topik (opsional)" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none" /><input type="number" min={2} max={100} value={form.max_capacity} onChange={(event) => setForm({ ...form, max_capacity: Number(event.target.value) })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none" /></div><button disabled={busy} className="mt-5 w-full rounded-xl bg-[#008be3] py-2.5 text-sm font-bold text-white disabled:opacity-50">Buat Room</button></form></div>}
      </main>
    </DashboardLayout>
  );
}
