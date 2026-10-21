import type { Player } from "@/types/api";
import type { Formation, Position } from "@/utils/labels";

export type Sector = "goal" | "defense" | "midfield" | "attack";

export interface LineupSlot {
  key: string;
  sector: Sector;
  label: string;
  positionsLabel: string;
  positions: Position[];
}

export type SlotSelection = Record<string, string>;

type Attribute = "shooting" | "passing" | "dribbling" | "defending";

export const ATTRIBUTE_LABEL: Record<Attribute, string> = {
  shooting: "Finalização",
  passing: "Passe",
  dribbling: "Drible",
  defending: "Defesa",
};

const ATTACK_ATTRIBUTE: Record<Position, Attribute> = {
  GOL: "defending",
  ZAG: "dribbling",
  LAT: "dribbling",
  MEI: "passing",
  ATA: "shooting",
};

const SECTOR_COUNTS: Record<Formation, Record<Exclude<Sector, "goal">, number>> = {
  "3-1": { defense: 3, midfield: 0, attack: 1 },
  "2-2": { defense: 2, midfield: 0, attack: 2 },
  "2-1-1": { defense: 2, midfield: 1, attack: 1 },
  "1-2-1": { defense: 1, midfield: 2, attack: 1 },
};

const SECTOR_SLOT: Record<Sector, Omit<LineupSlot, "key" | "sector">> = {
  goal: { label: "Goleiro", positionsLabel: "GOL", positions: ["GOL"] },
  defense: { label: "Defesa", positionsLabel: "ZAG ou LAT", positions: ["ZAG", "LAT"] },
  midfield: { label: "Meio", positionsLabel: "MEI", positions: ["MEI"] },
  attack: { label: "Ataque", positionsLabel: "ATA", positions: ["ATA"] },
};

const LINE_SECTORS = ["defense", "midfield", "attack"] as const;

export function formationSummary(formation: Formation): string {
  const counts = SECTOR_COUNTS[formation];
  const text = LINE_SECTORS.filter((sector) => counts[sector] > 0)
    .map((sector) => `${SECTOR_SLOT[sector].label.toLowerCase()} ${counts[sector]}`)
    .join(", ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function sectorRows(formation: Formation): { sector: Sector; count: number }[] {
  const counts = SECTOR_COUNTS[formation];
  return [
    { sector: "goal", count: 1 },
    ...LINE_SECTORS.filter((sector) => counts[sector] > 0).map((sector) => ({ sector, count: counts[sector] })),
  ];
}

export function slotsFor(formation: Formation): LineupSlot[] {
  return sectorRows(formation).flatMap(({ sector, count }) =>
    Array.from({ length: count }, (_, index) => ({ key: `${sector}-${index}`, sector, ...SECTOR_SLOT[sector] })),
  );
}

export function assignSlots(formation: Formation, players: Player[]): SlotSelection {
  const selection: SlotSelection = {};
  const used = new Set<number>();
  for (const slot of slotsFor(formation)) {
    const match = players.find((player) => !used.has(player.id) && slot.positions.includes(player.position));
    if (match) {
      used.add(match.id);
      selection[slot.key] = String(match.id);
    }
  }
  return selection;
}

export function usedAttributes(player: Player, lineNumber: number | null): { label: string; value: number }[] {
  const attack = ATTACK_ATTRIBUTE[player.position];
  const attributes: Attribute[] =
    lineNumber === null || lineNumber === 1 ? ["defending"] : lineNumber === 2 ? [attack, "defending"] : [attack];
  return attributes.map((attribute) => ({ label: ATTRIBUTE_LABEL[attribute], value: player[attribute] }));
}
