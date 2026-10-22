import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface ResultItem {
  label: string;
  hint?: string;
  value: ReactNode;
  strong?: boolean;
}

export function ResultList({ items }: { items: ResultItem[] }) {
  return (
    <dl className="divide-y overflow-hidden rounded-lg border">
      {items.map(({ label, hint, value, strong }) => (
        <div
          key={label}
          className={cn("flex items-center justify-between gap-4 px-3 py-2.5 text-sm", strong && "bg-muted/50")}
        >
          <dt className={cn(strong ? "font-semibold" : !hint && "text-muted-foreground")}>
            {label}
            {hint && <span className="block text-xs font-normal text-muted-foreground">{hint}</span>}
          </dt>
          <dd className={cn("text-right tabular-nums", strong && "font-semibold")}>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
