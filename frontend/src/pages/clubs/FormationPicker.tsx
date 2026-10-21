import { cn } from "@/lib/utils";
import { FORMATIONS, type Formation } from "@/utils/labels";
import { formationSummary } from "./lineupSlots";
import { MiniPitch } from "./LineupPitch";

interface FormationPickerProps {
  value: Formation | "";
  invalid: boolean;
  onChange: (formation: Formation) => void;
}

export function FormationPicker({ value, invalid, onChange }: FormationPickerProps) {
  return (
    <div role="radiogroup" aria-label="Formação" aria-invalid={invalid} className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
      {FORMATIONS.map((formation) => {
        const selected = formation === value;
        return (
          <button
            key={formation}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(formation)}
            className={cn(
              "flex items-start gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted/50",
              selected && "border-primary bg-primary/5 ring-1 ring-primary",
              invalid && !value && "border-destructive",
            )}
          >
            <MiniPitch formation={formation} />
            <span className="space-y-0.5">
              <span className="flex items-center gap-2 font-semibold">
                <span
                  className={cn(
                    "flex size-3.5 items-center justify-center rounded-full border",
                    selected ? "border-primary" : "border-muted-foreground/50",
                  )}
                  aria-hidden
                >
                  {selected && <span className="size-2 rounded-full bg-primary" />}
                </span>
                <span className={selected ? "text-primary" : undefined}>{formation}</span>
              </span>
              <span className="block text-xs text-muted-foreground">{formationSummary(formation)}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
