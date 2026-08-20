import { api } from "@/lib/axios";
import { cachedRequest, invalidateCache } from "@/lib/requestCache";

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
    return cachedRequest("mascots:catalog", async () => {
      const response = await api.get("/mascots");
      return response.data as {
      success: boolean;
      data: { mascots: MascotItem[]; count: number } | null;
      error: { code: string; message: string } | null;
      };
    });
  },

  async getInventory() {
    return cachedRequest("mascots:inventory", async () => {
      const response = await api.get("/mascots/inventory");
      return response.data as {
      success: boolean;
      data: { mascots: InventoryMascot[]; count: number } | null;
      error: { code: string; message: string } | null;
      };
    });
  },

  async purchase(mascotId: string) {
    const response = await api.post(`/mascots/${mascotId}/purchase`);
    invalidateCache("mascots:");
    return response.data as {
      success: boolean;
      data: { mascot: MascotItem; pearls_spent: number; pearls_remaining: number } | null;
      error: { code: string; message: string; details?: { required: number; available: number; shortage: number } } | null;
    };
  },

  async equip(mascotId: string, accessories: Record<string, string>) {
    const response = await api.put("/mascots/equip", { mascot_id: mascotId, accessories });
    invalidateCache("mascots:");
    return response.data as {
      success: boolean;
      data: { mascot_id: string; name: string; avatar_url: string; is_active: boolean } | null;
      error: { code: string; message: string } | null;
    };
  },
};
