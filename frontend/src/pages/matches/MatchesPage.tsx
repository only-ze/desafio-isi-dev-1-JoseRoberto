import { ChevronRight, Plus, Shield, Swords } from "lucide-react";
import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { listMatches } from "@/api/matches";
import { DataState } from "@/components/DataState";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useClubs } from "@/hooks/useClubs";
import { useFetch } from "@/hooks/useFetch";
import { cn } from "@/lib/utils";
import { MatchesTable } from "./MatchesTable";
import { MatchScoreCard } from "./MatchScoreCard";
import { NewMatchDialog } from "./NewMatchDialog";

const ALL_CLUBS = "__all__";

const fetchAllMatches = (signal: AbortSignal) => listMatches("", signal);

export function MatchesPage() {
  const navigate = useNavigate();
  const [clubId, setClubId] = useState("");
  const [creating, setCreating] = useState(false);
  const { clubs, clubsById } = useClubs();

  const fetchFiltered = useCallback((signal: AbortSignal) => listMatches(clubId, signal), [clubId]);
  const history = useFetch(fetchFiltered);
  const latest = useFetch(fetchAllMatches);

  const rows = history.data ?? [];
  const lastMatch = latest.data?.[0];
  const noMatches = latest.data !== null && latest.data.length === 0;
  const selectedClub = clubsById.get(Number(clubId));

  const newMatchButton = (variant: "default" | "outline", size: "default" | "sm") => (
    <Button variant={variant} size={size} onClick={() => setCreating(true)}>
      <Plus /> Nova partida
    </Button>
  );

  return (
    <>
      <PageHeader
        icon={Swords}
        title="Partidas"
        description="Jogue partidas entre clubes com os 5 titulares escalados e acompanhe o histórico."
        actions={noMatches ? undefined : newMatchButton("default", "default")}
      />

      {lastMatch && (
        <section className="mb-6 space-y-2">
          <p className="text-sm text-muted-foreground">Última partida</p>
          <MatchScoreCard
            match={lastMatch}
            clubsById={clubsById}
            action={
              <Button asChild variant="outline" size="sm">
                <Link to={`/matches/${lastMatch.id}`}>
                  Ver duelos <ChevronRight />
                </Link>
              </Button>
            }
          />
        </section>
      )}

      <Card className="gap-0 overflow-hidden py-0">
        {!noMatches && (
          <div className="flex flex-wrap items-start justify-between gap-3 border-b p-4">
            <div>
              <p className="font-medium">Histórico de partidas</p>
              <p className="text-xs text-muted-foreground">Da mais recente para a mais antiga.</p>
            </div>
            <Select value={clubId || ALL_CLUBS} onValueChange={(next) => setClubId(next === ALL_CLUBS ? "" : next)}>
              <SelectTrigger className="w-56 *:data-[slot=select-value]:flex-1" aria-label="Filtrar por clube">
                <Shield className="text-muted-foreground" />
                <SelectValue>Clube: {selectedClub?.name ?? "todos"}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_CLUBS}>Todos os clubes</SelectItem>
                {clubs.map((club) => (
                  <SelectItem key={club.id} value={String(club.id)}>
                    {club.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <DataState
          loading={history.loading}
          error={history.error}
          empty={rows.length === 0}
          loadingLabel="Carregando partidas..."
          errorTitle="Não foi possível carregar as partidas"
          emptyIcon={Swords}
          emptyTitle={clubId ? "Nenhuma partida desse clube" : "Nenhuma partida jogada"}
          emptyMessage={
            clubId
              ? "O clube ainda não jogou como mandante nem como visitante."
              : "Escale os 5 titulares de dois clubes e jogue a primeira partida; o resultado aparece aqui e na classificação."
          }
          emptyAction={clubId ? undefined : newMatchButton("outline", "sm")}
          onRetry={history.reload}
        >
          <div className={cn("transition-opacity", history.refreshing && "opacity-60")}>
            <MatchesTable matches={rows} clubsById={clubsById} />
            <p className="border-t px-4 py-3 text-sm text-muted-foreground">
              {rows.length} {rows.length === 1 ? "partida" : "partidas"}
            </p>
          </div>
        </DataState>
      </Card>
      <p className="mt-3 text-xs text-muted-foreground">
        {noMatches
          ? "Nenhuma partida jogada ainda. A classificação continua com todos os clubes, zerados."
          : 'Partidas da mais recente para a mais antiga, com filtro por clube. "Ver duelos" abre a partida.'}
      </p>

      {creating && (
        <NewMatchDialog
          clubs={clubs}
          onClose={() => setCreating(false)}
          onPlayed={(match) => navigate(`/matches/${match.id}`)}
        />
      )}
    </>
  );
}
