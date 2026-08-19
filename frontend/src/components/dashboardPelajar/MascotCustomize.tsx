"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Loader2, ShoppingCart, CheckCircle, Zap, Star, Crown, Gem } from "lucide-react";
import DashboardLayout from "@/components/dashboardPelajar/DashboardLayout";
import { mascotService, MascotItem, InventoryMascot } from "@/services/mascotService";
import { UserProfile } from "@/types/auth";

const RARITY_CONFIG = {
  common: { label: "Umum", color: "bg-slate-100 text-slate-600", border: "border-slate-200", glow: "", icon: Star },
  rare: { label: "Langka", color: "bg-blue-50 text-blue-600", border: "border-blue-200", glow: "shadow-blue-100", icon: Gem },
  epic: { label: "Epik", color: "bg-purple-50 text-purple-600", border: "border-purple-200", glow: "shadow-purple-100", icon: Zap },
  legendary: { label: "Legendaris", color: "bg-amber-50 text-amber-600", border: "border-amber-200", glow: "shadow-amber-100", icon: Crown },
};

const QULI_VARIANTS = [
  "/biru/biru1.webp",
  "/biru/biru2.webp",
  "/biru/biru3.webp",
  "/biru/biru4.webp",
];

function getMascotImage(mascot: MascotItem, index: number): string {
  if (mascot.avatar_url) {
    return mascot.avatar_url;
  }
  return QULI_VARIANTS[index % QULI_VARIANTS.length];
}

function getInventoryImage(mascot: InventoryMascot, index: number): string {
  if (mascot.avatar_url) {
    return mascot.avatar_url;
  }
  return QULI_VARIANTS[index % QULI_VARIANTS.length];
}

type Tab = "katalog" | "inventori";
type AccessoryKey = "hat" | "glasses" | "outfit" | "background";

const ACCESSORY_OPTIONS: Record<AccessoryKey, { label: string; value: string; title: string }[]> = {
  hat: [
    { label: "Tanpa topi", value: "none", title: "none" },
    { label: "Kapten", value: "hat-captain", title: "captain" },
    { label: "Penyelam", value: "hat-diver", title: "diver" },
  ],
  glasses: [
    { label: "Tanpa kacamata", value: "none", title: "none" },
    { label: "Matahari", value: "glasses-sun", title: "sun" },
    { label: "Pintar", value: "glasses-smart", title: "smart" },
  ],
  outfit: [
    { label: "Bawaan", value: "outfit-default", title: "default" },
    { label: "Navy", value: "outfit-navy", title: "navy" },
    { label: "Karang", value: "outfit-coral", title: "coral" },
  ],
  background: [
    { label: "Laut", value: "bg-ocean", title: "ocean" },
    { label: "Senja", value: "bg-sunset", title: "sunset" },
    { label: "Palung", value: "bg-abyss", title: "abyss" },
  ],
};

