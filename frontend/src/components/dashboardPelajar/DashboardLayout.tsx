"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  BookOpen,
  Bookmark,
  Users,
  Users2,
  Trophy,
  BarChart2,
  GraduationCap,
  Play,
  Bell,
  Search,
  ChevronRight,
  Palette,
  LogOut,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import FloatingBubbles from "@/components/ui/FloatingBubbles";
import StudentTutorial from "@/components/ui/StudentTutorial";
import { clearUserCache, useCurrentUser } from "@/hooks/useCurrentUser";
import { courseService } from "@/services/courseService";
import { getEcho } from "@/lib/echo";

const NAV_ITEMS = [
  { icon: <Home className="w-5 h-5" />, label: "Home", href: "/pelajar" },
  {
    icon: <BookOpen className="w-5 h-5" />,
    label: "All Course",
    href: "/pelajar/all-course",
  },
  {
    icon: <Bookmark className="w-5 h-5" />,
    label: "My Courses",
    href: "/pelajar/my-courses",
  },
  {
    icon: <Play className="w-5 h-5" />,
    label: "Live Class",
    href: "/pelajar/liveClass",
  },
  {
    icon: <Users2 className="w-5 h-5" />,
    label: "Study Forum",
    href: "/pelajar/study-room",
  },
  {
    icon: <Trophy className="w-5 h-5" />,
    label: "Leaderboard",
    href: "/pelajar/leaderboard",
  },
  {
    icon: <GraduationCap className="w-5 h-5" />,
    label: "Pembimbing",
    href: "/pelajar/pembimbing",
  },
  {
    icon: <BarChart2 className="w-5 h-5" />,
    label: "Report",
    href: "/pelajar/report",
  },
  {
    icon: <Palette className="w-5 h-5" />,
    label: "Customize Mascot",
    href: "/pelajar/mascot-customize",
  },
];

// Bottom nav mobile — item utama (tanpa admin items)
const BOTTOM_NAV = [
  { icon: <Home className="w-5 h-5" />, label: "Home", href: "/pelajar" },
  {
    icon: <BookOpen className="w-5 h-5" />,
    label: "All Course",
    href: "/pelajar/all-course",
  },
  {
    icon: <Bookmark className="w-5 h-5" />,
    label: "My Courses",
    href: "/pelajar/my-courses",
  },
  {
    icon: <Trophy className="w-5 h-5" />,
    label: "Rank",
    href: "/pelajar/leaderboard",
  },
  {
    icon: <BarChart2 className="w-5 h-5" />,
    label: "Report",
    href: "/pelajar/report",
  },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
  searchPlaceholder?: string;
}

