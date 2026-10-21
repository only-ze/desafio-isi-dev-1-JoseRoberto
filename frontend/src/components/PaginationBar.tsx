import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PageMeta } from "@/types/api";

interface PaginationBarProps {
  meta: PageMeta;
  noun: string;
  onPageChange: (page: number) => void;
}

function visiblePages(current: number, total: number): (number | "gap")[] {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  const wanted = [1, total, current - 1, current, current + 1].filter((page) => page >= 1 && page <= total);
  const sorted = [...new Set(wanted)].sort((a, b) => a - b);
  const result: (number | "gap")[] = [];
  sorted.forEach((page, index) => {
    const previous = sorted[index - 1];
    if (previous !== undefined && page - previous > 1) result.push("gap");
    result.push(page);
  });
  return result;
}

export function PaginationBar({ meta, noun, onPageChange }: PaginationBarProps) {
  if (meta.total_items === 0) return null;

  const from = (meta.page - 1) * meta.limit + 1;
  const to = Math.min(meta.page * meta.limit, meta.total_items);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3">
      <p className="text-sm text-muted-foreground">
        Mostrando {from}–{to} de {meta.total_items} {noun}
      </p>
      <nav aria-label="Paginação" className="flex items-center gap-1">
        <Button variant="ghost" size="sm" disabled={meta.page <= 1} onClick={() => onPageChange(meta.page - 1)}>
          <ChevronLeft /> Anterior
        </Button>
        {visiblePages(meta.page, meta.total_pages).map((page, index) =>
          page === "gap" ? (
            <span key={`gap-${index}`} className="px-1 text-muted-foreground">
              …
            </span>
          ) : (
            <Button
              key={page}
              size="icon"
              variant={page === meta.page ? "outline" : "ghost"}
              aria-current={page === meta.page ? "page" : undefined}
              onClick={() => onPageChange(page)}
            >
              {page}
            </Button>
          ),
        )}
        <Button
          variant="ghost"
          size="sm"
          disabled={meta.page >= meta.total_pages}
          onClick={() => onPageChange(meta.page + 1)}
        >
          Próxima <ChevronRight />
        </Button>
      </nav>
    </div>
  );
}