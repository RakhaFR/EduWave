"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  MessageCircle,
  Search,
  UserPlus,
  UserMinus,
  Users,
  X,
  Send,
  Smile,
  ArrowDown,
} from "lucide-react";
import DashboardLayout from "@/components/dashboardPelajar/DashboardLayout";
import { courseService } from "@/services/courseService";
import { getEcho } from "@/lib/echo";
import { useCurrentUser } from "@/hooks/useCurrentUser";

type Person = {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string | null;
  bio?: string;
  level?: number;
  xp?: number;
  last_active?: string;
  status?: string;
};
type FriendRequest = Person;
type Chat = {
  id: string;
  friend: Person;
  last_message?: {
    id: string;
    content: string;
    sender_id: string;
    sent_at: string;
  } | null;
};
type PrivateMessage = {
  id: string;
  conversation_id?: string;
  sender_id: string;
  content: string;
  sent_at: string;
  sender?: Person;
};

function avatar(person?: Person) {
  return person?.avatar_url ? (
    <img
      src={person.avatar_url}
      alt=""
      className="h-full w-full object-cover"
    />
  ) : (
    (person?.username || person?.full_name || "U").charAt(0).toUpperCase()
  );
}

export default function FriendsComponent() {
  const [friends, setFriends] = useState<Person[]>([]);
  const [requests, setRequests] = useState<{
    incoming: FriendRequest[];
    outgoing: FriendRequest[];
  }>({ incoming: [], outgoing: [] });
  const [chats, setChats] = useState<Chat[]>([]);
  const [search, setSearch] = useState("");
  const [matches, setMatches] = useState<Person[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<Person[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<PrivateMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [chatUnread, setChatUnread] = useState<Record<string, number>>({});
  const [newMessageCount, setNewMessageCount] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { user: currentUser } = useCurrentUser();
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const shouldScrollMessagesRef = useRef(true);
  const emojiOptions = [
    "😀",
    "😂",
    "😍",
    "😊",
    "😎",
    "😭",
    "😡",
    "👍",
    "👏",
    "🙏",
    "🎉",
    "❤️",
    "🔥",
    "✨",
    "💡",
    "📚",
  ];

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [friendResponse, requestResponse, chatResponse] = await Promise.all(
        [
          courseService.getFriends(),
          courseService.getFriendRequests(),
          courseService.getPrivateChats(),
        ],
      );
      setFriends(friendResponse.data?.friends ?? friendResponse.friends ?? []);
      setRequests(requestResponse.data ?? requestResponse);
      setChats(
        chatResponse.data?.conversations ?? chatResponse.conversations ?? [],
      );
      const knownIds = new Set([
        ...(friendResponse.data?.friends ?? friendResponse.friends ?? []).map(
          (person: Person) => person.id,
        ),
        ...(
          requestResponse.data?.incoming ??
          requestResponse.incoming ??
          []
        ).map((person: Person) => person.id),
        ...(
          requestResponse.data?.outgoing ??
          requestResponse.outgoing ??
          []
        ).map((person: Person) => person.id),
        currentUser?.id,
      ]);
      const candidatesResponse = await courseService.searchStudyRoomUsers("");
      const candidates =
        candidatesResponse.data?.users ?? candidatesResponse.users ?? [];
      setSuggestedUsers(
        candidates
          .filter((person: Person) => !knownIds.has(person.id))
          .slice(0, 5),
      );
    } catch (err: any) {
      setError(
        err?.response?.data?.error?.message || "Data teman belum dapat dimuat.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const readUnread = () => {
      const userId = currentUser?.id;
      if (!userId) return;
      try {
        const stored = JSON.parse(
          localStorage.getItem(`private_chat_unread_${userId}`) || "{}",
        );
        setChatUnread(stored && typeof stored === "object" ? stored : {});
      } catch {
        setChatUnread({});
      }
    };
    readUnread();
    window.addEventListener("private-chat-unread-changed", readUnread);
    window.addEventListener("storage", readUnread);
    return () => {
      window.removeEventListener("private-chat-unread-changed", readUnread);
      window.removeEventListener("storage", readUnread);
    };
  }, [currentUser?.id]);

  const searchUsers = async (value: string) => {
    setSearch(value);
    if (value.trim().length < 2) {
      setMatches([]);
      return;
    }
    try {
      const response = await courseService.searchStudyRoomUsers(value.trim());
      setMatches(response.data?.users ?? response.users ?? []);
    } catch {
      setMatches([]);
    }
  };

  const isOwnMessage = (item: PrivateMessage) =>
    String(item.sender_id) === String(currentUser?.id);

  const follow = async (userId: string) => {
    setBusy(true);
    setError("");
    try {
      await courseService.followFriend(userId);
      setSearch("");
      setMatches([]);
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || "Gagal mengikuti user.");
    } finally {
      setBusy(false);
    }
  };

  const unfollow = async (userId: string) => {
    setBusy(true);
    setError("");
    try {
      await courseService.unfollowFriend(userId);
      await loadData();
    } catch (err: any) {
      setError(
        err?.response?.data?.error?.message || "Gagal berhenti mengikuti user.",
      );
    } finally {
      setBusy(false);
    }
  };

  const openChat = async (friend: Person) => {
    setBusy(true);
    setError("");
    try {
      const response = await courseService.startPrivateChat(friend.id);
      const conversation = response.data?.conversation ?? response.conversation;
      if (!conversation?.id) throw new Error("Conversation tidak ditemukan.");
      const history = await courseService.getPrivateChatMessages(
        conversation.id,
      );
      setSelectedChat({ id: conversation.id, friend });
      if (currentUser?.id) {
        const key = `private_chat_unread_${currentUser.id}`;
        const stored = { ...chatUnread };
        delete stored[conversation.id];
        localStorage.setItem(key, JSON.stringify(stored));
        setChatUnread(stored);
        window.dispatchEvent(new Event("private-chat-unread-changed"));
      }
      shouldScrollMessagesRef.current = true;
      setNewMessageCount(0);
      setMessages(history.data?.messages ?? history.messages ?? []);
    } catch (err: any) {
      setError(
        err?.response?.data?.error?.message ||
          "Chat hanya tersedia untuk mutual friend.",
      );
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (
      !selectedChat ||
      messages.length === 0 ||
      !shouldScrollMessagesRef.current
    )
      return;
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight;
      });
    }
    setNewMessageCount(0);
  }, [messages, selectedChat]);

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
    if (!selectedChat) return;
    const echo = getEcho();
    if (!echo) return;
    const channelName = `private-chat.${selectedChat.id}`;
    const channel = echo.private(channelName);
    channel.listen(
      ".message_sent",
      (event: PrivateMessage & { message?: PrivateMessage }) => {
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
      },
    );
    return () => {
      channel.stopListening(".message_sent");
      echo.leave(channelName);
    };
  }, [selectedChat]);

  const sendMessage = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedChat || !draft.trim()) return;
    try {
      const response = await courseService.sendPrivateChatMessage(
        selectedChat.id,
        draft.trim(),
      );
      const sent = response.data?.message ?? response.message;
      if (sent)
        setMessages((current) =>
          current.some((item) => item.id === sent.id)
            ? current
            : [...current, sent],
        );
      setDraft("");
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || "Pesan gagal dikirim.");
    }
  };

  return (
    <DashboardLayout searchPlaceholder="Cari teman...">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-4 md:px-8 md:py-6">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Friends</h1>
          <p className="text-sm text-white/70">
            Temukan teman dan mulai percakapan privat.
          </p>
        </div>
        {error && (
          <p className="rounded-xl bg-red-50 p-3 text-xs text-red-600">
            {error}
          </p>
        )}
        {selectedChat ? (
          <section className="flex h-[calc(100vh-190px)] min-h-[420px] flex-col overflow-hidden rounded-3xl bg-white shadow-xl">
            <div className="flex items-center gap-3 border-b border-slate-100 p-4">
              <button
                onClick={() => setSelectedChat(null)}
                className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="h-10 w-10 overflow-hidden rounded-full bg-[#008be3] text-center font-bold leading-10 text-white">
                {avatar(selectedChat.friend)}
              </div>
              <div>
                <h2 className="font-extrabold text-[#00172e]">
                  {selectedChat.friend.full_name ||
                    selectedChat.friend.username}
                </h2>
                <p className="text-xs text-slate-400">
                  @{selectedChat.friend.username}
                </p>
              </div>
            </div>
            <div
              ref={messagesContainerRef}
              onScroll={() => {
                shouldScrollMessagesRef.current = isMessagesAtBottom();
              }}
              className="relative min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain bg-slate-50 p-4"
            >
              {messages.length ? (
                messages.map((item) => {
                  const own = isOwnMessage(item);
                  const sender: Person | undefined =
                    item.sender ||
                    (own
                      ? currentUser
                        ? {
                            id: currentUser.id,
                            username: currentUser.username,
                            full_name: currentUser.full_name,
                            avatar_url: currentUser.avatar_url,
                          }
                        : undefined
                      : selectedChat.friend);
                  return (
                    <div
                      key={item.id}
                      className={`flex items-end gap-2 ${own ? "justify-end" : "justify-start"}`}
                    >
                      {!own && (
                        <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-[#008be3] text-center text-xs font-bold leading-8 text-white">
                          {avatar(sender)}
                        </div>
                      )}
                      <div
                        className={`max-w-[75%] rounded-2xl p-3 shadow-sm ${own ? "bg-[#008be3] text-white" : "bg-white text-slate-900"}`}
                      >
                        <p
                          className={`mb-1 text-[10px] font-bold ${own ? "text-white/80" : "text-[#008be3]"}`}
                        >
                          {own
                            ? "Kamu"
                            : sender?.username ||
                              selectedChat.friend.username ||
                              "Teman"}
                        </p>
                        <p className="break-words text-sm [overflow-wrap:anywhere]">
                          {item.content}
                        </p>
                        <p
                          className={`mt-1 text-[10px] ${own ? "text-white/70" : "text-slate-400"}`}
                        >
                          {new Date(item.sent_at).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      {own && (
                        <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-[#008be3] text-center text-xs font-bold leading-8 text-white">
                          {avatar((currentUser as Person | null) || undefined)}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="m-auto text-center text-sm text-slate-400">
                  Belum ada pesan.
                </p>
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
              className="relative flex gap-2 border-t border-slate-100 p-4"
            >
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                maxLength={5000}
                placeholder="Tulis pesan..."
                className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#008be3]"
              />
              <div className="relative flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker((open) => !open)}
                  className="rounded-xl border border-slate-200 bg-white px-3 text-[#008be3] hover:bg-blue-50"
                  aria-label="Pilih emoji"
                >
                  <Smile className="h-5 w-5" />
                </button>
                {showEmojiPicker && (
                  <div className="absolute bottom-12 right-0 z-20 grid w-56 grid-cols-8 gap-1 rounded-2xl border border-slate-100 bg-white p-3 shadow-xl">
                    {emojiOptions.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                         onClick={() => {
                           setDraft((value) => `${value}${emoji}`);
                         }}
                        className="rounded-lg p-1.5 text-lg hover:bg-blue-50"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
                <button
                  disabled={busy}
                  className="rounded-xl bg-[#008be3] px-4 text-white disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>
          </section>
        ) : (
          <>
            <section className="rounded-3xl bg-white p-5 shadow-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => searchUsers(e.target.value)}
                  placeholder="Cari username atau nama..."
                  className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#008be3]"
                />
              </div>
              {matches.length > 0 && (
                <div className="mt-2 space-y-1">
                  {matches.map((person) => (
                    <div
                      key={person.id}
                      className="flex items-center justify-between rounded-xl p-2 hover:bg-slate-50"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#008be3] text-center font-bold leading-10 text-white">
                          {avatar(person)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {person.full_name || person.username}
                          </p>
                          <p className="text-xs text-slate-500">
                            @{person.username}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => follow(person.id)}
                        disabled={busy}
                        className="rounded-lg bg-[#008be3] px-3 py-2 text-xs font-bold text-white"
                      >
                        <UserPlus className="mr-1 inline h-3.5 w-3.5" />
                        Follow
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
            <section className="grid gap-4 md:grid-cols-2">
              {loading ? (
                <p className="text-sm text-white/70">Memuat teman...</p>
              ) : friends.length === 0 ? (
                <div className="rounded-3xl bg-white p-8 text-center text-sm text-slate-500 md:col-span-2">
                  Belum ada mutual friend.
                </div>
              ) : (
                friends.map((friend) => (
                  <div
                    key={friend.id}
                    className="rounded-3xl bg-white p-5 shadow-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 overflow-hidden rounded-full bg-[#008be3] text-center font-bold leading-[44px] text-white">
                        {avatar(friend)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h2 className="truncate font-extrabold text-[#00172e]">
                            {friend.full_name || friend.username}
                          </h2>
                          {chatUnread[
                            chats.find(
                              (chat) =>
                                String(chat.friend?.id) === String(friend.id),
                            )?.id || ""
                          ] > 0 && (
                            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-red-500" />
                          )}
                        </div>
                        <p className="text-xs text-slate-400">
                          @{friend.username}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => openChat(friend)}
                        disabled={busy}
                        className="flex-1 rounded-xl bg-[#008be3] py-2 text-xs font-bold text-white"
                      >
                        <MessageCircle className="mr-1 inline h-4 w-4" />
                        Chat
                      </button>
                      <button
                        onClick={() => unfollow(friend.id)}
                        disabled={busy}
                        className="rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-500"
                      >
                        <UserMinus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </section>
            {suggestedUsers.length > 0 && (
              <section className="rounded-3xl bg-white p-5 shadow-lg">
                <h2 className="mb-1 font-extrabold text-[#00172e]">
                  Penyelam yang disarankan
                </h2>
                <p className="mb-3 text-xs text-slate-500">
                  Temukan teman belajar baru.
                </p>
                <div className="grid gap-2 md:grid-cols-2">
                  {suggestedUsers.map((person) => (
                    <div
                      key={person.id}
                      className="flex items-center justify-between rounded-xl border border-slate-100 p-2"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-[#008be3] text-center text-xs font-bold leading-9 text-white">
                          {avatar(person)}
                        </div>
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {person.full_name || person.username}
                        </p>
                      </div>
                      <button
                        onClick={() => follow(person.id)}
                        disabled={busy}
                        className="rounded-lg bg-[#008be3] px-3 py-2 text-xs font-bold text-white"
                      >
                        Follow
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}
            {requests.incoming.length > 0 && (
              <section className="rounded-3xl bg-white p-5 shadow-lg">
                <h2 className="mb-3 font-extrabold text-[#00172e]">
                  Permintaan masuk
                </h2>
                {requests.incoming.map((person) => (
                  <div
                    key={person.id}
                    className="flex items-center justify-between border-b border-slate-100 py-2"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#008be3] text-center font-bold leading-10 text-white">
                        {avatar(person)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {person.full_name || person.username}
                        </p>
                        <p className="text-xs text-slate-500">
                          @{person.username}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => follow(person.id)}
                      disabled={busy}
                      className="rounded-lg bg-[#008be3] px-3 py-2 text-xs font-bold text-white"
                    >
                      Terima
                    </button>
                  </div>
                ))}
              </section>
            )}
          </>
        )}
      </main>
    </DashboardLayout>
  );
}