export default function DashboardLayout({
  children,
  searchPlaceholder = "Search...",
}: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [search, setSearch] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { user } = useCurrentUser();
  const [studyForumUnread, setStudyForumUnread] = useState(0);
  const [privateChatUnread, setPrivateChatUnread] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    const storageKey = user?.id
      ? `study_room_unread_${user.id}`
      : "study_room_unread";
    const readUnread = () => {
      try {
        const unread = JSON.parse(
          localStorage.getItem(storageKey) || "{}",
        ) as Record<string, unknown>;
        setStudyForumUnread(
          Object.values(unread).reduce<number>(
            (total, count) => total + (typeof count === "number" ? count : 0),
            0,
          ),
        );
      } catch {
        setStudyForumUnread(0);
      }
    };
    readUnread();
    window.addEventListener("storage", readUnread);
    window.addEventListener("study-room-unread-changed", readUnread);
    return () => {
      window.removeEventListener("storage", readUnread);
      window.removeEventListener("study-room-unread-changed", readUnread);
    };
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    const storageKey = `private_chat_unread_${user.id}`;
    const readUnread = () => {
      try {
        const value = JSON.parse(localStorage.getItem(storageKey) || "{}");
        setPrivateChatUnread(value && typeof value === "object" ? value : {});
      } catch {
        setPrivateChatUnread({});
      }
    };
    readUnread();
    window.addEventListener("storage", readUnread);
    window.addEventListener("private-chat-unread-changed", readUnread);
    let cancelled = false;
    let cleanup: (() => void) | undefined;
    courseService
      .getPrivateChats()
      .then((response) => {
        if (cancelled) return;
        const conversations =
          response.data?.conversations ?? response.conversations ?? [];
        const echo = getEcho();
        if (!echo) return;
        const subscriptions = conversations.map(
          (conversation: { id: string }) => {
            const channelName = `private-chat.${conversation.id}`;
            const channel = echo.private(channelName);
            channel.listen(".message_sent", (event: any) => {
              const incoming = event.message ?? event;
              if (
                !incoming?.id ||
                String(incoming.sender_id) === String(user.id)
              )
                return;
              setPrivateChatUnread((current) => {
                const next = {
                  ...current,
                  [conversation.id]: (current[conversation.id] ?? 0) + 1,
                };
                localStorage.setItem(storageKey, JSON.stringify(next));
                window.dispatchEvent(new Event("private-chat-unread-changed"));
                return next;
              });
            });
            return { channel, channelName };
          },
        );
        cleanup = () =>
          subscriptions.forEach(({ channel, channelName }: any) => {
            channel.stopListening(".message_sent");
            echo.leave(channelName);
          });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
      cleanup?.();
      window.removeEventListener("storage", readUnread);
      window.removeEventListener("private-chat-unread-changed", readUnread);
    };
  }, [user?.id]);

  const privateChatUnreadTotal = Object.values(privateChatUnread).reduce(
    (total, count) => total + (typeof count === "number" ? count : 0),
    0,
  );
  const displayName = user?.full_name || user?.username || "Pelajar";
  const initial = displayName.charAt(0).toUpperCase();

  const notifications = useMemo(() => {
    const list: { title: string; text: string; href: string; time: string; unread?: boolean }[] = [];

    // Notifikasi Mutiara & Level
    if ((user?.pearls ?? 0) > 0) {
      list.push({
        title: "Saldo Mutiara",
        text: `Kamu memiliki ${user?.pearls} Mutiara. Gunakan untuk kustomisasi maskot Quli!`,
        href: "/pelajar/mascot-customize",
        time: "Tersedia",
        unread: true,
      });
    }

    // Notifikasi XP & Leaderboard
    if ((user?.xp ?? 0) > 0) {
      list.push({
        title: "Pencapaian XP",
        text: `Total ${user?.xp} XP terkumpul. Cek posisi peringkatmu di Leaderboard!`,
        href: "/pelajar/leaderboard",
        time: "Aktif",
      });
    }

    // Notifikasi Belajar / Kursus
    list.push({
      title: "Materi Belajar",
      text: "Lanjutkan progres kursus terdaftar atau cari materi baru di All Course.",
      href: "/pelajar/my-courses",
      time: "Hari ini",
    });

    return list;
  }, [user]);

  const handleLogout = () => {
    clearUserCache();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("active_mascot");
    setAvatarOpen(false);
  };

  return (
    <div
      className="flex min-h-screen font-sans relative"
      style={{
        background: "linear-gradient(180deg, #42AEED 0%, #0063A7 100%)",
      }}
    >
      <FloatingBubbles count={20} />

      {/* Ornamen karang */}
      <div
        className="fixed bottom-0 left-0 right-0 pointer-events-none"
        style={{ zIndex: 1 }}
      >
        <img
          src="/ocean-ornament.svg"
          alt=""
          className="w-full"
          style={{
            display: "block",
            height: "240px",
            objectFit: "cover",
            objectPosition: "top",
          }}
        />
      </div>

      {/* ── SIDEBAR DESKTOP (lg+) ── */}
      <div
        className="hidden lg:block w-64 shrink-0 p-3 relative"
        style={{ zIndex: 20 }}
      >
        <aside className="relative h-full rounded-3xl bg-white flex flex-col px-5 py-6 shadow-xl">
          {/* Logo */}
          <Link href="/pelajar" className="flex items-center gap-2 mb-2">
            <Image
              src="/logo-eduwave.webp"
              alt="EduWave"
              width={32}
              height={32}
              className="h-8 w-auto shrink-0"
            />
            <span className="text-lg font-bold text-[#00172e]">
              Edu<span className="text-[#008be3]">Wave</span>
            </span>
            <ChevronRight className="w-4 h-4 text-slate-300 ml-auto" />
          </Link>

          <div className="border-b border-slate-100 mb-5" />

          {/* Nav */}
          <nav className="flex flex-col gap-0.5 flex-1">
            {NAV_ITEMS.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "#" &&
                  pathname.startsWith(item.href) &&
                  item.href !== "/pelajar") ||
                pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  data-tour={
                    item.href === "/pelajar"
                      ? "home"
                      : item.href === "/pelajar/all-course"
                        ? "all-course"
                        : item.href === "/pelajar/my-courses"
                          ? "my-courses"
                          : item.href === "/pelajar/liveClass"
                            ? "live-class"
                            : item.href === "/pelajar/study-room"
                              ? "study-forum"
                              : item.href === "/pelajar/leaderboard"
                                ? "leaderboard"
                                : item.href === "/pelajar/pembimbing"
                                  ? "pembimbing"
                                  : item.href === "/pelajar/report"
                                    ? "report"
                                    : item.href === "/pelajar/mascot-customize"
                                      ? "mascot"
                                      : undefined
                  }
                  title={item.label}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                    ${
                      active
                        ? "bg-[#008be3]/10 text-[#008be3] border-l-4 border-[#008be3]"
                        : "text-slate-500 hover:bg-slate-50 hover:text-[#008be3]"
                    }`}
                >
                  <span className="shrink-0">{item.icon}</span>
                  <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
                    <span>{item.label}</span>
                    {item.href === "/pelajar/study-room" &&
                      studyForumUnread > 0 && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-extrabold text-white">
                          {studyForumUnread > 99 ? "99+" : studyForumUnread}
                        </span>
                      )}
                  </span>
                </Link>
              );
            })}
          </nav>
        </aside>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div
        className="flex-1 flex flex-col min-w-0 relative"
        style={{ zIndex: 10 }}
      >
        {/* Topbar */}
        <header className="flex items-center justify-between px-4 md:px-8 py-3 md:py-4 bg-transparent">
          {/* Mobile & Tablet (< 1024px): hamburger */}
          <button
            className="lg:hidden w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white cursor-pointer"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search */}
          <div className="relative hidden sm:block w-48 md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && search.trim())
                  router.push(
                    `/pelajar/all-course?search=${encodeURIComponent(search.trim())}`,
                  );
              }}
              className="w-full pl-9 pr-4 py-2 md:py-2.5 rounded-full bg-white text-sm text-slate-700 placeholder-slate-400 outline-none shadow-sm focus:ring-2 focus:ring-[#008be3]/30"
            />
          </div>

          {/* Right */}
          <div className="flex items-center gap-2 md:gap-4 ml-auto">
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen((open) => !open)}
                className="relative w-8 h-8 md:w-9 md:h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20 hover:bg-white/30 transition-colors"
              >
                <Bell className="w-4 h-4 text-white" />
              </button>
              {notificationsOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 rounded-2xl bg-white p-4 shadow-xl z-50 text-slate-700 border border-slate-100 divide-y divide-slate-100">
                  <div className="flex items-center justify-between pb-2">
                    <p className="text-sm font-bold text-[#00172e]">Notifikasi Siswa</p>
                    <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{notifications.length} info</span>
                  </div>
                  <div className="flex flex-col gap-2 pt-2 max-h-72 overflow-y-auto">
                    {notifications.map((notification, idx) => (
                      <div key={idx} className="p-2 rounded-xl hover:bg-slate-50 transition-all flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-800">{notification.title}</p>
                          <span className="text-[10px] font-medium text-slate-400">{notification.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-snug">{notification.text}</p>
                        <Link
                          href={notification.href}
                          onClick={() => setNotificationsOpen(false)}
                          className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-[#008be3] hover:underline"
                        >
                          <span>Buka halaman</span>
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Avatar dropdown */}
            <div className="relative">
              <button
                onClick={() => setAvatarOpen(!avatarOpen)}
                className="flex items-center gap-1.5 md:gap-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/20 pl-1 pr-2 md:pr-3 py-1 hover:bg-white/30 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-[#008be3] flex items-center justify-center text-white text-xs font-bold shrink-0 overflow-hidden">
                  {user?.avatar_url && !imgError ? (
                    <img
                      src={user.avatar_url}
                      alt={displayName}
                      onError={() => setImgError(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    initial
                  )}
                </div>
                <span className="hidden md:block text-sm font-semibold text-white max-w-[120px] truncate">
                  {displayName}
                </span>
                {privateChatUnreadTotal > 0 && (
                  <span className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full border-2 border-[#42AEED] bg-red-500" />
                )}
                <ChevronDown
                  className={`w-3.5 h-3.5 text-white/70 transition-transform ${avatarOpen ? "rotate-180" : ""}`}
                />
              </button>

              {avatarOpen && (
                <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50">
                  <Link
                    href="/pelajar/profile"
                    onClick={() => setAvatarOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <Users className="w-4 h-4" />
                    Profil
                  </Link>
                  <Link
                    href="/pelajar/friends"
                    onClick={() => setAvatarOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <Users2 className="w-4 h-4" />
                    Friends
                    {privateChatUnreadTotal > 0 && (
                      <span className="ml-auto h-2.5 w-2.5 rounded-full bg-red-500" />
                    )}
                  </Link>
                  <div className="border-t border-slate-100" />
                  <Link
                    href="/auth/login"
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Keluar
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 pb-20 md:pb-8">{children}</div>
      </div>

      {/* ── MOBILE SIDEBAR DRAWER (< 1024px) ── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer */}
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-2xl flex flex-col p-6">
            <div className="flex items-center justify-between mb-6">
              <Link
                href="/pelajar"
                className="flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Image
                  src="/logo-eduwave.webp"
                  alt="EduWave"
                  width={32}
                  height={32}
                  className="h-8 w-auto"
                />
                <span className="text-lg font-bold text-[#00172e]">
                  Edu<span className="text-[#008be3]">Wave</span>
                </span>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="border-b border-slate-100 mb-4" />

            <nav className="flex flex-col gap-1 flex-1">
              {NAV_ITEMS.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                      ${
                        active
                          ? "bg-[#008be3]/10 text-[#008be3] border-l-4 border-[#008be3]"
                          : "text-slate-500 hover:bg-slate-50 hover:text-[#008be3]"
                      }`}
                  >
                    {item.icon}
                    <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
                      <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
                        <span>{item.label}</span>
                        {item.href === "/pelajar/friends" &&
                          privateChatUnreadTotal > 0 && (
                            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-extrabold text-white">
                              {privateChatUnreadTotal > 99
                                ? "99+"
                                : privateChatUnreadTotal}
                            </span>
                          )}
                      </span>
                      {item.href === "/pelajar/study-room" &&
                        studyForumUnread > 0 && (
                          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-extrabold text-white">
                            {studyForumUnread > 99 ? "99+" : studyForumUnread}
                          </span>
                        )}
                    </span>
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-slate-100 pt-4">
              <Link
                href="/auth/login"
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Keluar
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── BOTTOM NAV MOBILE (< 1024px) ── */}
      <div className="fixed bottom-0 left-0 right-0 lg:hidden z-40">
        <div className="mx-3 mb-3 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 px-2 py-2 flex items-center justify-around">
          {BOTTOM_NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                data-tour={
                  item.href === "/pelajar"
                    ? "home, mobile-home"
                    : item.href === "/pelajar/all-course"
                      ? "all-course, mobile-all-course"
                      : item.href === "/pelajar/my-courses"
                        ? "my-courses, mobile-my-courses"
                        : item.href === "/pelajar/report"
                          ? "report, mobile-report"
                          : undefined
                }
                className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all
                  ${active ? "text-[#008be3]" : "text-slate-400 hover:text-[#008be3]"}`}
              >
                {item.icon}
                <span className="text-[9px] font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
      <StudentTutorial />
    </div>
  );
}
