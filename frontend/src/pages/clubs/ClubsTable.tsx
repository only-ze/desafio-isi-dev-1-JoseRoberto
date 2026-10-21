import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { ClubCrest } from "@/components/ClubCrest";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Club } from "@/types/api";
import { formatMoney } from "@/utils/format";

export function ClubsTable({ clubs }: { clubs: Club[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Clube</TableHead>
          <TableHead>Sigla</TableHead>
          <TableHead className="text-right">Caixa</TableHead>
          <TableHead className="text-right">Valor do elenco</TableHead>
          <TableHead className="text-right">Patrimônio</TableHead>
          <TableHead className="w-[1%]">
            <span className="sr-only">Ações</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clubs.map((club) => (
          <TableRow key={club.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <ClubCrest acronym={club.acronym} />
                <Link to={`/clubs/${club.id}`} className="font-medium whitespace-nowrap hover:underline">
                  {club.name}
                </Link>
              </div>
            </TableCell>
            <TableCell className="font-mono">{club.acronym}</TableCell>
            <TableCell className="text-right tabular-nums">{formatMoney(club.cash)}</TableCell>
            <TableCell className="text-right tabular-nums">{formatMoney(club.squad_value)}</TableCell>
            <TableCell className="text-right font-semibold tabular-nums">{formatMoney(club.net_worth)}</TableCell>
            <TableCell>
              <Button asChild variant="ghost" size="sm">
                <Link to={`/clubs/${club.id}`} aria-label={`Abrir ${club.name}`}>
                  Abrir <ChevronRight />
                </Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
