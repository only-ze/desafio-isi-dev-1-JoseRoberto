import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CONDITION_LABEL, type Condition, type Position } from "@/utils/labels";

const CONDITION_STYLE: Record<Condition, string> = {
  APTO: "border-green-200 bg-green-50 text-green-700",
  MAL_CONDICIONADO: "border-amber-200 bg-amber-50 text-amber-800",
  DOENTE: "border-red-200 bg-red-50 text-red-700",
};

export function PositionBadge({ position }: { position: Position }) {
  return (
    <Badge variant="outline" className="font-mono">
      {position}
    </Badge>
  );
}

export function ConditionBadge({ condition }: { condition: Condition }) {
  return (
    <Badge variant="outline" className={cn("gap-1.5", CONDITION_STYLE[condition])}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {CONDITION_LABEL[condition]}
    </Badge>
  );
}