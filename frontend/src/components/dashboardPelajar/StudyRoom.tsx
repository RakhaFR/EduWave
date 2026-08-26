"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import {
  Users,
  Plus,
  MessageSquare,
  LogOut,
  X,
  Send,
  ArrowLeft,
  ArrowDown,
  Pencil,
  Trash2,
  Check,
  UserPlus,
  UserMinus,
  Copy,
  KeyRound,
} from "lucide-react";
import DashboardLayout from "@/components/dashboardPelajar/DashboardLayout";
import { courseService } from "@/services/courseService";
import { getEcho } from "@/lib/echo";
import { useCurrentUser } from "@/hooks/useCurrentUser";

type Participant = {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string | null;
};
type Room = {
  id: string;
  name: string;
  topic?: string;
  max_capacity: number;
  current_capacity: number;
  is_public: boolean;
  join_code?: string | null;
  status: string;
  host?: Participant;
  participants?: Participant[];
};
type UserSearchResult = Participant;
type Message = {
  id: string;
  content: string;
  sent_at: string;
  type?: string;
  user_id?: string;
  sender_id?: string;
  user?: {
    id?: string;
    user_id?: string;
    username?: string;
    avatar_url?: string | null;
  };
};

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
  const { user: currentUser } = useCurrentUser();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selected, setSelected] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [realtimeStatus, setRealtimeStatus] = useState<
    "connecting" | "connected" | "fallback"
  >("connecting");
  const [newMessageCount, setNewMessageCount] = useState(0);
  const [unreadByRoom, setUnreadByRoom] = useState<Record<string, number>>({});
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const shouldScrollMessagesRef = useRef(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoinByCode, setShowJoinByCode] = useState(false);
  const [form, setForm] = useState({
    name: "",
    topic: "",
    max_capacity: 20,
    is_public: true,
  });
  const [joinCode, setJoinCode] = useState("");
  const [joinRoomTarget, setJoinRoomTarget] = useState<Room | null>(null);
  const [inviteUsername, setInviteUsername] = useState("");
  const [inviteMatches, setInviteMatches] = useState<UserSearchResult[]>([]);
  const [inviteTarget, setInviteTarget] = useState<UserSearchResult | null>(
    null,
  );
  const [showInvite, setShowInvite] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [messageActionId, setMessageActionId] = useState<string | null>(null);
  const [deleteMessageId, setDeleteMessageId] = useState<string | null>(null);
  const unreadHydratedRef = useRef(false);

  const unreadStorageKey = currentUser?.id
    ? `study_room_unread_${currentUser.id}`
    : "study_room_unread";

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = JSON.parse(localStorage.getItem(unreadStorageKey) || "{}");
      if (stored && typeof stored === "object") setUnreadByRoom(stored);
    } catch {
      setUnreadByRoom({});
    } finally {
      unreadHydratedRef.current = true;
    }
  }, [unreadStorageKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (unreadHydratedRef.current) {
      localStorage.setItem(unreadStorageKey, JSON.stringify(unreadByRoom));
      window.dispatchEvent(new Event("study-room-unread-changed"));
    }
  }, [unreadByRoom, unreadStorageKey]);

  const loadRooms = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await courseService.getStudyRooms({ status: "active" });
      setRooms(response.data?.rooms ?? response.rooms ?? []);
    } catch (err: any) {
      setError(
        err?.response?.data?.error?.message || "Study Room belum dapat dimuat.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  // Listen to room channels while the forum list is open so new messages are visible before entry.
  useEffect(() => {
    if (selected || rooms.length === 0) return;
    const echo = getEcho();
    if (!echo) return;
    const subscriptions = rooms.map((room) => {
      const channelName = `study-room.${room.id}`;
      const channel = echo.private(channelName);
      channel.listen(".message", (event: any) => {
        const incoming = event.message ?? event;
        if (incoming?.id) {
          setUnreadByRoom((current) => ({
            ...current,
            [room.id]: (current[room.id] ?? 0) + 1,
          }));
        }
      });
      return { channel, channelName };
    });
    return () => {
      subscriptions.forEach(({ channel, channelName }) => {
        channel.stopListening(".message");
        echo.leave(channelName);
      });
    };
  }, [rooms, selected]);

  useEffect(() => {
    if (!selected || messages.length === 0) return;
    if (shouldScrollMessagesRef.current) {
      const scrollToBottom = () => {
        const container = messagesContainerRef.current;
        if (container) container.scrollTop = container.scrollHeight;
      };
      scrollToBottom();
      requestAnimationFrame(scrollToBottom);
      setNewMessageCount(0);
    }
  }, [messages, selected]);

  const isMessagesAtBottom = () => {
    const container = messagesContainerRef.current;
    if (!container) return true;
    return (
      container.scrollHeight - container.scrollTop - container.clientHeight < 80
    );
  };

  const scrollToLatestMessages = () => {
    shouldScrollMessagesRef.current = true;
    setNewMessageCount(0);
    const container = messagesContainerRef.current;
    if (container)
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  };

  useEffect(() => {
    if (!selected) return;
    const echo = getEcho();
    if (!echo) {
      setRealtimeStatus("fallback");
      return;
    }
    setRealtimeStatus("connecting");
    const channel = echo.private(`study-room.${selected.id}`);
    channel.listen(".message", (event: any) => {
      const incoming = event.message ?? event;
      if (incoming?.id) {
        const atBottom = isMessagesAtBottom();
        shouldScrollMessagesRef.current = atBottom;
        if (!atBottom) setNewMessageCount((count) => count + 1);
        setMessages((current) =>
          current.some((item) => item.id === incoming.id)
            ? current
            : [...current, incoming],
        );
      }
    });
    channel.listen(".message_updated", (event: any) => {
      const updated = event.message ?? event;
      if (updated?.id)
        setMessages((current) =>
          current.map((item) =>
            item.id === updated.id ? { ...item, ...updated } : item,
          ),
        );
    });
    channel.listen(".message_deleted", (event: any) => {
      if (event?.id)
        setMessages((current) =>
          current.filter((item) => item.id !== event.id),
        );
    });
    const pusher = (echo as any).connector?.pusher;
    const connection = pusher?.connection;
    const handleConnectionState = (states: { current: string }) => {
      setRealtimeStatus(
        states.current === "connected" ? "connected" : "connecting",
      );
    };
    const handleConnectionError = () => setRealtimeStatus("fallback");
    connection?.bind("state_change", handleConnectionState);
    connection?.bind("error", handleConnectionError);
    channel.listen(".room_closed", () => {
      setError("Study room telah ditutup oleh host.");
      setSelected(null);
      loadRooms();
    });
    channel.listen(".user_kicked", (event: any) => {
      const kickedUserId = event?.user?.id ?? event?.user_id;
      if (currentUser?.id && String(kickedUserId) === String(currentUser.id)) {
        setError("Kamu telah dikeluarkan dari study room oleh host.");
        setSelected(null);
        loadRooms();
      } else if (kickedUserId) {
        setSelected((room) =>
          room
            ? {
                ...room,
                participants: room.participants?.filter(
                  (participant) =>
                    String(participant.id) !== String(kickedUserId),
                ),
                current_capacity: Math.max(0, room.current_capacity - 1),
              }
            : room,
        );
      }
    });
    channel.listen(".user_joined", (event: any) => {
      const joined = event?.user;
      if (joined?.id)
        setSelected((room) =>
          room &&
          !room.participants?.some(
            (participant) => participant.id === joined.id,
          )
            ? {
                ...room,
                participants: [...(room.participants ?? []), joined],
                current_capacity: room.current_capacity + 1,
              }
            : room,
        );
    });
    channel.listen(".user_left", (event: any) => {
      const leftUserId = event?.user?.id ?? event?.user_id;
      if (leftUserId)
        setSelected((room) =>
          room
            ? {
                ...room,
                participants: room.participants?.filter(
                  (participant) =>
                    String(participant.id) !== String(leftUserId),
                ),
                current_capacity: Math.max(0, room.current_capacity - 1),
              }
            : room,
        );
    });
    return () => {
      channel.stopListening(".message");
      channel.stopListening(".message_updated");
      channel.stopListening(".message_deleted");
      channel.stopListening(".room_closed");
      channel.stopListening(".user_kicked");
      channel.stopListening(".user_joined");
      channel.stopListening(".user_left");
      connection?.unbind("state_change", handleConnectionState);
      connection?.unbind("error", handleConnectionError);
      echo.leave(`study-room.${selected.id}`);
    };
  }, [selected, currentUser?.id]);

  const openRoom = async (room: Room, privateCode = "", alreadyJoined = false) => {
    const storedCode =
      typeof window !== "undefined"
        ? localStorage.getItem(`study_room_code_${room.id}`) || ""
        : "";
    setBusy(true);
    setError("");
    try {
      try {
        if (!alreadyJoined) {
          const code = privateCode || room.join_code || storedCode || undefined;
          await courseService.joinStudyRoom(room.id, code);
          if (!room.is_public && code)
            localStorage.setItem(`study_room_code_${room.id}`, code);
        }
      } catch (joinError: any) {
        const code = joinError?.response?.data?.error?.code;
        if (code === "ALREADY_JOINED") {
          // A current participant can re-enter without submitting the private code again.
        } else if (
          code === "INVALID_JOIN_CODE" &&
          !privateCode &&
          !storedCode &&
          !room.join_code
        ) {
          setJoinRoomTarget(room);
          setJoinCode("");
          return;
        } else {
          throw joinError;
        }
      }
      const detail = await courseService.getStudyRoom(room.id);
      const current = detail.data?.room ?? detail.room ?? room;
      const history = await courseService.getStudyRoomMessages(room.id);
      setSelected(current);
      setJoinRoomTarget(null);
      setUnreadByRoom((unread) => {
        if (!(room.id in unread)) return unread;
        const next = { ...unread };
        delete next[room.id];
        return next;
      });
      shouldScrollMessagesRef.current = true;
      setNewMessageCount(0);
      const loadedMessages = history.data?.messages ?? history.messages ?? [];
      setMessages(
        [...loadedMessages].sort((first: Message, second: Message) => {
          const firstTime = new Date(first.sent_at).getTime();
          const secondTime = new Date(second.sent_at).getTime();
          return firstTime - secondTime;
        }),
      );
    } catch (err: any) {
      setError(
        err?.response?.data?.error?.message ||
          "Kamu tidak dapat bergabung ke room ini.",
      );
    } finally {
      setBusy(false);
    }
  };

  const createRoom = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.name.trim()) return;
    setBusy(true);
    setError("");
    try {
      const response = await courseService.createStudyRoom({
        ...form,
        name: form.name.trim(),
      });
      const room = response.data?.room ?? response.room;
      const createdRoom = room as Room | undefined;
      if (createdRoom?.join_code)
        localStorage.setItem(
          `study_room_code_${createdRoom.id}`,
          createdRoom.join_code,
        );
      setShowCreate(false);
      setForm({ name: "", topic: "", max_capacity: 20, is_public: true });
      await loadRooms();
      if (room) await openRoom(room);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || "Room gagal dibuat.");
    } finally {
      setBusy(false);
    }
  };

  const inviteParticipant = async (event: FormEvent) => {
    event.preventDefault();
    if (!selected || !inviteTarget) return;
    setBusy(true);
    setError("");
    try {
      const response = await courseService.inviteStudyRoomParticipant(
        selected.id,
        inviteTarget.id,
      );
      const invited = response.data?.user ?? response.user;
      if (invited)
        setSelected((room) =>
          room
            ? {
                ...room,
                participants: [...(room.participants ?? []), invited],
                current_capacity: room.current_capacity + 1,
              }
            : room,
        );
      setInviteUsername("");
      setInviteMatches([]);
      setInviteTarget(null);
      setShowInvite(false);
    } catch (err: any) {
      setError(
        err?.response?.data?.error?.message || "Participant gagal diundang.",
      );
    } finally {
      setBusy(false);
    }
  };

  const searchInviteUsers = async (value: string) => {
    setInviteUsername(value);
    setInviteTarget(null);
    if (value.trim().length < 2) {
      setInviteMatches([]);
      return;
    }
    try {
      const response = await courseService.searchStudyRoomUsers(value.trim());
      setInviteMatches(
        response.data?.users ?? response.users ?? response.data ?? [],
      );
    } catch {
      setInviteMatches([]);
    }
  };

  const kickParticipant = async (participant: Participant) => {
    if (
      !selected ||
      !currentUser?.id ||
      String(selected.host?.id) !== String(currentUser.id)
    )
      return;
    setBusy(true);
    setError("");
    try {
      await courseService.kickStudyRoomParticipant(selected.id, participant.id);
      setSelected((room) =>
        room
          ? {
              ...room,
              participants: room.participants?.filter(
                (item) => item.id !== participant.id,
              ),
              current_capacity: Math.max(0, room.current_capacity - 1),
            }
          : room,
      );
    } catch (err: any) {
      setError(
        err?.response?.data?.error?.message || "Participant gagal dikeluarkan.",
      );
    } finally {
      setBusy(false);
    }
  };

  const sendMessage = async (event: FormEvent) => {
    event.preventDefault();
    if (!selected || !message.trim()) return;
    try {
      const response = await courseService.sendStudyRoomMessage(
        selected.id,
        message.trim(),
      );
      const sent = response.data?.message ?? response.message;
      if (sent) {
        // The send response may omit the nested user object; enrich it locally so owner actions are available immediately.
        const sentWithOwner: Message = {
          ...sent,
          sent_at: sent.sent_at ?? new Date().toISOString(),
          user_id: sent.user_id ?? sent.sender_id ?? currentUser?.id,
          user:
            sent.user ??
            (currentUser
              ? {
                  id: currentUser.id,
                  username: currentUser.username,
                  avatar_url: currentUser.avatar_url,
                }
              : undefined),
        };
        shouldScrollMessagesRef.current = true;
        setNewMessageCount(0);
        setMessages((current) =>
          current.some((item) => item.id === sentWithOwner.id)
            ? current
            : [...current, sentWithOwner],
        );
      }
      setMessage("");
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || "Pesan gagal dikirim.");
    }
  };

  const isOwnMessage = (item: Message) => {
    if (!currentUser) return false;
    const normalize = (value: unknown) =>
      String(value ?? "")
        .trim()
        .toLowerCase();
    const currentId = normalize(currentUser.id);
    const messageUserId =
      item.user?.id ?? item.user?.user_id ?? item.user_id ?? item.sender_id;
    if (messageUserId !== undefined && normalize(messageUserId) === currentId)
      return true;
    return (
      normalize(item.user?.username) !== "" &&
      normalize(item.user?.username) === normalize(currentUser.username)
    );
  };

  const canEditMessage = (item: Message) => {
    const sentAt = new Date(item.sent_at).getTime();
    return (
      isOwnMessage(item) &&
      Number.isFinite(sentAt) &&
      Date.now() - sentAt <= 3 * 60 * 1000 &&
      Date.now() >= sentAt
    );
  };

  const startEditingMessage = (item: Message) => {
    if (!canEditMessage(item)) {
      setError("Pesan hanya dapat diedit dalam 3 menit setelah dikirim.");
      return;
    }
    setEditingMessageId(item.id);
    setEditingContent(item.content);
  };

  const cancelEditingMessage = () => {
    setEditingMessageId(null);
    setEditingContent("");
  };

  const updateMessage = async (event: FormEvent, messageId: string) => {
    event.preventDefault();
    const content = editingContent.trim();
    if (!selected || !content) return;
    setMessageActionId(messageId);
    try {
      const response = await courseService.updateStudyRoomMessage(
        selected.id,
        messageId,
        content,
      );
      const updated = response.data?.message ?? response.message;
      if (updated)
        setMessages((current) =>
          current.map((item) =>
            item.id === messageId ? { ...item, ...updated } : item,
          ),
        );
      cancelEditingMessage();
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || "Pesan gagal diubah.");
    } finally {
      setMessageActionId(null);
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!selected) return;
    setMessageActionId(messageId);
    try {
      await courseService.deleteStudyRoomMessage(selected.id, messageId);
      setMessages((current) => current.filter((item) => item.id !== messageId));
      setDeleteMessageId(null);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || "Pesan gagal dihapus.");
    } finally {
      setMessageActionId(null);
    }
  };

  const leaveRoom = async () => {
    if (!selected) return;
    setBusy(true);
    try {
      await courseService.leaveStudyRoom(selected.id);
      setSelected(null);
      setRealtimeStatus("connecting");
      await loadRooms();
    } catch (err: any) {
      setError(
        err?.response?.data?.error?.message || "Gagal keluar dari room.",
      );
    } finally {
      setBusy(false);
    }
  };

  const getStoredRoomCode = (room: Room) =>
    typeof window !== "undefined"
      ? localStorage.getItem(`study_room_code_${room.id}`) || ""
      : "";

  const copyJoinCode = async () => {
    if (!selected || !navigator.clipboard) return;
    const code = selected.join_code || getStoredRoomCode(selected);
    if (code) await navigator.clipboard.writeText(code);
  };

  const joinRoomByCode = async (event: FormEvent) => {
    event.preventDefault();
    const code = joinCode.trim();
    if (!code) return;
    setBusy(true);
    setError("");
    try {
      const response = await courseService.joinStudyRoomByCode(code);
      const roomId = response.data?.room_id ?? response.room_id;
      setShowJoinByCode(false);
      setJoinCode("");
      if (roomId) {
        const room = rooms.find((item) => String(item.id) === String(roomId));
        if (room) {
          await openRoom(room, "", true);
        } else {
          await loadRooms();
          const detail = await courseService.getStudyRoom(String(roomId));
          const refreshedRoom = detail.data?.room ?? detail.room;
          if (refreshedRoom) await openRoom(refreshedRoom, "", true);
        }
      }
    } catch (err: any) {
      const errorCode = err?.response?.data?.error?.code;
      const roomId = err?.response?.data?.data?.room_id ?? err?.response?.data?.room_id;
      if (errorCode === "ALREADY_JOINED" && roomId) {
        try {
          const detail = await courseService.getStudyRoom(String(roomId));
          const room = detail.data?.room ?? detail.room;
          if (room) {
            setShowJoinByCode(false);
            setJoinCode("");
            await openRoom(room, "", true);
            return;
          }
        } catch {
          // Fall through to the standard error message when the room cannot be opened.
        }
      }
      setError(
        errorCode === "INVALID_JOIN_CODE"
          ? "Kode join tidak valid."
          : errorCode === "ALREADY_JOINED"
            ? "Kamu sudah tergabung di room tersebut."
            : err?.response?.data?.error?.message || "Gagal bergabung ke room private.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <DashboardLayout searchPlaceholder="Cari study room...">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-4 md:px-8 md:py-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-white md:text-2xl">
              Study Forum
            </h1>
            <p className="text-sm text-white/70">
              Belajar dan berdiskusi bersama teman.
            </p>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <button
              onClick={() => setShowJoinByCode(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/70 bg-white/15 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/25"
            >
              <Users className="h-4 w-4" />
              Join Room
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-[#008be3]"
            >
              <Plus className="h-4 w-4" />
              Buat Study Room
            </button>
          </div>
        </div>
        {error && (
          <p className="rounded-xl bg-red-50 p-3 text-xs text-red-600">
            {error}
          </p>
        )}
        {selected ? (
          <section className="flex h-[calc(100vh-180px)] min-h-[420px] min-w-0 flex-col overflow-hidden rounded-3xl bg-white shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  onClick={() => setSelected(null)}
                  disabled={busy}
                  className="rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-[#008be3] disabled:opacity-50"
                  aria-label="Kembali ke daftar study room"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                  <h2 className="font-extrabold text-[#00172e]">
                    {selected.name}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {selected.topic || "Study room"} ·{" "}
                    {selected.current_capacity}/{selected.max_capacity} peserta
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!selected.is_public &&
                  String(selected.host?.id) === String(currentUser?.id) &&
                  (selected.join_code || getStoredRoomCode(selected)) && (
                    <div className="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2">
                      <KeyRound className="h-4 w-4 text-[#008be3]" />
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                          Kode Join
                        </p>
                        <p className="font-mono text-sm font-extrabold tracking-widest text-[#008be3]">
                          {selected.join_code || getStoredRoomCode(selected)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={copyJoinCode}
                        className="rounded-lg p-1.5 text-[#008be3] hover:bg-white"
                        aria-label="Salin kode join"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                <details className="relative">
                  <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100">
                    <Users className="h-3.5 w-3.5 text-[#008be3]" />
                    Peserta (
                    {selected.participants?.length ?? selected.current_capacity}
                    )
                  </summary>
                  <div className="absolute right-0 z-20 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-100 bg-white p-3 shadow-xl">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-xs font-extrabold text-[#00172e]">
                        Peserta Study Room
                      </p>
                      {String(selected.host?.id) ===
                        String(currentUser?.id) && (
                        <button
                          type="button"
                          onClick={() => setShowInvite(true)}
                          className="rounded-lg p-1.5 text-[#008be3] hover:bg-blue-50"
                          aria-label="Undang participant"
                        >
                          <UserPlus className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <div className="max-h-64 space-y-2 overflow-y-auto">
                      {selected.participants?.length ? (
                        selected.participants.map((participant) => (
                          <div
                            key={participant.id}
                            className="flex items-center gap-2.5 rounded-xl p-2 hover:bg-slate-50"
                          >
                            <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-[#008be3] text-center text-xs font-bold leading-8 text-white">
                              {participant.avatar_url ? (
                                <img
                                  src={participant.avatar_url}
                                  alt={participant.username || "Peserta"}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                (
                                  participant.username ||
                                  participant.full_name ||
                                  "P"
                                )
                                  .charAt(0)
                                  .toUpperCase()
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-bold text-[#00172e]">
                                {participant.username ||
                                  participant.full_name ||
                                  "Peserta"}
                              </p>
                              {participant.id === selected.host?.id && (
                                <p className="text-[10px] text-[#008be3]">
                                  Host
                                </p>
                              )}
                            </div>
                            {String(selected.host?.id) ===
                              String(currentUser?.id) &&
                              participant.id !== selected.host?.id && (
                                <button
                                  type="button"
                                  onClick={() => kickParticipant(participant)}
                                  disabled={busy}
                                  className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                                  aria-label={`Keluarkan ${participant.username || "participant"}`}
                                >
                                  <UserMinus className="h-3.5 w-3.5" />
                                </button>
                              )}
                          </div>
                        ))
                      ) : (
                        <p className="py-4 text-center text-xs text-slate-400">
                          Data peserta belum tersedia.
                        </p>
                      )}
                    </div>
                  </div>
                </details>
                <button
                  onClick={leaveRoom}
                  disabled={busy}
                  className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-2 text-xs font-bold text-red-500"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Keluar
                </button>
              </div>
            </div>
            <div className="sr-only" role="status" aria-live="polite">
              {realtimeStatus === "connected"
                ? "Realtime aktif"
                : realtimeStatus === "fallback"
                  ? "Realtime tidak tersedia."
                  : "Menghubungkan realtime..."}
            </div>
            <div
              ref={messagesContainerRef}
              onScroll={() => {
                shouldScrollMessagesRef.current = isMessagesAtBottom();
              }}
               className="relative min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain bg-slate-50 p-4"
            >
              {messages.length === 0 ? (
                <p className="m-auto text-sm text-slate-400">
                  Belum ada pesan.
                </p>
              ) : (
                 <div className="flex min-w-0 w-full flex-col gap-3">
                    {messages.map((item) => {
                      const own = isOwnMessage(item);
                      const messageUser = own
                        ? { id: currentUser?.id, username: currentUser?.username, avatar_url: currentUser?.avatar_url }
                        : item.user;
                      return (
                      <div key={item.id} className={`flex min-w-0 w-full items-end gap-2.5 ${own ? "justify-end" : "justify-start"}`}>
                        {!own && <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-[#008be3] text-center text-xs font-bold leading-9 text-white">
                          {messageUser?.avatar_url ? (
                            <img src={messageUser.avatar_url} alt={messageUser.username || "Peserta"} className="h-full w-full object-cover" />
                          ) : (
                            (messageUser?.username || "P").charAt(0).toUpperCase()
                          )}
                        </div>}
                        <div className={`min-w-0 w-fit max-w-[calc(100%-3rem)] overflow-hidden rounded-2xl p-3 shadow-sm ${own ? "bg-[#008be3]" : "bg-white"}`}>
                        {editingMessageId === item.id ? (
                          <form
                            onSubmit={(event) => updateMessage(event, item.id)}
                            className="min-w-52"
                          >
                            <input
                              value={editingContent}
                              onChange={(event) =>
                                setEditingContent(event.target.value)
                              }
                              maxLength={2000}
                              autoFocus
                              className="w-full rounded-lg border border-slate-200 px-2 py-1 text-sm text-slate-900 outline-none focus:border-[#008be3]"
                            />
                            <div className="mt-2 flex gap-2">
                              <button
                                type="submit"
                                disabled={messageActionId === item.id}
                                className="inline-flex items-center gap-1 rounded-lg bg-[#008be3] px-2 py-1 text-[10px] font-bold text-white"
                              >
                                <Check className="h-3 w-3" />
                                Simpan
                              </button>
                              <button
                                type="button"
                                onClick={cancelEditingMessage}
                                className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600"
                              >
                                Batal
                              </button>
                            </div>
                          </form>
                        ) : (
                          <>
                            <div className="flex items-start justify-between gap-3">
                               <p className={`text-[10px] font-bold ${own ? "text-white/80" : "text-[#008be3]"}`}>
                                 {own ? "Kamu" : item.user?.username || "Peserta"}
                               </p>
                              {isOwnMessage(item) && (
                                <div className="flex gap-1">
                                  {canEditMessage(item) && (
                                    <button
                                      type="button"
                                      onClick={() => startEditingMessage(item)}
                                      disabled={messageActionId === item.id}
                                      className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-[#008be3]"
                                      aria-label="Edit pesan"
                                    >
                                      <Pencil className="h-3 w-3" />
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => setDeleteMessageId(item.id)}
                                    disabled={messageActionId === item.id}
                                    className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-500"
                                    aria-label="Hapus pesan"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              )}
                            </div>
                              <p
                                className={`max-w-full break-words text-sm ${own ? "text-white" : "text-slate-700"}`}
                                style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
                              >
                              {item.content}
                            </p>
                             <p className={`mt-1 text-[10px] ${own ? "text-white/70" : "text-slate-400"}`}>
                               {formatMessageTime(item.sent_at)}
                             </p>
                           </>
                        )}
                       </div>
                       {own && <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-[#008be3] text-center text-xs font-bold leading-9 text-white">
                         {messageUser?.avatar_url ? (
                           <img src={messageUser.avatar_url} alt={messageUser.username || "Kamu"} className="h-full w-full object-cover" />
                         ) : (
                           (messageUser?.username || "K").charAt(0).toUpperCase()
                         )}
                       </div>}
                     </div>
                      );
                   })}
                  <div ref={messagesEndRef} aria-hidden="true" />
                </div>
              )}
              {newMessageCount > 0 && (
                <button
                  type="button"
                  onClick={scrollToLatestMessages}
                  className="sticky bottom-2 left-1/2 z-10 mx-auto flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-[#008be3] px-3 py-2 text-xs font-bold text-white shadow-lg hover:bg-[#007bc9]"
                  aria-label="Lihat pesan baru"
                >
                  <ArrowDown className="h-4 w-4" />
                  {newMessageCount === 1
                    ? "Pesan baru"
                    : `${newMessageCount} pesan baru`}
                </button>
              )}
            </div>
            <form
              onSubmit={sendMessage}
              className="flex gap-2 border-t border-slate-100 p-4"
            >
              <input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Tulis pesan..."
                maxLength={2000}
                className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#008be3]"
              />
              <button className="rounded-xl bg-[#008be3] px-4 text-white">
                <Send className="h-4 w-4" />
              </button>
            </form>
          </section>
        ) : (
          <section className="grid gap-4 md:grid-cols-2">
            {loading ? (
              <div className="text-sm text-white/70">Memuat room...</div>
            ) : rooms.length === 0 ? (
              <div className="rounded-3xl bg-white p-8 text-center text-sm text-slate-500 md:col-span-2">
                Belum ada study room aktif.
              </div>
            ) : (
              rooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => openRoom(room)}
                  disabled={busy}
                  className="rounded-3xl bg-white p-5 text-left shadow-lg transition hover:-translate-y-1 hover:shadow-xl disabled:opacity-60"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-extrabold text-[#00172e]">
                        {room.name}
                      </h2>
                      <p className="mt-1 text-xs text-slate-500">
                        {room.topic || "Belajar bersama"}
                      </p>
                    </div>
                     <span className="relative shrink-0">
                       <MessageSquare className="h-5 w-5 text-[#008be3]" />
                       {unreadByRoom[room.id] > 0 && (
                         <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-extrabold text-white">
                           {unreadByRoom[room.id] > 9 ? "9+" : unreadByRoom[room.id]}
                         </span>
                       )}
                     </span>
                  </div>
                  <p className="mt-5 flex items-center gap-1 text-xs font-semibold text-slate-400">
                    <Users className="h-4 w-4" />
                    {room.current_capacity}/{room.max_capacity} peserta
                  </p>
                </button>
              ))
            )}
          </section>
        )}
        {showJoinByCode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <form onSubmit={joinRoomByCode} className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="font-extrabold text-[#00172e]">Join Room</h2>
                  <p className="mt-1 text-xs text-slate-400">
                    Masukkan kode untuk bergabung ke room private.
                  </p>
                </div>
                <button type="button" onClick={() => { setShowJoinByCode(false); setJoinCode(""); }}>
                  <X className="h-5 w-5 text-slate-400" />
                </button>
              </div>
              <input required autoFocus value={joinCode} onChange={(event) => setJoinCode(event.target.value)} placeholder="Masukkan kode join" className="w-full rounded-xl border border-slate-200 px-3 py-3 text-center font-mono text-sm uppercase tracking-widest text-slate-900 outline-none focus:border-[#008be3]" />
              <button disabled={busy} className="mt-5 w-full rounded-xl bg-[#008be3] py-2.5 text-sm font-bold text-white disabled:opacity-50">Join Room</button>
            </form>
          </div>
        )}
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <form
              onSubmit={createRoom}
              className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
            >
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-extrabold text-[#00172e]">
                  Buat Study Room
                </h2>
                <button type="button" onClick={() => setShowCreate(false)}>
                  <X className="h-5 w-5 text-slate-400" />
                </button>
              </div>
              <div className="space-y-3">
                <input
                  required
                  maxLength={100}
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  placeholder="Nama room"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none"
                />
                <input
                  value={form.topic}
                  onChange={(event) =>
                    setForm({ ...form, topic: event.target.value })
                  }
                  placeholder="Topik (opsional)"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none"
                />
                <input
                  type="number"
                  min={2}
                  max={100}
                  value={form.max_capacity}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      max_capacity: Number(event.target.value),
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none"
                />
                <div className="flex gap-3">
                  <label
                    className={`flex flex-1 cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold ${form.is_public ? "border-[#008be3] bg-blue-50 text-[#008be3]" : "border-slate-200 text-slate-500"}`}
                  >
                    <input
                      type="radio"
                      name="room-visibility"
                      checked={form.is_public}
                      onChange={() => setForm({ ...form, is_public: true })}
                      className="accent-[#008be3]"
                    />
                    Publik
                  </label>
                  <label
                    className={`flex flex-1 cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold ${!form.is_public ? "border-[#008be3] bg-blue-50 text-[#008be3]" : "border-slate-200 text-slate-500"}`}
                  >
                    <input
                      type="radio"
                      name="room-visibility"
                      checked={!form.is_public}
                      onChange={() => setForm({ ...form, is_public: false })}
                      className="accent-[#008be3]"
                    />
                    Privat
                  </label>
                </div>
              </div>
              <button
                disabled={busy}
                className="mt-5 w-full rounded-xl bg-[#008be3] py-2.5 text-sm font-bold text-white disabled:opacity-50"
              >
                Buat Room
              </button>
            </form>
          </div>
        )}
        {joinRoomTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                openRoom(joinRoomTarget, joinCode.trim());
              }}
              className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
            >
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-extrabold text-[#00172e]">
                  Gabung Room Privat
                </h2>
                <button type="button" onClick={() => setJoinRoomTarget(null)}>
                  <X className="h-5 w-5 text-slate-400" />
                </button>
              </div>
              <p className="mb-3 text-sm text-slate-500">
                Masukkan kode untuk bergabung ke{" "}
                <strong>{joinRoomTarget.name}</strong>.
              </p>
              <input
                required
                autoFocus
                value={joinCode}
                onChange={(event) => setJoinCode(event.target.value)}
                placeholder="Kode join"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none"
              />
              <button
                disabled={busy}
                className="mt-5 w-full rounded-xl bg-[#008be3] py-2.5 text-sm font-bold text-white disabled:opacity-50"
              >
                Gabung
              </button>
            </form>
          </div>
        )}
        {showInvite && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <form
              onSubmit={inviteParticipant}
              className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
            >
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-extrabold text-[#00172e]">
                  Undang Participant
                </h2>
                <button type="button" onClick={() => setShowInvite(false)}>
                  <X className="h-5 w-5 text-slate-400" />
                </button>
              </div>
              <input
                required
                value={inviteUsername}
                onChange={(event) => searchInviteUsers(event.target.value)}
                placeholder="Cari berdasarkan username"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none"
              />
              {inviteMatches.length > 0 && (
                <div className="mt-2 max-h-44 space-y-1 overflow-y-auto rounded-xl border border-slate-100 p-1">
                  {inviteMatches.map((candidate) => (
                    <button
                      type="button"
                      key={candidate.id}
                      onClick={() => {
                        setInviteTarget(candidate);
                        setInviteUsername(candidate.username || "");
                        setInviteMatches([]);
                      }}
                      className={`flex w-full items-center gap-2 rounded-lg p-2 text-left hover:bg-blue-50 ${inviteTarget?.id === candidate.id ? "bg-blue-50" : ""}`}
                    >
                      <div className="h-8 w-8 rounded-full bg-[#008be3] text-center text-xs font-bold leading-8 text-white">
                        {(candidate.username || candidate.full_name || "P")
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                      <span className="text-sm font-semibold text-slate-700">
                        {candidate.username || candidate.full_name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
              <button
                disabled={busy || !inviteTarget}
                className="mt-5 w-full rounded-xl bg-[#008be3] py-2.5 text-sm font-bold text-white disabled:opacity-50"
              >
                Undang
              </button>
            </form>
          </div>
        )}
        {deleteMessageId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setDeleteMessageId(null)}
            />
            <div className="relative z-10 flex w-full max-w-sm flex-col gap-4 rounded-3xl bg-white p-6 text-center shadow-2xl">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl font-bold text-red-500">
                !
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#00172e]">
                  Konfirmasi Hapus
                </h3>
                <p className="mt-2 font-medium text-slate-400">
                  Apakah kamu yakin ingin menghapus pesan ini? Tindakan ini
                  tidak dapat dibatalkan.
                </p>
              </div>
              <div className="mt-4 flex items-center justify-center gap-3.5">
                <button
                  type="button"
                  onClick={() => setDeleteMessageId(null)}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 font-bold text-slate-500 transition-all hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() =>
                    deleteMessageId && deleteMessage(deleteMessageId)
                  }
                  disabled={messageActionId === deleteMessageId}
                  className="flex-1 rounded-xl bg-red-500 px-4 py-2.5 font-bold text-white shadow-md transition-all hover:bg-red-600 disabled:opacity-60"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </DashboardLayout>
  );
}
