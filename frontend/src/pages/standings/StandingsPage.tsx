import { ArrowRight, ListOrdered, Plus } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getStandings, listMatches } from "@/api/matches";
import { ClubLink } from "@/components/ClubTag";
import { DataState } from "@/components/DataState";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useClubs } from "@/hooks/useClubs";
import { useFetch } from "@/hooks/useFetch";
import { cn } from "@/lib/utils";
import type { Club, MatchSummary, Standing } from "@/types/api";
import { formatDateTime } from "@/utils/format";
import { NewMatchDialog } from "../matches/NewMatchDialog";

const RECENT_MATCHES = 3;

const STAT_COLUMNS: { key: keyof Standing; label: string }[] = [
  { key: "played", label: "J" },
  { key: "wins", label: "V" },
  { key: "draws", label: "E" },
  { key: "losses", label: "D" },
  { key: "goals_for", label: "GP" },
  { key: "goals_against", label: "GC" },
];

const TIEBREAKERS = ["Mais pontos", "Maior saldo de gols", "Mais gols marcados", "Nome do clube, de A a Z"];

const fetchStandings = (signal: AbortSignal) => getStandings(signal);
const fetchMatches = (signal: AbortSignal) => listMatches("", signal);

function formatGoalDifference(value: number): string {
  return value > 0 ? `+${value}` : String(value);
}

function StandingsTable({ standings, clubsById }: { standings: Standing[]; clubsById: Map<number, Club> }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12 pl-4 text-center">#</TableHead>
          <TableHead>Clube</TableHead>
          {STAT_COLUMNS.map(({ key, label }) => (
            <TableHead key={key} className="text-center">
              {label}
            </TableHead>
          ))}
          <TableHead className="text-center">SG</TableHead>
          <TableHead className="pr-4 text-center">Pts</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {standings.map((standing) => (
          <TableRow key={standing.club_id}>
            <TableCell className="pl-4 text-center">
              <span
                className={cn(
                  "inline-flex size-6 items-center justify-center rounded-md text-xs font-semibold tabular-nums",
                  standing.position === 1 ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                )}
              >
                {standing.position}
              </span>
            </TableCell>
            <TableCell>
              <ClubLink
                clubId={standing.club_id}
                name={standing.club_name}
                acronym={clubsById.get(standing.club_id)?.acronym}
              />
            </TableCell>
            {STAT_COLUMNS.map(({ key }) => (
              <TableCell key={key} className="text-center tabular-nums">
                {standing[key]}
              </TableCell>
            ))}
            <TableCell className="text-center tabular-nums">{formatGoalDifference(standing.goal_difference)}</TableCell>
            <TableCell className="pr-4 text-center font-semibold tabular-nums">{standing.points}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function RecentMatches({ matches }: { matches: MatchSummary[] }) {
  return (
    <Card className="gap-0 py-0">
      <div className="border-b p-4">
        <p className="font-medium">Últimas partidas</p>
        <p className="text-xs text-muted-foreground">Da mais recente para a mais antiga.</p>
      </div>
      {matches.length === 0 ? (
        <p className="p-4 text-sm text-muted-foreground">Nenhuma partida jogada ainda.</p>
      ) : (
        <ul className="space-y-3 p-4">
          {matches.slice(0, RECENT_MATCHES).map((match) => (
            <li key={match.id} className="text-sm">
              <p className="text-xs text-muted-foreground tabular-nums">{formatDateTime(match.played_at)}</p>
              <Link to={`/matches/${match.id}`} className="flex flex-wrap items-center gap-2 hover:underline">
                <span className={cn(match.result === "MANDANTE" && "font-semibold")}>{match.home.club_name}</span>
                <span className="rounded-md border px-1.5 text-xs font-semibold tabular-nums">
                  {match.home.goals} × {match.away.goals}
                </span>
                <span className={cn(match.result === "VISITANTE" && "font-semibold")}>{match.away.club_name}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <div className="px-4 pb-4">
        <Button asChild variant="link" size="sm" className="h-auto px-0">
          <Link to="/matches">
            Ver todas as partidas <ArrowRight />
          </Link>
        </Button>
      </div>
    </Card>
  );
}

function TiebreakerCard() {
  return (
    <Card className="gap-0 py-0">
      <div className="border-b p-4">
        <p className="font-medium">Ordem da tabela</p>
        <p className="text-xs text-muted-foreground">Critérios de classificação, nesta ordem.</p>
      </div>
      <ol className="space-y-2 p-4 text-sm">
        {TIEBREAKERS.map((criterion, index) => (
          <li key={criterion} className="flex items-center gap-2">
            <span className="flex size-5 items-center justify-center rounded-md bg-muted text-xs tabular-nums">
              {index + 1}
            </span>
            {criterion}
          </li>
        ))}
      </ol>
    </Card>
  );
}

export function StandingsPage() {
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const { clubs, clubsById } = useClubs();
  const standings = useFetch(fetchStandings);
  const matches = useFetch(fetchMatches);
  const rows = standings.data ?? [];

  return (
    <>
      <PageHeader
        icon={ListOrdered}
        title="Classificação"
        description="Todos os clubes, com 3 pontos por vitória e 1 por empate."
        actions={
          <Button variant="outline" onClick={() => setCreating(true)}>
            <Plus /> Nova partida
          </Button>
        }
      />

      <div className="grid items-start gap-4 lg:grid-cols-[1fr_300px]">
        <div>
          <Card className="gap-0 overflow-hidden py-0">
            <DataState
              loading={standings.loading}
              error={standings.error}
              empty={rows.length === 0}
              emptyIcon={ListOrdered}
              emptyTitle="Nenhum clube na liga"
              emptyMessage="A classificação lista todos os clubes, inclusive os que ainda não jogaram."
              onRetry={standings.reload}
            >
              <div className={cn("transition-opacity", standings.refreshing && "opacity-60")}>
                <StandingsTable standings={rows} clubsById={clubsById} />
                <p className="border-t px-4 py-3 text-xs text-muted-foreground">
                  J: jogos · V: vitórias · E: empates · D: derrotas · GP: gols marcados · GC: gols sofridos · SG: saldo de
                  gols · Pts: pontos
                </p>
              </div>
            </DataState>
          </Card>
          <p className="mt-3 text-xs text-muted-foreground">
            Na ordem devolvida pela API, com os clubes sem partidas zerados. Pontos, saldo e posição são calculados a cada
            consulta.
          </p>
        </div>
        <div className="space-y-4">
          <RecentMatches matches={matches.data ?? []} />
          <TiebreakerCard />
        </div>
      </div>

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
