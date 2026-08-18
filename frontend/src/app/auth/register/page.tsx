"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { User, Mail, GraduationCap, Presentation, ArrowLeft, Anchor, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { authService } from "@/services/authService";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<"siswa" | "pengajar">("siswa");
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (password !== confirmPassword) {
      setErrorMsg("Password dan konfirmasi password tidak cocok.");
      return;
    }

    setLoading(true);

    try {
      const res = await authService.register({
        username,
        email,
        password,
        password_confirmation: confirmPassword,
        full_name: fullName,
      });

      if (res.success && res.data) {
        if (res.data.token) {
          localStorage.setItem("token", res.data.token);
        }
        if (res.data.user) {
          localStorage.setItem("user", JSON.stringify(res.data.user));
          const userRole = res.data.user.role;
          if (userRole === "admin") {
            router.push("/admin");
          } else if (userRole === "instructor" || role === "pengajar") {
            router.push("/pembimbing");
          } else {
            router.push("/pelajar");
          }
        } else {
          router.push(role === "pengajar" ? "/pembimbing" : "/pelajar");
        }
      } else {
        setErrorMsg(res.error?.message || "Pendaftaran gagal. Silakan periksa kembali data anda.");
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || err.message || "Gagal terhubung ke server backend.");
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

          {step === 2 && (
            <button onClick={() => setStep(1)}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-800/80 px-3.5 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-all">
              <ArrowLeft className="h-3.5 w-3.5" />Kembali
            </button>
          )}

          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Mulai Petualangan Barumu</h1>
            <p className="text-slate-400 text-sm">Daftar akun dan siap menyelam.</p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-500/20 border border-red-500/50 text-red-200 text-sm">
              {errorMsg}
            </div>
          )}

          {/* Stepper */}
          <div className="flex items-center justify-between relative my-6 px-4">
            <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-[2px] bg-slate-700 z-0" />
            <div className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${step >= 1 ? "bg-cyan-500 text-slate-950" : "bg-slate-800 text-slate-400"}`}>1</div>
            <div className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${step === 2 ? "bg-cyan-500 text-slate-950" : "bg-slate-800 text-slate-400"}`}>2</div>
          </div>

          {/* Step 1 */}
          {step === 1 && (
            <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">Nama Lengkap</label>
                <div className="relative flex items-center">
                  <User className="absolute left-4 h-5 w-5 text-slate-400" />
                  <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Masukkan nama lengkap"
                    className="w-full rounded-xl border border-slate-700 bg-[#072042]/60 py-3.5 pl-12 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">Gmail / Email</label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-4 h-5 w-5 text-slate-400" />
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contoh@gmail.com"
                    className="w-full rounded-xl border border-slate-700 bg-[#072042]/60 py-3.5 pl-12 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">Pilih Peran</label>
                <div className="grid grid-cols-2 gap-4">
                  <button type="button" onClick={() => setRole("siswa")}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${role === "siswa" ? "border-cyan-500 bg-[#0c2e5c]" : "border-slate-800 bg-[#072042]/40 hover:border-slate-700"}`}>
                    <GraduationCap className={`h-8 w-8 mb-2 ${role === "siswa" ? "text-cyan-400" : "text-slate-400"}`} />
                    <span className="text-xs font-semibold text-slate-200">Penjelajah (Siswa)</span>
                  </button>
                  <button type="button" onClick={() => setRole("pengajar")}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${role === "pengajar" ? "border-cyan-500 bg-[#0c2e5c]" : "border-slate-800 bg-[#072042]/40 hover:border-slate-700"}`}>
                    <Presentation className={`h-8 w-8 mb-2 ${role === "pengajar" ? "text-cyan-400" : "text-slate-400"}`} />
                    <span className="text-xs font-semibold text-slate-200">Kapten (Pengajar)</span>
                  </button>
                </div>
              </div>

              <button type="submit"
                className="w-full rounded-xl bg-[#0c3c78] py-3.5 text-center text-sm font-semibold text-cyan-200 transition-all hover:bg-[#10488f] shadow-lg">
                Lanjut ke langkah berikutnya
              </button>
            </form>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <form className="space-y-5" onSubmit={handleRegister}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">Username</label>
                <div className="relative flex items-center">
                  <User className="absolute left-4 h-5 w-5 text-slate-400" />
                  <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Pilih username unikmu"
                    className="w-full rounded-xl border border-slate-700 bg-[#072042]/60 py-3.5 pl-12 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">Password</label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-4 h-5 w-5 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Buat password kuat"
                    className="w-full rounded-xl border border-slate-700 bg-[#072042]/60 py-3.5 pl-12 pr-12 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 text-slate-400 hover:text-slate-200 transition-colors">
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">Konfirmasi Password</label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-4 h-5 w-5 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Ulangi password"
                    className="w-full rounded-xl border border-slate-700 bg-[#072042]/60 py-3.5 pl-12 pr-12 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="flex items-center justify-center gap-2 w-full rounded-xl bg-cyan-500/80 py-3.5 text-center text-sm font-semibold text-white transition-all hover:bg-cyan-500 shadow-lg disabled:opacity-50">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Anchor className="h-4 w-4" />}
                Buat Akun & Mulai Menyelam
              </button>
            </form>
          )}

          <div className="text-center text-sm text-slate-400 pt-2">
            Sudah punya akun?{" "}
            <Link href="/auth/login" className="font-medium text-cyan-400 hover:underline">
              Masuk sebagai Penjelajah
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}