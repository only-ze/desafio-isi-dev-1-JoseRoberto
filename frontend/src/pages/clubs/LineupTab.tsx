import { useCallback } from "react";
import { getLineup } from "@/api/clubs";
import { DataState } from "@/components/DataState";
import { Card } from "@/components/ui/card";
import { useFetch } from "@/hooks/useFetch";
import type { SquadPlayer } from "@/types/api";
import { LineupEditor } from "./LineupEditor";

interface LineupTabProps {
  clubId: number;
  clubName: string;
  squad: SquadPlayer[];
}

export function LineupTab({ clubId, clubName, squad }: LineupTabProps) {
  const fetchLineup = useCallback((signal: AbortSignal) => getLineup(clubId, signal), [clubId]);
  const lineup = useFetch(fetchLineup);
  const current = lineup.data;

  if (!current) {
    return (
      <Card className="py-0">
        <DataState
          loading={lineup.loading}
          error={lineup.error}
          empty={false}
          loadingLabel="Carregando escalação..."
          errorTitle="Não foi possível carregar a escalação"
          onRetry={lineup.reload}
        >
          {null}
        </DataState>
      </Card>
    );
  }

  const editorKey = `${current.formation}-${current.players.map((player) => player.id).join(",")}`;

  return (
    <LineupEditor
      key={editorKey}
      clubId={clubId}
      clubName={clubName}
      squad={squad}
      lineup={current}
      onSaved={lineup.reload}
    />
  );
}
