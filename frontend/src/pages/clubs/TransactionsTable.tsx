import { HandCoins, ShoppingCart } from "lucide-react";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { Transaction } from "@/types/api";
import { formatDateTime, formatMoney, formatSignedMoney } from "@/utils/format";
import { TRANSACTION_TYPE_LABEL } from "@/utils/labels";

function signedClass(value: number): string | undefined {
  if (value > 0) return "text-green-700";
  if (value < 0) return "text-red-700";
  return undefined;
}

function ProfitCell({ profit }: { profit: number | null }) {
  if (profit === null) return <span className="text-muted-foreground">–</span>;
  return <span className={signedClass(profit)}>{profit === 0 ? formatMoney(0) : formatSignedMoney(profit)}</span>;
}

export function TransactionsTable({ transactions }: { transactions: Transaction[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="pl-4">Data e hora</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Jogador</TableHead>
          <TableHead className="text-right">Valor</TableHead>
          <TableHead className="text-right">Taxa ou comissão</TableHead>
          <TableHead className="text-right">Multa</TableHead>
          <TableHead className="text-right">Lucro</TableHead>
          <TableHead className="pr-4 text-right">Variação do caixa</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((transaction) => {
          const TypeIcon = transaction.type === "COMPRA" ? ShoppingCart : HandCoins;
          return (
            <TableRow key={transaction.id}>
              <TableCell className="pl-4 whitespace-nowrap tabular-nums">
                {formatDateTime(transaction.created_at)}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="gap-1 font-normal">
                  <TypeIcon /> {TRANSACTION_TYPE_LABEL[transaction.type]}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <PlayerAvatar id={transaction.player_id} name={transaction.player_name} />
                  <span className="font-medium whitespace-nowrap">{transaction.player_name}</span>
                </div>
              </TableCell>
              <TableCell className="text-right tabular-nums">{formatMoney(transaction.value)}</TableCell>
              <TableCell className="text-right text-muted-foreground tabular-nums">{formatMoney(transaction.fee)}</TableCell>
              <TableCell className="text-right text-muted-foreground tabular-nums">
                {formatMoney(transaction.penalty)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                <ProfitCell profit={transaction.profit} />
              </TableCell>
              <TableCell className={cn("pr-4 text-right font-semibold tabular-nums", signedClass(transaction.cash_change))}>
                {formatSignedMoney(transaction.cash_change)}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
