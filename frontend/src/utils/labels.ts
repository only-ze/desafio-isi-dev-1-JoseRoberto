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

export const TRANSACTION_TYPES = ["COMPRA", "VENDA"] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export const TRANSACTION_TYPE_LABEL: Record<TransactionType, string> = {
  COMPRA: "Compra",
  VENDA: "Venda",
};

export const FORMATIONS =["3-1", "2-2", "2-1-1", "1-2-1"] as const;
export type Formation = (typeof FORMATIONS)[number];