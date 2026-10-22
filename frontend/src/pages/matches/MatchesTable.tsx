import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { ClubTag } from "@/components/ClubTag";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { Club, MatchSummary } from "@/types/api";
import { formatDateTime } from "@/utils/format";
import { MATCH_RESULT_LABEL } from "@/utils/labels";

interface MatchesTableProps {
  matches: MatchSummary[];
  clubsById: Map<number, Club>;
}

export function MatchesTable({ matches, clubsById }: MatchesTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="pl-4">Data e hora</TableHead>
          <TableHead className="text-right">Mandante</TableHead>
          <TableHead className="text-center">Placar</TableHead>
          <TableHead>Visitante</TableHead>
          <TableHead>Resultado</TableHead>
          <TableHead className="w-[1%]">
            <span className="sr-only">Ações</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {matches.map((match) => (
          <TableRow key={match.id}>
            <TableCell className="pl-4 whitespace-nowrap tabular-nums">{formatDateTime(match.played_at)}</TableCell>
            <TableCell>
              <div className="flex items-center justify-end gap-2">
                <span className={cn("whitespace-nowrap", match.result === "MANDANTE" && "font-semibold")}>
                  {match.home.club_name}
                </span>
                <ClubTag acronym={clubsById.get(match.home.club_id)?.acronym} />
              </div>
            </TableCell>
            <TableCell className="text-center">
              <span className="rounded-md border px-2 py-0.5 font-semibold tabular-nums">
                {match.home.goals} × {match.away.goals}
              </span>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <ClubTag acronym={clubsById.get(match.away.club_id)?.acronym} />
                <span className={cn("whitespace-nowrap", match.result === "VISITANTE" && "font-semibold")}>
                  {match.away.club_name}
                </span>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline" className="font-normal">
                {MATCH_RESULT_LABEL[match.result]}
              </Badge>
            </TableCell>
            <TableCell>
              <Button asChild variant="ghost" size="sm">
                <Link to={`/matches/${match.id}`}>
                  Ver duelos <ChevronRight />
                </Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
