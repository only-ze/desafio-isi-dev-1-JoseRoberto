import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { Transaction } from "@/types/api";
import { formatDateTime, formatMoney, formatSignedMoney } from "@/utils/format";
import { TRANSACTION_TYPE_LABEL } from "@/utils/labels";

export function TransactionsTable({ transactions }: { transactions: Transaction[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Data e hora</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Jogador</TableHead>
          <TableHead className="text-right">Valor</TableHead>
          <TableHead className="text-right">Taxa ou comissão</TableHead>
          <TableHead className="text-right">Multa</TableHead>
          <TableHead className="text-right">Lucro</TableHead>
          <TableHead className="text-right">Variação do caixa</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((transaction) => (
          <TableRow key={transaction.id}>
            <TableCell className="whitespace-nowrap tabular-nums">{formatDateTime(transaction.created_at)}</TableCell>
            <TableCell>
              <Badge variant={transaction.type === "COMPRA" ? "secondary" : "outline"}>
                {TRANSACTION_TYPE_LABEL[transaction.type]}
              </Badge>
            </TableCell>
            <TableCell className="font-medium whitespace-nowrap">{transaction.player_name}</TableCell>
            <TableCell className="text-right tabular-nums">{formatMoney(transaction.value)}</TableCell>
            <TableCell className="text-right tabular-nums">{formatMoney(transaction.fee)}</TableCell>
            <TableCell className="text-right tabular-nums">{formatMoney(transaction.penalty)}</TableCell>
            <TableCell className="text-right tabular-nums">
              {transaction.profit === null ? "—" : formatMoney(transaction.profit)}
            </TableCell>
            <TableCell
              className={cn(
                "text-right font-semibold tabular-nums",
                transaction.cash_change < 0 ? "text-red-700" : "text-green-700",
              )}
            >
              {formatSignedMoney(transaction.cash_change)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
