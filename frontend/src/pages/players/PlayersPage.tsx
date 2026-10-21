import { Plus, Users } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { listClubs } from "@/api/clubs";
import { deletePlayer, listPlayers } from "@/api/players";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { DataState } from "@/components/DataState";
import { PageHeader } from "@/components/PageHeader";
import { PaginationBar } from "@/components/PaginationBar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAction } from "@/hooks/useAction";
import { useFetch } from "@/hooks/useFetch";
import { cn } from "@/lib/utils";
import type { Player } from "@/types/api";
import { BuyDialog } from "./BuyDialog";
import { ConditionDialog } from "./ConditionDialog";
import { PlayerFormDialog } from "./PlayerFormDialog";
import { PlayersFilters } from "./PlayersFilters";
import { PlayersTable } from "./PlayersTable";
import { INITIAL_FILTERS, SORT_OPTIONS, toQuery, type FreeTab, type PlayerFilters } from "./PlayerFilters";

type FormState = { player: Player | null } | null;

const fetchClubs = (signal: AbortSignal) => listClubs("name", signal);
const EMPTY_CLUBS: Awaited<ReturnType<typeof listClubs>> = [];

export function PlayersPage() {
  const [filters, setFilters] = useState<PlayerFilters>(INITIAL_FILTERS);
  const [resetKey, setResetKey] = useState(0);
  const [form, setForm] = useState<FormState>(null);
  const [conditionTarget, setConditionTarget] = useState<Player | null>(null);
  const [buyTarget, setBuyTarget] = useState<Player | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Player | null>(null);

  const query = useMemo(() => toQuery(filters), [filters]);
  const fetchPlayers = useCallback((signal: AbortSignal) => listPlayers(query, signal), [query]);
  const players = useFetch(fetchPlayers);
  const clubs = useFetch(fetchClubs);

  const rows = players.data?.data ?? [];
  const clubList = clubs.data ?? EMPTY_CLUBS;
  const clubsById = useMemo(() => new Map(clubList.map((club) => [club.id, club])), [clubList]);

  const updateFilters = useCallback((patch: Partial<PlayerFilters>) => {
    setFilters((current) => ({ ...current, page: 1, ...patch }));
  }, []);

  const handleSearch = useCallback((search: string) => updateFilters({ search }), [updateFilters]);

  function handleTab(tab: FreeTab) {
    updateFilters(tab === "free" ? { tab, clubId: "" } : { tab });
  }

  function clearFilters() {
    setFilters({ ...INITIAL_FILTERS, sort: filters.sort });
    setResetKey((key) => key + 1);
  }

  const remove = useAction((id: number) => deletePlayer(id), {
    successMessage: "Jogador excluído.",
    onSuccess: () => {
      setDeleteTarget(null);
      if (rows.length === 1 && filters.page > 1) {
        setFilters((current) => ({ ...current, page: current.page - 1 })); // a busca refaz sozinha
      } else {
        players.reload();
      }
    },
  });

  return (
    <>
      <PageHeader
        icon={Users}
        title="Jogadores"
        description="Cadastre jogadores, acompanhe os indicadores e compre os que estão livres."
        actions={
          <Button onClick={() => setForm({ player: null })}>
            <Plus /> Novo jogador
          </Button>
        }
      />

      <PlayersFilters
        filters={filters}
        clubs={clubList}
        resetKey={resetKey}
        onSearch={handleSearch}
        onChange={updateFilters}
        onClear={clearFilters}
      />

      <Card className="gap-0 overflow-hidden py-0">
        <div className="flex flex-wrap items-center justify-between gap-3 p-4">
          <Tabs value={filters.tab} onValueChange={(tab) => handleTab(tab as FreeTab)}>
            <TabsList>
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="free">Livres</TabsTrigger>
              <TabsTrigger value="club">Em clubes</TabsTrigger>
            </TabsList>
          </Tabs>
          <Select value={filters.sort} onValueChange={(sort) => updateFilters({ sort })}>
            <SelectTrigger className="w-57.5" aria-label="Ordenar por">
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
          loading={players.loading}
          error={players.error}
          empty={rows.length === 0}
          emptyMessage="Nenhum jogador encontrado com esses filtros."
          onRetry={players.reload}
        >
          <div className={cn("transition-opacity", players.refreshing && "opacity-60")}>
            <PlayersTable
              players={rows}
              clubsById={clubsById}
              onBuy={setBuyTarget}
              onEdit={(player) => setForm({ player })}
              onChangeCondition={setConditionTarget}
              onDelete={setDeleteTarget}
            />
            {players.data && (
              <PaginationBar
                meta={players.data.meta}
                noun="jogadores"
                onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
              />
            )}
          </div>
        </DataState>
      </Card>
      <p className="mt-3 text-xs text-muted-foreground">
        Overall e valor de mercado são calculados a cada consulta. A busca ignora maiúsculas, minúsculas e acentos.
      </p>

      {form && <PlayerFormDialog player={form.player} onClose={() => setForm(null)} onSaved={players.reload} />}
      {conditionTarget && (
        <ConditionDialog player={conditionTarget} onClose={() => setConditionTarget(null)} onSaved={players.reload} />
      )}
      {buyTarget && (
        <BuyDialog
          player={buyTarget}
          clubs={clubList}
          clubsError={clubs.error}
          onClose={() => setBuyTarget(null)}
          onBought={players.reload}
        />
      )}
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Excluir jogador"
        description={
          <>
            Excluir <strong>{deleteTarget?.name}</strong>? O jogador some da listagem, mas o histórico de transações e
            de partidas continua.
          </>
        }
        confirmLabel="Excluir"
        destructive
        pending={remove.pending}
        onConfirm={() => deleteTarget && void remove.run(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}