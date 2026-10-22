import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CONDITION_LABEL, type Condition, type ContractStatus, type Position } from "@/utils/labels";

const CONDITION_STYLE: Record<Condition, string> = {
  APTO: "border-green-200 bg-green-50 text-green-700",
  MAL_CONDICIONADO: "border-amber-200 bg-amber-50 text-amber-800",
  DOENTE: "border-red-200 bg-red-50 text-red-700",
};

const CONTRACT_STYLE: Record<ContractStatus, string> = {
  ATIVO: "border-green-200 bg-green-50 text-green-700",
  ENCERRADO: "border-border bg-muted text-muted-foreground",
  RESCINDIDO: "border-amber-200 bg-amber-50 text-amber-800",
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

export function ContractStatusBadge({ status }: { status: ContractStatus }) {
  return (
    <Badge variant="outline" className={cn("gap-1.5", CONTRACT_STYLE[status])}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {status}
    </Badge>
  );
}

export function PenaltyRateBadge({ rate }: { rate: number }) {
  return (
    <Badge
      variant="outline"
      className={rate > 0 ? "border-amber-200 bg-amber-50 text-amber-800" : "border-green-200 bg-green-50 text-green-700"}
    >
      {rate}%
    </Badge>
  );
}