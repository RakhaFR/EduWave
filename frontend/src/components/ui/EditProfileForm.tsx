"use client";

import { useState } from "react";
import { authService } from "@/services/authService";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function EditProfileForm() {
  const { user, refetch } = useCurrentUser();
  const [form, setForm] = useState({
    full_name: "",
    username: "",
    email: "",
    bio: "",
    avatar_url: "",
    current_password: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const values = {
    full_name: form.full_name || user.full_name,
    username: form.username || user.username || "",
    email: form.email || user.email || "",
    bio: form.bio || user.bio || "",
    avatar_url: form.avatar_url || user.avatar_url || "",
    ...(form.current_password ? { current_password: form.current_password } : {}),
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setMessage(null);
    try {
      // 1. Update basic profile
      const response = await authService.updateProfile(values);
      if (!response.success) {
        throw new Error(response.error?.message || "Gagal menyimpan profil.");
      }

      // 2. Update password if filled
      if (showPasswordSection && passwordForm.password) {
        if (!passwordForm.current_password) {
          throw new Error("Password saat ini wajib diisi untuk mengubah password.");
        }
        if (passwordForm.password !== passwordForm.password_confirmation) {
          throw new Error("Konfirmasi password baru tidak cocok.");
        }

        const passRes = await authService.updatePassword({
          current_password: passwordForm.current_password,
          password: passwordForm.password,
          password_confirmation: passwordForm.password_confirmation,
        });

        if (!passRes.success) {
          throw new Error(passRes.error?.message || "Gagal memperbarui password.");
        }
        setPasswordForm({ current_password: "", password: "", password_confirmation: "" });
        setShowPasswordSection(false);
      }

      await refetch();
      setMessage({ text: "Profil berhasil diperbarui!", type: "success" });
    } catch (error) {
      setMessage({
        text: error instanceof Error ? error.message : "Gagal menyimpan profil.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-3">
      <p className="text-sm font-bold text-slate-700">Edit Profil & Keamanan</p>

      {/* Full Name */}
      <div>
        <label className="text-[11px] font-semibold text-slate-500 block mb-1">Nama Lengkap</label>
        <input
          value={values.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:border-cyan-400"
          placeholder="Nama lengkap"
        />
      </div>

      {/* Email */}
      <div>
        <label className="text-[11px] font-semibold text-slate-500 block mb-1">Email</label>
        <input
          type="email"
          value={values.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:border-cyan-400"
          placeholder="nama@example.com"
        />
      </div>

      {/* Bio */}
      <div>
        <label className="text-[11px] font-semibold text-slate-500 block mb-1">Bio</label>
        <textarea
          value={values.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:border-cyan-400 resize-none"
          placeholder="Tulis bio singkat..."
          rows={2}
        />
      </div>

      {/* Avatar URL */}
      <div>
        <label className="text-[11px] font-semibold text-slate-500 block mb-1">URL Avatar / Foto Profil</label>
        <input
          value={values.avatar_url}
          onChange={(e) => setForm({ ...form, avatar_url: e.target.value })}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:border-cyan-400"
          placeholder="https://..."
        />
      </div>

      {/* Current Password for Username/Email Change */}
      <div>
        <label className="text-[11px] font-semibold text-slate-500 block mb-1">
          Password anda sekarang (hanya digunakan jika mengganti email atau username)
        </label>
        <input
          type="password"
          value={form.current_password}
          onChange={(e) => setForm({ ...form, current_password: e.target.value })}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:border-cyan-400"
          placeholder="Password saat ini"
        />
      </div>

      {/* Password Toggle Button */}
      {!showPasswordSection ? (
        <button
          type="button"
          onClick={() => setShowPasswordSection(true)}
          className="text-xs text-[#008be3] font-semibold hover:underline block pt-1"
        >
          + Ubah Password
        </button>
      ) : (
        <div className="pt-2 border-t border-slate-200 space-y-2">
          <p className="text-xs font-bold text-slate-600">Ubah Password</p>
          <input
            type="password"
            value={passwordForm.current_password}
            onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:border-cyan-400"
            placeholder="Password saat ini"
          />
          <input
            type="password"
            value={passwordForm.password}
            onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:border-cyan-400"
            placeholder="Password baru"
          />
          <input
            type="password"
            value={passwordForm.password_confirmation}
            onChange={(e) => setPasswordForm({ ...passwordForm, password_confirmation: e.target.value })}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:border-cyan-400"
            placeholder="Konfirmasi password baru"
          />
        </div>
      )}

      {/* Save Button */}
      <button
        onClick={handleSaveProfile}
        disabled={saving}
        className="w-full rounded-xl bg-[#008be3] hover:bg-[#0078c8] px-4 py-2.5 text-xs font-bold text-white transition-all disabled:opacity-60 cursor-pointer active:scale-95 shadow-md shadow-[#008be3]/20"
      >
        {saving ? "Menyimpan..." : "Simpan Profil"}
      </button>

      {/* Feedback Message */}
      {message && (
        <p className={`text-xs font-medium ${message.type === "success" ? "text-emerald-600" : "text-red-500"}`}>
          {message.text}
        </p>
      )}
    </div>
  );
}
