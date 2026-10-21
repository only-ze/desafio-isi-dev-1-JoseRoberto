export const POSITIONS = ["GOL", "ZAG", "LAT", "MEI", "ATA"] as const;
export type Position = (typeof POSITIONS)[number];

export const POSITION_LABEL: Record<Position, string> = {
  GOL: "Goleiro",
  ZAG: "Zagueiro",
  LAT: "Lateral",
  MEI: "Meio-campo",
  ATA: "Atacante",
};

export const CONDITIONS = ["APTO", "MAL_CONDICIONADO", "DOENTE"] as const;
export type Condition = (typeof CONDITIONS)[number];

export const CONDITION_LABEL: Record<Condition, string> = {
  APTO: "Apto",
  MAL_CONDICIONADO: "Mal condicionado",
  DOENTE: "Doente",
};

export const FORMATIONS = ["3-1", "2-2", "2-1-1", "1-2-1"] as const;
export type Formation = (typeof FORMATIONS)[number];