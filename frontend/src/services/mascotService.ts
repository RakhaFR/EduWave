import { api } from "@/lib/axios";

export interface MascotItem {
  id: string;
  name: string;
  avatar_url: string;
  description: string;
  unlock_cost: number;
  rarity: "common" | "rare" | "epic" | "legendary";
  category: string;
  is_owned?: boolean;
}

export interface InventoryMascot extends MascotItem {
  is_active: boolean;
  accessories: Record<string, string> | null;
  unlocked_at: string;
}

export const mascotService = {
  async getCatalog() {
    const response = await api.get("/mascots");
    return response.data as {
      success: boolean;
      data: { mascots: MascotItem[]; count: number } | null;
      error: { code: string; message: string } | null;
    };
  },

  async getInventory() {
    const response = await api.get("/mascots/inventory");
    return response.data as {
      success: boolean;
      data: { mascots: InventoryMascot[]; count: number } | null;
      error: { code: string; message: string } | null;
    };
  },

  async purchase(mascotId: string) {
    const response = await api.post(`/mascots/${mascotId}/purchase`);
    return response.data as {
      success: boolean;
      data: { mascot: MascotItem; pearls_spent: number; pearls_remaining: number } | null;
      error: { code: string; message: string; details?: { required: number; available: number; shortage: number } } | null;
    };
  },

  async equip(mascotId: string) {
    const response = await api.put("/mascots/equip", { mascot_id: mascotId });
    return response.data as {
      success: boolean;
      data: { mascot_id: string; name: string; avatar_url: string; is_active: boolean } | null;
      error: { code: string; message: string } | null;
    };
  },
};
