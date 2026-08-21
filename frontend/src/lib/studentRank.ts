const RANKS = [
  [1, "Penyelam Pemula"],
  [5, "Penyelam Karang"],
  [10, "Penyelam Pesisir"],
  [20, "Penyelam Laut Dangkal"],
  [35, "Penyelam Terumbu"],
  [50, "Penyelam Samudra"],
  [75, "Penjelajah Palung"],
  [100, "Penjaga Terumbu"],
  [150, "Penjelajah Arus"],
  [200, "Ahli Oseanografi"],
  [300, "Kapten Samudra"],
  [400, "Penguasa Gelombang"],
  [500, "Legenda Laut"],
  [666, "Mitos Samudra"],
  [750, "Penguasa Palung"],
  [850, "Penjaga Samudra"],
  [950, "Legenda EduWave"],
  [1000, "Master Samudra"],
] as const;

export function getStudentRank(level?: number | null) {
  const currentLevel = Math.min(1000, Math.max(1, level ?? 1));
  let rank: string = RANKS[0][1];
  for (const [minimum, title] of RANKS) {
    if (currentLevel >= minimum) rank = title;
    else break;
  }
  return rank;
}
