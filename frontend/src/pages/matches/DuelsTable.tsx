import { Thermometer, Volleyball } from "lucide-react";
import { Fragment } from "react";
import { ClubTag } from "@/components/ClubTag";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Club, DuelParticipant, Match, MatchSide } from "@/types/api";
import { ATTRIBUTE_LABEL } from "@/utils/labels";
import { attackerRole, defenderRole, teamDuels } from "./matchTeams";

interface ParticipantCellProps {
  participant: DuelParticipant;
  role: string;
  clubName: string;
}

function ParticipantCell({ participant, role, clubName }: ParticipantCellProps) {
  return (
    <div className="flex items-center gap-2">
      <PlayerAvatar id={participant.player_id} name={participant.player_name} />
      <div className="leading-tight">
        <p className="flex items-center gap-1 font-medium whitespace-nowrap">
          {participant.player_name}
          {participant.condition === "MAL_CONDICIONADO" && (
            <Thermometer className="size-3.5 text-amber-600" aria-label="Mal condicionado" />
          )}
        </p>
        <p className="text-xs whitespace-nowrap text-muted-foreground">
          {role} · {clubName}
        </p>
      </div>
    </div>
  );
}

function ValueCell({ participant }: { participant: DuelParticipant }) {
  return (
    <span className="whitespace-nowrap text-muted-foreground">
      {ATTRIBUTE_LABEL[participant.attribute]}{" "}
      <span className="font-semibold text-foreground tabular-nums">{participant.value}</span>
    </span>
  );
}

interface DuelsTableProps {
  match: Match;
  clubsById: Map<number, Club>;
}

export function DuelsTable({ match, clubsById }: DuelsTableProps) {
  const groups: { side: MatchSide; opponent: MatchSide; role: string }[] = [
    { side: match.home, opponent: match.away, role: "mandante" },
    { side: match.away, opponent: match.home, role: "visitante" },
  ];

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="pl-4">Duelo</TableHead>
          <TableHead>Atacante</TableHead>
          <TableHead>Ataque</TableHead>
          <TableHead>Defensor</TableHead>
          <TableHead>Defesa</TableHead>
          <TableHead className="pr-4">Resultado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {groups.map(({ side, opponent, role }) => (
          <Fragment key={side.club_id}>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableCell colSpan={5} className="pl-4 text-xs font-medium">
                <span className="flex items-center gap-2">
                  <ClubTag acronym={clubsById.get(side.club_id)?.acronym} />
                  Ataques do {side.club_name} ({role})
                </span>
              </TableCell>
              <TableCell className="pr-4 text-right text-xs text-muted-foreground">
                {side.goals} {side.goals === 1 ? "gol" : "gols"}
              </TableCell>
            </TableRow>
            {teamDuels(match, side.club_id).attacks.map((duel, index) => (
              <TableRow key={duel.order}>
                <TableCell className="pl-4 tabular-nums">{duel.order}</TableCell>
                <TableCell>
                  <ParticipantCell
                    participant={duel.attacker}
                    role={`${duel.attacker.position}, ${attackerRole(index)}`}
                    clubName={side.club_name}
                  />
                </TableCell>
                <TableCell>
                  <ValueCell participant={duel.attacker} />
                </TableCell>
                <TableCell>
                  <ParticipantCell
                    participant={duel.defender}
                    role={index === 0 ? defenderRole(index) : `${duel.defender.position}, ${defenderRole(index)}`}
                    clubName={opponent.club_name}
                  />
                </TableCell>
                <TableCell>
                  <ValueCell participant={duel.defender} />
                </TableCell>
                <TableCell className="pr-4">
                  {duel.goal ? (
                    <Badge variant="outline" className="gap-1 border-green-200 bg-green-50 text-green-700">
                      <Volleyball /> Gol
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="font-normal">
                      Sem gol
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </Fragment>
        ))}
      </TableBody>
    </Table>
  );
}
