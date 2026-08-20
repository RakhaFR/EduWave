"use client";

import { useState } from "react";
import { authService } from "@/services/authService";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function EditProfileForm() {
  const { user, refetch } = useCurrentUser();
  const [form, setForm] = useState({ full_name: "", bio: "", avatar_url: "" });
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  if (!user) return null;
  const values = { full_name: form.full_name || user.full_name, bio: form.bio || user.bio || "", avatar_url: form.avatar_url || user.avatar_url || "" };
  const save = async () => {
    setSaving(true); setMessage("");
    try {
      const response = await authService.updateProfile(values);
      if (!response.success) throw new Error(response.error?.message || "Gagal menyimpan profil.");
      await refetch();
      setMessage("Profil berhasil diperbarui.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Gagal menyimpan profil."); }
    finally { setSaving(false); }
  };

  return <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-3">
    <p className="text-sm font-bold text-slate-700">Edit Profil</p>
    <input value={values.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs" placeholder="Nama lengkap" />
    <textarea value={values.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs" placeholder="Bio" rows={3} />
    <input value={values.avatar_url} onChange={(e) => setForm({ ...form, avatar_url: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs" placeholder="URL avatar" />
    <button onClick={save} disabled={saving} className="rounded-xl bg-[#008be3] px-4 py-2 text-xs font-bold text-white disabled:opacity-60">{saving ? "Menyimpan..." : "Simpan Profil"}</button>
    {message && <p className="text-xs text-slate-500">{message}</p>}
  </div>;
}
