"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Loader2, ShoppingCart, CheckCircle, Zap, Star, Crown, Gem, ChevronLeft, ChevronRight } from "lucide-react";
import DashboardLayout from "@/components/dashboardPelajar/DashboardLayout";
import { mascotService, MascotItem, InventoryMascot } from "@/services/mascotService";
import { UserProfile } from "@/types/auth";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { GridSkeleton } from "@/components/ui/PageSkeleton";
import { formatMascotDisplayName } from "@/lib/mascotNames";

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

const ITEMS_PER_PAGE = 8;

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
  const { user: currentUser } = useCurrentUser();
  const [tab, setTab] = useState<Tab>("katalog");
  const [catalog, setCatalog] = useState<MascotItem[]>([]);
  const [inventory, setInventory] = useState<InventoryMascot[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [, setUser] = useState<UserProfile | null>(null);
  const [pearls, setPearls] = useState<number>(0);
  const [catalogPage, setCatalogPage] = useState(1);
  const [inventoryPage, setInventoryPage] = useState(1);
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
      const invMascots = invRes.success && invRes.data ? invRes.data.mascots : [];
      const invIds = new Set(invMascots.map((m) => m.id));

      if (catRes.success && catRes.data) {
        // Filter out mascots that are already in inventory/owned
        const availableCatalog = catRes.data.mascots.filter(
          (m) => !m.is_owned && !invIds.has(m.id)
        );
        setCatalog(availableCatalog);
      }
      setInventory(invMascots);
    } catch {
      showToast("Gagal memuat data maskot.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    setUser(currentUser);
    setPearls(currentUser.pearls ?? 0);
    loadData();
  }, [currentUser, loadData]);

  const handlePurchase = async (mascot: MascotItem) => {
    setActionLoading(mascot.id);
    try {
      const res = await mascotService.purchase(mascot.id);
      if (res.success && res.data) {
        showToast(`${mascot.name} berhasil dibeli!`);
        setPearls(res.data.pearls_remaining);

        // Update localStorage
        const stored = localStorage.getItem("user");
        if (stored) {
          const u = JSON.parse(stored);
          u.pearls = res.data.pearls_remaining;
          localStorage.setItem("user", JSON.stringify(u));
        }

        // Local state update: remove from catalog, add to inventory without loading re-fetch
        setCatalog((prev) => prev.filter((item) => item.id !== mascot.id));
        const newInventoryItem: InventoryMascot = {
          ...mascot,
          is_owned: true,
          is_active: false,
          accessories: null,
          unlocked_at: new Date().toISOString(),
        };
        setInventory((prev) => [...prev, newInventoryItem]);
      } else {
        if (res.error?.code === "INSUFFICIENT_PEARLS") {
          const d = res.error.details;
          showToast(`Mutiara tidak cukup. Butuh ${d?.required}, kamu punya ${d?.available}.`, "error");
        } else if (res.error?.code === "MASCOT_ALREADY_OWNED") {
          showToast("Maskot ini sudah kamu miliki.", "error");
          // Remove from catalog if already owned
          setCatalog((prev) => prev.filter((item) => item.id !== mascot.id));
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
        // Local update for active status
        const updatedInventory = inventory.map((item) => ({
          ...item,
          is_active: item.id === mascot.id,
          accessories: item.id === mascot.id ? accessories : item.accessories,
        }));
        setInventory(updatedInventory);

        // Broadcast or save active mascot to localStorage for instant UI sync in dashboard banner
        const active = updatedInventory.find((item) => item.id === mascot.id);
        if (active) {
          localStorage.setItem("active_mascot", JSON.stringify(active));
          window.dispatchEvent(new Event("active_mascot_updated"));
        }
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

  // Pagination calculations
  const catalogTotalPages = Math.max(1, Math.ceil(catalog.length / ITEMS_PER_PAGE));
  const currentCatalog = catalog.slice(
    (catalogPage - 1) * ITEMS_PER_PAGE,
    catalogPage * ITEMS_PER_PAGE
  );

  const inventoryTotalPages = Math.max(1, Math.ceil(inventory.length / ITEMS_PER_PAGE));
  const currentInventory = inventory.slice(
    (inventoryPage - 1) * ITEMS_PER_PAGE,
    inventoryPage * ITEMS_PER_PAGE
  );

  return (
    <DashboardLayout searchPlaceholder="Cari maskot...">
      <div className="w-full max-w-4xl mx-auto px-3 sm:px-5 md:px-8 py-4 md:py-6">

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
              <h1 className="text-xl md:text-2xl font-extrabold text-white">Pilih Maskot</h1>
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
          <div className="mb-6 bg-white/10 backdrop-blur border border-white/20 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-5 text-center sm:text-left">
            <div className="relative w-20 h-20 shrink-0">
              <Image
                src={getInventoryImage(activeMascot, activeMascotIdx)}
                alt={formatMascotDisplayName(activeMascot.name, activeMascot.avatar_url)}
                fill
                className="object-contain drop-shadow-lg"
              />
            </div>
            <div>
              <p className="text-xs font-bold text-cyan-300 uppercase tracking-widest mb-0.5">Maskot Aktif</p>
              <p className="text-white font-extrabold text-lg leading-tight">
                {formatMascotDisplayName(activeMascot.name, activeMascot.avatar_url)}
              </p>
              <p className="text-slate-300 text-xs mt-1 line-clamp-2">{activeMascot.description}</p>
            </div>
          </div>
        )}

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
          <div className="rounded-3xl bg-white/10 p-4"><GridSkeleton count={8} /></div>
        ) : tab === "katalog" ? (
          <>
            {catalog.length === 0 ? (
              <div className="text-center py-16 bg-white/5 rounded-3xl border border-white/10">
                <p className="text-slate-300 font-semibold">Semua maskot katalog sudah kamu miliki!</p>
                <p className="text-slate-400 text-sm mt-1">Cek tab Inventori untuk memasang maskotmu.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {currentCatalog.map((mascot, idx) => {
                    const rarity = RARITY_CONFIG[mascot.rarity] ?? RARITY_CONFIG.common;
                    const RarityIcon = rarity.icon;
                    const isLoading = actionLoading === mascot.id;
                    const globalIdx = (catalogPage - 1) * ITEMS_PER_PAGE + idx;

                    return (
                      <div
                        key={mascot.id}
                        className={`bg-white rounded-2xl border-2 ${rarity.border} shadow-md ${rarity.glow} flex flex-col items-center p-4 gap-3 transition-all hover:shadow-lg`}
                      >
                        <div className="relative w-20 h-20">
                          <Image
                            src={getMascotImage(mascot, globalIdx)}
                            alt={formatMascotDisplayName(mascot.name, mascot.avatar_url)}
                            fill
                            className="object-contain"
                          />
                        </div>

                        <div className="text-center w-full">
                          <p className="font-extrabold text-[#00172e] text-xs leading-tight">
                            {formatMascotDisplayName(mascot.name, mascot.avatar_url)}
                          </p>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold mt-1 ${rarity.color}`}>
                            <RarityIcon className="w-3 h-3" />
                            {rarity.label}
                          </span>
                          <p className="text-[10px] text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">{mascot.description}</p>
                        </div>

                        <div className="w-full mt-auto">
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
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Catalog Pagination */}
                {catalogTotalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 bg-white/10 backdrop-blur px-4 py-3 rounded-2xl border border-white/20">
                    <button
                      onClick={() => setCatalogPage((p) => Math.max(1, p - 1))}
                      disabled={catalogPage === 1}
                      className="flex items-center gap-1 text-xs font-bold text-white disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" /> Sebelumnya
                    </button>
                    <span className="text-xs font-semibold text-slate-200">
                      Halaman {catalogPage} dari {catalogTotalPages}
                    </span>
                    <button
                      onClick={() => setCatalogPage((p) => Math.min(catalogTotalPages, p + 1))}
                      disabled={catalogPage === catalogTotalPages}
                      className="flex items-center gap-1 text-xs font-bold text-white disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                    >
                      Selanjutnya <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </>
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
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {currentInventory.map((mascot, idx) => {
                    const rarity = RARITY_CONFIG[mascot.rarity] ?? RARITY_CONFIG.common;
                    const RarityIcon = rarity.icon;
                    const isLoading = actionLoading === mascot.id;
                    const globalIdx = (inventoryPage - 1) * ITEMS_PER_PAGE + idx;

                    return (
                      <div
                        key={mascot.id}
                        className={`bg-white rounded-2xl border-2 flex flex-col items-center p-4 gap-3 transition-all hover:shadow-lg ${mascot.is_active ? "border-cyan-400 shadow-cyan-100 shadow-md ring-2 ring-cyan-300/40" : rarity.border}`}
                      >
                        <div className="relative w-20 h-20">
                          <Image
                            src={getInventoryImage(mascot, globalIdx)}
                            alt={formatMascotDisplayName(mascot.name, mascot.avatar_url)}
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
                          <p className="font-extrabold text-[#00172e] text-xs leading-tight">
                            {formatMascotDisplayName(mascot.name, mascot.avatar_url)}
                          </p>
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

                {/* Inventory Pagination */}
                {inventoryTotalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 bg-white/10 backdrop-blur px-4 py-3 rounded-2xl border border-white/20">
                    <button
                      onClick={() => setInventoryPage((p) => Math.max(1, p - 1))}
                      disabled={inventoryPage === 1}
                      className="flex items-center gap-1 text-xs font-bold text-white disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" /> Sebelumnya
                    </button>
                    <span className="text-xs font-semibold text-slate-200">
                      Halaman {inventoryPage} dari {inventoryTotalPages}
                    </span>
                    <button
                      onClick={() => setInventoryPage((p) => Math.min(inventoryTotalPages, p + 1))}
                      disabled={inventoryPage === inventoryTotalPages}
                      className="flex items-center gap-1 text-xs font-bold text-white disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                    >
                      Selanjutnya <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
