import { Plus, Shield } from "lucide-react";
import { useCallback, useState } from "react";
import { listClubs, type ClubSort } from "@/api/clubs";
import { DataState } from "@/components/DataState";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFetch } from "@/hooks/useFetch";
import { cn } from "@/lib/utils";
import { ClubFormDialog } from "./ClubFormDialog";
import { ClubsTable } from "./ClubsTable";

const SORT_OPTIONS: { value: ClubSort; label: string }[] = [
  { value: "name", label: "Nome" },
  { value: "net_worth_desc", label: "Patrimônio (maior para o menor)" },
  { value: "net_worth_asc", label: "Patrimônio (menor para o maior)" },
];

export function ClubsPage() {
  const [sort, setSort] = useState<ClubSort>("name");
  const [creating, setCreating] = useState(false);

  const fetchClubs = useCallback((signal: AbortSignal) => listClubs(sort, signal), [sort]);
  const clubs = useFetch(fetchClubs);
  const rows = clubs.data ?? [];

  return (
    <>
      <PageHeader
        icon={Shield}
        title="Clubes"
        description="Cada clube começa com 300,00 em caixa e sem jogadores. A liga aceita no máximo 20 clubes."
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus /> Novo clube
          </Button>
        }
      />

      <Card className="gap-0 overflow-hidden py-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
          <p className="text-sm text-muted-foreground">
            {clubs.data ? `${rows.length} de 20 clubes cadastrados` : "Clubes da liga"}
          </p>
          <Select value={sort} onValueChange={(next) => setSort(next as ClubSort)}>
            <SelectTrigger className="w-72" aria-label="Ordenar por">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  Ordenar: {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DataState
          loading={clubs.loading}
          error={clubs.error}
          empty={rows.length === 0}
          loadingLabel="Carregando clubes..."
          errorTitle="Não foi possível carregar os clubes"
          emptyIcon={Shield}
          emptyTitle="Nenhum clube cadastrado"
          emptyMessage="Crie o primeiro clube para começar."
          emptyAction={
            <Button variant="outline" size="sm" onClick={() => setCreating(true)}>
              <Plus /> Novo clube
            </Button>
          }
          onRetry={clubs.reload}
        >
          <div className={cn("transition-opacity", clubs.refreshing && "opacity-60")}>
            <ClubsTable clubs={rows} />
          </div>
        </DataState>
      </Card>
      <p className="mt-3 text-xs text-muted-foreground">
        Patrimônio é o caixa mais o valor do elenco, calculado pela API a cada consulta. No empate, vale o nome.
      </p>

      {creating && <ClubFormDialog onClose={() => setCreating(false)} onSaved={clubs.reload} />}
    </>
  );
}
