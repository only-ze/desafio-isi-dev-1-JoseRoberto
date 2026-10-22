import type { Formation } from "@/utils/labels";

export type Sector = "goal" | "defense" | "midfield" | "attack";
export type LineSector = Exclude<Sector, "goal">;

export const LINE_SECTORS: readonly LineSector[] = ["defense", "midfield", "attack"];

export const SECTOR_COUNTS: Record<Formation, Record<LineSector, number>> = {
  "3-1": { defense: 3, midfield: 0, attack: 1 },
  "2-2": { defense: 2, midfield: 0, attack: 2 },
  "2-1-1": { defense: 2, midfield: 1, attack: 1 },
  "1-2-1": { defense: 1, midfield: 2, attack: 1 },
};

export function sectorRows(formation: Formation): { sector: Sector; count: number }[] {
  const counts = SECTOR_COUNTS[formation];
  return [
    { sector: "goal", count: 1 },
    ...LINE_SECTORS.filter((sector) => counts[sector] > 0).map((sector) => ({ sector, count: counts[sector] })),
  ];
}
