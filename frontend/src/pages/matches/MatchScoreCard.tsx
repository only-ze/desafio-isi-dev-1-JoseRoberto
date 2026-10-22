import type { ReactNode } from "react";
import { ClubCrest } from "@/components/ClubCrest";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Club, MatchSide, MatchSummary } from "@/types/api";
import { formatDateTime } from "@/utils/format";
import { MATCH_RESULT_LABEL } from "@/utils/labels";

interface TeamProps {
  side: MatchSide;
  role: string;
  acronym: string | undefined;
  showFormation: boolean;
  reverse?: boolean;
}

function Team({ side, role, acronym, showFormation, reverse = false }: TeamProps) {
  return (
    <div className={cn("flex items-center gap-3", reverse ? "flex-row-reverse text-left" : "text-right")}>
      <div className="leading-tight">
        <p className="font-semibold">{side.club_name}</p>
        <p className="text-xs text-muted-foreground">
          {role}
          {showFormation && ` · ${side.formation}`}
        </p>
      </div>
      <ClubCrest acronym={acronym ?? "—"} />
    </div>
  );
}

interface MatchScoreCardProps {
  match: MatchSummary;
  clubsById: Map<number, Club>;
  showFormations?: boolean;
  action?: ReactNode;
}

export function MatchScoreCard({ match, clubsById, showFormations = false, action }: MatchScoreCardProps) {
  return (
    <Card className="flex-row flex-wrap items-center gap-4 px-5 py-4">
      <div className="hidden flex-1 md:block" />
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Team
          side={match.home}
          role="Mandante"
          acronym={clubsById.get(match.home.club_id)?.acronym}
          showFormation={showFormations}
        />
        <div className="flex flex-col items-center gap-1">
          <span className="rounded-md border px-3 py-0.5 text-xl font-semibold tabular-nums">
            {match.home.goals} × {match.away.goals}
          </span>
          <span className="text-xs text-muted-foreground tabular-nums">{formatDateTime(match.played_at)}</span>
          <Badge variant="outline" className="font-normal">
            {MATCH_RESULT_LABEL[match.result]}
          </Badge>
        </div>
        <Team
          side={match.away}
          role="Visitante"
          acronym={clubsById.get(match.away.club_id)?.acronym}
          showFormation={showFormations}
          reverse
        />
      </div>
      <div className="flex flex-1 justify-end">{action}</div>
    </Card>
  );
}
