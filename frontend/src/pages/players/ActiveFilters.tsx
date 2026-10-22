import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Club } from "@/types/api";
import { CONDITION_LABEL, POSITION_LABEL, type Condition, type Position } from "@/utils/labels";
import { hasActiveFilters, type PlayerFilters } from "./PlayerFilters";

interface Chip {
  key: string;
  label: string;
  clear: Partial<PlayerFilters>;
}

function rangeText(min: string, max: string): string {
  return `${min || "…"} a ${max || "…"}`.replaceAll(".", ",");
}

function chipsFor(filters: PlayerFilters, clubs: Club[]): Chip[] {
  const chips: Chip[] = [];
  const search = filters.search.trim();
  if (search) chips.push({ key: "search", label: `Busca: ${search}`, clear: { search: "" } });
  if (filters.position) {
    chips.push({
      key: "position",
      label: `Posição: ${POSITION_LABEL[filters.position as Position]}`,
      clear: { position: "" },
    });
  }
  if (filters.condition) {
    chips.push({
      key: "condition",
      label: `Condição: ${CONDITION_LABEL[filters.condition as Condition]}`,
      clear: { condition: "" },
    });
  }
  if (filters.clubId) {
    const club = clubs.find((item) => String(item.id) === filters.clubId);
    chips.push({ key: "club", label: `Clube: ${club?.name ?? filters.clubId}`, clear: { clubId: "" } });
  }
  if (filters.minAge || filters.maxAge) {
    chips.push({ key: "age", label: `Idade: ${rangeText(filters.minAge, filters.maxAge)}`, clear: { minAge: "", maxAge: "" } });
  }
  if (filters.minValue || filters.maxValue) {
    chips.push({
      key: "value",
      label: `Valor de mercado: ${rangeText(filters.minValue, filters.maxValue)}`,
      clear: { minValue: "", maxValue: "" },
    });
  }
  return chips;
}

interface ActiveFiltersProps {
  filters: PlayerFilters;
  clubs: Club[];
  onRemove: (patch: Partial<PlayerFilters>) => void;
  onClear: () => void;
}

export function ActiveFilters({ filters, clubs, onRemove, onClear }: ActiveFiltersProps) {
  if (!hasActiveFilters(filters)) return null;
  const chips = chipsFor(filters, clubs);

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
      {chips.length > 0 && <span className="text-muted-foreground">Filtros ativos:</span>}
      {chips.map((chip) => (
        <span key={chip.key} className="inline-flex items-center gap-1 rounded-md border bg-card py-0.5 pr-1 pl-2 text-xs">
          {chip.label}
          <button
            type="button"
            className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label={`Remover filtro ${chip.label}`}
            onClick={() => onRemove(chip.clear)}
          >
            <X className="size-3" />
          </button>
        </span>
      ))}
      <Button variant="link" size="sm" className="h-auto px-1" onClick={onClear}>
        Limpar filtros
      </Button>
    </div>
  );
}
