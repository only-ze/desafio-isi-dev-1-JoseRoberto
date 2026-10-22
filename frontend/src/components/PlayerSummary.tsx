import { PlayerAvatar } from "@/components/PlayerAvatar";
import type { Player } from "@/types/api";
import { formatMoney } from "@/utils/format";
import { POSITION_LABEL } from "@/utils/labels";

export function PlayerSummary({ player }: { player: Player }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-muted/40 p-3">
      <PlayerAvatar id={player.id} name={player.name} />
      <div className="flex-1 leading-tight">
        <p className="text-sm font-medium">{player.name}</p>
        <p className="text-xs text-muted-foreground">
          {player.position} · {POSITION_LABEL[player.position]} · {player.age} anos
        </p>
      </div>
      <div className="text-right leading-tight">
        <p className="text-xs text-muted-foreground">Valor de mercado</p>
        <p className="text-lg font-semibold tabular-nums">{formatMoney(player.market_value)}</p>
      </div>
    </div>
  );
}
