"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { authService } from "@/services/authService";
import { formatErrorMessage } from "@/lib/utils";
import { sanitizeInput, validatePassword, authRateLimiter } from "@/lib/security";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      authService.getUserMe().then((res) => {
        if (res.success && res.data?.user) {
          const role = res.data.user.role;
          if (role === "admin") router.replace("/admin");
          else if (role === "instructor") router.replace("/pembimbing");
          else router.replace("/pelajar");
        }
      }).catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      });
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const cleanEmail = sanitizeInput(email);
    const cleanPassword = password.trim();

    if (!cleanEmail) {
      setErrorMsg("Email atau username tidak boleh kosong.");
      return;
    }

    const passValidation = validatePassword(cleanPassword);
    if (!passValidation.valid) {
      setErrorMsg(passValidation.message || "Password tidak valid.");
      return;
    }

    // Rate Limiter Brute Force Check
    const rateCheck = authRateLimiter.isRateLimited("login_attempt", 5, 60000);
    if (rateCheck.limited) {
      setErrorMsg(`Terlalu banyak percobaan login gagal. Silakan tunggu ${rateCheck.remainingSec} detik.`);
      return;
    }

    setLoading(true);

    try {
      const res = await authService.login({ email: cleanEmail, password: cleanPassword });
      if (res.success && res.data) {
        authRateLimiter.resetAttempts("login_attempt");
        if (res.data.token) {
          localStorage.setItem("token", res.data.token);
        }
        if (res.data.user) {
          localStorage.setItem("user", JSON.stringify(res.data.user));
          const role = res.data.user.role;
          if (role === "admin") {
            router.push("/admin");
          } else if (role === "instructor") {
            router.push("/pembimbing");
          } else {
            router.push("/pelajar");
          }
        } else {
          router.push("/pelajar");
        }
      } else {
        authRateLimiter.recordAttempt("login_attempt");
        setErrorMsg(res.error?.message || "Email/username atau password salah.");
      }
    } catch (err: any) {
      authRateLimiter.recordAttempt("login_attempt");
      setErrorMsg(formatErrorMessage(err, "Login gagal. Silakan periksa kembali email & password anda."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full bg-[#03152e] text-white overflow-hidden font-sans">
      {/* Kiri */}
      <div className="relative hidden w-1/2 md:flex items-center justify-center">
        <Image src="/ocean-bg.jpg" alt="Underwater Ocean Background" fill priority className="object-cover object-center" />
        <div className="absolute top-0 right-[-1px] bottom-0 w-24 z-10 pointer-events-none">
          <svg className="h-full w-full fill-[#03152e]" viewBox="0 0 100 800" preserveAspectRatio="none">
            <path d="M0,0 C60,150 -30,300 70,450 C120,550 10,700 0,800 L100,800 L100,0 Z" />
          </svg>
        </div>
      </div>

      {/* Kanan */}
      <div className="flex w-full md:w-1/2 items-center justify-center p-8 md:p-16 z-20">
        <div className="w-full max-w-md space-y-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Login</h1>
            <p className="text-slate-400 text-sm">Login untuk masuk ke dalam laut.</p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-500/20 border border-red-500/50 text-red-200 text-sm">
              {errorMsg}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleLogin}>
            {/* Email / Username */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Email atau Username</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-4 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contoh@gmail.com atau username"
                  className="w-full rounded-xl border border-slate-700 bg-[#072042]/60 py-3.5 pl-12 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            {/* Password + show/hide */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Password</label>
              <div className="relative flex items-center">
                <Lock className="absolute left-4 h-5 w-5 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full rounded-xl border border-slate-700 bg-[#072042]/60 py-3.5 pl-12 pr-12 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <div className="flex justify-end pt-1">
                <Link href="/auth/forgot-password" className="text-xs text-cyan-400 hover:underline">
                  Forgot Password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-cyan-400 py-3.5 text-center text-sm font-semibold text-slate-950 transition-all hover:bg-cyan-300 shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Login
            </button>
          </form>

          <div className="text-center text-sm text-slate-400 pt-4 space-y-1">
            <p>Don't have an account?</p>
            <Link href="/auth/register" className="font-medium text-cyan-400 hover:underline inline-block">
              Register Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}