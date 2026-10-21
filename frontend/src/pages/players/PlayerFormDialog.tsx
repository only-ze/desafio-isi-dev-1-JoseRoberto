import { useState, type FormEvent } from "react";
import { createPlayer, updatePlayer } from "@/api/players";
import { FormField } from "@/components/FormField";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAction } from "@/hooks/useAction";
import type { Player, PlayerCreateInput, PlayerUpdateInput } from "@/types/api";
import { formatMoney } from "@/utils/format";
import { POSITION_LABEL, POSITIONS, type Position } from "@/utils/labels";

type NumericKey =
  | "agility" | "age"
  | "pace" | "shooting" | "passing" | "dribbling" | "defending" | "physical" | "potential";
type FieldKey = "name" | "position" | NumericKey;
type FormValues = Record<FieldKey, string>;
type FormErrors = Partial<Record<FieldKey, string>>;

interface NumericField {
  key: NumericKey;
  label: string;
  min: number;
  max: number;
}

const BASIC_FIELDS: NumericField[] = [
  { key: "agility", label: "Agilidade", min: 1, max: 100 },
  { key: "age", label: "Idade", min: 16, max: 45 },
];

const INDICATOR_FIELDS: NumericField[] = [
  { key: "pace", label: "Velocidade", min: 1, max: 99 },
  { key: "shooting", label: "Finalização", min: 1, max: 99 },
  { key: "passing", label: "Passe", min: 1, max: 99 },
  { key: "dribbling", label: "Drible", min: 1, max: 99 },
  { key: "defending", label: "Defesa", min: 1, max: 99 },
  { key: "physical", label: "Físico", min: 1, max: 99 },
  { key: "potential", label: "Potencial", min: 1, max: 99 },
];

function initialValues(player: Player | null): FormValues {
  const text = (value: number | undefined) => (value === undefined ? "" : String(value));
  return {
    name: player?.name ?? "",
    position: player?.position ?? "",
    agility: text(player?.agility),
    age: text(player?.age),
    pace: "", shooting: "", passing: "", dribbling: "", defending: "", physical: "", potential: "",
  };
}

function normalizeName(raw: string): string {
  return raw.trim().replace(/ {2,}/g, " ");
}

function validateName(raw: string): string | undefined {
  const name = normalizeName(raw);
  if (!name) return "Informe o nome.";
  if (name.length < 3 || name.length > 100) return "O nome deve ter de 3 a 100 caracteres.";
  if (/[0-9]/.test(name)) return "O nome não pode conter números.";
  if (name.split(" ").filter((word) => /\p{L}/u.test(word)).length < 2) return "Informe nome e sobrenome.";
  return undefined;
}

function validateNumber(raw: string, field: NumericField, min: number): string | undefined {
  const text = raw.trim();
  if (!text) return "Campo obrigatório.";
  if (!/^[0-9]+$/.test(text)) return "Informe um número inteiro.";
  const value = Number(text);
  if (value < min || value > field.max) return `Informe um valor de ${min} a ${field.max}.`;
  return undefined;
}

interface PlayerFormDialogProps {
  player: Player | null;
  onClose: () => void;
  onSaved: () => void;
}

export function PlayerFormDialog({ player, onClose, onSaved }: PlayerFormDialogProps) {
  const [values, setValues] = useState<FormValues>(() => initialValues(player));
  const [errors, setErrors] = useState<FormErrors>({});
  const positionLocked = player !== null && player.club_id !== null;
  const fields = player ? BASIC_FIELDS : [...BASIC_FIELDS, ...INDICATOR_FIELDS];

  const save = useAction(
    (payload: PlayerCreateInput | PlayerUpdateInput) =>
      player ? updatePlayer(player.id, payload) : createPlayer(payload as PlayerCreateInput),
    {
      successMessage: (saved) =>
        player
          ? "Jogador atualizado."
          : `Jogador cadastrado. Overall ${saved.overall}, valor base ${formatMoney(saved.base_value)}.`,
      onSuccess: () => {
        onSaved();
        onClose();
      },
    },
  );

  function setValue(key: FieldKey, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function validate(): FormErrors {
    const found: FormErrors = {};
    const nameError = validateName(values.name);
    if (nameError) found.name = nameError;
    if (!values.position) found.position = "Escolha a posição.";
    for (const field of fields) {
      const min = field.key === "age" && player ? player.age : field.min;
      const error = validateNumber(values[field.key], field, min);
      if (error) found[field.key] = error;
    }
    return found;
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const base: PlayerUpdateInput = {
      name: normalizeName(values.name),
      position: values.position as Position,
      agility: Number(values.agility),
      age: Number(values.age),
    };
    const payload: PlayerCreateInput | PlayerUpdateInput = player
      ? base
      : {
          ...base,
          pace: Number(values.pace),
          shooting: Number(values.shooting),
          passing: Number(values.passing),
          dribbling: Number(values.dribbling),
          defending: Number(values.defending),
          physical: Number(values.physical),
          potential: Number(values.potential),
        };
    void save.run(payload);
  }

  function renderNumber(field: NumericField) {
    const error = errors[field.key];
    return (
      <FormField key={field.key} id={field.key} label={field.label} error={error}>
        <Input
          id={field.key}
          type="number"
          inputMode="numeric"
          step={1}
          value={values[field.key]}
          onChange={(event) => setValue(field.key, event.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${field.key}-error` : undefined}
        />
      </FormField>
    );
  }

  return (
    <Dialog open onOpenChange={(open) => !open && !save.pending && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{player ? `Editar ${player.name}` : "Novo jogador"}</DialogTitle>
          <DialogDescription>
            {player
              ? "Edite nome, posição, agilidade e idade. Os indicadores não mudam depois do cadastro."
              : "O valor base e o overall são calculados pela API depois de salvar."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <FormField id="name" label="Nome" error={errors.name}>
            <Input
              id="name"
              value={values.name}
              onChange={(event) => setValue("name", event.target.value)}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "name-error" : undefined}
            />
          </FormField>
          <FormField
            id="position"
            label="Posição"
            error={errors.position}
            hint={positionLocked ? "Jogador com clube não muda de posição." : undefined}
          >
            <Select
              value={values.position}
              onValueChange={(next) => setValue("position", next)}
              disabled={positionLocked}
            >
              <SelectTrigger id="position" className="w-full" aria-invalid={Boolean(errors.position)}>
                <SelectValue placeholder="Escolha a posição" />
              </SelectTrigger>
              <SelectContent>
                {POSITIONS.map((position) => (
                  <SelectItem key={position} value={position}>
                    {position} · {POSITION_LABEL[position]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">{BASIC_FIELDS.map(renderNumber)}</div>
          {!player && (
            <fieldset className="space-y-3">
              <legend className="mb-2 text-sm font-medium">Indicadores (1 a 99)</legend>
              <div className="grid gap-4 sm:grid-cols-2">{INDICATOR_FIELDS.map(renderNumber)}</div>
              <p className="text-xs text-muted-foreground">
                A API confere as regras entre os campos (soma dos seis atributos, potencial e agilidade por idade) e
                devolve a mensagem em caso de recusa.
              </p>
            </fieldset>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" disabled={save.pending} onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={save.pending}>
              {save.pending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}