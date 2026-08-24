"use client";

import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, MessageCircle, Search, UserPlus, UserMinus, Users, X, Send } from "lucide-react";
import DashboardLayout from "@/components/dashboardPelajar/DashboardLayout";
import { courseService } from "@/services/courseService";
import { getEcho } from "@/lib/echo";

 type Person = { id: string; username?: string; full_name?: string; avatar_url?: string | null; bio?: string; level?: number; xp?: number; last_active?: string; status?: string };
 type FriendRequest = Person;
 type Chat = { id: string; friend: Person; last_message?: { id: string; content: string; sender_id: string; sent_at: string } | null };
 type PrivateMessage = { id: string; conversation_id?: string; sender_id: string; content: string; sent_at: string; sender?: Person };

 function avatar(person?: Person) {
   return person?.avatar_url ? <img src={person.avatar_url} alt="" className="h-full w-full object-cover" /> : (person?.username || person?.full_name || "U").charAt(0).toUpperCase();
 }

 export default function FriendsComponent() {
   const [friends, setFriends] = useState<Person[]>([]);
   const [requests, setRequests] = useState<{ incoming: FriendRequest[]; outgoing: FriendRequest[] }>({ incoming: [], outgoing: [] });
   const [chats, setChats] = useState<Chat[]>([]);
   const [search, setSearch] = useState("");
   const [matches, setMatches] = useState<Person[]>([]);
   const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
   const [messages, setMessages] = useState<PrivateMessage[]>([]);
   const [draft, setDraft] = useState("");
   const [loading, setLoading] = useState(true);
   const [busy, setBusy] = useState(false);
   const [error, setError] = useState("");

   const loadData = async () => {
     setLoading(true); setError("");
     try {
       const [friendResponse, requestResponse, chatResponse] = await Promise.all([
         courseService.getFriends(), courseService.getFriendRequests(), courseService.getPrivateChats(),
       ]);
       setFriends(friendResponse.data?.friends ?? friendResponse.friends ?? []);
       setRequests(requestResponse.data ?? requestResponse);
       setChats(chatResponse.data?.conversations ?? chatResponse.conversations ?? []);
     } catch (err: any) { setError(err?.response?.data?.error?.message || "Data teman belum dapat dimuat."); }
     finally { setLoading(false); }
   };

   useEffect(() => { loadData(); }, []);

   const searchUsers = async (value: string) => {
     setSearch(value);
     if (value.trim().length < 2) { setMatches([]); return; }
     try {
       const response = await courseService.searchStudyRoomUsers(value.trim());
       setMatches(response.data?.users ?? response.users ?? []);
     } catch { setMatches([]); }
   };

   const follow = async (userId: string) => {
     setBusy(true); setError("");
     try { await courseService.followFriend(userId); setSearch(""); setMatches([]); await loadData(); }
     catch (err: any) { setError(err?.response?.data?.error?.message || "Gagal mengikuti user."); }
     finally { setBusy(false); }
   };

   const unfollow = async (userId: string) => {
     setBusy(true); setError("");
     try { await courseService.unfollowFriend(userId); await loadData(); }
     catch (err: any) { setError(err?.response?.data?.error?.message || "Gagal berhenti mengikuti user."); }
     finally { setBusy(false); }
   };

   const openChat = async (friend: Person) => {
     setBusy(true); setError("");
     try {
       const response = await courseService.startPrivateChat(friend.id);
       const conversation = response.data?.conversation ?? response.conversation;
       if (!conversation?.id) throw new Error("Conversation tidak ditemukan.");
       const history = await courseService.getPrivateChatMessages(conversation.id);
       setSelectedChat({ id: conversation.id, friend });
       setMessages(history.data?.messages ?? history.messages ?? []);
     } catch (err: any) { setError(err?.response?.data?.error?.message || "Chat hanya tersedia untuk mutual friend."); }
     finally { setBusy(false); }
   };

   useEffect(() => {
     if (!selectedChat) return;
     const echo = getEcho();
     if (!echo) return;
     const channelName = `private-chat.${selectedChat.id}`;
     const channel = echo.private(channelName);
     channel.listen(".message_sent", (event: PrivateMessage & { message?: PrivateMessage }) => {
       const incoming = event.message ?? event;
       if (incoming?.id) setMessages(current => current.some(item => item.id === incoming.id) ? current : [...current, incoming]);
     });
     return () => { channel.stopListening(".message_sent"); echo.leave(channelName); };
   }, [selectedChat]);

   const sendMessage = async (event: FormEvent) => {
     event.preventDefault();
     if (!selectedChat || !draft.trim()) return;
     try {
       const response = await courseService.sendPrivateChatMessage(selectedChat.id, draft.trim());
       const sent = response.data?.message ?? response.message;
       if (sent) setMessages(current => current.some(item => item.id === sent.id) ? current : [...current, sent]);
       setDraft("");
     } catch (err: any) { setError(err?.response?.data?.error?.message || "Pesan gagal dikirim."); }
   };

   return <DashboardLayout searchPlaceholder="Cari teman...">
     <main className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-4 md:px-8 md:py-6">
       <div><h1 className="text-2xl font-extrabold text-white">Friends</h1><p className="text-sm text-white/70">Temukan teman dan mulai percakapan privat.</p></div>
       {error && <p className="rounded-xl bg-red-50 p-3 text-xs text-red-600">{error}</p>}
       {selectedChat ? <section className="flex h-[calc(100vh-190px)] min-h-[420px] flex-col overflow-hidden rounded-3xl bg-white shadow-xl">
         <div className="flex items-center gap-3 border-b border-slate-100 p-4"><button onClick={() => setSelectedChat(null)} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"><ArrowLeft className="h-5 w-5" /></button><div className="h-10 w-10 overflow-hidden rounded-full bg-[#008be3] text-center font-bold leading-10 text-white">{avatar(selectedChat.friend)}</div><div><h2 className="font-extrabold text-[#00172e]">{selectedChat.friend.full_name || selectedChat.friend.username}</h2><p className="text-xs text-slate-400">@{selectedChat.friend.username}</p></div></div>
         <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4">{messages.length ? messages.map(item => <div key={item.id} className="max-w-[80%] rounded-2xl bg-white p-3 shadow-sm"><p className="break-words text-sm text-slate-700 [overflow-wrap:anywhere]">{item.content}</p><p className="mt-1 text-[10px] text-slate-400">{new Date(item.sent_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</p></div>) : <p className="text-center text-sm text-slate-400">Belum ada pesan.</p>}</div>
         <form onSubmit={sendMessage} className="flex gap-2 border-t border-slate-100 p-4"><input value={draft} onChange={e => setDraft(e.target.value)} maxLength={5000} placeholder="Tulis pesan..." className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#008be3]" /><button disabled={busy} className="rounded-xl bg-[#008be3] px-4 text-white"><Send className="h-4 w-4" /></button></form>
       </section> : <>
         <section className="rounded-3xl bg-white p-5 shadow-xl"><div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={e => searchUsers(e.target.value)} placeholder="Cari username atau nama..." className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-sm outline-none focus:border-[#008be3]" /></div>{matches.length > 0 && <div className="mt-2 space-y-1">{matches.map(person => <div key={person.id} className="flex items-center justify-between rounded-xl p-2 hover:bg-slate-50"><span className="text-sm font-semibold text-slate-700">{person.full_name || person.username}</span><button onClick={() => follow(person.id)} disabled={busy} className="rounded-lg bg-[#008be3] px-3 py-2 text-xs font-bold text-white"><UserPlus className="mr-1 inline h-3.5 w-3.5" />Follow</button></div>)}</div>}</section>
         <section className="grid gap-4 md:grid-cols-2">{loading ? <p className="text-sm text-white/70">Memuat teman...</p> : friends.length === 0 ? <div className="rounded-3xl bg-white p-8 text-center text-sm text-slate-500 md:col-span-2">Belum ada mutual friend.</div> : friends.map(friend => <div key={friend.id} className="rounded-3xl bg-white p-5 shadow-lg"><div className="flex items-center gap-3"><div className="h-11 w-11 overflow-hidden rounded-full bg-[#008be3] text-center font-bold leading-[44px] text-white">{avatar(friend)}</div><div className="min-w-0 flex-1"><h2 className="truncate font-extrabold text-[#00172e]">{friend.full_name || friend.username}</h2><p className="text-xs text-slate-400">@{friend.username}</p></div></div><div className="mt-4 flex gap-2"><button onClick={() => openChat(friend)} disabled={busy} className="flex-1 rounded-xl bg-[#008be3] py-2 text-xs font-bold text-white"><MessageCircle className="mr-1 inline h-4 w-4" />Chat</button><button onClick={() => unfollow(friend.id)} disabled={busy} className="rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-500"><UserMinus className="h-4 w-4" /></button></div></div>)}</section>
         {requests.incoming.length > 0 && <section className="rounded-3xl bg-white p-5 shadow-lg"><h2 className="mb-3 font-extrabold text-[#00172e]">Permintaan masuk</h2>{requests.incoming.map(person => <div key={person.id} className="flex items-center justify-between border-b border-slate-100 py-2"><span className="text-sm font-semibold text-slate-700">{person.full_name || person.username}</span><button onClick={() => follow(person.id)} disabled={busy} className="rounded-lg bg-[#008be3] px-3 py-2 text-xs font-bold text-white">Terima</button></div>)}</section>}
       </>}
     </main>
   </DashboardLayout>;
 }
