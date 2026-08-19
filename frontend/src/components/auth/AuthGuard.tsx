"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authService } from "@/services/authService";
import { UserProfile } from "@/types/auth";
import { clearUserCache } from "@/hooks/useCurrentUser";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: Array<"student" | "instructor" | "admin">;
}

export default function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

      if (!token) {
        if (isMounted) {
          router.replace(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
        }
        return;
      }

      try {
        // Ambil data profil terkini langsung dari DB via backend endpoint
        let user: UserProfile | null = null;
        const res = await authService.getUserMe();
        if (res.success && res.data?.user) {
          user = res.data.user;
        } else {
          const authRes = await authService.getAuthMe();
          if (authRes.success && authRes.data?.user) {
            user = authRes.data.user;
          }
        }

        if (!user) {
          clearUserCache();
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          if (isMounted) router.replace("/auth/login");
          return;
        }

        localStorage.setItem("user", JSON.stringify(user));

        if (allowedRoles && allowedRoles.length > 0) {
          if (!allowedRoles.includes(user.role)) {
            // Redirect ke dashboard yang sesuai peran sesungguhnya dari DB
            if (user.role === "admin") {
              router.replace("/admin");
            } else if (user.role === "instructor") {
              router.replace("/pembimbing");
            } else {
              router.replace("/pelajar");
            }
            return;
          }
        }

        if (isMounted) {
          setAuthorized(true);
          setLoading(false);
        }
      } catch (err) {
        // Jika token invalid / 401 unauthenticated
        clearUserCache();
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        if (isMounted) {
          router.replace("/auth/login");
        }
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [pathname, router, allowedRoles]);

  if (loading || !authorized) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#03152e] text-white">
        <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mb-3" />
        <p className="text-sm font-medium text-slate-300">Silakan tunggu...</p>
      </div>
    );
  }

  return <>{children}</>;
}