export default function MascotCustomizeComponent() {
  const [tab, setTab] = useState<Tab>("katalog");
  const [catalog, setCatalog] = useState<MascotItem[]>([]);
  const [inventory, setInventory] = useState<InventoryMascot[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [pearls, setPearls] = useState<number>(0);
  const [accessories, setAccessories] = useState<Record<AccessoryKey, string>>({
    hat: "none",
    glasses: "none",
    outfit: "outfit-default",
    background: "bg-ocean",
  });

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [catRes, invRes] = await Promise.all([
        mascotService.getCatalog(),
        mascotService.getInventory(),
      ]);
      if (catRes.success && catRes.data) setCatalog(catRes.data.mascots);
      if (invRes.success && invRes.data) setInventory(invRes.data.mascots);
    } catch {
      showToast("Gagal memuat data maskot.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const u: UserProfile = JSON.parse(stored);
      setUser(u);
      setPearls(u.pearls ?? 0);
    }
    loadData();
  }, [loadData]);

  const handlePurchase = async (mascot: MascotItem) => {
    setActionLoading(mascot.id);
    try {
      const res = await mascotService.purchase(mascot.id);
      if (res.success && res.data) {
        showToast(`${mascot.name} berhasil dibeli!`);
        setPearls(res.data.pearls_remaining);
        const stored = localStorage.getItem("user");
        if (stored) {
          const u = JSON.parse(stored);
          u.pearls = res.data.pearls_remaining;
          localStorage.setItem("user", JSON.stringify(u));
        }
        await loadData();
      } else {
        if (res.error?.code === "INSUFFICIENT_PEARLS") {
          const d = res.error.details;
          showToast(`Mutiara tidak cukup. Butuh ${d?.required}, kamu punya ${d?.available}.`, "error");
        } else if (res.error?.code === "MASCOT_ALREADY_OWNED") {
          showToast("Maskot ini sudah kamu miliki.", "error");
        } else {
          showToast(res.error?.message ?? "Gagal membeli maskot.", "error");
        }
      }
    } catch {
      showToast("Terjadi kesalahan. Coba lagi.", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleEquip = async (mascot: InventoryMascot) => {
    setActionLoading(mascot.id);
    try {
      const res = await mascotService.equip(mascot.id, accessories);
      if (res.success) {
        showToast(`${mascot.name} sekarang aktif dengan kustomisasi pilihanmu!`);
        await loadData();
      } else {
        showToast(res.error?.message ?? "Gagal equip maskot.", "error");
      }
    } catch {
      showToast("Terjadi kesalahan. Coba lagi.", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const activeMascot = inventory.find((m) => m.is_active);
  const activeMascotIdx = inventory.findIndex((m) => m.is_active);

  return (
    <DashboardLayout searchPlaceholder="Cari maskot...">
      <div className="px-4 md:px-8 py-4 md:py-6 max-w-4xl mx-auto">

        {/* Toast */}
        {toast && (
          <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-2xl text-sm font-semibold shadow-xl transition-all ${toast.type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}>
            {toast.msg}
          </div>
        )}

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-white">Maskot Quli</h1>
              <p className="text-sm text-slate-300 mt-0.5">Koleksi & pasang maskot pendampingmu</p>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-2xl border border-white/20">
              <Image src="/pearl.webp" alt="mutiara" width={20} height={20} />
              <span className="text-white font-extrabold text-sm">{pearls.toLocaleString("id-ID")}</span>
              <span className="text-slate-300 text-xs font-medium">Mutiara</span>
            </div>
          </div>
        </div>

        {/* Active mascot preview */}
        {activeMascot && (
          <div className="mb-6 bg-white/10 backdrop-blur border border-white/20 rounded-3xl p-5 flex items-center gap-5">
            <div className="relative w-20 h-20 shrink-0">
              <Image
                src={getInventoryImage(activeMascot, activeMascotIdx)}
                alt={activeMascot.name}
                fill
                className="object-contain drop-shadow-lg"
              />
            </div>
            <div>
              <p className="text-xs font-bold text-cyan-300 uppercase tracking-widest mb-0.5">Maskot Aktif</p>
              <p className="text-white font-extrabold text-lg leading-tight">{activeMascot.name}</p>
              <p className="text-slate-300 text-xs mt-1 line-clamp-2">{activeMascot.description}</p>
            </div>
          </div>
        )}

        {/* Accessory customization */}
        <div className="bg-white rounded-3xl p-5 mb-6 shadow-lg text-[#00172e]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-extrabold text-base">Kustomisasi Quli</h2>
              <p className="text-xs text-slate-400 mt-1">Pilih aksesori lalu pasang dari tab Inventori.</p>
            </div>
            <span className="text-xs font-bold text-cyan-600 bg-cyan-50 px-3 py-1.5 rounded-full">4 pilihan</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {(Object.keys(ACCESSORY_OPTIONS) as AccessoryKey[]).map((key) => (
              <label key={key} className="flex flex-col gap-1.5">
                <span className="text-[11px] font-bold text-slate-500 capitalize">{key}</span>
                <select
                  value={accessories[key]}
                  onChange={(e) => setAccessories((current) => ({ ...current, [key]: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:border-cyan-400"
                >
                  {ACCESSORY_OPTIONS[key].map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-white/10 backdrop-blur p-1 rounded-2xl mb-6 gap-1">
          {(["katalog", "inventori"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer capitalize ${tab === t ? "bg-white text-[#00172e] shadow" : "text-slate-300 hover:text-white"}`}
            >
              {t === "katalog" ? `Katalog (${catalog.length})` : `Inventori (${inventory.length})`}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
          </div>
        ) : tab === "katalog" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {catalog.map((mascot, idx) => {
              const rarity = RARITY_CONFIG[mascot.rarity] ?? RARITY_CONFIG.common;
              const RarityIcon = rarity.icon;
              const owned = mascot.is_owned || inventory.some((m) => m.id === mascot.id);
              const isLoading = actionLoading === mascot.id;

              return (
                <div
                  key={mascot.id}
                  className={`bg-white rounded-2xl border-2 ${rarity.border} shadow-md ${rarity.glow} flex flex-col items-center p-4 gap-3 transition-all hover:shadow-lg`}
                >
                  <div className="relative w-20 h-20">
                    <Image
                      src={getMascotImage(mascot, idx)}
                      alt={mascot.name}
                      fill
                      className="object-contain"
                    />
                    {owned && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="text-center w-full">
                    <p className="font-extrabold text-[#00172e] text-xs leading-tight">{mascot.name}</p>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold mt-1 ${rarity.color}`}>
                      <RarityIcon className="w-3 h-3" />
                      {rarity.label}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">{mascot.description}</p>
                  </div>

                  <div className="w-full mt-auto">
                    {owned ? (
                      <div className="w-full py-2 rounded-xl bg-emerald-50 text-emerald-600 text-xs font-bold text-center border border-emerald-100">
                        Dimiliki ✓
                      </div>
                    ) : (
                      <button
                        onClick={() => handlePurchase(mascot)}
                        disabled={isLoading || pearls < mascot.unlock_cost}
                        className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer
                          ${pearls >= mascot.unlock_cost
                            ? "bg-[#0073e6] hover:bg-[#0052cc] text-white shadow-md shadow-blue-200 active:scale-95"
                            : "bg-slate-100 text-slate-400 cursor-not-allowed"
                          } disabled:opacity-60`}
                      >
                        {isLoading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <>
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <Image src="/pearl.webp" alt="" width={14} height={14} />
                            {mascot.unlock_cost.toLocaleString("id-ID")}
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div>
            {inventory.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-4 relative opacity-40">
                  <Image src="/quli-maskot.webp" alt="quli" fill className="object-contain" />
                </div>
                <p className="text-slate-300 font-semibold">Belum punya maskot</p>
                <p className="text-slate-400 text-sm mt-1">Beli maskot di tab Katalog</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {inventory.map((mascot, idx) => {
                  const rarity = RARITY_CONFIG[mascot.rarity] ?? RARITY_CONFIG.common;
                  const RarityIcon = rarity.icon;
                  const isLoading = actionLoading === mascot.id;

                  return (
                    <div
                      key={mascot.id}
                      className={`bg-white rounded-2xl border-2 flex flex-col items-center p-4 gap-3 transition-all hover:shadow-lg ${mascot.is_active ? "border-cyan-400 shadow-cyan-100 shadow-md ring-2 ring-cyan-300/40" : rarity.border}`}
                    >
                      <div className="relative w-20 h-20">
                        <Image
                          src={getInventoryImage(mascot, idx)}
                          alt={mascot.name}
                          fill
                          className="object-contain"
                        />
                        {mascot.is_active && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center shadow">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>

                      <div className="text-center w-full">
                        <p className="font-extrabold text-[#00172e] text-xs leading-tight">{mascot.name}</p>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold mt-1 ${rarity.color}`}>
                          <RarityIcon className="w-3 h-3" />
                          {rarity.label}
                        </span>
                        {mascot.is_active && (
                          <p className="text-[10px] text-cyan-600 font-bold mt-1">Sedang Dipakai</p>
                        )}
                      </div>

                      <div className="w-full mt-auto">
                        {mascot.is_active ? (
                          <button
                            onClick={() => handleEquip(mascot)}
                            disabled={isLoading}
                            className="w-full py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-600 text-white shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60"
                          >
                            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Simpan kustomisasi"}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleEquip(mascot)}
                            disabled={isLoading}
                            className="w-full py-2 rounded-xl text-xs font-bold bg-[#0073e6] hover:bg-[#0052cc] text-white shadow-md shadow-blue-200 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60"
                          >
                            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Pasang"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
