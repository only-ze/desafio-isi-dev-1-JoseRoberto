export interface ResultItem {
  label: string;
  value: string;
  strong?: boolean;
}

export function ResultList({ items }: { items: ResultItem[] }) {
  return (
    <dl className="divide-y">
      {items.map(({ label, value, strong }) => (
        <div key={label} className="flex justify-between gap-4 py-1.5 text-sm">
          <dt className="text-muted-foreground">{label}</dt>
          <dd className={strong ? "font-semibold tabular-nums" : "tabular-nums"}>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
