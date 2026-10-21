import type { QueryParams } from "@/api/http";

export const PAGE_SIZE = 10;

export type FreeTab = "all" | "free" | "club";

export interface PlayerFilters {
  search: string;
  position: string;
  condition: string;
  tab: FreeTab;
  clubId: string;
  minAge: string;
  maxAge: string;
  minValue: string;
  maxValue: string;
  sort: string;
  page: number;
}

export const INITIAL_FILTERS: PlayerFilters = {
  search: "",
  position: "",
  condition: "",
  tab: "all",
  clubId: "",
  minAge: "",
  maxAge: "",
  minValue: "",
  maxValue: "",
  sort: "name",
  page: 1,
};

export const SORT_OPTIONS = [
  { value: "name", label: "Nome" },
  { value: "value_desc", label: "Valor de mercado (maior)" },
  { value: "value_asc", label: "Valor de mercado (menor)" },
  { value: "age_asc", label: "Idade (menor)" },
  { value: "age_desc", label: "Idade (maior)" },
  { value: "position", label: "Posição" },
];

export function hasActiveFilters(filters: PlayerFilters): boolean {
  return (
    filters.search.trim() !== "" ||
    filters.position !== "" ||
    filters.condition !== "" ||
    filters.tab !== "all" ||
    filters.clubId !== "" ||
    filters.minAge !== "" ||
    filters.maxAge !== "" ||
    filters.minValue !== "" ||
    filters.maxValue !== ""
  );
}

export function toQuery(filters: PlayerFilters): QueryParams {
  const search = filters.search.trim();
  return {
    search: search.length >= 2 ? search : undefined,
    position: filters.position || undefined,
    condition: filters.condition || undefined,
    free: filters.tab === "free" ? "true" : filters.tab === "club" ? "false" : undefined,
    club_id: filters.tab === "free" ? undefined : filters.clubId || undefined,
    min_age: filters.minAge || undefined,
    max_age: filters.maxAge || undefined,
    min_value: filters.minValue || undefined,
    max_value: filters.maxValue || undefined,
    sort: filters.sort,
    page: filters.page,
    limit: PAGE_SIZE,
  };
}