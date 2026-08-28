export interface MascotInfo {
  name: string;
  avatarUrl: string;
}

const MASCOT_FIRST_NAMES: Record<string, string> = {
  "biru-muda": "Nami",
  "biru-tua": "Abyss",
  biru: "Quli",
  hijau: "Kira",
  kuning: "Sparky",
  merah: "Ignis",
  pink: "Coral",
  putih: "Luna",
};

export function getMascotFirstName(rawName?: string, avatarUrl?: string): string {
  const lowerName = (rawName || "").toLowerCase();
  const lowerAvatar = (avatarUrl || "").toLowerCase();

  // Check specific keys first ("biru-muda", "biru-tua") before "biru"
  for (const [key, name] of Object.entries(MASCOT_FIRST_NAMES)) {
    if (lowerName.includes(key) || lowerAvatar.includes(key)) {
      return name;
    }
  }

  if (rawName && !lowerName.startsWith("ubur")) {
    return rawName.split(" ")[0];
  }

  return "Quli";
}

export function formatMascotDisplayName(rawName?: string, avatarUrl?: string): string {
  if (!rawName) return "Quli 1";
  const firstName = getMascotFirstName(rawName, avatarUrl);

  // Extract level number if present (e.g. "Ubur-ubur Kuning 1" -> "1", "level 2" -> "2")
  const levelMatch = rawName.match(/(\d+)/);
  const levelStr = levelMatch ? ` ${levelMatch[1]}` : "";

  return `${firstName}${levelStr}`;
}

export function getActiveMascotInfo(): MascotInfo {
  if (typeof window === "undefined") {
    return { name: "Quli", avatarUrl: "/quli-maskot.webp" };
  }

  try {
    const raw = localStorage.getItem("active_mascot");
    if (raw) {
      const parsed = JSON.parse(raw);
      const rawName: string = parsed?.name || parsed?.mascot?.name || "";
      const avatarUrl: string = parsed?.avatar_url || parsed?.mascot?.avatar_url || "/quli-maskot.webp";
      const firstName = getMascotFirstName(rawName, avatarUrl);

      return {
        name: firstName,
        avatarUrl: avatarUrl || "/quli-maskot.webp",
      };
    }
  } catch {
    // fallback
  }

  return { name: "Quli", avatarUrl: "/quli-maskot.webp" };
}
