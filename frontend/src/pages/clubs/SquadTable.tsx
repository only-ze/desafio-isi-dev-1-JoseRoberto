import { ConditionBadge, PositionBadge } from "@/components/badges";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { SquadPlayer } from "@/types/api";
import { formatDateTime, formatMoney } from "@/utils/format";
import { POSITION_LABEL } from "@/utils/labels";

interface SquadTableProps {
  players: SquadPlayer[];
  onSell: (player: SquadPlayer) => void;
}

export function SquadTable({ players, onSell }: SquadTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Jogador</TableHead>
          <TableHead>Posição</TableHead>
          <TableHead className="text-right">Overall</TableHead>
          <TableHead>Condição</TableHead>
          <TableHead className="text-right">Valor de mercado</TableHead>
          <TableHead>Fim da fidelidade</TableHead>
          <TableHead className="text-right">Dias restantes</TableHead>
          <TableHead className="text-right">% de multa</TableHead>
          <TableHead className="w-[1%]">
            <span className="sr-only">Ações</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {players.map((player) => (
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
              <ConditionBadge condition={player.condition} />
            </TableCell>
            <TableCell className="text-right font-semibold tabular-nums">{formatMoney(player.market_value)}</TableCell>
            <TableCell className="whitespace-nowrap tabular-nums">{formatDateTime(player.contract.loyalty_until)}</TableCell>
            <TableCell className="text-right tabular-nums">{player.contract.remaining_days}</TableCell>
            <TableCell className="text-right tabular-nums">{player.contract.penalty_rate}%</TableCell>
            <TableCell>
              <Button variant="outline" size="sm" onClick={() => onSell(player)}>
                Vender
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
