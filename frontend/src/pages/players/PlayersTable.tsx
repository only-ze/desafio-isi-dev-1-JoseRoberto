import { MoreHorizontal, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { ConditionBadge, PositionBadge } from "@/components/badges";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { Club, Player } from "@/types/api";
import { formatMoney } from "@/utils/format";
import { POSITION_LABEL } from "@/utils/labels";

interface PlayersTableProps {
  players: Player[];
  clubsById: Map<number, Club>;
  onBuy: (player: Player) => void;
  onEdit: (player: Player) => void;
  onChangeCondition: (player: Player) => void;
  onDelete: (player: Player) => void;
}

function AgilityBar({ value }: { value: number }) {
  const color = value >= 80 ? "bg-green-600" : value <= 30 ? "bg-red-500" : "bg-slate-500";
  return (
    <div className="flex items-center justify-end gap-2">
      <span className="tabular-nums">{value}</span>
      <div className="h-1.5 w-10 rounded-full bg-muted" aria-hidden>
        <div className={cn("h-full rounded-full", color)} style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
    </div>
  );
}

function ClubCell({ player, clubsById }: { player: Player; clubsById: Map<number, Club> }) {
  if (player.club_id === null) return <Badge variant="secondary">Livre</Badge>;
  const club = clubsById.get(player.club_id);
  return (
    <div className="flex items-center gap-2">
      <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{club?.acronym ?? "—"}</span>
      <Link to={`/clubs/${player.club_id}`} className="whitespace-nowrap underline-offset-4 hover:underline">
        {club?.name ?? `Clube ${player.club_id}`}
      </Link>
    </div>
  );
}

export function PlayersTable({ players, clubsById, onBuy, onEdit, onChangeCondition, onDelete }: PlayersTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Jogador</TableHead>
          <TableHead>Posição</TableHead>
          <TableHead className="text-right">Overall</TableHead>
          <TableHead className="text-right">Agilidade</TableHead>
          <TableHead className="text-right">Idade</TableHead>
          <TableHead>Condição</TableHead>
          <TableHead className="text-right">Valor base</TableHead>
          <TableHead className="text-right">Valor de mercado</TableHead>
          <TableHead>Clube</TableHead>
          <TableHead className="w-[1%]">
            <span className="sr-only">Ações</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {players.map((player) => {
          const isFree = player.club_id === null;
          return (
            <TableRow key={player.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <PlayerAvatar id={player.id} name={player.name} />
                  <div className="leading-tight">
                    <p className="font-medium whitespace-nowrap">{player.name}</p>
                    <p className="text-xs text-muted-foreground">{POSITION_LABEL[player.position]}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <PositionBadge position={player.position} />
              </TableCell>
              <TableCell className="text-right font-semibold tabular-nums">{player.overall}</TableCell>
              <TableCell>
                <AgilityBar value={player.agility} />
              </TableCell>
              <TableCell className="text-right tabular-nums">{player.age}</TableCell>
              <TableCell>
                <ConditionBadge condition={player.condition} />
              </TableCell>
              <TableCell className="text-right text-muted-foreground tabular-nums">
                {formatMoney(player.base_value)}
              </TableCell>
              <TableCell className="text-right font-semibold tabular-nums">{formatMoney(player.market_value)}</TableCell>
              <TableCell>
                <ClubCell player={player} clubsById={clubsById} />
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  {isFree && (
                    <Button variant="outline" size="sm" onClick={() => onBuy(player)}>
                      <ShoppingCart /> Comprar
                    </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label={`Ações de ${player.name}`}>
                        <MoreHorizontal />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => onEdit(player)}>Editar</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => onChangeCondition(player)}>Alterar condição</DropdownMenuItem>
                      {isFree && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive" onSelect={() => onDelete(player)}>
                            Excluir
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}