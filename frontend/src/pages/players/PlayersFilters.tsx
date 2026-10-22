import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { FormField } from "@/components/FormField";
import { SearchInput } from "@/components/SearchInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Club } from "@/types/api";
import { CONDITION_LABEL, CONDITIONS, POSITION_LABEL, POSITIONS } from "@/utils/labels";

import type { PlayerFilters } from "./PlayerFilters";

const ALL = "__all__";

interface Option {
  value: string;
  label: string;
}

interface FilterSelectProps {
  label: string;
  allLabel: string;
  value: string;
  options: Option[];
  disabled?: boolean;
  title?: string;
  onChange: (value: string) => void;
}

function FilterSelect({ label, allLabel, value, options, disabled, title, onChange }: FilterSelectProps) {
  return (
    <Select value={value || ALL} onValueChange={(next) => onChange(next === ALL ? "" : next)} disabled={disabled}>
      <SelectTrigger className="w-42.5" aria-label={label} title={title}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{allLabel}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

type RangeKind = "age" | "value";

function parseBound(raw: string, kind: RangeKind): { value: string; error?: string } {
  const text = raw.trim().replace(",", ".");
  if (!text) return { value: "" };
  if (kind === "age") {
    if (!/^[1-9][0-9]*$/.test(text)) return { value: text, error: "Informe um número inteiro." };
    const age = Number(text);
    if (age < 16 || age > 45) return { value: text, error: "Use de 16 a 45." };
    return { value: text };
  }
  if (!/^(0|[1-9][0-9]*)(\.[0-9]{1,2})?$/.test(text)) {
    return { value: text, error: "Use um número com até 2 casas decimais." };
  }
  if (Number(text) > 550) return { value: text, error: "Use de 0 a 550." };
  return { value: text };
}

interface RangeFormProps {
  kind: RangeKind;
  initialMin: string;
  initialMax: string;
  onApply: (min: string, max: string) => void;
  onClear: () => void;
}

function RangeForm({ kind, initialMin, initialMax, onApply, onClear }: RangeFormProps) {
  const [min, setMin] = useState(initialMin);
  const [max, setMax] = useState(initialMax);
  const [errors, setErrors] = useState<{ min?: string; max?: string }>({});

  function apply() {
    const parsedMin = parseBound(min, kind);
    const parsedMax = parseBound(max, kind);
    const found = { min: parsedMin.error, max: parsedMax.error };
    if (!found.min && !found.max && parsedMin.value && parsedMax.value) {
      if (Number(parsedMin.value) > Number(parsedMax.value)) found.max = "O máximo não pode ser menor que o mínimo.";
    }
    setErrors(found);
    if (found.min || found.max) return;
    onApply(parsedMin.value, parsedMax.value);
  }

  return (
    <div className="space-y-3">
      <FormField id={`${kind}-min`} label="Mínimo" error={errors.min}>
        <Input id={`${kind}-min`} inputMode="decimal" value={min} onChange={(event) => setMin(event.target.value)} />
      </FormField>
      <FormField id={`${kind}-max`} label="Máximo" error={errors.max}>
        <Input id={`${kind}-max`} inputMode="decimal" value={max} onChange={(event) => setMax(event.target.value)} />
      </FormField>
      <div className="flex justify-between gap-2">
        <Button variant="ghost" size="sm" onClick={onClear}>
          Limpar
        </Button>
        <Button size="sm" onClick={apply}>
          Aplicar
        </Button>
      </div>
    </div>
  );
}

interface RangeFilterProps {
  label: string;
  kind: RangeKind;
  min: string;
  max: string;
  onApply: (min: string, max: string) => void;
}

function RangeFilter({ label, kind, min, max, onApply }: RangeFilterProps) {
  const [open, setOpen] = useState(false);
  const active = min !== "" || max !== "";
  const text = active ? `${label}: ${min || "…"} a ${max || "…"}`.replaceAll(".", ",") : label;

  function finish(nextMin: string, nextMax: string) {
    onApply(nextMin, nextMax);
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="justify-between gap-2 font-normal">
          {text}
          <ChevronDown className="size-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64">
        <RangeForm
          kind={kind}
          initialMin={min}
          initialMax={max}
          onApply={finish}
          onClear={() => finish("", "")}
        />
      </PopoverContent>
    </Popover>
  );
}

interface PlayersFiltersProps {
  filters: PlayerFilters;
  clubs: Club[];
  resetKey: number;
  onSearch: (text: string) => void;
  onChange: (patch: Partial<PlayerFilters>) => void;
}

const POSITION_OPTIONS = POSITIONS.map((value) => ({ value, label: POSITION_LABEL[value] }));
const CONDITION_OPTIONS = CONDITIONS.map((value) => ({ value, label: CONDITION_LABEL[value] }));

export function PlayersFilters({ filters, clubs, resetKey, onSearch, onChange }: PlayersFiltersProps) {
  const clubOptions = clubs.map((club) => ({ value: String(club.id), label: club.name }));
  const onlyFree = filters.tab === "free";

  return (
    <div className="mb-4 flex flex-wrap items-start gap-2 rounded-xl border bg-card p-2">
      <SearchInput key={resetKey} value={filters.search} placeholder="Buscar por nome" onSearch={onSearch} />
      <FilterSelect
        label="Posição"
        allLabel="Todas as posições"
        value={filters.position}
        options={POSITION_OPTIONS}
        onChange={(position) => onChange({ position })}
      />
      <FilterSelect
        label="Condição"
        allLabel="Todas as condições"
        value={filters.condition}
        options={CONDITION_OPTIONS}
        onChange={(condition) => onChange({ condition })}
      />
      <FilterSelect
        label="Clube"
        allLabel="Todos os clubes"
        value={filters.clubId}
        options={clubOptions}
        disabled={onlyFree}
        title={onlyFree ? "Jogadores livres não têm clube" : undefined}
        onChange={(clubId) => onChange({ clubId })}
      />
      <RangeFilter
        label="Idade"
        kind="age"
        min={filters.minAge}
        max={filters.maxAge}
        onApply={(minAge, maxAge) => onChange({ minAge, maxAge })}
      />
      <RangeFilter
        label="Valor de mercado"
        kind="value"
        min={filters.minValue}
        max={filters.maxValue}
        onApply={(minValue, maxValue) => onChange({ minValue, maxValue })}
      />
    </div>
  );
}