import { ArrowLeft, SearchX, Thermometer, Volleyball } from "lucide-react";
import { useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { getMatch } from "@/api/matches";
import { DataState } from "@/components/DataState";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useClubs } from "@/hooks/useClubs";
import { useFetch } from "@/hooks/useFetch";
import { DuelsTable } from "./DuelsTable";
import { MatchPitch } from "./MatchPitch";
import { MatchScoreCard } from "./MatchScoreCard";
import { teamOnPitch } from "./matchTeams";

function PitchLegend() {
  return (
    <div className="flex items-center gap-4 text-xs text-muted-foreground">
      <span className="flex items-center gap-1.5">
        <span className="flex size-4 items-center justify-center rounded-full bg-amber-600 text-white">
          <Thermometer className="size-2.5" />
        </span>
        Mal condicionado
      </span>
      <span className="flex items-center gap-1.5">
        <Volleyball className="size-4" /> Gol no duelo
      </span>
    </div>
  );
}

export function MatchDetailPage() {
  const matchId = Number(useParams().id);
  const { clubsById } = useClubs();
  const fetchMatch = useCallback((signal: AbortSignal) => getMatch(matchId, signal), [matchId]);
  const result = useFetch(fetchMatch);
  const match = result.data;

  const backLink = (
    <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
      <Link to="/matches">
        <ArrowLeft /> Voltar para partidas
      </Link>
    </Button>
  );

  if (!match) {
    return (
      <>
        {backLink}
        <Card className="py-0">
          <DataState
            loading={result.loading}
            error={result.error}
            empty={false}
            loadingLabel="Carregando partida..."
            errorTitle={result.errorStatus === 404 ? "Partida não encontrada" : "Não foi possível carregar a partida"}
            errorIcon={result.errorStatus === 404 ? SearchX : undefined}
            onRetry={result.errorStatus === 404 ? undefined : result.reload}
          >
            {null}
          </DataState>
        </Card>
      </>
    );
  }

  return (
    <>
      {backLink}
      <div className="space-y-6">
        <MatchScoreCard match={match} clubsById={clubsById} showFormations />

        <Card className="gap-0 py-0">
          <div className="flex flex-wrap items-start justify-between gap-3 p-4">
            <div>
              <p className="font-medium">Em campo</p>
              <p className="text-xs text-muted-foreground">
                Titulares de cada clube na formação da partida e os valores usados nos duelos, já com o efeito da
                condição.
              </p>
            </div>
            <PitchLegend />
          </div>
          <div className="px-4 pb-4">
            <MatchPitch home={teamOnPitch(match, "home")} away={teamOnPitch(match, "away")} />
          </div>
        </Card>

        <Card className="gap-0 overflow-hidden py-0">
          <div className="p-4">
            <p className="font-medium">Duelos</p>
            <p className="text-xs text-muted-foreground">
              Os 3 ataques do mandante e depois os 3 do visitante. Os jogadores de linha vão do 1º (o mais recuado) ao
              4º (o mais avançado), pela ordem do elenco: o 4º ataca o goleiro, o 3º ataca o 1º e o 2º ataca o 2º.
            </p>
          </div>
          <DuelsTable match={match} clubsById={clubsById} />
        </Card>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Os valores e a condição de cada titular vêm gravados nos duelos devolvidos pela API; mal condicionado joga com
        15% a menos.
      </p>
    </>
  );
}
