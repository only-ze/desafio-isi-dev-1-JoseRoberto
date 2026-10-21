import { Download } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import type { QueryParams } from "@/api/http";
import { exportTransactions, listTransactions } from "@/api/market";
import { DataState } from "@/components/DataState";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAction } from "@/hooks/useAction";
import { useFetch } from "@/hooks/useFetch";
import { cn } from "@/lib/utils";
import type { ClubDetail, Transaction, TransactionSummary } from "@/types/api";
import { saveBlob } from "@/utils/download";
import { formatMoney } from "@/utils/format";
import { TRANSACTION_TYPE_LABEL, TRANSACTION_TYPES, type TransactionType } from "@/utils/labels";
import { TransactionsTable } from "./TransactionsTable";

const ALL_PLAYERS = "__all__";

function playerOptions(transactions: Transaction[]): { id: number; name: string }[] {
  const names = new Map<number, string>();
  for (const transaction of transactions) {
    if (!names.has(transaction.player_id)) names.set(transaction.player_id, transaction.player_name);
  }
  return [...names].map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}

function SummaryBar({ summary }: { summary: TransactionSummary }) {
  const items = [
    { label: "Total pago em compras", value: summary.total_spent },
    { label: "Total recebido em vendas", value: summary.total_received },
    { label: "Taxas e comissões", value: summary.total_fees },
    { label: "Multas", value: summary.total_penalties },
    { label: "Lucro total", value: summary.total_profit },
  ];
  return (
    <dl className="grid gap-4 border-t bg-muted/40 p-4 sm:grid-cols-3 xl:grid-cols-5">
      {items.map(({ label, value }) => (
        <div key={label}>
          <dt className="text-xs text-muted-foreground">{label}</dt>
          <dd className="font-semibold tabular-nums">{formatMoney(value)}</dd>
        </div>
      ))}
    </dl>
  );
}

export function TransactionsTab({ club }: { club: ClubDetail }) {
  const [types, setTypes] = useState<TransactionType[]>([]);
  const [playerId, setPlayerId] = useState("");

  const query = useMemo<QueryParams>(
    () => ({ type: types.join(",") || undefined, player_id: playerId || undefined }),
    [types, playerId],
  );
  const fetchFiltered = useCallback(
    (signal: AbortSignal) => listTransactions(club.id, query, signal),
    [club.id, query],
  );
  const fetchAll = useCallback((signal: AbortSignal) => listTransactions(club.id, {}, signal), [club.id]);
  const history = useFetch(fetchFiltered);
  const allHistory = useFetch(fetchAll);

  const rows = history.data?.data ?? [];
  const players = useMemo(() => playerOptions(allHistory.data?.data ?? []), [allHistory.data]);

  const download = useAction(
    async () => saveBlob(await exportTransactions(club.id, query), `transacoes-${club.acronym}.csv`),
    { successMessage: "CSV exportado com os filtros aplicados." },
  );

  function toggleType(type: TransactionType) {
    setTypes((current) => {
      const next = current.includes(type) ? current.filter((item) => item !== type) : [...current, type];
      return TRANSACTION_TYPES.filter((item) => next.includes(item));
    });
  }

  return (
    <>
      <Card className="gap-0 overflow-hidden py-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Tipo:</span>
            {TRANSACTION_TYPES.map((type) => (
              <Button
                key={type}
                size="sm"
                variant={types.includes(type) ? "default" : "outline"}
                aria-pressed={types.includes(type)}
                onClick={() => toggleType(type)}
              >
                {TRANSACTION_TYPE_LABEL[type]}
              </Button>
            ))}
            <Select value={playerId || ALL_PLAYERS} onValueChange={(next) => setPlayerId(next === ALL_PLAYERS ? "" : next)}>
              <SelectTrigger className="w-56" aria-label="Jogador">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_PLAYERS}>Todos os jogadores</SelectItem>
                {players.map((player) => (
                  <SelectItem key={player.id} value={String(player.id)}>
                    {player.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" disabled={download.pending} onClick={() => void download.run()}>
            <Download /> {download.pending ? "Exportando..." : "Exportar CSV"}
          </Button>
        </div>

        <DataState
          loading={history.loading}
          error={history.error}
          empty={rows.length === 0}
          emptyMessage="Nenhuma transação encontrada."
          onRetry={history.reload}
        >
          <div className={cn("transition-opacity", history.refreshing && "opacity-60")}>
            <TransactionsTable transactions={rows} />
          </div>
        </DataState>
        {history.data && !history.error && <SummaryBar summary={history.data.summary} />}
      </Card>
      <p className="mt-3 text-xs text-muted-foreground">
        Da mais recente para a mais antiga, com os valores do momento de cada operação. Os totais respeitam os filtros.
      </p>
    </>
  );
}
